import { Link } from 'react-router-dom'
import type { PublishedDiagnosticSet } from '@/client'
import useListPublishedSetsQuery from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'
import useMyAttemptsQuery from '@/hooks/diagnostic/useMyAttemptsQuery.ts'
import { testFromSubject } from '@/lib/diagnosticNextSteps.ts'
import { MINI_FIRST_TESTS } from '@/lib/miniFirst.ts'

function isMini(set: PublishedDiagnosticSet): boolean {
    return (set as { format?: string }).format === 'mini'
}

/**
 * On a full paper's start screen, for a student who has sat nothing in this
 * subject yet: the mini is there if they would rather start smaller.
 *
 * Only on a mini-first test (see src/lib/miniFirst.ts), and never in the way:
 * it is a sentence and a link above the start button, not a step before it.
 * Hidden while either list is loading, and once anything in the subject has
 * been started, since by then the student knows what the full paper is.
 */
export function TryMiniFirst({
    subject,
    fullMinutes,
    signedIn,
}: {
    subject: string | null | undefined
    fullMinutes: number
    signedIn: boolean
}) {
    const test = testFromSubject(subject)
    const { data: sets } = useListPublishedSetsQuery(test)
    const { data: attempts, isLoading } = useMyAttemptsQuery({ enabled: signedIn })

    if (test === undefined || !MINI_FIRST_TESTS.has(test) || !subject) return null
    const mini = (sets ?? []).find((s) => s.subject === subject && isMini(s))
    if (!mini) return null
    if (signedIn && (isLoading || (attempts ?? []).some((a) => a.subject === subject))) {
        return null
    }

    const paper = subject.replace(/^(ESAT|TMUA)\s+/i, '')
    return (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            First time on {test.toUpperCase()} {paper}? This paper is{' '}
            {fullMinutes} minutes. If you&apos;d rather start smaller, the mini is{' '}
            {mini.questionCount} questions in {mini.timeLimitMinutes} minutes, at the
            same pace, with a score and a review of every answer.{' '}
            <Link
                to={`/diagnostic/sets/${mini.id}`}
                className="font-medium text-slate-900 underline underline-offset-4"
            >
                Try the mini first →
            </Link>
        </div>
    )
}
