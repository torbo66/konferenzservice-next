'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

export function QuickSelectManager({
  products,
  initialQuickSelect,
  editable,
}: {
  products: Product[]
  initialQuickSelect: number[]
  editable: boolean
}) {
  const supabase = createClient()
  const [quickSelect, setQuickSelect] = useState(initialQuickSelect)
  const [toAdd, setToAdd] = useState('')

  const available = products.filter((p) => !quickSelect.includes(p.id))

  async function persist(next: number[]) {
    setQuickSelect(next)
    await supabase.from('settings').update({ quick_select: next }).eq('id', 1)
  }

  function add() {
    if (!toAdd) return
    persist([...quickSelect, Number(toAdd)])
    setToAdd('')
  }
  function remove(id: number) {
    persist(quickSelect.filter((x) => x !== id))
  }
  function move(id: number, dir: -1 | 1) {
    const idx = quickSelect.indexOf(id)
    const next = [...quickSelect]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= next.length) return
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    persist(next)
  }

  return (
    <div className="border border-neutral-800 rounded">
      <div className="px-4 py-3 border-b border-neutral-800 text-xs font-mono uppercase text-lime-400">
        Schnellauswahl
      </div>
      <div className="p-4">
        <div className="text-xs text-neutral-500 mb-3">
          Produkte im Buchungsdialog als fixer Block oben.
          {!editable && ' Nur Admins können dies ändern.'}
        </div>
        {editable && (
          <div className="flex gap-2 mb-3">
            <select value={toAdd} onChange={(e) => setToAdd(e.target.value)} className="input flex-1 max-w-xs">
              <option value="">— Produkt wählen —</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={add}>
              + Hinzufügen
            </button>
          </div>
        )}
        <div className="space-y-1.5">
          {quickSelect.map((id, i) => {
            const p = products.find((x) => x.id === id)
            if (!p) return null
            return (
              <div
                key={id}
                className="flex items-center justify-between border border-neutral-800 rounded px-3 py-2 text-sm"
              >
                <span>{p.name}</span>
                {editable && (
                  <div className="flex gap-1">
                    <button className="btn-secondary" onClick={() => move(id, -1)} disabled={i === 0}>
                      ↑
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => move(id, 1)}
                      disabled={i === quickSelect.length - 1}
                    >
                      ↓
                    </button>
                    <button className="btn-danger" onClick={() => remove(id)}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {quickSelect.length === 0 && (
            <div className="text-xs text-neutral-600">Keine Schnellauswahl konfiguriert.</div>
          )}
        </div>
      </div>
    </div>
  )
}
