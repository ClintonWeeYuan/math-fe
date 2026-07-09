import { useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import {
    DiagnosticQuestionForm,
    getCorrectOptionLabel,
    type DiagnosticQuestionFormValues,
} from '@/components/diagnostic/DiagnosticQuestionForm.tsx'
import useGetDiagnosticQuestionQuery from '@/hooks/diagnostic/useGetDiagnosticQuestionQuery.ts'
import useUpdateDiagnosticQuestionMutation from '@/hooks/diagnostic/useUpdateDiagnosticQuestionMutation.ts'
import { toast } from 'sonner'

export function DiagnosticQuestionEditPage() {
    const navigate = useNavigate()
    const { questionId } = useParams()
    const { data: question, isLoading } = useGetDiagnosticQuestionQuery({
        questionId: questionId ?? '',
    })
    const { mutate: updateQuestion, isPending } = useUpdateDiagnosticQuestionMutation(
        { questionId: questionId ?? '' }
    )

    function handleSubmit(values: DiagnosticQuestionFormValues) {
        const correctOption = getCorrectOptionLabel(values)
        if (!correctOption) {
            toast.error('Mark one option as the correct answer.')
            return
        }

        updateQuestion(
            {
                topicCode: values.topicCode,
                coreSkillPrimary: values.coreSkillPrimary,
                coreSkillSecondary: values.coreSkillSecondary,
                stem: values.stem,
                options: values.options.map((o) => ({
                    label: o.label,
                    text: o.text,
                    isCorrect: o.isCorrect,
                    misconception: o.misconception || null,
                })),
                correctOption,
                difficultyTag: values.difficultyTag,
                status: values.status,
            },
            {
                onSuccess: () => {
                    toast.success('Question updated.')
                    navigate('/admin/questions')
                },
                onError: (error) =>
                    toast.error(`Failed to update question: ${error.message}`),
            }
        )
    }

    if (isLoading) {
        return <LoadingPage />
    }

    return (
        <AdminLayout>
            <div className="mt-8">
                <h1 className="text-2xl font-semibold mb-6">
                    Edit Diagnostic Question
                </h1>
                <DiagnosticQuestionForm
                    initialData={question}
                    onSubmit={handleSubmit}
                    isSubmitting={isPending}
                    submitLabel="Save changes"
                />
            </div>
        </AdminLayout>
    )
}
