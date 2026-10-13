/** The email a sign-up link was issued for, read from the token's payload
 *  without checking its signature. Only used to prefill the resend box: the
 *  backend decides whether an account exists, and says the same thing
 *  either way. */
export function emailInToken(token: string | null): string {
    try {
        const payload = token?.split('.')[1]
        if (!payload) return ''
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        const email = (JSON.parse(json) as { email?: unknown }).email
        return typeof email === 'string' ? email : ''
    } catch {
        return ''
    }
}
