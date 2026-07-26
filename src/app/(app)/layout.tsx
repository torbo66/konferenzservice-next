import { redirect } from 'next/navigation'
import { getCurrentProfile, getLocations } from '@/lib/data'
import { Sidebar } from './sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const locations = await getLocations()
  const locationLabel =
    profile.role === 'admin'
      ? 'Alle Standorte'
      : locations.find((l) => l.id === profile.location_id)?.name ?? 'Kein Standort'

  return (
    <div className="min-h-screen flex bg-neutral-950 text-neutral-100">
      <Sidebar
        role={profile.role}
        displayName={profile.vorname ?? profile.username}
        locationLabel={locationLabel}
      />
      <main className="flex-1 min-w-0 px-8 py-8">{children}</main>
    </div>
  )
}
