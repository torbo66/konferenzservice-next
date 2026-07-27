'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('ks_theme', next ? 'dark' : 'light')
    } catch {
      // localStorage nicht verfügbar (z.B. privater Modus) - Umschalten funktioniert trotzdem für die Session
    }
    setDark(next)
  }

  return (
    <button
      onClick={toggle}
      className="text-neutral-600 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded w-6 h-6 flex items-center justify-center text-xs font-mono shrink-0"
      title="Hell/Dunkel umschalten"
      aria-label="Hell/Dunkel umschalten"
    >
      {dark ? '◑' : '◐'}
    </button>
  )
}
