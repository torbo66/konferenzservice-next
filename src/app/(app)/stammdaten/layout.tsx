import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/data'
import { StammdatenTabs } from './tabs'

export default async function StammdatenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/uebersicht')

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">
        Stamm<span className="text-lime-400">daten</span>
      </h1>
      <StammdatenTabs />
      <div className="mt-6">{children}</div>
    </div>
  )
}
