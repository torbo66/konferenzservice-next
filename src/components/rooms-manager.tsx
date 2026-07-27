'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Location, Room } from '@/lib/types'

export function RoomsManager({
  initialRooms,
  locations,
}: {
  initialRooms: Room[]
  locations: Location[]
}) {
  const supabase = createClient()
  const [rooms, setRooms] = useState(initialRooms)
  const [name, setName] = useState('')
  const [locationId, setLocationId] = useState<string>('')

  async function addRoom() {
    const trimmed = name.trim()
    if (!trimmed) return
    const { data, error } = await supabase
      .from('rooms')
      .insert({ name: trimmed, location_id: locationId ? Number(locationId) : null })
      .select()
      .single()
    if (error) {
      alert('Fehler beim Anlegen — Name evtl. bereits vergeben.')
      return
    }
    setRooms((prev) => [...prev, data as Room])
    setName('')
    setLocationId('')
  }

  async function updateRoomLocation(room: Room, value: string) {
    const location_id = value ? Number(value) : null
    const { error } = await supabase.from('rooms').update({ location_id }).eq('id', room.id)
    if (!error) {
      setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, location_id } : r)))
    }
  }

  async function removeRoom(room: Room) {
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('room', room.name)
    if (count && count > 0) {
      alert(`Raum wird noch von ${count} Buchung(en) verwendet und kann nicht gelöscht werden.`)
      return
    }
    if (!confirm(`Raum "${room.name}" löschen?`)) return
    const { error } = await supabase.from('rooms').delete().eq('id', room.id)
    if (error) {
      alert('Löschen fehlgeschlagen — wird evtl. noch von Buchungen referenziert.')
      return
    }
    setRooms((prev) => prev.filter((r) => r.id !== room.id))
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase text-lime-700 dark:text-lime-400">
        Konferenzräume
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Raumname"
            className="input flex-1 min-w-[160px]"
          />
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="input w-auto max-w-[220px]"
          >
            <option value="">— Standort —</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={addRoom}>
            +
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-neutral-600 dark:text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
              <th className="py-2 font-medium">Raum</th>
              <th className="py-2 font-medium">Standort</th>
              <th className="py-2 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="py-2">{r.name}</td>
                <td className="py-2">
                  <select
                    value={r.location_id ?? ''}
                    onChange={(e) => updateRoomLocation(r, e.target.value)}
                    className="input w-auto min-w-[150px]"
                  >
                    <option value="">— keiner —</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2">
                  <button className="btn-danger" onClick={() => removeRoom(r)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-neutral-400 dark:text-neutral-600">
                  Noch keine Räume angelegt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
