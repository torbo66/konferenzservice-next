import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('vorname, nachname, username, role, location_id')
    .eq('id', user?.id ?? '')
    .single()

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">
          Konferenz<span className="text-lime-400">Service</span>
        </h1>
        <LogoutButton />
      </div>

      <div className="text-sm text-neutral-400 font-mono">
        Eingeloggt als {profile?.vorname} {profile?.nachname} (@{profile?.username}) ·
        Rolle: {profile?.role}
      </div>

      <div className="mt-8 border border-neutral-800 rounded p-6 text-neutral-500 text-sm">
        Phase 1 abgeschlossen: Login, Passwort-Zwangswechsel, Session. Die
        eigentlichen Ansichten (Übersicht, Buchungen, Kalender, ...) folgen in
        Phase 3.
      </div>
    </div>
  )
}
