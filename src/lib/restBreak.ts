/** How a rest-break allowance is said to a student: the number they need to
 *  decide whether they can afford to stop now, never raw seconds. */
export function formatAllowance(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const rest = seconds % 60
    if (minutes && rest) return `${minutes} min ${rest} s`
    if (minutes) return `${minutes} minute${minutes === 1 ? '' : 's'}`
    return `${rest} second${rest === 1 ? '' : 's'}`
}

/** A running clock, m:ss, the same shape as the exam timer so the two read as
 *  one family. Rounded up, so it never shows 0:00 while time remains. */
export function formatClock(ms: number): string {
    const total = Math.max(0, Math.ceil(ms / 1000))
    const minutes = Math.floor(total / 60)
    return `${minutes}:${(total % 60).toString().padStart(2, '0')}`
}

/** When the break screen starts warning that the allowance is nearly spent. */
export const BREAK_WARNING_MS = 60_000
