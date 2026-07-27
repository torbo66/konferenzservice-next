import { redirect } from 'next/navigation'
import { getAppMeta, getCurrentProfile, getLocations } from '@/lib/data'
import { Sidebar } from './sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const [locations, appMeta] = await Promise.all([getLocations(), getAppMeta()])
  const locationLabel =
    profile.role === 'admin'
      ? 'Alle Standorte'
      : locations.find((l) => l.id === profile.location_id)?.name ?? 'Kein Standort'

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Sidebar
        role={profile.role}
        displayName={profile.vorname ?? profile.username}
        locationLabel={locationLabel}
        appVersion={appMeta.version}
        appBuildDate={appMeta.build_date}
      />
      <main className="flex-1 min-w-0 px-8 py-8">{children}</main>
    </div>
  )
}
