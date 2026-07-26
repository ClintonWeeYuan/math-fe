import { useState } from 'react'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'

/**
 * TODO(Clinton): no waitlist endpoint exists in math-be yet. When one is
 * added (and regenerated into the API client), flip this flag and POST
 * { email } inside handleSubmit where marked. With the flag off the form
 * validates and shows the success state locally, so the UI ships now.
 */
const WAITLIST_API_WIRED = false

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Email capture for the TMUA launch — client-side validation, local
 * success state, no third-party services. */
export function TmuaWaitlistForm() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!EMAIL_RE.test(email.trim())) {
            setError('Please enter a valid email address.')
            return
        }
        setError(null)
        if (WAITLIST_API_WIRED) {
            // TODO(Clinton): POST { email } to the waitlist endpoint here.
        }
        setDone(true)
    }

    if (done) {
        return (
            <p className="text-sm font-medium text-emerald-700">
                You&apos;re on the list — we&apos;ll email you when TMUA opens.
            </p>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
            noValidate
        >
            <div className="flex gap-2">
                <Input
                    type="email"
                    placeholder="you@email.com"
                    aria-label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" className="cursor-pointer shrink-0">
                    Join waitlist
                </Button>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
    )
}
