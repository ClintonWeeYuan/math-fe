import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import { SolutionBlock } from '@/components/diagnostic/report/SolutionBlock.tsx'
import useAttemptReviewQuery, {
    type ReviewQuestion,
} from '@/hooks/diagnostic/useAttemptReviewQuery.ts'
import { trackEvent } from '@/lib/analytics.ts'

/**
 * Per-question review: what they picked, what was right, and why.
 *
 * Defaults to incorrect-only. A student who scored 20 of 27 does not need to
 * scroll past twenty questions they got right to reach the seven that taught
 * them something, and the wrong answers are where the misconception notes —
 * the thing this platform actually has that a mark scheme does not — live.
 *
 * The question and options always render. Solutions are content that arrives
 * over months; correct-answer marking is data we already have, so it ships now
 * regardless of how many worked solutions exist.
 */

function Verdict({ question }: { question: ReviewQuestion }) {
    if (question.isCorrect === null || question.isCorrect === undefined) {
        return (
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                Not answered
            </span>
        )
    }
    return question.isCorrect ? (
        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            Correct
        </span>
    ) : (
        <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
            Incorrect
        </span>
    )
}

function OptionRow({
    option,
}: {
    option: ReviewQuestion['options'][number]
}) {
    // Both facts are shown, and they are different facts: which one was right,
    // and which one they chose. A student who picked the right answer sees one
    // row carrying both marks.
    const tone = option.isCorrect
        ? 'border-emerald-200 bg-emerald-50'
        : option.isSelected
          ? 'border-rose-200 bg-rose-50'
          : 'border-slate-200'

    return (
        <li className={`rounded-md border px-3 py-2 text-sm ${tone}`}>
            <div className="flex items-start gap-2">
                <span className="font-semibold">{option.label}.</span>
                <span className="flex-1">
                    <LatexText text={option.text} />
                </span>
                <span className="shrink-0 text-xs text-slate-500">
                    {option.isCorrect && 'Correct answer'}
                    {option.isSelected && !option.isCorrect && 'Your answer'}
                    {option.isSelected && option.isCorrect && ' · your answer'}
                </span>
            </div>
        </li>
    )
}

function QuestionCard({ question }: { question: ReviewQuestion }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b border-slate-100 py-3 last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 text-left"
            >
                <span className="font-medium">
                    Question {question.questionOrderIndex + 1}
                </span>
                <span className="flex items-center gap-2">
                    <Verdict question={question} />
                    <span className="text-slate-400">{open ? '−' : '+'}</span>
                </span>
            </button>

            {open && (
                <div className="mt-3">
                    <div className="mb-3 text-sm leading-relaxed text-slate-700">
                        <LatexText text={question.stem} />
                    </div>

                    {question.diagramUrl && (
                        <img
                            src={question.diagramUrl}
                            alt=""
                            className="mb-3 max-w-full rounded-md border border-slate-200"
                        />
                    )}

                    <ul className="flex flex-col gap-2">
                        {question.options.map((option) => (
                            <OptionRow key={option.label} option={option} />
                        ))}
                    </ul>

                    {/* The specific mistake, immediately visible rather than
                        behind the disclosure. It is the shortest useful thing
                        on the card and the reason a wrong answer is worth
                        opening at all. */}
                    {question.options
                        .filter((o) => o.isSelected && o.misconception)
                        .map((o) => (
                            <p
                                key={o.label}
                                className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                            >
                                {/* Through LatexText like every other
                                    author-written field. None of the 487
                                    notes written so far use maths, but an
                                    author reaching for $x^2$ in one should
                                    not be the way we find out this was the
                                    single field that rendered it literally. */}
                                <LatexText text={o.misconception as string} />
                            </p>
                        ))}

                    <SolutionBlock
                        questionId={question.questionId}
                        solutionText={question.solutionText}
                        solutionVideoUrl={question.solutionVideoUrl}
                    />
                </div>
            )}
        </div>
    )
}

export function ReviewAnswers({ attemptId }: { attemptId: string }) {
    const [incorrectOnly, setIncorrectOnly] = useState(true)
    const { data, isLoading, isError } = useAttemptReviewQuery({ attemptId })

    useEffect(() => {
        if (data) trackEvent('review_opened', { attemptId })
    }, [data, attemptId])

    if (isLoading || isError || !data) {
        // Silent on failure. The report above this is the thing the student
        // came for and is already rendered; a red error block under it would
        // make a working page look broken.
        return null
    }

    const wrong = data.questions.filter((q) => q.isCorrect === false)
    const shown = incorrectOnly ? wrong : data.questions

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xl font-medium">Review your answers</h2>
            <Card>
                <CardContent className="pt-6">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-600">
                            {wrong.length === 0
                                ? 'You got every question right — the full paper is below.'
                                : `${wrong.length} of ${data.questions.length} went wrong. Each one shows what you picked and why.`}
                        </p>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={incorrectOnly}
                                onChange={(event) => {
                                    setIncorrectOnly(event.target.checked)
                                    trackEvent('incorrect_filter_used', {
                                        attemptId,
                                        metadata: {
                                            incorrectOnly: event.target.checked,
                                        },
                                    })
                                }}
                            />
                            Only what I got wrong
                        </label>
                    </div>

                    {shown.length === 0 ? (
                        <p className="py-3 text-sm text-slate-500">
                            Nothing to show with that filter on.
                        </p>
                    ) : (
                        shown.map((question) => (
                            <QuestionCard
                                key={question.questionId}
                                question={question}
                            />
                        ))
                    )}
                </CardContent>
            </Card>
        </section>
    )
}
