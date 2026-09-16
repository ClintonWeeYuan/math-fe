import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Access arrangements: extra time and pause-the-clock rest breaks.
 *
 * Hand-written against the generic client, as questionReportsApi.ts is, so
 * that regenerating the SDK cannot rewrite it. The endpoints are in the
 * committed openapi.json.
 */

export type Accommodation = {
    studentId: string
    studentName?: string | null
    studentEmail?: string | null
    extraTimePercent: number
    breakBudgetMinutes: number
    note?: string | null
    updatedAt?: string | null
    /** Set by the student themselves (applied at once, for the admin to
     *  review) rather than by an admin. */
    declaredByStudent?: boolean
}

/** The ESAT grants 25% as standard; more is possible with exceptional
 *  evidence, so the list offers the usual amounts without hiding the rest. */
export const EXTRA_TIME_CHOICES = [0, 25, 50, 100]

export function describeAccommodation(a: {
    extraTimePercent: number
    breakBudgetMinutes: number
}): string {
    const parts: string[] = []
    if (a.extraTimePercent > 0) parts.push(`${a.extraTimePercent}% extra time`)
    if (a.breakBudgetMinutes > 0) parts.push(`${a.breakBudgetMinutes} min of rest breaks`)
    return parts.length ? parts.join(' · ') : 'No arrangements'
}

/** What extra time means for one paper, in words a student can check. */
export function describeLength(timeLimitMinutes: number, extraTimePercent: number): string {
    const total = Math.round((timeLimitMinutes * (100 + extraTimePercent)) / 100)
    return `${timeLimitMinutes} min → ${total} min`
}

export async function fetchAccommodations(): Promise<Accommodation[]> {
    const result = await client.get({
        url: '/diagnostic/admin/accommodations',
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not load access arrangements.')
    }
    return (result.data as { accommodations: Accommodation[] }).accommodations
}

export async function saveAccommodation(input: {
    studentId: string
    extraTimePercent: number
    breakBudgetMinutes: number
    note?: string | null
}): Promise<Accommodation> {
    const result = await client.put({
        url: `/diagnostic/admin/accommodations/${input.studentId}`,
        body: {
            extraTimePercent: input.extraTimePercent,
            breakBudgetMinutes: input.breakBudgetMinutes,
            note: input.note || null,
        },
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not save the arrangement.')
    }
    return result.data as Accommodation
}

export const MY_ARRANGEMENTS_QUERY_KEY = ['my-access-arrangements']

export type MyArrangements = {
    /** Whether the student has been asked yet. Until they answer, the
     *  instructions screen asks before letting them start. */
    answered: boolean
    extraTimePercent: number
    breakBudgetMinutes: number
    note?: string | null
}

/** What a student can pick. 25% is the ESAT's usual grant, so it is named. */
export const STUDENT_EXTRA_TIME_CHOICES = [
    { value: 0, label: 'No extra time' },
    { value: 25, label: '25% extra time (the most common grant)' },
    { value: 50, label: '50% extra time' },
    { value: 100, label: '100% extra time' },
]

export const STUDENT_BREAK_CHOICES = [
    { value: 0, label: 'No rest breaks' },
    { value: 5, label: '5 minutes in total' },
    { value: 10, label: '10 minutes in total' },
    { value: 15, label: '15 minutes in total' },
    { value: 20, label: '20 minutes in total' },
    { value: 30, label: '30 minutes in total' },
]

export async function declareMyArrangements(input: {
    extraTimePercent: number
    breakBudgetMinutes: number
    note?: string | null
    confirmed: boolean
}): Promise<MyArrangements> {
    const result = await client.put({
        url: '/users/access-arrangements',
        body: {
            extraTimePercent: input.extraTimePercent,
            breakBudgetMinutes: input.breakBudgetMinutes,
            note: input.note || null,
            confirmed: input.confirmed,
        },
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not save your access arrangements.')
    }
    return result.data as MyArrangements
}

/** The student's own arrangements, for the instructions screen. */
/**
 * Whether the start button must wait for the student to answer the
 * arrangements question. Asked once, before the first paper, because the
 * attempt snapshots the arrangement when it starts. A signed-out visitor is
 * never asked, and a student whose answer cannot be loaded is never held up:
 * being unable to start at all would be worse than the standard clock.
 */
export function mustAnswerArrangements(input: {
    signedIn: boolean
    loadFailed: boolean
    arrangements: MyArrangements | undefined
}): boolean {
    return input.signedIn && !input.loadFailed && !input.arrangements?.answered
}

export async function fetchMyArrangements(): Promise<MyArrangements> {
    const result = await client.get({
        url: '/users/access-arrangements',
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not load your access arrangements.')
    }
    return result.data as MyArrangements
}
