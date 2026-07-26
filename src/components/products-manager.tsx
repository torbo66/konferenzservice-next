'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Product } from '@/lib/types'
import { ProductCsvImport } from './product-csv-import'

export function ProductsManager({
  initialProducts,
  categories: initialCategories,
}: {
  initialProducts: Product[]
  categories: Category[]
}) {
  const supabase = createClient()
  const [products, setProducts] = useState(initialProducts)
  const [categories, setCategories] = useState(initialCategories)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const [plu, setPlu] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0]?.name ?? '')
  const [unit, setUnit] = useState('Stück')
  const [price, setPrice] = useState('0')
  const [inactive, setInactive] = useState(false)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setPlu('')
    setName('')
    setCategory(categories[0]?.name ?? '')
    setUnit('Stück')
    setPrice('0')
    setInactive(false)
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setPlu(p.plu ?? '')
    setName(p.name)
    setCategory(p.category)
    setUnit(p.unit)
    setPrice(String(p.price))
    setInactive(p.inactive)
    setModalOpen(true)
  }

  async function save() {
    if (!name.trim() || !category) {
      alert('Name und Kategorie sind erforderlich.')
      return
    }
    const priceNum = parseFloat(price.replace(',', '.')) || 0
    setSaving(true)
    try {
      if (editing) {
        const { data, error } = await supabase
          .from('products')
          .update({ plu: plu || null, name: name.trim(), category, unit, price: priceNum, inactive })
          .eq('id', editing.id)
          .select()
          .single()
        if (error) throw error
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? (data as Product) : p)))
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert({ plu: plu || null, name: name.trim(), category, unit, price: priceNum, inactive })
          .select()
          .single()
        if (error) throw error
        setProducts((prev) => [...prev, data as Product])
      }
      setModalOpen(false)
    } catch (e) {
      alert('Fehler beim Speichern — PLU evtl. bereits vergeben.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function remove(p: Product) {
    if (!confirm(`Produkt "${p.name}" löschen?`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) {
      alert('Löschen fehlgeschlagen — wird evtl. noch von Buchungen referenziert.')
      return
    }
    setProducts((prev) => prev.filter((x) => x.id !== p.id))
  }

  return (
    <div className="border border-neutral-800 rounded">
      <div className="px-4 py-3 border-b border-neutral-800 text-xs font-mono uppercase text-lime-400 flex items-center justify-between">
        <span>Produkte</span>
        <ProductCsvImport
          categories={categories}
          onImported={(prods, cats) => {
            setProducts(prods)
            setCategories(cats)
          }}
        />
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-neutral-500 border-b border-neutral-800">
              <th className="py-2 font-medium">PLU</th>
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Kategorie</th>
              <th className="py-2 font-medium">Einheit</th>
              <th className="py-2 font-medium">Preis</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-900">
                <td className="py-2 font-mono text-xs text-neutral-500">{p.plu}</td>
                <td className="py-2">{p.name}</td>
                <td className="py-2">{p.category}</td>
                <td className="py-2 text-neutral-400">{p.unit}</td>
                <td className="py-2 font-mono">{p.price.toFixed(2)} €</td>
                <td className="py-2">
                  {p.inactive ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-700 text-neutral-400">
                      Inaktiv
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-lime-500/20 text-lime-400">
                      Aktiv
                    </span>
                  )}
                </td>
                <td className="py-2 flex gap-1.5">
                  <button className="btn-secondary" onClick={() => openEdit(p)}>
                    ✎
                  </button>
                  <button className="btn-danger" onClick={() => remove(p)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-neutral-600">
                  Noch keine Produkte angelegt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <button className="btn-secondary mt-4" onClick={openCreate}>
          + Produkt hinzufügen
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <h2 className="font-bold">{editing ? 'Produkt bearbeiten' : 'Produkt hinzufügen'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <Field label="PLU (optional)">
                <input value={plu} onChange={(e) => setPlu(e.target.value)} className="input" />
              </Field>
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </Field>
              <Field label="Kategorie">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Einheit">
                  <input value={unit} onChange={(e) => setUnit(e.target.value)} className="input" />
                </Field>
                <Field label="Preis (€)">
                  <input value={price} onChange={(e) => setPrice(e.target.value)} className="input" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={inactive}
                  onChange={(e) => setInactive(e.target.checked)}
                />
                Inaktiv (im Buchungsdialog ausgeblendet)
              </label>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-800">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>
                Abbrechen
              </button>
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">{label}</label>
      {children}
    </div>
  )
}
