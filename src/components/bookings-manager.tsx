'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Booking, CostCenter, Location, Product, Profile, Room } from '@/lib/types'
import { BookingRow, nextStatus } from './booking-row'
import { BookingModal } from './booking-modal'
import { BookingPrintModal } from './booking-print-modal'

interface Props {
  initialBookings: Booking[]
  rooms: Room[]
  costcenters: CostCenter[]
  categories: string[]
  products: Product[]
  favorites: number[]
  profile: Profile
  locations: Location[]
  mode: 'overview' | 'list'
}

export function BookingsManager({
  initialBookings,
  rooms,
  costcenters,
  categories,
  products,
  favorites: initialFavorites,
  profile,
  locations,
  mode,
}: Props) {
  const supabase = createClient()
  const [bookings, setBookings] = useState(initialBookings)
  const [favorites, setFavorites] = useState(initialFavorites)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Booking | null>(null)
  const [printBooking, setPrintBooking] = useState<Booking | null>(null)

  const [filterDate, setFilterDate] = useState('')
  const [filterRoom, setFilterRoom] = useState('')
  const [filterKs, setFilterKs] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => {
    let list = bookings
    if (mode === 'list') {
      if (filterDate) list = list.filter((b) => b.date === filterDate)
      if (filterRoom) list = list.filter((b) => b.room === filterRoom)
      if (filterKs) list = list.filter((b) => b.costcenter === filterKs)
      if (filterStatus) list = list.filter((b) => b.status === filterStatus)
    }
    return list
  }, [bookings, mode, filterDate, filterRoom, filterKs, filterStatus])

  function openCreate() {
    if (!rooms.length) {
      alert(
        profile.location_id
          ? 'Für deinen Standort sind keine Konferenzräume angelegt. Bitte an einen Administrator wenden.'
          : 'Dir ist kein Standort zugewiesen. Bitte an einen Administrator wenden.'
      )
      return
    }
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(b: Booking) {
    if (b.status === 'billed' && profile.role !== 'admin') {
      alert('Nur Admins können abgerechnete Buchungen bearbeiten.')
      return
    }
    setEditing(b)
    setModalOpen(true)
  }

  function handleSaved(booking: Booking, isNew: boolean) {
    setBookings((prev) =>
      isNew ? [booking, ...prev] : prev.map((b) => (b.id === booking.id ? booking : b))
    )
    setModalOpen(false)
  }

  async function handleAdvanceStatus(b: Booking) {
    const status = nextStatus(b.status)
    if (status === 'billed') {
      // Abrechnung ist ein eigener Workflow, folgt spaeter (Phase 3 Fortsetzung)
      alert('Abrechnung folgt in einem späteren Ausbauschritt.')
      return
    }
    const { error } = await supabase.from('bookings').update({ status }).eq('id', b.id)
    if (!error) {
      setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status } : x)))
    }
  }

  async function handleDelete(b: Booking) {
    if (b.status === 'billed' && profile.role !== 'admin') {
      alert('Abgerechnete Buchungen können nur von Admins gelöscht werden.')
      return
    }
    if (!confirm('Buchung löschen?')) return
    const { error } = await supabase.from('bookings').delete().eq('id', b.id)
    if (!error) {
      setBookings((prev) => prev.filter((x) => x.id !== b.id))
    }
  }

  const headers =
    mode === 'overview'
      ? ['Raum', 'Standort', 'Datum / Zeit', 'Kostenstelle', 'Teilnehmer', 'Produkte', 'Status', 'Aktionen']
      : ['#', 'Raum', 'Standort', 'Datum', 'Von', 'Bis', 'Kostenstelle', 'Teilnehmer', 'Produkte', 'Status', 'Aktionen']

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-neutral-600 dark:text-neutral-500">{filtered.length} Buchung(en)</div>
        <button className="btn-primary" onClick={openCreate}>
          + Neue Buchung
        </button>
      </div>

      {mode === 'list' && (
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input w-auto"
          />
          <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="input w-auto">
            <option value="">Alle Räume</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <select value={filterKs} onChange={(e) => setFilterKs(e.target.value)} className="input w-auto">
            <option value="">Alle Kostenstellen</option>
            {costcenters.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-auto"
          >
            <option value="">Alle Status</option>
            <option value="pending">Ausstehend</option>
            <option value="active">Aktiv</option>
            <option value="done">Abgeschlossen</option>
            <option value="billed">Abgerechnet</option>
          </select>
        </div>
      )}

      <div className="border border-neutral-200 dark:border-neutral-800 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-left text-xs uppercase text-neutral-600 dark:text-neutral-500">
              {headers.map((h) => (
                <th key={h} className="py-2 px-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="py-8 text-center text-neutral-400 dark:text-neutral-600">
                  Keine Buchungen gefunden.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  rooms={rooms}
                  locations={locations}
                  role={profile.role}
                  compact={mode === 'overview'}
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
