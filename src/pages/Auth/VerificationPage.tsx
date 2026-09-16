import { useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVerifyAccountMutation } from '@/components/auth/useVerifyAccountMutation.ts'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import { trackEvent } from '@/lib/analytics.ts'
import { trackAuthFailed } from '@/lib/authFunnel.ts'

export function VerificationPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { login } = useAuth()

    const { mutate: verify, isPending } = useVerifyAccountMutation({
        onSuccess: (data) => {
            if (data !== undefined) {
                login({
                    user: data.user,
                    token: data.token,
                    callback: () => {
                        trackEvent('email_verified')
                        toast.success(data.message, {
                            id: 'ACCOUNT_VERIFICATION_SUCCESS',
                        })
                        navigate('/auth/more-info')
                    },
                })
            }
        },
        // A link that fails (expired, already used) is where a password
        // sign-up can quietly end, so it is counted.
        onError: (err: Error) => trackAuthFailed('password', 'signup', err),
    })

    // Get specific parameter
    const token = searchParams.get('token')

    const hasTriggered = useRef(false)

    if (token && !hasTriggered.current && !isPending) {
        hasTriggered.current = true
        verify(token)
    }

    return (
        <div className="h-screen flex items-center justify-center">
            Verifying...
        </div>
    )
}
