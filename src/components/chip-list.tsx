'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Item {
  id: number
  name: string
}

export function ChipList({
  table,
  title,
  placeholder,
  initialItems,
}: {
  table: 'locations' | 'costcenters' | 'categories'
  title: string
  placeholder: string
  initialItems: Item[]
}) {
  const supabase = createClient()
  const [items, setItems] = useState(initialItems)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')

  function norm(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  const filteredItems = search.trim()
    ? items.filter((i) => norm(i.name).includes(norm(search)))
    : items

  async function add() {
    const name = value.trim()
    if (!name) return
    if (items.some((i) => i.name.toLowerCase() === name.toLowerCase())) {
      alert(title + ' existiert bereits.')
      return
    }
    setBusy(true)
    const { data, error } = await supabase.from(table).insert({ name }).select().single()
    setBusy(false)
    if (error) {
      alert('Fehler beim Anlegen.')
      return
    }
    setItems((prev) => [...prev, data as Item])
    setValue('')
  }

  async function checkUsage(item: Item): Promise<string | null> {
    if (table === 'categories') {
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category', item.name)
      if (count && count > 0) {
        return `Kategorie wird noch von ${count} Produkt(en) verwendet und kann nicht gelöscht werden.`
      }
    } else if (table === 'costcenters') {
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('costcenter', item.name)
      if (count && count > 0) {
        return `Kostenstelle wird noch von ${count} Buchung(en) verwendet und kann nicht gelöscht werden.`
      }
    } else if (table === 'locations') {
      const { count: roomCount } = await supabase
        .from('rooms')
        .select('id', { count: 'exact', head: true })
        .eq('location_id', item.id)
      if (roomCount && roomCount > 0) {
        return `Standort wird noch von ${roomCount} Raum/Räumen verwendet und kann nicht gelöscht werden.`
      }
      const { count: userCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('location_id', item.id)
      if (userCount && userCount > 0) {
        return `Standort wird noch von ${userCount} Benutzer(n) verwendet und kann nicht gelöscht werden.`
      }
    }
    return null
  }

  async function remove(item: Item) {
    const blocked = await checkUsage(item)
    if (blocked) {
      alert(blocked)
      return
    }
    if (!confirm(`"${item.name}" löschen?`)) return
    const { error } = await supabase.from(table).delete().eq('id', item.id)
    if (error) {
      alert(
        'Löschen fehlgeschlagen — wird evtl. noch von Räumen/Buchungen/Produkten referenziert.'
      )
      return
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  return (
    <div className="border border-neutral-800 rounded">
      <div className="px-4 py-3 border-b border-neutral-800 text-xs font-mono uppercase text-lime-400">
        {title}
      </div>
      <div className="p-4">
        {items.length > 6 && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche..."
            className="input w-full mb-3"
          />
        )}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder={placeholder}
            className="input flex-1"
          />
          <button className="btn-primary" onClick={add} disabled={busy}>
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredItems.map((i) => (
            <span
              key={i.id}
              className="inline-flex items-center gap-2 bg-neutral-800 rounded-full pl-3 pr-1.5 py-1 text-sm"
            >
              {i.name}
              <button
                onClick={() => remove(i)}
                className="w-5 h-5 rounded-full hover:bg-neutral-700 text-neutral-400"
              >
                ✕
              </button>
            </span>
          ))}
          {filteredItems.length === 0 && (
            <span className="text-xs text-neutral-600">
              {items.length === 0 ? 'Noch keine Einträge.' : 'Keine Treffer für diese Suche.'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
