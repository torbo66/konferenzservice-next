import { getLocations } from '@/lib/data'
import { ChipList } from '@/components/chip-list'

export default async function StandortePage() {
  const locations = await getLocations()
  return (
    <ChipList table="locations" title="Standorte" placeholder="Standortname" initialItems={locations} />
  )
}
