'use client'

import { useMemo, useState } from 'react'
import type { Booking, Product, Role } from '@/lib/types'
import { BillingModal } from './billing-modal'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ausstehend',
  active: 'Aktiv',
  done: 'Abzurechnen',
  billed: 'Abgerechnet',
}
const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200',
  active: 'bg-lime-500/20 text-lime-700 dark:text-lime-400',
  done: 'bg-amber-500/20 text-amber-400',
  billed: 'bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300',
}

export function BillingManager({
  initialBookings,
  products,
  role,
}: {
  initialBookings: Booking[]
  products: Product[]
  role: Role
}) {
  const [bookings, setBookings] = useState(initialBookings)
  const [statusFilter, setStatusFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [modalBooking, setModalBooking] = useState<Booking | null>(null)
  const [readOnly, setReadOnly] = useState(false)

  const isAdmin = role === 'admin'

  const filtered = useMemo(() => {
    let list = [...bookings].reverse()
    if (statusFilter) list = list.filter((b) => b.status === statusFilter)
    if (monthFilter) list = list.filter((b) => b.date?.startsWith(monthFilter))
    return list
  }, [bookings, statusFilter, monthFilter])

  function totalOrdered(b: Booking) {
    return (b.products ?? []).reduce((s, p) => {
      const pr = products.find((x) => x.id === p.id)
      return s + (pr ? pr.price * p.qty : 0)
    }, 0)
  }

  function openAbrechnen(b: Booking) {
    setModalBooking(b)
    setReadOnly(false)
  }
  function openAnsehen(b: Booking) {
    setModalBooking(b)
    setReadOnly(true)
  }
  function handleCompleted(b: Booking) {
    setBookings((prev) => prev.map((x) => (x.id === b.id ? b : x)))
    setModalBooking(null)
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">
        Ab<span className="text-lime-700 dark:text-lime-400">rechnung</span>
      </h1>

      <div className="flex gap-2 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="">Alle</option>
          <option value="done">Abzurechnen</option>
          <option value="billed">Abgerechnet</option>
        </select>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="input w-auto"
        />
      </div>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-left text-xs uppercase text-neutral-600 dark:text-neutral-500">
              {['ID', 'Raum', 'Datum', 'Kostenstelle', 'Best. Gesamt', 'Status', 'Aktionen'].map((h) => (
                <th key={h} className="py-2 px-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-400 dark:text-neutral-600">
                  Keine Einträge.
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const total = b.status === 'billed' ? b.billed_total ?? 0 : totalOrdered(b)
                return (
                  <tr key={b.id} className="border-b border-neutral-100 dark:border-neutral-900">
                    <td className="py-2 px-2 font-mono text-xs text-neutral-600 dark:text-neutral-500">#{b.id}</td>
                    <td className="py-2 px-2">{b.room}</td>
                    <td className="py-2 px-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">{b.date}</td>
                    <td className="py-2 px-2">{b.costcenter}</td>
                    <td className="py-2 px-2 font-mono text-xs">
                      {b.status === 'billed' ? (
                        <span className="text-lime-700 dark:text-lime-400">{total.toFixed(2)} €</span>
                      ) : (
                        `${total.toFixed(2)} €`
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[b.status]}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      {b.status === 'done' && (
                        <button className="btn-primary" onClick={() => openAbrechnen(b)}>
                          Abrechnen
                        </button>
                      )}
                      {b.status === 'billed' && isAdmin && (
                        <button className="btn-secondary" onClick={() => openAnsehen(b)}>
                          Ansehen
                        </button>
                      )}
                      {b.status === 'billed' && !isAdmin && (
                        <span className="text-xs text-neutral-600 dark:text-neutral-500">🔒 gesperrt</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {modalBooking && (
        <BillingModal
          booking={modalBooking}
          products={products}
          readOnly={readOnly}
          onClose={() => setModalBooking(null)}
          onCompleted={handleCompleted}
        />
      )}
    </div>
  )
}
