import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import useUpdateDiagnosticSetMutation from '@/hooks/diagnostic/useUpdateDiagnosticSetMutation.ts'
import useBulkSetQuestionStatusMutation from '@/hooks/diagnostic/useBulkSetQuestionStatusMutation.ts'
import type { DiagnosticApiError } from '@/lib/diagnosticApiError.ts'
import type { DiagnosticSetResponse } from '@/client'

type Props = {
    set: DiagnosticSetResponse
}

/**
 * Publish/unpublish a set — the single gate between a set existing and
 * students being able to take it (start-attempt only accepts a published
 * set).
 *
 * Unpublishing is confirmed, publishing isn't: publishing an unfinished set
 * is recoverable by unpublishing it, but unpublishing is what yanks a live
 * diagnostic out from under students who may be mid-attempt.
 *
 * Smart retry: the common publish failure is the gate rejecting still-draft
 * questions (bulk import lands them draft). Rather than dead-end on that
 * error, offer to publish the set's questions and the set in one confirmed
 * step — the bulk-publish is idempotent, so re-including already-published
 * ones is harmless.
 */
export function SetPublishButton({ set }: Props) {
    const { mutate: updateSet, isPending } = useUpdateDiagnosticSetMutation({
        setId: set.id,
    })
    const { mutateAsync: bulkPublish, isPending: bulkPending } =
        useBulkSetQuestionStatusMutation()

    const published = set.status === 'published'

    function publish() {
        updateSet(
            { status: 'published' },
            {
                onSuccess: () => toast.success('Set published'),
                onError: (err) => handlePublishError(err as DiagnosticApiError),
            }
        )
    }

    async function handlePublishError(err: DiagnosticApiError) {
        // The empty-set 409 can't be fixed by publishing questions (there are
        // none) — only the still-draft-questions 409 can. Distinguish by the
        // set actually having questions.
        const draftGate = err.status === 409 && set.questionIds.length > 0
        if (!draftGate) {
            toast.error(err.message)
            return
        }
        const ok = confirm(
            `This set has questions that are still drafts, so it can't be ` +
                `published yet.\n\nPublish all ${set.questionIds.length} of its ` +
                `questions and the set now?`
        )
        if (!ok) {
            toast.error(err.message)
            return
        }
        try {
            await bulkPublish({ questionIds: set.questionIds, status: 'published' })
            updateSet(
                { status: 'published' },
                {
                    onSuccess: () => toast.success('Questions and set published'),
                    onError: (retryErr) => toast.error(retryErr.message),
                }
            )
        } catch (bulkErr) {
            toast.error((bulkErr as DiagnosticApiError).message)
        }
    }

    function handleClick() {
        if (published) {
            const ok = confirm(
                `Unpublish "${set.title}"? Students won't be able to start it, ` +
                    `and anyone part-way through won't be able to finish.`
            )
            if (!ok) return
            updateSet(
                { status: 'draft' },
                {
                    onSuccess: () => toast.success('Set unpublished'),
                    onError: (err) => toast.error(err.message),
                }
            )
            return
        }
        publish()
    }

    return (
        <Button
            variant={published ? 'outline' : 'default'}
            size="sm"
            disabled={isPending || bulkPending}
            onClick={handleClick}
        >
            {published ? 'Unpublish' : 'Publish'}
        </Button>
    )
}
