'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Product } from '@/lib/types'

export function ProductCsvImport({
  categories,
  onImported,
}: {
  categories: Category[]
  onImported: (products: Product[], categories: Category[]) => void
}) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<{ msg: string; ok: boolean } | null>(null)

  function handlePick() {
    inputRef.current?.click()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    if (!lines.length) {
      setResult({ msg: 'Datei ist leer.', ok: false })
      return
    }
    const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ','
    const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ''))
    const idx = (n: string) => headers.findIndex((h) => h.toLowerCase() === n.toLowerCase())
    const iP = idx('PLU')
    const iN = idx('Kurzbez.')
    const iC = idx('Produktgruppe')
    const iPr = idx('Gästepreis')

    if (iP === -1 || iN === -1) {
      setResult({ msg: 'Pflichtfelder PLU oder Kurzbez. nicht gefunden.', ok: false })
      return
    }

    let currentCategories = [...categories]
    const { data: currentProducts } = await supabase.from('products').select('*')
    const products = (currentProducts as Product[]) ?? []

    let added = 0
    let updated = 0
    let skipped = 0

    for (const line of lines.slice(1)) {
      const cols = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''))
      const plu = cols[iP] || ''
      const name = cols[iN] || ''
      const cat = iC >= 0 ? cols[iC] || 'Sonstiges' : 'Sonstiges'
      const price = iPr >= 0 ? parseFloat((cols[iPr] || '0').replace(',', '.')) || 0 : 0
      if (!plu || !name) {
        skipped++
        continue
      }

      if (!currentCategories.some((c) => c.name === cat)) {
        const { data } = await supabase.from('categories').insert({ name: cat }).select().single()
        if (data) currentCategories = [...currentCategories, data as Category]
      }

      const existing = products.find((p) => p.plu === plu)
      if (existing) {
        const { error } = await supabase
          .from('products')
          .update({ name, category: cat, price })
          .eq('id', existing.id)
        if (error) skipped++
        else {
          Object.assign(existing, { name, category: cat, price })
          updated++
        }
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert({ plu, name, category: cat, unit: 'Stück', price, inactive: false })
          .select()
          .single()
        if (error) skipped++
        else {
          products.push(data as Product)
          added++
        }
      }
    }

    onImported(products, currentCategories)
    setResult({
      msg: `Import: ${added} neu, ${updated} aktualisiert${skipped ? ', ' + skipped + ' übersprungen' : ''}.`,
      ok: true,
    })
    if (inputRef.current) inputRef.current.value = ''
    setTimeout(() => setResult(null), 5000)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />
      <button className="btn-secondary" onClick={handlePick}>
        CSV Import
      </button>
      {result && (
        <div
          className={`mt-3 text-xs font-mono border rounded px-3 py-2 ${
            result.ok ? 'border-lime-600 text-lime-400' : 'border-red-800 text-red-400'
          }`}
        >
          {result.msg}
        </div>
      )}
    </div>
  )
}
