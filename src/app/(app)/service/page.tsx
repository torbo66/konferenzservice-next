import { getBookings, getCurrentProfile, getLocations, getProducts, getRooms, visibleRooms } from '@/lib/data'
import { ServiceView } from '@/components/service-view'

export default async function ServicePage() {
  const [profile, bookings, products, rooms, locations] = await Promise.all([
    getCurrentProfile(),
    getBookings(),
    getProducts(),
    getRooms(),
    getLocations(),
  ])
  if (!profile) return null

  return (
    <ServiceView
      initialBookings={bookings}
      products={products}
      rooms={visibleRooms(rooms, profile)}
      locations={locations}
    />
  )
}
