import type { AdminAttemptResultRow } from '@/client'

/** RFC-4180 field escaping: wrap in quotes and double any embedded quote when
 * the value contains a comma, quote, or newline. */
function csvField(value: string | number | null | undefined): string {
    const s = value === null || value === undefined ? '' : String(value)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const HEADERS = [
    'Student email',
    'Set',
    'Subject',
    'Status',
    'Score',
    'Answered',
    'Questions',
    'Time (s)',
    'Started',
    'Submitted',
] as const

/**
 * Turn the admin results rows into a CSV string for download — one row per
 * attempt, the same columns the table shows. Kept pure (no DOM) so it's
 * unit-testable; the page wires the Blob download around it.
 */
export function resultsToCsv(rows: AdminAttemptResultRow[]): string {
    const lines = [HEADERS.join(',')]
    for (const r of rows) {
        lines.push(
            [
                csvField(r.studentEmail),
                csvField(r.setTitle),
                csvField(r.subject),
                csvField(r.status),
                csvField(r.totalScore),
                csvField(r.answeredCount),
                csvField(r.questionCount),
                csvField(r.totalTimeSeconds),
                csvField(r.startedAt),
                csvField(r.submittedAt),
            ].join(',')
        )
    }
    return lines.join('\n')
}

/** Trigger a client-side download of the results as a CSV file. */
export function downloadResultsCsv(rows: AdminAttemptResultRow[]): void {
    const blob = new Blob([resultsToCsv(rows)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagnostic-results-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
