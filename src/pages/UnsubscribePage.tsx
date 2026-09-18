import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Seo } from '@/components/Seo.tsx'
import { unsubscribe } from '@/lib/emailConsentApi.ts'

/**
 * Where the follow-up email's unsubscribe link lands. It unsubscribes on
 * arrival — one click, no sign-in, no second button — because that is what
 * the link promised. The token in the URL names the student.
 */
export function UnsubscribePage() {
    const [params] = useSearchParams()
    const token = params.get('token') ?? ''
    const [state, setState] = useState<'working' | 'done' | 'failed'>(
        token ? 'working' : 'failed'
    )
    // Strict mode mounts twice in development; one request is enough.
    const sent = useRef(false)

    useEffect(() => {
        if (!token || sent.current) return
        sent.current = true
        unsubscribe(token)
            .then(() => setState('done'))
            .catch(() => setState('failed'))
    }, [token])

    return (
        <LandingLayout>
            <Seo
                title="Unsubscribe | JomExam"
                description="Stop follow-up emails from JomExam."
                path="/email/unsubscribe"
            />
            <div className="mx-auto max-w-lg px-4 py-20 text-center">
                {state === 'working' && (
                    <p className="text-slate-500">Unsubscribing…</p>
                )}
                {state === 'done' && (
                    <>
                        <h1 className="mb-3 text-2xl font-semibold">
                            You&apos;re unsubscribed
                        </h1>
                        <p className="text-slate-600">
                            We won&apos;t send you any more follow-up emails.
                            Your account and reports are unchanged.
                        </p>
                    </>
                )}
                {state === 'failed' && (
                    <>
                        <h1 className="mb-3 text-2xl font-semibold">
                            That link didn&apos;t work
                        </h1>
                        <p className="text-slate-600">
                            Try the link in the email again, or write to{' '}
                            <a
                                className="underline underline-offset-4"
                                href="mailto:hello@jomexam.com"
                            >
                                hello@jomexam.com
                            </a>{' '}
                            and we&apos;ll unsubscribe you by hand.
                        </p>
                    </>
                )}
                <Link
                    to="/"
                    className="mt-8 inline-block text-sm underline underline-offset-4"
                >
                    Back to JomExam
                </Link>
            </div>
        </LandingLayout>
    )
}
