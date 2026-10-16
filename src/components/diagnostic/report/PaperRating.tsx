import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { trackEvent } from '@/lib/analytics.ts'
import { testFromSubject } from '@/lib/diagnosticNextSteps.ts'

type Question = 'feel' | 'vs_past_papers' | 'helped'
type Answers = Partial<Record<Question, string>> & {
    /** What they wrote, kept once sent so a reopened report shows it went. */
    feedback?: string
}

/** The answers the backend accepts for report_helped — REPORT_HELPED_ANSWERS
 *  on app/models/analytics.py. */
const HELPED = [
    { value: 'yes', label: 'Yes' },
    { value: 'a_bit', label: 'A bit' },
    { value: 'not_really', label: 'Not really' },
]
/** REPORT_FEEDBACK_MAX_CHARS on the backend; longer is a 4xx and dropped. */
const FEEDBACK_MAX = 500

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
 * Three one-tap questions on a student's report: whether the report helped,
 * how the paper felt, and how it compared with the real exam's past papers,
 * with a box for what would have made the report more useful.
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
    const [draft, setDraft] = useState('')
    const test = testFromSubject(subject)?.toUpperCase() ?? 'admissions test'
    const format = isMini ? 'mini' : 'full'

    const answer = (question: Question, value: string) => {
        const next = { ...answers, [question]: value }
        setAnswers(next)
        save(attemptId, next)
        trackEvent(question === 'helped' ? 'report_helped' : 'paper_rated', {
            attemptId,
            metadata:
                question === 'helped'
                    ? { answer: value, subject: subject ?? null, format }
                    : { question, answer: value, subject: subject ?? null, format },
        })
    }

    // The words go with the tap they already made, so the inbox email can
    // show both; the backend keeps them as one event on the attempt.
    const send = () => {
        const text = draft.trim()
        if (!text) return
        const next = { ...answers, feedback: text }
        setAnswers(next)
        save(attemptId, next)
        trackEvent('report_feedback', {
            attemptId,
            metadata: {
                text,
                helped: answers.helped ?? null,
                subject: subject ?? null,
                format,
            },
        })
    }

    const done =
        answers.helped !== undefined &&
        answers.feel !== undefined &&
        answers.vs_past_papers !== undefined

    // All three questions from the start, usefulness first. From 12 to 16
    // October 2026, 67 reports were opened, 11 students rated the paper, 7
    // compared it with past papers, 1 said whether the report helped and none
    // wrote anything. "Did this report help?" only appeared after a first tap,
    // and a thank-you arrived after the second, which read as the end. Now
    // nothing is hidden behind a tap except the box for the why, and the
    // thank-you waits until all three are answered.
    return (
        <Card>
            <CardContent className="flex flex-col gap-5 pt-6">
                <Choices
                    prompt="Did this report help you?"
                    options={HELPED}
                    selected={answers.helped}
                    onSelect={(v) => answer('helped', v)}
                />
                {answers.helped !== undefined && (
                    <div className="flex flex-col gap-2">
                        <label htmlFor="report-feedback" className="font-medium">
                            What would have made it more useful?
                        </label>
                        {answers.feedback !== undefined ? (
                            <>
                                <p className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                    {answers.feedback}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Thank you — Hazel reads every one of these.
                                </p>
                            </>
                        ) : (
                            <>
                                <Textarea
                                    id="report-feedback"
                                    value={draft}
                                    maxLength={FEEDBACK_MAX}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder="Anything at all — an explanation that was missing, a chart that didn't make sense, something you wanted to know and couldn't find."
                                />
                                <div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="cursor-pointer"
                                        disabled={draft.trim() === ''}
                                        onClick={send}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
                <Choices
                    prompt={`How did this ${isMini ? 'mini test' : 'paper'} feel?`}
                    options={FEEL}
                    selected={answers.feel}
                    onSelect={(v) => answer('feel', v)}
                />
                <Choices
                    prompt={`Compared with real ${test} past papers, was it…`}
                    options={VS_PAST_PAPERS}
                    selected={answers.vs_past_papers}
                    onSelect={(v) => answer('vs_past_papers', v)}
                />
                {done && (
                    <p className="text-sm text-slate-600">
                        Thank you! This helps us improve the reports and pitch
                        the papers at the real exam.
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
