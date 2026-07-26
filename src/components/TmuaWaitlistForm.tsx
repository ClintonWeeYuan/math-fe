import { useState } from 'react'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import useJoinWaitlistMutation from '@/hooks/useJoinWaitlistMutation.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Props = {
    /** Which waitlist to join — must be a product the backend allows. */
    product?: 'tmua' | 'esat-chemistry' | 'esat-biology'
    /** Shown after a successful signup. */
    successMessage?: string
}

/** Email capture for an upcoming product. Validates client-side, then
 * posts to the waitlist endpoint; a repeat signup still succeeds because
 * the backend upserts. No third-party services. */
export function TmuaWaitlistForm({
    product = 'tmua',
    successMessage = "You're on the list — we'll email you when TMUA opens.",
}: Props) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)
    const { mutate: join, isPending } = useJoinWaitlistMutation()

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!EMAIL_RE.test(email.trim())) {
            setError('Please enter a valid email address.')
            return
        }
        setError(null)
        join(
            { email: email.trim(), product },
            {
                onSuccess: () => setDone(true),
                onError: (err) => setError(err.message),
            }
        )
    }

    if (done) {
        return (
            <p className="text-sm font-medium text-emerald-700">
                {successMessage}
            </p>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
            noValidate
        >
            {/* Stacked, not side by side: in a narrow card the row layout
                squeezed the input down to a few characters. Full width each,
                so the email is readable as it is typed. */}
            <Input
                type="email"
                placeholder="you@email.com"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="w-full"
            />
            <Button
                type="submit"
                className="cursor-pointer w-full"
                disabled={isPending}
            >
                {isPending ? 'Joining…' : 'Join waitlist'}
            </Button>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
    )
}
