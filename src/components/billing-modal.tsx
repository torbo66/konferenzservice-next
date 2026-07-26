'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Booking, Product } from '@/lib/types'

interface Props {
  booking: Booking
  products: Product[]
  readOnly: boolean
  onClose: () => void
  onCompleted: (booking: Booking) => void
}

export function BillingModal({ booking, products, readOnly, onClose, onCompleted }: Props) {
  const supabase = createClient()
  const [consumed, setConsumed] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {}
    booking.products?.forEach((p) => {
      map[p.id] = booking.billing_data?.[p.id] ?? p.qty
    })
    return map
  })
  const [saving, setSaving] = useState(false)

  const lines = useMemo(
    () =>
      (booking.products ?? [])
        .map((p) => ({ ordered: p, product: products.find((x) => x.id === p.id) }))
        .filter((l) => l.product),
    [booking.products, products]
  )

  const total = lines.reduce((sum, l) => {
    const c = Math.min(l.ordered.qty, Math.max(0, consumed[l.ordered.id] ?? 0))
    return sum + c * (l.product?.price ?? 0)
  }, 0)

  function setQty(id: number, max: number, value: number) {
    setConsumed((prev) => ({ ...prev, [id]: Math.min(max, Math.max(0, value)) }))
  }

  async function complete() {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'billed',
          billing_data: consumed,
          billed_total: total,
          billed_at: new Date().toISOString(),
        })
        .eq('id', booking.id)
        .select()
        .single()
      if (error) throw error
      onCompleted(data as Booking)
    } catch (e) {
      alert('Fehler beim Abrechnen.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h2 className="font-bold">Abrechnung erfassen</h2>
          <button onClick={onClose} className="text-neutral-400">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="text-xs font-mono text-neutral-500 mb-4">
            #{booking.id} · {booking.room} · {booking.date} {booking.time_from?.slice(0, 5)}–
            {booking.time_to?.slice(0, 5)} · KST: {booking.costcenter}
          </div>

          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 text-xs uppercase text-neutral-500 border-b border-neutral-800 pb-2 mb-2">
            <div>Produkt</div>
            <div>Preis</div>
            <div>Bestellt</div>
            <div>Verbraucht</div>
            <div>Gesamt</div>
          </div>

          {lines.length === 0 ? (
            <div className="text-neutral-600 text-sm py-4">Keine Produkte.</div>
          ) : (
            lines.map(({ ordered, product }) => {
              const c = Math.min(ordered.qty, Math.max(0, consumed[ordered.id] ?? 0))
              return (
                <div
                  key={ordered.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 items-center py-2 border-b border-neutral-900 text-sm"
                >
                  <div>{product!.name}</div>
                  <div className="font-mono text-xs">{product!.price.toFixed(2)} €</div>
                  <div className="font-mono text-xs">{ordered.qty}</div>
                  <div>
                    <input
                      type="number"
                      min={0}
                      max={ordered.qty}
                      value={c}
                      disabled={readOnly}
                      onChange={(e) => setQty(ordered.id, ordered.qty, parseInt(e.target.value) || 0)}
                      className="input w-20"
                    />
                  </div>
                  <div className="font-mono text-xs text-lime-400">
                    {(c * (product?.price ?? 0)).toFixed(2)} €
                  </div>
                </div>
              )
            })
          )}

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-800">
            <span className="text-sm">Gesamtbetrag:</span>
            <span className="font-bold text-lime-400">{total.toFixed(2).replace('.', ',')} €</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-800">
          <button className="btn-secondary" onClick={onClose}>
            {readOnly ? 'Schließen' : 'Abbrechen'}
          </button>
          {!readOnly && (
            <button className="btn-primary" onClick={complete} disabled={saving}>
              {saving ? 'Speichern...' : 'Abrechnung abschließen'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
