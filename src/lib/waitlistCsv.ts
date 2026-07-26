import type { WaitlistEntry } from '@/client'

/** RFC-4180 field escaping: wrap in quotes and double any embedded quote when
 * the value contains a comma, quote, or newline. */
function csvField(value: string | number | null | undefined): string {
    const s = value === null || value === undefined ? '' : String(value)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const HEADERS = ['Email', 'Product', 'Signed up'] as const

/**
 * Turn waitlist signups into a CSV string — one row per signup, the columns
 * the table shows. Kept pure (no DOM) so it's unit-testable; the page wires
 * the Blob download around it. The export is what you paste into an email
 * tool when a product opens.
 */
export function waitlistToCsv(entries: WaitlistEntry[]): string {
    const lines = [HEADERS.join(',')]
    for (const e of entries) {
        lines.push(
            [
                csvField(e.email),
                csvField(e.product),
                csvField(e.createdAt),
            ].join(',')
        )
    }
    return lines.join('\n')
}

/** Trigger a client-side download of the signups as a CSV file. */
export function downloadWaitlistCsv(entries: WaitlistEntry[]): void {
    const blob = new Blob([waitlistToCsv(entries)], {
        type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
