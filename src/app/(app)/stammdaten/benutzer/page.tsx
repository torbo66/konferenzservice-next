import { getCurrentProfile, getLocations } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'
import { UsersManager } from '@/components/users-manager'
import type { Profile } from '@/lib/types'

export default async function BenutzerPage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()
  const [locations, { data: users }] = await Promise.all([
    getLocations(),
    supabase.from('profiles').select('*').order('username'),
  ])

  return (
    <UsersManager
      initialUsers={(users as Profile[]) ?? []}
      locations={locations}
      currentUserId={profile!.id}
    />
  )
}
