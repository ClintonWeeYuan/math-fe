import { useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVerifyAccountMutation } from '@/components/auth/useVerifyAccountMutation.ts'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/AuthContext.tsx'

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
                        toast.success(data.message, {
                            id: 'ACCOUNT_VERIFICATION_SUCCESS',
                        })
                        navigate('/auth/more-info')
                    },
                })
            }
        },
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
