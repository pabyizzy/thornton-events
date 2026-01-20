// lib/ics.ts
export type IcsEvent = {
    id: string
    title: string
    description?: string | null
    url?: string | null
    venue?: string | null
    city?: string | null
    state?: string | null
    start_time: string | null
    end_time?: string | null
    timezone?: string | null
  }
  
  function fmtDate(dtISO: string, tz?: string | null) {
    // ICS prefers UTC (Z). We’ll convert to UTC and format YYYYMMDDTHHMMSSZ.
    const d = new Date(dtISO)
    const yyyy = d.getUTCFullYear()
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    const hh = String(d.getUTCHours()).padStart(2, '0')
    const mi = String(d.getUTCMinutes()).padStart(2, '0')
    const ss = String(d.getUTCSeconds()).padStart(2, '0')
    return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`
  }
  
  export function buildIcs(e: IcsEvent) {
    if (!e.start_time) throw new Error('Missing start_time')
  
    const uid = e.id
    const now = fmtDate(new Date().toISOString())
    const dtStart = fmtDate(e.start_time, e.timezone || undefined)
    const dtEnd = e.end_time ? fmtDate(e.end_time, e.timezone || undefined) : undefined
  
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Thornton Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      ...(dtEnd ? [`DTEND:${dtEnd}`] : []),
      `SUMMARY:${escapeText(e.title)}`,
      `DESCRIPTION:${escapeText((e.description || '') + (e.url ? `\\n\\nMore info: ${e.url}` : ''))}`,
      `LOCATION:${escapeText([e.venue, e.city, e.state].filter(Boolean).join(', '))}`,
      ...(e.url ? [`URL:${e.url}`] : []),
      'END:VEVENT',
      'END:VCALENDAR',
    ]
  
    return lines.join('\r\n')
  }
  
  export function downloadIcs(e: IcsEvent, filename = 'event.ics') {
    const ics = buildIcs(e)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
  
  function escapeText(s: string) {
    // RFC5545 escaping
    return s
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n')
  }
  