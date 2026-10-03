import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Which ESAT modules a student is sitting.
 *
 * Every candidate sits Maths 1 and, depending on the course, one or two more.
 * The catalogue asks once and then shows only those modules. The choice lives
 * on the account (GET/PUT /users/esat-modules) so it follows the student; a
 * signed-out visitor's choice is held on the device until they sign in, and
 * then copied to the account.
 *
 * Hand-written against the generic client, as accommodationsApi.ts is, so that
 * regenerating the SDK cannot rewrite it.
 */

export type EsatModule = 'maths_1' | 'maths_2' | 'physics' | 'chemistry' | 'biology'

/** In the order the catalogue shows them: Maths 1 first, because everyone
 *  sits it, then the order the ESAT itself lists them. */
export const ESAT_MODULES: { key: EsatModule; label: string; subject: string }[] = [
    { key: 'maths_1', label: 'Maths 1', subject: 'ESAT Math 1' },
    { key: 'maths_2', label: 'Maths 2', subject: 'ESAT Math 2' },
    { key: 'physics', label: 'Physics', subject: 'ESAT Physics' },
    { key: 'chemistry', label: 'Chemistry', subject: 'ESAT Chemistry' },
    { key: 'biology', label: 'Biology', subject: 'ESAT Biology' },
]

/** Besides Maths 1, a student picks at least this many and at most this many. */
export const MIN_EXTRA_MODULES = 1
export const MAX_EXTRA_MODULES = 2

export function isValidChoice(modules: EsatModule[]): boolean {
    const set = new Set(modules)
    const extras = set.size - 1
    return (
        set.size === modules.length &&
        set.has('maths_1') &&
        extras >= MIN_EXTRA_MODULES &&
        extras <= MAX_EXTRA_MODULES
    )
}

/** The subject strings a choice covers, for filtering the catalogue. */
export function subjectsFor(modules: EsatModule[]): Set<string> {
    return new Set(
        ESAT_MODULES.filter((m) => modules.includes(m.key)).map((m) => m.subject)
    )
}

export const ESAT_MODULES_QUERY_KEY = ['my-esat-modules']

export async function fetchMyEsatModules(): Promise<EsatModule[] | null> {
    const result = await client.get({
        url: '/users/esat-modules',
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not load your modules.')
    }
    return (result.data as { modules?: EsatModule[] | null }).modules ?? null
}

export async function saveMyEsatModules(modules: EsatModule[]): Promise<EsatModule[]> {
    const result = await client.put({
        url: '/users/esat-modules',
        body: { modules },
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not save your modules.')
    }
    return (result.data as { modules: EsatModule[] }).modules
}

const STORAGE_KEY = 'jomexam:esat-modules'

/** The choice made on this device, or null. Blocked or corrupt storage reads
 *  as no choice, which costs nothing but the picker showing again. */
export function readLocalEsatModules(): EsatModule[] | null {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
        return Array.isArray(parsed) && isValidChoice(parsed) ? parsed : null
    } catch {
        return null
    }
}

export function writeLocalEsatModules(modules: EsatModule[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(modules))
    } catch {
        // Blocked storage: the account still has it if they are signed in.
    }
}
