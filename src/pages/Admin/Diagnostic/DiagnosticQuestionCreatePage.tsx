import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import {
    DiagnosticQuestionForm,
    getCorrectOptionLabel,
    getDiagramSvgForCreate,
    type DiagnosticQuestionFormValues,
} from '@/components/diagnostic/DiagnosticQuestionForm.tsx'
import useTopicCodeOptions from '@/hooks/diagnostic/useTopicCodeOptions.ts'
import useCreateDiagnosticQuestionMutation from '@/hooks/diagnostic/useCreateDiagnosticQuestionMutation.ts'
import useUploadDiagnosticQuestionDiagramMutation from '@/hooks/diagnostic/useUploadDiagnosticQuestionDiagramMutation.ts'
import { toast } from 'sonner'

export function DiagnosticQuestionCreatePage() {
    const navigate = useNavigate()
    const topicCodeOptions = useTopicCodeOptions()
    const { mutate: createQuestion, isPending } =
        useCreateDiagnosticQuestionMutation()
    const { mutateAsync: uploadDiagram, isPending: isUploadingDiagram } =
        useUploadDiagnosticQuestionDiagramMutation()

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
                diagramSvg: getDiagramSvgForCreate(values),
            },
            {
                onSuccess: async (created) => {
                    if (values.diagramFile && created) {
                        // Sequential, not fire-and-forget: wait for the
                        // upload's actual result before deciding where to
                        // send the admin. The row already exists at this
                        // point, so on failure there's no "stay here and
                        // retry" — resubmitting create would make a second
                        // row. Instead, land on that row's own edit page,
                        // which owns the one real upload-retry mechanism.
                        try {
                            await uploadDiagram({
                                file: values.diagramFile,
                                questionId: created.id,
                            })
                            toast.success('Question created.')
                            navigate('/admin/questions')
                        } catch (error) {
                            const message =
                                error instanceof Error
                                    ? error.message
                                    : 'Diagram upload failed.'
                            toast.error(
                                'Question created, but the diagram upload failed — retry on the edit page.'
                            )
                            navigate(`/admin/questions/${created.id}`, {
                                state: { diagramUploadError: message },
                            })
                        }
                        return
                    }
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
                    topicCodeOptions={topicCodeOptions}
                    onSubmit={handleSubmit}
                    isSubmitting={isPending || isUploadingDiagram}
                    submitLabel="Create question"
                />
            </div>
        </AdminLayout>
    )
}
