import type { DiagnosticAttemptResponse } from '@/client'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'

type Props = {
    attempt: DiagnosticAttemptResponse
}

/**
 * Terminal state for a non-in_progress attempt. ExamPage switches to this
 * whenever attempt.status !== 'in_progress' — reached today only via a 409
 * on a write (the attempt timed out mid-exam), and in PR 2 also when the
 * countdown hits zero and auto-submits. Deliberately a minimal placeholder
 * for now: PR 4 turns this into the real review/summary, and Stage 5 adds
 * the Skills Radar report. The point of building it in PR 1 is that the
 * status switch it hangs off exists from the start, so PR 2/PR 4 extend
 * one shape rather than introduce a new one.
 */
export function AttemptClosedView({ attempt }: Props) {
    const navigate = useNavigate()
    const timedOut = attempt.status === 'timed_out'

    return (
        <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-semibold">
                {timedOut ? "Time's up" : 'Attempt submitted'}
            </h1>
            <p className="text-gray-600">
                {timedOut
                    ? 'The time limit for this diagnostic has passed, so it was submitted automatically.'
                    : 'Your answers have been submitted.'}{' '}
                Your report is ready.
            </p>
            <div className="flex gap-3">
                <Button
                    type="button"
                    onClick={() =>
                        navigate(`/diagnostic/attempts/${attempt.id}/report`)
                    }
                >
                    View your report
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                    Back to home
                </Button>
            </div>
        </div>
    )
}
