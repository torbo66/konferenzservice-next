'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AppVersionSetting({
  initialVersion,
  initialBuildDate,
}: {
  initialVersion: string
  initialBuildDate: string
}) {
  const supabase = createClient()
  const [version, setVersion] = useState(initialVersion)
  const [buildDate, setBuildDate] = useState(initialBuildDate)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const { error } = await supabase
      .from('app_meta')
      .update({ version, build_date: buildDate })
      .eq('id', 1)
    setSaving(false)
    if (error) alert('Fehler beim Speichern.')
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase text-lime-700 dark:text-lime-400">
        App-Version
      </div>
      <div className="p-4">
        <div className="text-xs text-neutral-600 dark:text-neutral-500 mb-3">
          Wird beim Login-Screen und in der Sidebar angezeigt. Bei jedem Release aktualisieren!
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">Version</label>
            <input value={version} onChange={(e) => setVersion(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
              Stand (Datum/Zeit)
            </label>
            <input value={buildDate} onChange={(e) => setBuildDate(e.target.value)} className="input" />
          </div>
        </div>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Speichern...' : 'Version speichern'}
        </button>
      </div>
    </div>
  )
}
