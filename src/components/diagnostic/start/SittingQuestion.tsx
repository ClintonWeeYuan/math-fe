import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    SITTING_OPTIONS,
    SURVEY_ANSWERS_QUERY_KEY,
    fetchSurveyAnswers,
    saveSitting,
    type TestSitting,
} from '@/lib/testSitting.ts'
import { WeeklyPlanOptIn } from '@/components/diagnostic/WeeklyPlanOptIn.tsx'

/**
 * "Which sitting are you preparing for?", asked on the start screen, once.
 *
 * Until October 2026 the only place this was asked was the optional questions
 * after a paper, and 159 of 263 students never answered. It is the best
 * predictor of how much a student uses JomExam, and from 16 October it is the
 * only way to tell the January 2027 students from the rest. So it is now also
 * asked here, before the first paper, for anyone who has not answered.
 *
 * It never stands between the student and the paper: it is above the start
 * button, not instead of it; one tap saves; nothing has to be answered; and
 * a failed save or a failed read just means the question does not appear.
 */
export function SittingQuestion() {
    const queryClient = useQueryClient()
    const { data, isError } = useQuery({
        queryKey: SURVEY_ANSWERS_QUERY_KEY,
        queryFn: fetchSurveyAnswers,
        staleTime: 5 * 60_000,
        retry: false,
    })
    const [chosen, setChosen] = useState<TestSitting | null>(null)
    const { mutate, isPending, data: saved } = useMutation({
        mutationFn: saveSitting,
        onSuccess: (saved, sitting) => {
            if (!saved) return
            queryClient.setQueryData(SURVEY_ANSWERS_QUERY_KEY, {
                ...(data ?? {}),
                testSitting: sitting,
            })
        },
    })

    // Not asked while loading, if the read failed, or if it is already known,
    // unless it was answered just now, in which case say thank you.
    if (isError || data === undefined) return null
    if (data.testSitting && chosen === null) return null

    return (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-medium" id="sitting-question">
                Which sitting are you preparing for?
            </p>
            <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-labelledby="sitting-question"
            >
                {SITTING_OPTIONS.map((option) => {
                    const selected = chosen === option.value
                    return (
                        <button
                            key={option.value}
                            type="button"
                            disabled={isPending}
                            aria-pressed={selected}
                            onClick={() => {
                                setChosen(option.value)
                                mutate(option.value)
                            }}
                            className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                                selected
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'
                            }`}
                        >
                            {option.label}
                        </button>
                    )
                })}
            </div>
            <p className="mt-2 text-xs text-slate-500">
                {/* "Saved" only once the server says so. A failed save is
                    still not shown as an error, but it is not claimed as a
                    success either: the hint stays, and a second tap retries. */}
                {saved === true
                    ? 'Thanks — saved. You can change it after any paper.'
                    : 'One tap, and optional. It helps us show you what matters for your sitting.'}
            </p>
            {/* Once a sitting still ahead is saved, the natural next question:
                a plan each week until then. Not for October, which is over. */}
            {saved === true && chosen !== null && chosen !== 'october_2026' && (
                <WeeklyPlanOptIn source="start_screen" compact />
            )}
        </div>
    )
}
