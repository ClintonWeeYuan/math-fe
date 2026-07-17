import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { QuestionPicker } from '@/components/diagnostic/QuestionPicker.tsx'
import useListDiagnosticQuestionsQuery from '@/hooks/diagnostic/useListDiagnosticQuestionsQuery.ts'
import useGetDiagnosticSetQuery from '@/hooks/diagnostic/useGetDiagnosticSetQuery.ts'
import useUpdateDiagnosticSetMutation from '@/hooks/diagnostic/useUpdateDiagnosticSetMutation.ts'

/**
 * Edit which questions are in a set, and in what order (§3). Separate from
 * the metadata edit dialog because a filterable, orderable list needs room.
 * Saving replaces the whole ordered membership via PATCH question_ids, which
 * the backend validates (every id real, no duplicates).
 */
export function DiagnosticSetQuestionsPage() {
    const { setId } = useParams()
    const navigate = useNavigate()

    const { data: set, isLoading: setLoading } = useGetDiagnosticSetQuery({
        setId: setId ?? '',
    })
    const { data: questions, isLoading: questionsLoading } =
        useListDiagnosticQuestionsQuery()
    const { mutate: updateSet, isPending } = useUpdateDiagnosticSetMutation({
        setId: setId ?? '',
    })

    const [questionIds, setQuestionIds] = useState<string[]>([])
    // Seed from the loaded set once (keyed on identity, not every render, so
    // in-progress edits aren't wiped by a background refetch).
    useEffect(() => {
        if (set) setQuestionIds(set.questionIds)
        // Seed only when the set identity changes, not on every refetch —
        // otherwise a background refresh would wipe in-progress edits.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [set?.id])

    if (setLoading || questionsLoading) {
        return (
            <AdminLayout>
                <p className="mt-8 text-gray-500">Loading…</p>
            </AdminLayout>
        )
    }

    if (!set) {
        return (
            <AdminLayout>
                <div className="mt-8 flex flex-col gap-4">
                    <h1 className="text-2xl font-semibold">Set not found</h1>
                    <Button variant="outline" onClick={() => navigate('/admin/sets')}>
                        Back to sets
                    </Button>
                </div>
            </AdminLayout>
        )
    }

    function handleSave() {
        updateSet(
            { questionIds },
            {
                onSuccess: () => {
                    toast.success('Questions updated')
                    navigate('/admin/sets')
                },
                onError: (err) => toast.error(err.message),
            }
        )
    }

    return (
        <AdminLayout>
            <div className="mt-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{set.title}</h1>
                        <p className="text-sm text-gray-500">Editing questions</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/admin/sets')}>
                        Cancel
                    </Button>
                </div>

                <QuestionPicker
                    questions={questions ?? []}
                    value={questionIds}
                    onChange={setQuestionIds}
                />

                <div>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Saving…' : 'Save questions'}
                    </Button>
                </div>
            </div>
        </AdminLayout>
    )
}
