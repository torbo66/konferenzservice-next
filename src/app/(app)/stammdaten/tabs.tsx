'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Standorte', href: '/stammdaten/standorte' },
  { label: 'Konferenzräume', href: '/stammdaten/konferenzraeume' },
  { label: 'Kostenstellen', href: '/stammdaten/kostenstellen' },
  { label: 'Benutzer', href: '/stammdaten/benutzer' },
  { label: 'Produktkategorien', href: '/stammdaten/produktkategorien' },
  { label: 'Produkte', href: '/stammdaten/produkte' },
]

export function StammdatenTabs() {
  const pathname = usePathname()
  return (
    <div className="flex gap-1 flex-wrap border-b border-neutral-200 dark:border-neutral-800 pb-2">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-3 py-1.5 rounded text-sm ${
            pathname === tab.href
              ? 'bg-neutral-200 dark:bg-neutral-800 text-lime-700 dark:text-lime-400'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
