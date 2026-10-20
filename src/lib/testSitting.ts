import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * The sittings a student can say they are preparing for, in the order they
 * are offered.
 *
 * January 2027 comes first because, from 16 October 2026, it is the only
 * sitting left for 2026–27 entry and the one most students arriving now are
 * preparing for. "Later" is for students starting early on the 2027–28 cycle,
 * who previously had nowhere to go. October stays so that students who sat it
 * can say so, but it is labelled as past.
 *
 * The values must match the database constraint user_info_test_sitting_known
 * and the backend's TestSitting.
 */
export const SITTING_OPTIONS = [
    { value: 'january_2027', label: 'January 2027' },
    { value: 'later', label: 'Later (2027–28 entry)' },
    { value: 'october_2026', label: 'October 2026 (already sat)' },
    { value: 'undecided', label: 'Not decided' },
] as const

export type TestSitting = (typeof SITTING_OPTIONS)[number]['value']

export type SurveyAnswers = {
    testSitting?: TestSitting | null
    targetUniversities?: string[] | null
    country?: string | null
}

export const SURVEY_ANSWERS_QUERY_KEY = ['diagnostic-survey-answers']

/** What the student has already told us. Fails open to "nothing known". */
export async function fetchSurveyAnswers(): Promise<SurveyAnswers> {
    const result = await client.get({
        url: '/users/diagnostic-survey',
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) throw new Error('Could not read your answers.')
    return (result.data ?? {}) as SurveyAnswers
}

/** Record the sitting. Resolves to whether it saved. */
export async function saveSitting(testSitting: TestSitting): Promise<boolean> {
    const result = await client.post({
        url: '/users/diagnostic-survey',
        body: { testSitting },
        headers: getAuthHeaders(),
    })
    return result.error === undefined
}

/** The last day of each sitting, matching SITTING_LAST_DAY in the backend's
 *  app/services/sittings.py. A student is finished the day after. */
const SITTING_LAST_DAY: Partial<Record<TestSitting, string>> = {
    october_2026: '2026-10-16',
    january_2027: '2027-01-08',
}

export function sittingIsOver(
    sitting: TestSitting | null | undefined,
    today: Date = new Date()
): boolean {
    const last = sitting ? SITTING_LAST_DAY[sitting] : undefined
    if (!last) return false
    return today.toISOString().slice(0, 10) > last
}
