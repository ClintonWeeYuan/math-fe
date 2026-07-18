import { useNavigate, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import { SetPublishButton } from '@/components/diagnostic/SetPublishButton.tsx'
import useGetDiagnosticSetQuery from '@/hooks/diagnostic/useGetDiagnosticSetQuery.ts'
import useListDiagnosticQuestionsQuery from '@/hooks/diagnostic/useListDiagnosticQuestionsQuery.ts'
import useBulkSetQuestionStatusMutation from '@/hooks/diagnostic/useBulkSetQuestionStatusMutation.ts'
import { orderedSelection } from '@/lib/questionPicker.ts'

/**
 * Read-only review of a set before publishing — every question in exam
 * order, fully rendered with the correct answer marked.
 *
 * Deliberately an admin review, not a student dry-run: the student view
 * strips the answer key, but the whole point here is to *check* it — a wrong
 * correct_option would score students incorrectly with no error, and the
 * publish gate can't catch that. So this shows what students can't see.
 */
export function DiagnosticSetReviewPage() {
    const { setId } = useParams()
    const navigate = useNavigate()

    const { data: set, isLoading: setLoading } = useGetDiagnosticSetQuery({
        setId: setId ?? '',
    })
    const { data: questions, isLoading: questionsLoading } =
        useListDiagnosticQuestionsQuery()
    const { mutate: bulkPublish, isPending: bulkPending } =
        useBulkSetQuestionStatusMutation()

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

    const ordered = orderedSelection(questions ?? [], set.questionIds)
    const draftCount = ordered.filter((q) => q.status === 'draft').length

    function handlePublishAllQuestions() {
        if (!set) return
        bulkPublish(
            { questionIds: set.questionIds, status: 'published' },
            {
                onSuccess: (res) =>
                    toast.success(
                        `Published ${res?.updatedCount ?? 0} question${
                            res?.updatedCount === 1 ? '' : 's'
                        }`
                    ),
                onError: (err) => toast.error(err.message),
            }
        )
    }

    return (
        <AdminLayout>
            <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">{set.title}</h1>
                        <p className="text-sm text-gray-500">
                            {ordered.length} questions ·{' '}
                            {set.timeLimitMinutes} min ·{' '}
                            <Badge
                                variant={set.status === 'published' ? 'default' : 'secondary'}
                            >
                                {set.status}
                            </Badge>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate('/admin/sets')}>
                            Back
                        </Button>
                        {draftCount > 0 && (
                            <Button
                                variant="outline"
                                disabled={bulkPending}
                                onClick={handlePublishAllQuestions}
                            >
                                Publish all questions ({draftCount} draft)
                            </Button>
                        )}
                        <SetPublishButton set={set} />
                    </div>
                </div>

                {ordered.length === 0 && (
                    <p className="text-gray-500">
                        This set has no questions. Add some from the Questions
                        screen.
                    </p>
                )}

                {ordered.map((q, index) => (
                    <Card key={q.id}>
                        <CardContent className="flex flex-col gap-3 pt-6">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="font-medium text-gray-900">
                                    Q{index + 1}
                                </span>
                                <span>{q.topicCode}</span>
                                <span>· {q.coreSkillPrimary}</span>
                                {q.coreSkillSecondary && <span>/ {q.coreSkillSecondary}</span>}
                                {q.status === 'draft' && (
                                    <Badge variant="secondary">draft</Badge>
                                )}
                            </div>

                            <div className="text-gray-900">
                                <LatexText text={q.stem} />
                            </div>

                            {q.diagramUrl && (
                                <img
                                    src={q.diagramUrl}
                                    alt={`Diagram for question ${index + 1}`}
                                    className="max-h-64 max-w-full rounded border"
                                />
                            )}

                            <ul className="flex flex-col gap-1.5">
                                {q.options.map((o) => {
                                    const correct = o.isCorrect ?? false
                                    return (
                                        <li
                                            key={o.label}
                                            className={`flex items-start gap-2 rounded px-2 py-1 text-sm ${
                                                correct
                                                    ? 'bg-emerald-50 text-emerald-900'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            <span className="font-medium">{o.label}.</span>
                                            <span className="flex-1">
                                                <LatexText text={o.text} />
                                                {o.misconception && (
                                                    <span className="ml-2 text-gray-400 italic">
                                                        ({o.misconception})
                                                    </span>
                                                )}
                                            </span>
                                            {correct && (
                                                <span className="flex items-center gap-1 text-emerald-700">
                                                    <Check className="h-4 w-4" /> correct
                                                </span>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    )
}
