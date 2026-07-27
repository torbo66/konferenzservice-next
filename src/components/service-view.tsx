'use client'

import { useMemo, useState } from 'react'
import type { Booking, Location, Product, Room } from '@/lib/types'
import { ServiceDetailModal } from './service-detail-modal'
import { ServiceConsumptionModal } from './service-consumption-modal'

const STATUS_LABEL: Record<string, string> = { pending: 'Ausstehend', active: 'Aktiv' }
const DELIVERY_LABEL: Record<string, string> = {
  offen: 'Offen',
  vorbereitet: 'Vorbereitet',
  ausgeliefert: 'Ausgeliefert',
}

export function ServiceView({
  initialBookings,
  products,
  rooms,
  locations,
}: {
  initialBookings: Booking[]
  products: Product[]
  rooms: Room[]
  locations: Location[]
}) {
  const [bookings, setBookings] = useState(initialBookings)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const [consumptionBooking, setConsumptionBooking] = useState<Booking | null>(null)

  const prep = useMemo(
    () => bookings.filter((b) => b.status === 'pending' || b.status === 'active'),
    [bookings]
  )
  const consumption = useMemo(() => bookings.filter((b) => b.status === 'done'), [bookings])

  function handleUpdated(b: Booking) {
    setBookings((prev) => prev.map((x) => (x.id === b.id ? b : x)))
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">
        Serv<span className="text-lime-700 dark:text-lime-400">ice</span>
      </h1>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded mb-6">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase text-lime-700 dark:text-lime-400">
          Vorbereitung & Lieferung
        </div>
        <div className="p-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-500 mb-4">
            Bevorstehende und laufende Buchungen an deinem Standort. Produkte richten, ausliefern,
            Lieferung quittieren.
          </p>
          {prep.length === 0 ? (
            <div className="text-neutral-400 dark:text-neutral-600 text-sm">Keine anstehenden Buchungen.</div>
          ) : (
            prep.map((b) => {
              const ds = b.delivery_status || 'offen'
              const cnt = b.products?.reduce((s, p) => s + p.qty, 0) ?? 0
              return (
                <div
                  key={b.id}
                  onClick={() => setDetailBooking(b)}
                  className="flex justify-between items-center gap-3 border border-neutral-200 dark:border-neutral-800 rounded p-4 mb-2 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-700"
                >
                  <div>
                    <div className="font-bold">{b.room}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-500 font-mono">
                      {b.date} {b.time_from?.slice(0, 5)}–{b.time_to?.slice(0, 5)} · {cnt} Pos.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                      {STATUS_LABEL[b.status]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-lime-500/20 text-lime-700 dark:text-lime-400">
                      {DELIVERY_LABEL[ds]}
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-500">›</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase text-lime-700 dark:text-lime-400">
          Verbrauch erfassen
        </div>
        <div className="p-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-500 mb-4">
            Veranstaltungen an deinem Standort, die von einem Admin/Nutzer bereits als beendet
            markiert wurden. Tatsächlichen Verbrauch eintragen — der Rücklauf wird automatisch
            berechnet.
          </p>
          {consumption.length === 0 ? (
            <div className="text-neutral-400 dark:text-neutral-600 text-sm">
              Keine Buchungen zur Verbrauchserfassung. Eine Buchung erscheint hier erst, sobald ein
              Admin oder Nutzer die Veranstaltung über &quot;Buchungen&quot; als beendet markiert
              hat.
            </div>
          ) : (
            consumption.map((b) => {
              const erfasst = b.billing_data && Object.keys(b.billing_data).length > 0
              return (
                <div
                  key={b.id}
                  onClick={() => setConsumptionBooking(b)}
                  className="flex justify-between items-center gap-3 border border-neutral-200 dark:border-neutral-800 rounded p-4 mb-2 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-700"
                >
                  <div>
                    <div className="font-bold">{b.room}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-500 font-mono">
                      {b.date} {b.time_from?.slice(0, 5)}–{b.time_to?.slice(0, 5)} ·{' '}
                      {b.participants ?? 1} Teilnehmer
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {erfasst && (
                      <span className="text-xs px-2 py-0.5 rounded bg-lime-500/20 text-lime-700 dark:text-lime-400">
                        ✓ erfasst
                      </span>
                    )}
                    <span className="text-neutral-600 dark:text-neutral-500">›</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {detailBooking && (
        <ServiceDetailModal
          booking={detailBooking}
          products={products}
          rooms={rooms}
          locations={locations}
          onClose={() => setDetailBooking(null)}
          onUpdated={handleUpdated}
        />
      )}
      {consumptionBooking && (
        <ServiceConsumptionModal
          booking={consumptionBooking}
          products={products}
          onClose={() => setConsumptionBooking(null)}
          onSaved={handleUpdated}
        />
      )}
    </div>
  )
}
