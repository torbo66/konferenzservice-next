import { redirect } from 'next/navigation'
import {
  getBookings,
  getCategories,
  getCostCenters,
  getCurrentProfile,
  getLocations,
  getProducts,
  getRooms,
  getSettings,
  visibleRooms,
} from '@/lib/data'
import { BookingsManager } from '@/components/bookings-manager'

function ymd(d: Date) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default async function UebersichtPage() {
  const [profile, bookings, rooms, costcenters, categories, products, locations, settings] =
    await Promise.all([
      getCurrentProfile(),
      getBookings(),
      getRooms(),
      getCostCenters(),
      getCategories(),
      getProducts(),
      getLocations(),
      getSettings(),
    ])

  if (!profile) return null
  if (profile.role === 'service') redirect('/kalender')

  const today = ymd(new Date())
  const month = today.slice(0, 7)
  const todayCount = bookings.filter((b) => b.date === today).length
  const activeCount = bookings.filter((b) => b.status === 'active').length
  const pendingBillCount = bookings.filter((b) => b.status === 'done').length
  const revenue = bookings
    .filter((b) => b.status === 'billed' && b.date?.startsWith(month))
    .reduce((s, b) => s + (b.billed_total ?? 0), 0)

  const stats = [
    { label: 'Heute', value: todayCount },
    { label: 'Aktiv', value: activeCount },
    { label: 'Abzurechnen', value: pendingBillCount },
    { label: 'Umsatz (Monat)', value: revenue.toFixed(2) + ' €' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">
        Über<span className="text-lime-700 dark:text-lime-400">sicht</span>
      </h1>
      <p className="text-xs text-neutral-600 dark:text-neutral-500 font-mono mb-6">
        {new Date().toLocaleDateString('de-DE', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="border border-neutral-200 dark:border-neutral-800 rounded p-4">
            <div className="text-xs uppercase text-neutral-600 dark:text-neutral-500 mb-1">{s.label}</div>
            <div className="text-2xl font-bold font-mono">{s.value}</div>
          </div>
        ))}
      </div>

      <BookingsManager
        initialBookings={bookings}
        rooms={visibleRooms(rooms, profile)}
        costcenters={costcenters}
        categories={categories.map((c) => c.name)}
        products={products}
        favorites={settings.favorites}
        profile={profile}
        locations={locations}
        mode="overview"
      />
    </div>
  )
}
