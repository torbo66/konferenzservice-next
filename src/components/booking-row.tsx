import type { Booking, Role, Room } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ausstehend',
  active: 'Aktiv',
  done: 'Abgeschl.',
  billed: 'Abgerechnet',
}
const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200',
  active: 'bg-lime-500/20 text-lime-700 dark:text-lime-400',
  done: 'bg-blue-500/20 text-blue-400',
  billed: 'bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300',
}

export function nextStatus(s: string) {
  return s === 'pending' ? 'active' : s === 'active' ? 'done' : 'billed'
}
export function nextStatusLabel(s: string) {
  return s === 'pending' ? '▶ Starten' : s === 'active' ? '■ Beenden' : s === 'done' ? '€ Abrechnen' : ''
}
export function roomLocationName(rooms: Room[], locations: { id: number; name: string }[], roomName: string) {
  const r = rooms.find((x) => x.name === roomName)
  if (!r?.location_id) return '—'
  return locations.find((l) => l.id === r.location_id)?.name ?? '—'
}

export function BookingRow({
  booking,
  rooms,
  locations,
  role,
  compact,
  onEdit,
  onAdvanceStatus,
  onDelete,
  onPrint,
}: {
  booking: Booking
  rooms: Room[]
  locations: { id: number; name: string }[]
  role: Role
  compact: boolean
  onEdit: (b: Booking) => void
  onAdvanceStatus: (b: Booking) => void
  onDelete: (b: Booking) => void
  onPrint: (b: Booking) => void
}) {
  const b = booking
  const isAdmin = role === 'admin'
  const locked = b.status === 'billed' && !isAdmin
  const count = b.products?.reduce((s, p) => s + p.qty, 0) ?? 0
  const loc = roomLocationName(rooms, locations, b.room)

  const actions = (
    <div className="flex gap-1.5">
      {!locked && (
        <button className="btn-secondary" onClick={() => onEdit(b)}>
          ✎
        </button>
      )}
      <button className="btn-secondary" onClick={() => onPrint(b)}>
        🖶
      </button>
      {!locked && b.status !== 'billed' && (
        <button className="btn-secondary" onClick={() => onAdvanceStatus(b)}>
          {nextStatusLabel(b.status)}
        </button>
      )}
      {!locked && (
        <button className="btn-danger" onClick={() => onDelete(b)}>
          ✕
        </button>
      )}
      {locked && <span className="text-xs text-neutral-600 dark:text-neutral-500 self-center">🔒 gesperrt</span>}
    </div>
  )

  if (compact) {
    return (
      <tr className="border-b border-neutral-200 dark:border-neutral-800">
        <td className="py-2 px-2">{b.room}</td>
        <td className="py-2 px-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">{loc}</td>
        <td className="py-2 px-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">
          {b.date} {b.time_from?.slice(0, 5)}–{b.time_to?.slice(0, 5)}
        </td>
        <td className="py-2 px-2">{b.costcenter}</td>
        <td className="py-2 px-2 font-mono text-xs">{b.participants}</td>
        <td className="py-2 px-2 font-mono text-xs">{count} Pos.</td>
        <td className="py-2 px-2">
          <span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[b.status]}`}>
            {STATUS_LABEL[b.status]}
          </span>
        </td>
        <td className="py-2 px-2">{actions}</td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-neutral-200 dark:border-neutral-800">
      <td className="py-2 px-2 font-mono text-xs text-neutral-600 dark:text-neutral-500">#{b.id}</td>
      <td className="py-2 px-2">{b.room}</td>
      <td className="py-2 px-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">{loc}</td>
      <td className="py-2 px-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">{b.date}</td>
      <td className="py-2 px-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">{b.time_from?.slice(0, 5)}</td>
      <td className="py-2 px-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">{b.time_to?.slice(0, 5)}</td>
      <td className="py-2 px-2">{b.costcenter}</td>
      <td className="py-2 px-2 font-mono text-xs">{b.participants}</td>
      <td className="py-2 px-2 font-mono text-xs">{count} Pos.</td>
      <td className="py-2 px-2">
        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[b.status]}`}>
          {STATUS_LABEL[b.status]}
        </span>
      </td>
      <td className="py-2 px-2">{actions}</td>
    </tr>
  )
}
