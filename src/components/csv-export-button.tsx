'use client'

import type { Booking } from '@/lib/types'

export function CsvExportButton({ bookings }: { bookings: Booking[] }) {
  function exportCsv() {
    const headers = [
      'ID',
      'Raum',
      'Kostenstelle',
      'Datum',
      'Von',
      'Bis',
      'Teilnehmer',
      'Status',
      'Abgerechnet',
    ]
    const rows = bookings.map((b) => [
      b.id,
      b.room,
      b.costcenter,
      b.date,
      b.time_from?.slice(0, 5),
      b.time_to?.slice(0, 5),
      b.participants,
      b.status,
      b.billed_total ?? 0,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `buchungen_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button className="btn-secondary" onClick={exportCsv}>
      Buchungen CSV exportieren
    </button>
  )
}
