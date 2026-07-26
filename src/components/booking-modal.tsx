'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Booking, BookingProduct, CostCenter, Product, Room } from '@/lib/types'

interface Props {
  editing: Booking | null
  rooms: Room[]
  costcenters: CostCenter[]
  categories: string[]
  products: Product[]
  favorites: number[]
  onFavoritesChange: (next: number[]) => void
  onClose: () => void
  onSaved: (booking: Booking, isNew: boolean) => void
}

export function BookingModal({
  editing,
  rooms,
  costcenters,
  categories,
  products,
  favorites,
  onFavoritesChange,
  onClose,
  onSaved,
}: Props) {
  const supabase = createClient()
  const [room, setRoom] = useState(editing?.room ?? rooms[0]?.name ?? '')
  const [costcenter, setCostcenter] = useState(editing?.costcenter ?? costcenters[0]?.name ?? '')
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().slice(0, 10))
  const [timeFrom, setTimeFrom] = useState(editing?.time_from?.slice(0, 5) ?? '')
  const [timeTo, setTimeTo] = useState(editing?.time_to?.slice(0, 5) ?? '')
  const [note, setNote] = useState(editing?.note ?? '')
  const [participants, setParticipants] = useState(editing?.participants ?? 1)
  const [qty, setQty] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {}
    editing?.products?.forEach((p) => (map[p.id] = p.qty))
    return map
  })
  const [filter, setFilter] = useState<'Alle' | 'Favoriten' | string>('Alle')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function changeQty(id: number, delta: number) {
    setQty((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }))
  }

  async function toggleFavorite(id: number) {
    const next = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id]
    onFavoritesChange(next)
    await supabase.from('settings').update({ favorites: next }).eq('id', 1)
  }

  const visibleProducts = useMemo(() => {
    let list = products.filter((p) => !p.inactive)
    if (filter === 'Favoriten') list = list.filter((p) => favorites.includes(p.id))
    else if (filter !== 'Alle') list = list.filter((p) => p.category === filter)
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(s))
    }
    if (filter !== 'Favoriten') {
      list = [...list].sort(
        (a, b) => (favorites.includes(a.id) ? 0 : 1) - (favorites.includes(b.id) ? 0 : 1)
      )
    }
    return list
  }, [products, filter, search, favorites])

  const addedProducts = useMemo(
    () =>
      Object.entries(qty)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => ({ product: products.find((p) => p.id === Number(id)), qty: q }))
        .filter((x) => x.product),
    [qty, products]
  )

  async function handleSave() {
    setError('')
    if (!room || !costcenter || !date || !timeFrom || !timeTo) {
      setError('Bitte alle Pflichtfelder ausfüllen.')
      return
    }
    if (!participants || participants < 1) {
      setError('Bitte eine gültige Teilnehmerzahl (mind. 1) angeben.')
      return
    }
    const bookingProducts: BookingProduct[] = Object.entries(qty)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => ({ id: Number(id), qty: q }))

    setSaving(true)
    try {
      if (editing) {
        const { data, error: dbError } = await supabase
          .from('bookings')
          .update({
            room,
            costcenter,
            date,
            time_from: timeFrom,
            time_to: timeTo,
            note,
            participants,
            products: bookingProducts,
          })
          .eq('id', editing.id)
          .select()
          .single()
        if (dbError) throw dbError
        onSaved(data as Booking, false)
      } else {
        const { data, error: dbError } = await supabase
          .from('bookings')
          .insert({
            room,
            costcenter,
            date,
            time_from: timeFrom,
            time_to: timeTo,
            note,
            participants,
            products: bookingProducts,
            status: 'pending',
          })
          .select()
          .single()
        if (dbError) throw dbError
        onSaved(data as Booking, true)
      }
    } catch (e) {
      setError('Fehler beim Speichern.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h2 className="font-bold">{editing ? 'Buchung bearbeiten' : 'Neue Buchung'}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-100">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Field label="Raum">
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="input"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kostenstelle">
              <select
                value={costcenter}
                onChange={(e) => setCostcenter(e.target.value)}
                className="input"
              >
                {costcenters.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Datum">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Von">
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Bis">
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="input"
                />
              </Field>
            </div>
            <Field label="Teilnehmer">
              <input
                type="number"
                min={1}
                value={participants}
                onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                className="input"
              />
            </Field>
            <Field label="Notiz">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input"
                rows={2}
              />
            </Field>

            <div className="border border-neutral-800 rounded p-3">
              <div className="text-xs uppercase text-neutral-500 mb-2">
                Ausgewählte Produkte ({addedProducts.reduce((s, x) => s + x.qty, 0)})
              </div>
              {addedProducts.length === 0 ? (
                <div className="text-xs text-neutral-600">Noch keine Produkte ausgewählt.</div>
              ) : (
                <div className="space-y-1">
                  {addedProducts.map(({ product, qty: q }) => (
                    <div key={product!.id} className="flex justify-between text-sm">
                      <span>
                        {product!.name} × {q}
                      </span>
                      <span className="text-neutral-400 font-mono">
                        {(product!.price * q).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="text-red-500 text-xs font-mono">{error}</div>}
          </div>

          <div>
            <div className="flex gap-2 mb-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input flex-1"
              >
                <option value="Alle">Alle</option>
                <option value="Favoriten">★ Favoriten</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Suche..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input flex-1"
              />
            </div>
            <div className="space-y-1 max-h-[420px] overflow-y-auto">
              {visibleProducts.length === 0 ? (
                <div className="text-xs text-neutral-600 py-4 text-center">
                  Keine Produkte gefunden.
                </div>
              ) : (
                visibleProducts.map((p) => {
                  const isFav = favorites.includes(p.id)
                  const q = qty[p.id] ?? 0
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between border border-neutral-800 rounded px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => toggleFavorite(p.id)}
                          className={isFav ? 'text-amber-400' : 'text-neutral-700'}
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                        <div className="min-w-0">
                          <div className="text-sm truncate">{p.name}</div>
                          <div className="text-xs text-neutral-500">
                            {p.category} · {p.price.toFixed(2)} € / {p.unit}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => changeQty(p.id, -1)}
                          className="w-7 h-7 border border-neutral-700 rounded"
                        >
                          −
                        </button>
                        <div className="w-6 text-center font-mono">{q}</div>
                        <button
                          onClick={() => changeQty(p.id, 1)}
                          className="w-7 h-7 border border-neutral-700 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-800">
          <button onClick={onClose} className="btn-secondary">
            Abbrechen
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}
