'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PasswortAendernPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen haben.')
      return
    }
    if (password !== confirm) {
      setError('Passwörter stimmen nicht überein.')
      return
    }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError('Fehler beim Ändern: ' + updateError.message)
        return
      }
      const { error: rpcError } = await supabase.rpc('mark_password_changed')
      if (rpcError) {
        setError('Passwort geändert, aber Status konnte nicht aktualisiert werden. Bitte neu laden.')
        return
      }
      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">Passwort ändern</h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-500 font-mono mb-8">
          {'// Erforderlich vor dem ersten Zugriff'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
              Neues Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-lime-400"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
              Wiederholen
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-lime-400"
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-500 text-xs font-mono">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 text-black font-semibold py-2 rounded hover:bg-lime-300 disabled:opacity-50"
          >
            {loading ? 'Speichern...' : 'Passwort setzen'}
          </button>
        </form>
      </div>
    </div>
  )
}
