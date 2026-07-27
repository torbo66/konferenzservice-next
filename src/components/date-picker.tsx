'use client'

import { useEffect, useRef, useState } from 'react'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function formatDisplay(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function todayIso(): string {
  const now = new Date()
  return toIso(now.getFullYear(), now.getMonth(), now.getDate())
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Datum wählen',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const initial = value ? new Date(value + 'T00:00:00') : new Date()
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function goToMonth(delta: number) {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setViewMonth(m)
    setViewYear(y)
  }

  function selectDay(day: number) {
    onChange(toIso(viewYear, viewMonth, day))
    setOpen(false)
  }

  function selectToday() {
    const iso = todayIso()
    const d = new Date(iso + 'T00:00:00')
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
    onChange(iso)
    setOpen(false)
  }

  function clear() {
    onChange('')
    setOpen(false)
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  // Montag = 0 statt JS-Standard Sonntag = 0
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input w-auto flex items-center gap-2 text-left"
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <span className="text-neutral-500 dark:text-neutral-500">📅</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded shadow-lg p-3 w-64">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              className="w-6 h-6 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              ‹
            </button>
            <span className="text-sm font-medium">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              className="w-6 h-6 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[10px] uppercase text-neutral-500 dark:text-neutral-500 py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`blank-${idx}`} />
              const iso = toIso(viewYear, viewMonth, day)
              const isSelected = iso === value
              const isToday = iso === todayIso()
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-7 w-7 rounded text-xs flex items-center justify-center ${
                    isSelected
                      ? 'bg-lime-400 text-black font-semibold'
                      : isToday
                      ? 'border border-lime-600 dark:border-lime-400 text-neutral-900 dark:text-neutral-100'
                      : 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className="flex justify-between mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button type="button" onClick={selectToday} className="text-xs text-lime-700 dark:text-lime-400">
              Heute
            </button>
            <button type="button" onClick={clear} className="text-xs text-neutral-500 dark:text-neutral-500">
              Zurücksetzen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
