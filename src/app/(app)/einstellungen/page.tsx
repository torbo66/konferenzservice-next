import { redirect } from 'next/navigation'
import { getAppMeta, getBookings, getCurrentProfile, getProducts, getSettings } from '@/lib/data'
import { SessionSetting } from '@/components/session-setting'
import { QuickSelectManager } from '@/components/quick-select-manager'
import { AppVersionSetting } from '@/components/app-version-setting'
import { CsvExportButton } from '@/components/csv-export-button'

export default async function EinstellungenPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const [settings, products, bookings, appMeta] = await Promise.all([
    getSettings(),
    getProducts(),
    getBookings(),
    getAppMeta(),
  ])
  const isAdmin = profile.role === 'admin'

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold mb-2">
        Ein<span className="text-lime-400">stellungen</span>
      </h1>

      <SessionSetting initialTimeout={settings.timeout} editable={isAdmin} />
      <QuickSelectManager
        products={products}
        initialQuickSelect={settings.quick_select}
        editable={isAdmin}
      />

      <div className="border border-neutral-800 rounded">
        <div className="px-4 py-3 border-b border-neutral-800 text-xs font-mono uppercase text-lime-400">
          Daten
        </div>
        <div className="p-4">
          <CsvExportButton bookings={bookings} />
          <div className="text-xs text-neutral-500 mt-3">
            Daten werden in Supabase gespeichert und sind für alle Nutzer verfügbar.
          </div>
        </div>
      </div>

      {isAdmin && (
        <AppVersionSetting initialVersion={appMeta.version} initialBuildDate={appMeta.build_date} />
      )}
    </div>
  )
}
