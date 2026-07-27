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

export default async function BuchungenPage() {
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

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">
        Buch<span className="text-lime-700 dark:text-lime-400">ungen</span>
      </h1>
      <BookingsManager
        initialBookings={bookings}
        rooms={visibleRooms(rooms, profile)}
        costcenters={costcenters}
        categories={categories.map((c) => c.name)}
        products={products}
        favorites={settings.favorites}
        profile={profile}
        locations={locations}
        mode="list"
      />
    </div>
  )
}
