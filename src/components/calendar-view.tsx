'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Booking, CostCenter, Location, Product, Profile, Room } from '@/lib/types'
import { BookingRow, nextStatus } from './booking-row'
import { BookingModal } from './booking-modal'
import { BookingPrintModal } from './booking-print-modal'

function ymd(d: Date) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}
function mondayOf(d: Date) {
  const nd = new Date(d)
  const day = (nd.getDay() + 6) % 7
  nd.setDate(nd.getDate() - day)
  nd.setHours(0, 0, 0, 0)
  return nd
}
function isoWeekNumber(d: Date) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayNum = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - dayNum + 3)
  const firstThursday = new Date(date.getFullYear(), 0, 4)
  const firstDayNum = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDayNum + 3)
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 864e5))
}

interface Props {
  initialBookings: Booking[]
  rooms: Room[]
  costcenters: CostCenter[]
  categories: string[]
  products: Product[]
  favorites: number[]
  profile: Profile
  locations: Location[]
}

export function CalendarView({
  initialBookings,
  rooms,
  costcenters,
  categories,
  products,
  favorites: initialFavorites,
  profile,
  locations,
}: Props) {
  const supabase = createClient()
  const [bookings, setBookings] = useState(initialBookings)
  const [favorites, setFavorites] = useState(initialFavorites)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Booking | null>(null)
  const [printBooking, setPrintBooking] = useState<Booking | null>(null)

  const today = new Date()
  const todayStr = ymd(today)

  const weekStarts = useMemo(() => {
    const anchor = mondayOf(today)
    anchor.setDate(anchor.getDate() + weekOffset * 7)
    return [-1, 0, 1].map((off) => {
      const d = new Date(anchor)
      d.setDate(d.getDate() + off * 7)
      return d
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset])

  const bookingCounts = useMemo(() => {
    const map = new Map<string, number>()
    bookings.forEach((b) => {
      if (b.date) map.set(b.date, (map.get(b.date) ?? 0) + 1)
    })
    return map
  }, [bookings])

  const rangeLabel = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
    const end = new Date(weekStarts[2])
    end.setDate(end.getDate() + 6)
    return `${fmt(weekStarts[0])} – ${fmt(end)} ${end.getFullYear()}`
  }, [weekStarts])

  const dayBookings = selected ? bookings.filter((b) => b.date === selected) : []

  function openEdit(b: Booking) {
    if (b.status === 'billed' && profile.role !== 'admin') {
      alert('Nur Admins können abgerechnete Buchungen bearbeiten.')
      return
    }
    setEditing(b)
    setModalOpen(true)
  }

  function handleSaved(booking: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)))
    setModalOpen(false)
  }

  async function handleAdvanceStatus(b: Booking) {
    const status = nextStatus(b.status)
    if (status === 'billed') {
      alert('Abrechnung folgt in einem späteren Ausbauschritt.')
      return
    }
    const { error } = await supabase.from('bookings').update({ status }).eq('id', b.id)
    if (!error) setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status } : x)))
  }

  async function handleDelete(b: Booking) {
    if (b.status === 'billed' && profile.role !== 'admin') {
      alert('Abgerechnete Buchungen können nur von Admins gelöscht werden.')
      return
    }
    if (!confirm('Buchung löschen?')) return
    const { error } = await supabase.from('bookings').delete().eq('id', b.id)
    if (!error) setBookings((prev) => prev.filter((x) => x.id !== b.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          Kal<span className="text-lime-700 dark:text-lime-400">ender</span>
        </h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => setWeekOffset((w) => w - 1)}>
            ‹
          </button>
          <div className="text-sm font-mono min-w-[140px] text-center">{rangeLabel}</div>
          <button className="btn-secondary" onClick={() => setWeekOffset((w) => w + 1)}>
            ›
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              setWeekOffset(0)
              setSelected(todayStr)
            }}
          >
            Heute
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[40px_repeat(7,1fr)] gap-2 mb-2 text-xs uppercase text-neutral-600 dark:text-neutral-500 text-center">
        <div></div>
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="space-y-2 mb-8">
        {weekStarts.map((weekStart) => (
          <div key={weekStart.toISOString()} className="grid grid-cols-[40px_repeat(7,1fr)] gap-2 items-center">
            <div className="text-xs font-mono text-neutral-600 dark:text-neutral-500 text-center font-semibold">
              KW {isoWeekNumber(weekStart)}
            </div>
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(weekStart)
              d.setDate(d.getDate() + i)
              const dateStr = ymd(d)
              const count = bookingCounts.get(dateStr) ?? 0
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selected
              return (
                <div key={dateStr} className="flex justify-center">
                  <button
                    onClick={() => setSelected(dateStr)}
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-mono transition-colors
                      ${count > 0 ? 'bg-lime-400 text-black font-semibold' : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'}
                      ${isToday ? 'ring-1 ring-cyan-400' : ''}
                      ${isSelected ? 'ring-2 ring-white' : ''}
                    `}
                  >
                    {d.getDate()}
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded overflow-x-auto">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium">
          {selected
            ? 'Aufträge am ' +
              new Date(selected).toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : 'Kein Tag ausgewählt'}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-left text-xs uppercase text-neutral-600 dark:text-neutral-500">
              {['Raum', 'Standort', 'Datum / Zeit', 'Kostenstelle', 'Teilnehmer', 'Produkte', 'Status', 'Aktionen'].map(
                (h) => (
                  <th key={h} className="py-2 px-2 font-medium">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {!selected ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400 dark:text-neutral-600">
                  Datum im Kalender auswählen.
                </td>
              </tr>
            ) : dayBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400 dark:text-neutral-600">
                  Keine Aufträge an diesem Tag.
                </td>
              </tr>
            ) : (
              dayBookings.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  rooms={rooms}
                  locations={locations}
                  role={profile.role}
                  compact
                  onEdit={openEdit}
                  onAdvanceStatus={handleAdvanceStatus}
                  onDelete={handleDelete}
                  onPrint={setPrintBooking}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <BookingModal
          editing={editing}
          rooms={rooms}
          costcenters={costcenters}
          categories={categories}
          products={products}
          favorites={favorites}
          onFavoritesChange={setFavorites}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {printBooking && (
        <BookingPrintModal
          booking={printBooking}
          products={products}
          rooms={rooms}
          locations={locations}
          onClose={() => setPrintBooking(null)}
        />
      )}
    </div>
  )
}
