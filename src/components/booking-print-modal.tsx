'use client'

import type { Booking, Location, Product, Room } from '@/lib/types'
import { roomLocationName } from './booking-row'

export function BookingPrintModal({
  booking,
  products,
  rooms,
  locations,
  onClose,
}: {
  booking: Booking
  products: Product[]
  rooms: Room[]
  locations: Location[]
  onClose: () => void
}) {
  const lines = (booking.products ?? [])
    .map((p) => ({ ordered: p, product: products.find((x) => x.id === p.id) }))
    .filter((l) => l.product)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded w-full max-w-lg max-h-[90vh] flex flex-col print:bg-white print:text-black print:border-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 print:hidden">
          <h2 className="font-bold">{booking.room}</h2>
          <button onClick={onClose} className="text-neutral-400">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 print-area">
          <div className="text-lg font-bold mb-1">{booking.room}</div>
          <div className="text-xs font-mono text-neutral-500 mb-4">
            #{booking.id} · {roomLocationName(rooms, locations, booking.room)} · {booking.date}{' '}
            {booking.time_from?.slice(0, 5)}–{booking.time_to?.slice(0, 5)}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <Fact label="Teilnehmer" value={String(booking.participants ?? 1)} />
            <Fact label="Kostenstelle" value={booking.costcenter} />
          </div>

          {booking.note && (
            <div className="mb-4">
              <div className="text-xs uppercase text-neutral-500 mb-1">Bemerkung</div>
              <div className="text-sm">{booking.note}</div>
            </div>
          )}

          <div className="text-xs uppercase text-neutral-500 mb-2">Produkte</div>
          {lines.length === 0 ? (
            <div className="text-sm text-neutral-600">Keine Produkte in dieser Buchung.</div>
          ) : (
            lines.map(({ ordered, product }) => (
              <div
                key={ordered.id}
                className="flex justify-between py-2 border-b border-neutral-800 text-sm print:border-neutral-300"
              >
                <span>{product!.name}</span>
                <span className="font-mono font-bold">
                  {ordered.qty} {product!.unit}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-800 print:hidden">
          <button className="btn-secondary" onClick={() => window.print()}>
            Drucken
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase text-neutral-500 mb-0.5">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}
