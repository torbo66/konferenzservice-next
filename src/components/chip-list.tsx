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

  async function remove(item: Item) {
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
          {items.map((i) => (
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
          {items.length === 0 && (
            <span className="text-xs text-neutral-600">Noch keine Einträge.</span>
          )}
        </div>
      </div>
    </div>
  )
}
