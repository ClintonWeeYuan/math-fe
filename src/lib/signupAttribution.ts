import { storedAcquisition, storedAgentCode } from '@/lib/acquisition.ts'

/**
 * The attribution fields to attach to whichever signup call is being made.
 *
 * One helper for all three routes — password, Google, emailed code — because
 * an account whose origin is recorded on some routes and not others produces a
 * funnel that silently under-counts whichever one was forgotten. That is the
 * failure `created_via` exists to prevent, and this is the same shape of fact.
 *
 * Attaching it in the mutation hooks rather than in the pages means no signup
 * form has to remember: a fourth sign-in route added later gets this by
 * calling the same helper, and a page that forgets is not a way to lose data.
 *
 * The server writes these only when the call creates an account. Sending them
 * on a sign-in that matches an existing account is harmless and expected —
 * these endpoints cannot know in advance which they are doing.
 */
export function signupAttribution(): Record<string, unknown> {
    const acquisition = storedAcquisition()
    const agentCode = storedAgentCode()
    return {
        ...(acquisition ? { acquisition } : {}),
        ...(agentCode ? { agentCode } : {}),
    }
}
