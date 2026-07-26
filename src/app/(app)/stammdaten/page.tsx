import { redirect } from 'next/navigation'
import {
  getCategories,
  getCostCenters,
  getCurrentProfile,
  getLocations,
  getRooms,
} from '@/lib/data'
import { createClient } from '@/lib/supabase/server'
import { ChipList } from '@/components/chip-list'
import { RoomsManager } from '@/components/rooms-manager'
import { UsersManager } from '@/components/users-manager'
import type { Profile } from '@/lib/types'

export default async function StammdatenPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/uebersicht')

  const supabase = await createClient()
  const [locations, costcenters, categories, rooms, { data: users }] = await Promise.all([
    getLocations(),
    getCostCenters(),
    getCategories(),
    getRooms(),
    supabase.from('profiles').select('*').order('username'),
  ])

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">
        Stamm<span className="text-lime-400">daten</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ChipList table="locations" title="Standorte" placeholder="Standortname" initialItems={locations} />
        <ChipList table="costcenters" title="Kostenstellen" placeholder="Kostenstelle" initialItems={costcenters} />
      </div>

      <div className="mb-4">
        <RoomsManager initialRooms={rooms} locations={locations} />
      </div>

      <div className="mb-4">
        <UsersManager
          initialUsers={(users as Profile[]) ?? []}
          locations={locations}
          currentUserId={profile.id}
        />
      </div>

      <div>
        <ChipList
          table="categories"
          title="Produktkategorien"
          placeholder="Kategoriename"
          initialItems={categories}
        />
      </div>
    </div>
  )
}
