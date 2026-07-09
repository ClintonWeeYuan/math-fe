import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import {
    DiagnosticQuestionForm,
    getCorrectOptionLabel,
    type DiagnosticQuestionFormValues,
} from '@/components/diagnostic/DiagnosticQuestionForm.tsx'
import useCreateDiagnosticQuestionMutation from '@/hooks/diagnostic/useCreateDiagnosticQuestionMutation.ts'
import { toast } from 'sonner'

export function DiagnosticQuestionCreatePage() {
    const navigate = useNavigate()
    const { mutate: createQuestion, isPending } =
        useCreateDiagnosticQuestionMutation()

    function handleSubmit(values: DiagnosticQuestionFormValues) {
        const correctOption = getCorrectOptionLabel(values)
        if (!correctOption) {
            toast.error('Mark one option as the correct answer.')
            return
        }

        createQuestion(
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
                    toast.success('Question created.')
                    navigate('/admin/questions')
                },
                onError: (error) =>
                    toast.error(`Failed to create question: ${error.message}`),
            }
        )
    }

    return (
        <AdminLayout>
            <div className="mt-8">
                <h1 className="text-2xl font-semibold mb-6">
                    New Diagnostic Question
                </h1>
                <DiagnosticQuestionForm
                    onSubmit={handleSubmit}
                    isSubmitting={isPending}
                    submitLabel="Create question"
                />
            </div>
        </AdminLayout>
    )
}
