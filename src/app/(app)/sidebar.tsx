'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Role } from '@/lib/types'
import { LogoutButton } from './logout-button'

interface NavItem {
  label: string
  href: string | null
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Übersicht', href: '/uebersicht', roles: ['admin', 'user'] },
  { label: 'Buchungen', href: '/buchungen', roles: ['admin', 'user'] },
  { label: 'Kalender', href: '/kalender', roles: ['admin', 'user', 'service'] },
  { label: 'Abrechnung', href: null, roles: ['admin', 'user'] },
  { label: 'Produkte', href: null, roles: ['admin', 'user'] },
  { label: 'Stammdaten', href: '/stammdaten', roles: ['admin'] },
  { label: 'Service', href: null, roles: ['service'] },
  { label: 'Einstellungen', href: '/einstellungen', roles: ['admin', 'user', 'service'] },
]

export function Sidebar({
  role,
  displayName,
  locationLabel,
}: {
  role: Role
  displayName: string
  locationLabel: string
}) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role))

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-800 flex flex-col bg-neutral-950">
      <div className="px-5 py-6">
        <h1 className="text-lg font-bold">
          Konferenz<span className="text-lime-400">Service</span>
        </h1>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {items.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm ${
                pathname === item.href
                  ? 'bg-neutral-800 text-lime-400'
                  : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <div
              key={item.label}
              className="flex items-center justify-between px-3 py-2 rounded text-sm text-neutral-600 cursor-not-allowed"
              title="Noch nicht verfügbar"
            >
              {item.label}
              <span className="text-[10px] border border-neutral-800 rounded px-1.5 py-0.5">
                bald
              </span>
            </div>
          )
        )}
      </nav>

      <div className="px-5 py-4 border-t border-neutral-800 text-xs text-neutral-500 font-mono">
        {displayName} ({role}) · {locationLabel}
        <div className="mt-2">
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
