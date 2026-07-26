'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState('')
  const [buildDate, setBuildDate] = useState('')

  useEffect(() => {
    supabase
      .from('app_meta')
      .select('version, build_date')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setVersion(data.version ?? '')
          setBuildDate(data.build_date ?? '')
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Ungültige Zugangsdaten.')
      return
    }
    setLoading(true)
    try {
      const { data: email, error: resolveError } = await supabase.rpc(
        'resolve_login_email',
        { p_username: username.trim() }
      )
      if (resolveError || !email) {
        setError('Ungültige Zugangsdaten.')
        return
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        setError('Ungültige Zugangsdaten.')
        return
      }
      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">
          Konferenz<span className="text-lime-400">Service</span>
        </h1>
        <p className="text-xs text-neutral-500 font-mono mb-8">
          {version ? (
            <>
              {'// Dashboard ' + version}
              <br />
              {'// Stand ' + buildDate}
            </>
          ) : (
            '// Anmeldung'
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
              Benutzername
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-lime-400"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-lime-400"
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-mono">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 text-black font-semibold py-2 rounded hover:bg-lime-300 disabled:opacity-50"
          >
            {loading ? 'Prüfe...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
