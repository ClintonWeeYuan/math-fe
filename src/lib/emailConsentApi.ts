import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * The follow-up email's opt-in, and its unsubscribe link.
 *
 * Hand-written against the generic client, as accommodationsApi.ts is, so that
 * regenerating the SDK cannot rewrite it. The endpoints are in the committed
 * openapi.json.
 */

export type EmailConsent = {
    optedIn: boolean
    /** The label for the box, verbatim. The backend owns it, so the words it
     *  stores as the record of consent are the words the student saw. */
    wording: string
}

export const EMAIL_CONSENT_QUERY_KEY = ['email-consent']

export async function fetchEmailConsent(): Promise<EmailConsent> {
    const result = await client.get({
        url: '/users/email-consent',
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not load your email preference.')
    }
    return result.data as EmailConsent
}

export async function saveEmailConsent(
    optedIn: boolean,
    source: string
): Promise<EmailConsent> {
    const result = await client.put({
        url: '/users/email-consent',
        headers: getAuthHeaders(),
        body: { optedIn, source },
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, "Couldn't save that. Please try again.")
    }
    return result.data as EmailConsent
}

export async function unsubscribe(token: string): Promise<void> {
    const result = await client.post({
        url: '/users/email-unsubscribe',
        body: { token },
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, "Couldn't unsubscribe just now.")
    }
}
