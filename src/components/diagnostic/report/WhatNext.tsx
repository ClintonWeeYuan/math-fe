import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import useListPublishedSetsQuery from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'
import type { PublishedDiagnosticSet } from '@/client'
import { BILLING_LIVE } from '@/lib/billing.ts'
import { nextStepsFor, testFromSubject } from '@/lib/diagnosticNextSteps.ts'

/** "ESAT Math 1" -> "Math 1". The test is already named by the heading, so
 *  repeating it on five cards is noise. */
function withoutTestPrefix(subject: string): string {
    return subject.replace(/^(ESAT|TMUA)\s+/i, '')
}

/** `primary` is the one recommendation being argued for in the prose above
 *  it. It has to outrank the browse-the-rest grid visually, or the card the
 *  copy just made the case for is the faintest thing on the page. */
function SetCard({
    set,
    primary = false,
}: {
    set: PublishedDiagnosticSet
    primary?: boolean
}) {
    const navigate = useNavigate()
    const label = set.subject ? withoutTestPrefix(set.subject) : set.title

    return (
        <div
            className={`flex flex-col gap-2 rounded-lg border p-4 ${
                primary ? 'border-slate-300 bg-slate-50' : 'border-slate-200'
            }`}
        >
            <p className="font-medium">{label}</p>
            <p className="text-sm text-slate-500">
                {set.questionCount} questions · {set.timeLimitMinutes} min
                {set.isFree ? ' · free' : ''}
            </p>
            <Button
                variant={primary ? 'default' : 'outline'}
                className="mt-auto cursor-pointer"
                onClick={() => navigate(`/diagnostic/sets/${set.id}`)}
            >
                Start →
            </Button>
        </div>
    )
}

/**
 * Where to go after reading your report.
 *
 * The report used to end at "Back to home", which threw away the one moment a
 * student is provably engaged — they have just sat a paper and read what it
 * found. Most arrive on Mathematics 1 from the guides and never learn the
 * other four modules exist.
 *
 * Rendered only on the student's own report, via the page's footer slot, so
 * the admin view of the same report is untouched: an admin reading a
 * student's results has no use for "start a diagnostic" buttons.
 */
export function WhatNext({
    subject,
    currentSetId,
    isMini,
}: {
    subject: string | null | undefined
    currentSetId: string
    isMini: boolean
}) {
    const test = testFromSubject(subject)
    const { data: sets } = useListPublishedSetsQuery(test)

    const { sameSubject, otherSubjects } = nextStepsFor({
        subject,
        sets,
        currentSetId,
        isMini,
        billingLive: BILLING_LIVE,
    })

    // Nothing startable to point at — say nothing rather than render an empty
    // "what next" heading, which reads as a broken page.
    if (test === undefined || (!sameSubject && otherSubjects.length === 0)) {
        return null
    }

    const catalogue = `/diagnostics/${test}`
    const testName = test.toUpperCase()

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xl font-medium">What to do next</h2>
            <Card>
                <CardContent className="flex flex-col gap-5 pt-6">
                    {sameSubject && (
                        <div className="flex flex-col gap-3">
                            <p className="text-sm text-slate-600">
                                You sat the short version. The full paper is
                                what resolves every skill on the radar above —
                                same subject, same format as the real thing.
                            </p>
                            <div className="sm:max-w-sm">
                                <SetCard set={sameSubject} primary />
                            </div>
                        </div>
                    )}

                    {otherSubjects.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-sm text-slate-600">
                                {sameSubject
                                    ? 'Or start another module:'
                                    : `The other ${testName} modules, each with its own skills report:`}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {otherSubjects.map((set) => (
                                    <SetCard key={set.id} set={set} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Which modules a candidate actually needs depends on the
                        course they applied to, and we never asked. Rather than
                        rank the cards on a guess, point at the table that
                        answers it properly. */}
                    {test === 'esat' && (
                        <p className="text-sm text-slate-500">
                            Not sure which modules you need?{' '}
                            <Link
                                to="/guides/esat-practice-tests#format"
                                className="font-medium underline underline-offset-4"
                            >
                                The modules-by-course table
                            </Link>{' '}
                            lists what each Cambridge and Imperial course asks
                            for.
                        </p>
                    )}

                    <p className="text-sm text-slate-500">
                        <Link
                            to={catalogue}
                            className="font-medium underline underline-offset-4"
                        >
                            See every {testName} diagnostic →
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </section>
    )
}
