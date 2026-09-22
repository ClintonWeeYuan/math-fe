import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { trackEvent } from '@/lib/analytics.ts'
import { testFromSubject } from '@/lib/diagnosticNextSteps.ts'

type Question = 'feel' | 'vs_past_papers'
type Answers = Partial<Record<Question, string>>

/** The answers the backend accepts for paper_rated — PAPER_RATING_ANSWERS on
 *  app/models/analytics.py. A value not listed there is a 4xx and is dropped. */
const FEEL = [
    { value: 'too_easy', label: 'Too easy' },
    { value: 'about_right', label: 'About right' },
    { value: 'too_hard', label: 'Too hard' },
]
const VS_PAST_PAPERS = [
    { value: 'easier', label: 'Easier' },
    { value: 'similar', label: 'About the same' },
    { value: 'harder', label: 'Harder' },
    { value: 'not_tried', label: "I haven't tried any yet" },
]

const storageKey = (attemptId: string) => `paperRating:${attemptId}`

/** Remembered per attempt so reopening a report does not ask again. Only a
 *  convenience: the answers themselves live in analytics_events, and a
 *  private window that forgets them just shows the question once more. */
function load(attemptId: string): Answers {
    try {
        return JSON.parse(localStorage.getItem(storageKey(attemptId)) ?? '{}')
    } catch {
        return {}
    }
}

function save(attemptId: string, answers: Answers): void {
    try {
        localStorage.setItem(storageKey(attemptId), JSON.stringify(answers))
    } catch {
        // Blocked storage costs nothing but a repeat question.
    }
}

/**
 * Two one-tap questions on a student's report: how the paper felt, and how it
 * compared with the real exam's past papers.
 *
 * Scores alone cannot say whether a paper is pitched right — a keen cohort
 * scoring 75% could mean an easy paper or strong students. The second question
 * is the one that answers "is this on par with the real thing", so it follows
 * straight on from the first rather than being left for later.
 *
 * Each tap is its own paper_rated event; a changed mind is a later row, so
 * reports read the latest answer per attempt and question.
 */
export function PaperRating({
    attemptId,
    subject,
    isMini,
}: {
    attemptId: string
    subject: string | null | undefined
    isMini: boolean
}) {
    const [answers, setAnswers] = useState<Answers>(() => load(attemptId))
    const test = testFromSubject(subject)?.toUpperCase() ?? 'admissions test'

    const answer = (question: Question, value: string) => {
        const next = { ...answers, [question]: value }
        setAnswers(next)
        save(attemptId, next)
        trackEvent('paper_rated', {
            attemptId,
            metadata: {
                question,
                answer: value,
                subject: subject ?? null,
                format: isMini ? 'mini' : 'full',
            },
        })
    }

    const done = answers.feel !== undefined && answers.vs_past_papers !== undefined

    return (
        <Card>
            <CardContent className="flex flex-col gap-5 pt-6">
                <Choices
                    prompt={`How did this ${isMini ? 'mini test' : 'paper'} feel?`}
                    options={FEEL}
                    selected={answers.feel}
                    onSelect={(v) => answer('feel', v)}
                />
                {answers.feel !== undefined && (
                    <Choices
                        prompt={`Compared with real ${test} past papers, was it…`}
                        options={VS_PAST_PAPERS}
                        selected={answers.vs_past_papers}
                        onSelect={(v) => answer('vs_past_papers', v)}
                    />
                )}
                {done && (
                    <p className="text-sm text-slate-600">
                        Thank you! This helps us pitch our papers at the real exam.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

function Choices({
    prompt,
    options,
    selected,
    onSelect,
}: {
    prompt: string
    options: { value: string; label: string }[]
    selected: string | undefined
    onSelect: (value: string) => void
}) {
    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-medium">{prompt}</legend>
            <div className="flex flex-wrap gap-2">
                {options.map((o) => (
                    <Button
                        key={o.value}
                        type="button"
                        size="sm"
                        variant={selected === o.value ? 'default' : 'outline'}
                        aria-pressed={selected === o.value}
                        className="cursor-pointer"
                        onClick={() => onSelect(o.value)}
                    >
                        {o.label}
                    </Button>
                ))}
            </div>
        </fieldset>
    )
}
