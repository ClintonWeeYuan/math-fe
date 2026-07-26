import { useMutation } from '@tanstack/react-query'
import { joinWaitlistWaitlistPost } from '@/client'
import type { WaitlistSignupRequest } from '@/client'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Join a product waitlist (TMUA now; ESAT Chemistry/Biology when they
 * open). No auth — visitors signing up aren't logged in. Throws on error
 * so the form shows the real reason instead of a false success, and the
 * backend's upsert makes a repeat signup a success rather than a 409.
 */
export default function useJoinWaitlistMutation() {
    return useMutation({
        mutationFn: async (body: WaitlistSignupRequest) => {
            const result = await joinWaitlistWaitlistPost({ body })
            if (result.error !== undefined) {
                throw toDiagnosticApiError(
                    result,
                    'Could not join the waitlist — please try again.'
                )
            }
            return result.data
        },
    })
}
