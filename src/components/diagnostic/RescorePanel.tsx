import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    applyRescore,
    fetchRescorePreview,
    type RescorePreview,
} from '@/lib/rescoreApi.ts'

type Props = {
    questionId: string
    /** Bumped by the parent after it saves the question, so the check runs
     *  again against the new key. */
    refreshKey?: number
    /** Say so when nothing needs re-scoring, rather than rendering nothing.
     *  Right where an admin came to check (a "wrong answer" report); noise
     *  on every question they open in the editor. */
    showWhenClean?: boolean
}

function mark(value: boolean | null): string {
    if (value === null) return 'unanswered'
    return value ? 'right' : 'wrong'
}

/**
 * Past sittings marked against a different answer from the question's
 * current key, and a way to re-mark them.
 *
 * Marks are written when an attempt finishes, so correcting an answer key
 * leaves every earlier sitting marked the old way. This shows whose marks
 * would move, and which way, before anything is changed, then re-marks
 * those attempts. Their reports and skill charts follow on their next load.
 *
 * Plain state rather than React Query: it is embedded in pages whose tests
 * render without a QueryClient, and it has exactly one read and one write.
 */
export function RescorePanel({ questionId, refreshKey = 0, showWhenClean = false }: Props) {
    const [preview, setPreview] = useState<RescorePreview | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [applying, setApplying] = useState(false)

    const load = useCallback(async () => {
        try {
            setError(null)
            setPreview(await fetchRescorePreview(questionId))
        } catch (err) {
            setError((err as Error).message)
        }
    }, [questionId])

    useEffect(() => {
        void load()
    }, [load, refreshKey])

    async function apply() {
        if (!preview) return
        const n = preview.rows.length
        if (
            !confirm(
                `Re-score ${n} past sitting${n === 1 ? '' : 's'} against answer ${preview.correctOption}? ` +
                    `This changes those students' scores and reports.`
            )
        ) {
            return
        }
        setApplying(true)
        try {
            const result = await applyRescore(questionId)
            toast.success(
                `Re-scored ${result.rescored} sitting${result.rescored === 1 ? '' : 's'}.`
            )
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setApplying(false)
            await load()
        }
    }

    if (error) {
        return <p className="text-sm text-red-600">{error}</p>
    }
    if (!preview) return null

    if (preview.rows.length === 0) {
        if (!showWhenClean) return null
        return (
            <p className="text-sm text-gray-500">
                Past marks match the current answer ({preview.correctOption}) —{' '}
                {preview.answeredAttempts} finished sitting
                {preview.answeredAttempts === 1 ? '' : 's'}, nothing to re-score.
            </p>
        )
    }

    const n = preview.rows.length
    return (
        <section
            aria-label="Re-score past attempts"
            className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
        >
            <div>
                <p className="font-semibold">
                    {n} past sitting{n === 1 ? ' was' : 's were'} marked against a different
                    answer from the current key ({preview.correctOption}).
                </p>
                <p>
                    Re-scoring gives {preview.gains} a mark and takes one from{' '}
                    {preview.losses}. Their scores, reports and skill charts update.
                    {preview.inProgressAttempts > 0 &&
                        ` ${preview.inProgressAttempts} sitting${preview.inProgressAttempts === 1 ? ' is' : 's are'} still in progress and will be marked against the current key when finished.`}
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="text-amber-800 dark:text-amber-300">
                            <th className="py-1 pr-3 font-medium">Student</th>
                            <th className="py-1 pr-3 font-medium">Set</th>
                            <th className="py-1 pr-3 font-medium">Picked</th>
                            <th className="py-1 pr-3 font-medium">Mark</th>
                            <th className="py-1 font-medium">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {preview.rows.map((r) => (
                            <tr key={r.attemptId} className="border-t border-amber-200 dark:border-amber-900">
                                <td className="py-1 pr-3">
                                    {r.studentEmail ?? 'Unknown'}
                                    {r.isInternal && (
                                        <Badge variant="outline" className="ml-2">internal</Badge>
                                    )}
                                </td>
                                <td className="py-1 pr-3">{r.setTitle ?? '—'}</td>
                                <td className="py-1 pr-3">{r.selectedOption ?? '—'}</td>
                                <td className="py-1 pr-3">
                                    {mark(r.storedIsCorrect)} → <strong>{mark(r.newIsCorrect)}</strong>
                                </td>
                                <td className="py-1">
                                    {r.totalScore ?? '—'} → <strong>{r.newTotalScore ?? '—'}</strong>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <Button size="sm" onClick={() => void apply()} disabled={applying}>
                    {applying ? 'Re-scoring…' : `Re-score ${n} sitting${n === 1 ? '' : 's'}`}
                </Button>
            </div>
        </section>
    )
}
