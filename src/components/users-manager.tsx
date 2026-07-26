'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Location, Profile, Role } from '@/lib/types'

type UserRow = Profile

const ROLE_LABEL: Record<Role, string> = { admin: 'admin', user: 'user', service: 'service' }
const ROLE_CLASS: Record<Role, string> = {
  admin: 'bg-lime-500/20 text-lime-400',
  user: 'bg-amber-500/20 text-amber-400',
  service: 'bg-neutral-700 text-neutral-300',
}

export function UsersManager({
  initialUsers,
  locations,
  currentUserId,
}: {
  initialUsers: UserRow[]
  locations: Location[]
  currentUserId: string
}) {
  const supabase = createClient()
  const [users, setUsers] = useState(initialUsers)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)

  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('user')
  const [locationId, setLocationId] = useState('')
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setVorname('')
    setNachname('')
    setUsername('')
    setEmail('')
    setRole('user')
    setLocationId('')
    setModalOpen(true)
  }

  function openEdit(u: UserRow) {
    setEditing(u)
    setVorname(u.vorname ?? '')
    setNachname(u.nachname ?? '')
    setUsername(u.username)
    setEmail(u.email ?? '')
    setRole(u.role)
    setLocationId(u.location_id ? String(u.location_id) : '')
    setModalOpen(true)
  }

  async function save() {
    if (!vorname.trim() || !nachname.trim() || !username.trim() || !email.trim()) {
      alert('Vorname, Nachname, Benutzername und E-Mail sind erforderlich.')
      return
    }
    const dup = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.id !== editing?.id
    )
    if (dup) {
      alert('Benutzername bereits vergeben.')
      return
    }
    const location_id = locationId ? Number(locationId) : null
    if ((role === 'user' || role === 'service') && !location_id) {
      if (
        !confirm(
          'Kein Standort ausgewählt. Dieser Nutzer sieht dann keine Räume/Buchungen, bis ein Standort zugewiesen wird. Trotzdem speichern?'
        )
      )
        return
    }

    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.rpc('admin_update_user', {
          p_user_id: editing.id,
          p_username: username.trim(),
          p_vorname: vorname.trim(),
          p_nachname: nachname.trim(),
          p_email: email.trim(),
          p_role: role,
          p_location_id: location_id,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.rpc('admin_create_user', {
          p_username: username.trim(),
          p_vorname: vorname.trim(),
          p_nachname: nachname.trim(),
          p_email: email.trim(),
          p_role: role,
          p_location_id: location_id,
        })
        if (error) throw error
      }
      const { data: rows } = await supabase.from('profiles').select('*').order('username')
      setUsers((rows as UserRow[]) ?? [])
      setModalOpen(false)
    } catch (e) {
      alert('Fehler — evtl. E-Mail oder Benutzername bereits vergeben.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function updateLocation(u: UserRow, value: string) {
    const location_id = value ? Number(value) : null
    const { error } = await supabase.from('profiles').update({ location_id }).eq('id', u.id)
    if (!error) {
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, location_id } : x)))
    }
  }

  async function deleteUser(u: UserRow) {
    if (u.id === currentUserId) {
      alert('Eigenen Account nicht löschbar.')
      return
    }
    if (!confirm(`Benutzer "${u.username}" löschen?`)) return
    const { error } = await supabase.rpc('admin_delete_user', { p_user_id: u.id })
    if (error) {
      alert('Löschen fehlgeschlagen.')
      return
    }
    setUsers((prev) => prev.filter((x) => x.id !== u.id))
  }

  return (
    <div className="border border-neutral-800 rounded">
      <div className="px-4 py-3 border-b border-neutral-800 text-xs font-mono uppercase text-lime-400">
        Benutzer
      </div>
      <div className="p-4">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-left text-xs uppercase text-neutral-500 border-b border-neutral-800">
              <th className="py-2 font-medium w-[16%]">Benutzername</th>
              <th className="py-2 font-medium w-[18%]">Vorname</th>
              <th className="py-2 font-medium w-[18%]">Nachname</th>
              <th className="py-2 font-medium w-[12%]">Rolle</th>
              <th className="py-2 font-medium w-[22%]">Standort</th>
              <th className="py-2 font-medium w-[14%]">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-900">
                <td className="py-2">{u.username}</td>
                <td className="py-2">{u.vorname}</td>
                <td className="py-2">{u.nachname}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${ROLE_CLASS[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="py-2">
                  {u.role === 'admin' ? (
                    <span className="text-xs text-neutral-500">Alle</span>
                  ) : (
                    <select
                      value={u.location_id ?? ''}
                      onChange={(e) => updateLocation(u, e.target.value)}
                      className="input w-auto min-w-[140px]"
                    >
                      <option value="">— keiner —</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="py-2 flex gap-1.5">
                  <button className="btn-secondary" onClick={() => openEdit(u)}>
                    ✎
                  </button>
                  {users.length > 1 && (
                    <button className="btn-danger" onClick={() => deleteUser(u)}>
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-secondary mt-4" onClick={openCreate}>
          + Benutzer hinzufügen
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <h2 className="font-bold">{editing ? 'Benutzer bearbeiten' : 'Benutzer hinzufügen'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <LabeledInput label="Vorname" value={vorname} onChange={setVorname} />
              <LabeledInput label="Nachname" value={nachname} onChange={setNachname} />
              <LabeledInput label="Benutzername (Login)" value={username} onChange={setUsername} />
              <LabeledInput label="E-Mail" value={email} onChange={setEmail} type="email" />
              <div>
                <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
                  Rolle
                </label>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input">
                  <option value="user">Benutzer</option>
                  <option value="service">Service</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
                  Standort
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="input"
                >
                  <option value="">— keiner —</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              {!editing && (
                <div className="text-xs text-neutral-500">
                  Default-Passwort wird automatisch vergeben (EinfachZweifach + aktuelles Jahr),
                  Nutzer muss es beim ersten Login ändern.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-800">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>
                Abbrechen
              </button>
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  )
}
