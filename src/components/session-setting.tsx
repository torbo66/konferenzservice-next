'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SessionSetting({ initialTimeout, editable }: { initialTimeout: number; editable: boolean }) {
  const supabase = createClient()
  const [timeout_, setTimeout_] = useState(initialTimeout)
  const [saved, setSaved] = useState(false)

  async function handleChange(value: number) {
    setTimeout_(value)
    if (!editable) return
    const { error } = await supabase.from('settings').update({ timeout: value }).eq('id', 1)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  return (
    <div className="border border-neutral-800 rounded">
      <div className="px-4 py-3 border-b border-neutral-800 text-xs font-mono uppercase text-lime-400">
        Sitzung
      </div>
      <div className="p-4">
        <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
          Automatische Abmeldung nach (Minuten)
        </label>
        <input
          type="number"
          min={1}
          max={480}
          value={timeout_}
          disabled={!editable}
          onChange={(e) => handleChange(parseInt(e.target.value) || 30)}
          className="input max-w-xs"
        />
        <div className="text-xs text-neutral-500 mt-2">
          Standard: 30 Minuten. Aktivität verlängert die Sitzung automatisch.
          {!editable && ' Nur Admins können dies ändern.'}
          {saved && <span className="text-lime-400 ml-2">Gespeichert</span>}
        </div>
      </div>
    </div>
  )
}
