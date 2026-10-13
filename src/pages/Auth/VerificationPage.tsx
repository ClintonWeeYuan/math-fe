import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useVerifyAccountMutation } from '@/components/auth/useVerifyAccountMutation.ts'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import { resendVerificationUsersResendVerificationPost } from '@/client'
import { trackEvent } from '@/lib/analytics.ts'
import { trackAuthFailed } from '@/lib/authFunnel.ts'
import { emailInToken } from '@/lib/verificationLink.ts'

/**
 * Where the link in the sign-up email lands.
 *
 * This page used to say "Verifying…" for ever when the link failed: no
 * message, no way out. Students re-submitted the sign-up form, which killed
 * the earlier links, and clicked those until the rate limiter stopped them.
 * Now a failed link says what happened and offers a new one, and an
 * already-verified account is sent to sign in.
 */
export function VerificationPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { login } = useAuth()
    const token = searchParams.get('token')
    const [failure, setFailure] = useState<string | null>(
        token ? null : 'This link is missing its code. Try the link in the email again.'
    )
    const [email, setEmail] = useState(() => emailInToken(token))
    const [sent, setSent] = useState(false)

    const { mutate: verify, isPending } = useVerifyAccountMutation({
        onSuccess: (data) => {
            if (data === undefined) return
            if (data.token && data.user) {
                login({
                    user: data.user,
                    token: data.token,
                    callback: () => {
                        trackEvent('email_verified')
                        toast.success(data.message, { id: 'ACCOUNT_VERIFICATION_SUCCESS' })
                        navigate('/auth/more-info')
                    },
                })
                return
            }
            // Already verified, most often a second click on the same link.
            toast.success('Your email is already verified — please sign in.', {
                id: 'ACCOUNT_VERIFICATION_SUCCESS',
            })
            navigate('/auth/login')
        },
        // A link that fails (expired, already used) is where a password
        // sign-up can quietly end, so it is counted.
        onError: (err: Error) => {
            trackAuthFailed('password', 'signup', err)
            setFailure(err.message)
        },
    })

    const { mutate: resend, isPending: isResending } = useMutation({
        mutationFn: async (address: string) => {
            const result = await resendVerificationUsersResendVerificationPost({
                query: { email: address },
            })
            if (result.error !== undefined) {
                throw new Error("Couldn't send a new link just now. Please try again in a minute.")
            }
        },
        onSuccess: () => setSent(true),
        onError: (err: Error) => toast.error(err.message),
    })

    const hasTriggered = useRef(false)
    if (token && !hasTriggered.current && !isPending) {
        hasTriggered.current = true
        verify(token)
    }

    if (failure === null) {
        return (
            <div className="h-screen flex items-center justify-center text-slate-600">
                Verifying…
            </div>
        )
    }

    return (
        <div className="mx-auto mt-16 flex max-w-md flex-col gap-4 px-4">
            <h1 className="text-2xl font-semibold">That link didn&apos;t work</h1>
            <p className="text-gray-600">{failure}</p>
            {sent ? (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    Sent. Check your inbox for a new link — it can take a minute
                    to arrive. Any link from the last day works, so an older
                    email is fine too.
                </p>
            ) : (
                <form
                    className="flex flex-col gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (email.trim()) resend(email.trim())
                    }}
                >
                    <label htmlFor="verify-email" className="text-sm font-medium">
                        Send me a new link
                    </label>
                    <Input
                        id="verify-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div>
                        <Button type="submit" disabled={isResending || email.trim() === ''}>
                            {isResending ? 'Sending…' : 'Send a new link'}
                        </Button>
                    </div>
                </form>
            )}
            <p className="text-sm text-slate-500">
                Or skip the email altogether:{' '}
                <Link to="/auth/login" className="underline underline-offset-4">
                    sign in with Google or a one-time code
                </Link>
                . If you already verified, just sign in.
            </p>
        </div>
    )
}
