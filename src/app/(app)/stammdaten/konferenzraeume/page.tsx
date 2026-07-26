import { getLocations, getRooms } from '@/lib/data'
import { RoomsManager } from '@/components/rooms-manager'

export default async function KonferenzraeumePage() {
  const [rooms, locations] = await Promise.all([getRooms(), getLocations()])
  return <RoomsManager initialRooms={rooms} locations={locations} />
}
