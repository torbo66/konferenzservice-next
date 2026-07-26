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
import { CalendarView } from '@/components/calendar-view'

export default async function KalenderPage() {
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

  return (
    <CalendarView
      initialBookings={bookings}
      rooms={visibleRooms(rooms, profile)}
      costcenters={costcenters}
      categories={categories.map((c) => c.name)}
      products={products}
      favorites={settings.favorites}
      profile={profile}
      locations={locations}
    />
  )
}
