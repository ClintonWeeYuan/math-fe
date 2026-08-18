import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    DiagnosticQuestionForm,
    getCorrectOptionLabel,
    getDiagramSvgForUpdate,
    type DiagnosticQuestionFormValues,
} from '@/components/diagnostic/DiagnosticQuestionForm.tsx'
import useTopicCodeOptions from '@/hooks/diagnostic/useTopicCodeOptions.ts'
import useGetDiagnosticQuestionQuery from '@/hooks/diagnostic/useGetDiagnosticQuestionQuery.ts'
import useUpdateDiagnosticQuestionMutation from '@/hooks/diagnostic/useUpdateDiagnosticQuestionMutation.ts'
import useUploadDiagnosticQuestionDiagramMutation from '@/hooks/diagnostic/useUploadDiagnosticQuestionDiagramMutation.ts'
import { toast } from 'sonner'

type LocationState = {
    diagramUploadError?: string
    /** Path to return to after saving — set by whoever linked here. */
    returnTo?: string
}

export function DiagnosticQuestionEditPage() {
    const navigate = useNavigate()
    const topicCodeOptions = useTopicCodeOptions()
    const location = useLocation()
    const { questionId } = useParams()
    const { data: question, isLoading } = useGetDiagnosticQuestionQuery({
        questionId: questionId ?? '',
    })
    const { mutate: updateQuestion, isPending } =
        useUpdateDiagnosticQuestionMutation({ questionId: questionId ?? '' })
    const { mutateAsync: uploadDiagram, isPending: isUploadingDiagram } =
        useUploadDiagnosticQuestionDiagramMutation()

    // Where to go after saving. Editing a question reached from a set's
    // review screen used to land on the questions list, which loses the set
    // you were working through and every bit of scroll position with it —
    // the admin then has to find their way back for each of 27 questions.
    // Absent (the questions list, a bookmark, a refresh) this stays the
    // list, which is the right destination for those.
    const returnTo =
        (location.state as LocationState | null)?.returnTo ?? '/admin/questions'

    // Set directly from a redirect after a failed upload-on-create (see
    // DiagnosticQuestionCreatePage), or from attemptDiagramUpload below when
    // a retry on this same page fails again. Cleared on successful upload.
    const [diagramUploadError, setDiagramUploadError] = useState<string | null>(
        (location.state as LocationState | null)?.diagramUploadError ?? null
    )
    // The file a failed upload needs to retry against — kept separately from
    // react-hook-form's state so the "Retry upload" button works without the
    // admin having to re-pick the file or re-submit the whole form.
    const [pendingDiagramFile, setPendingDiagramFile] = useState<File | null>(
        null
    )

    async function attemptDiagramUpload(file: File) {
        if (!questionId) return
        try {
            await uploadDiagram({ file, questionId })
            setDiagramUploadError(null)
            setPendingDiagramFile(null)
            toast.success('Question updated.')
            navigate(returnTo)
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Diagram upload failed.'
            setPendingDiagramFile(file)
            setDiagramUploadError(message)
            toast.error(
                'Question saved, but the diagram upload failed — retry below.'
            )
            // Deliberately no navigate() here: the admin stays on this exact
            // form, with the file still available to retry immediately.
        }
    }

    async function handleSubmit(values: DiagnosticQuestionFormValues) {
        const correctOption = getCorrectOptionLabel(values)
        if (!correctOption) {
            toast.error('Mark one option as the correct answer.')
            return
        }
        const diagramSvg = getDiagramSvgForUpdate(values)

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
                // Omitting the key entirely (not sending `diagramSvg:
                // undefined`) is what preserves the existing diagram —
                // matches the backend's exclude_unset contract exactly.
                ...(diagramSvg !== undefined ? { diagramSvg } : {}),
            },
            {
                onSuccess: async () => {
                    if (values.diagramFile) {
                        // Sequential, not fire-and-forget: don't navigate or
                        // report final success until the upload itself has
                        // actually resolved.
                        await attemptDiagramUpload(values.diagramFile)
                        return
                    }
                    toast.success('Question updated.')
                    navigate(returnTo)
                },
                onError: (error) =>
                    toast.error(`Failed to update question: ${error.message}`),
            }
        )
    }

    function handleRetryDiagramUpload() {
        if (pendingDiagramFile) {
            void attemptDiagramUpload(pendingDiagramFile)
        }
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
                {diagramUploadError && (
                    <div
                        role="alert"
                        className="mb-6 flex items-center justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                    >
                        <span>
                            The question was saved, but the diagram upload
                            failed: {diagramUploadError}
                        </span>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleRetryDiagramUpload}
                            disabled={!pendingDiagramFile || isUploadingDiagram}
                        >
                            {isUploadingDiagram
                                ? 'Retrying...'
                                : 'Retry upload'}
                        </Button>
                    </div>
                )}
                <DiagnosticQuestionForm
                    topicCodeOptions={topicCodeOptions}
                    initialData={question}
                    onSubmit={handleSubmit}
                    isSubmitting={isPending || isUploadingDiagram}
                    submitLabel="Save changes"
                />
            </div>
        </AdminLayout>
    )
}
