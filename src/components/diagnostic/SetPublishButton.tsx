import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import useUpdateDiagnosticSetMutation from '@/hooks/diagnostic/useUpdateDiagnosticSetMutation.ts'
import type { DiagnosticSetResponse } from '@/client'

type Props = {
    set: DiagnosticSetResponse
}

/**
 * Publish/unpublish a set — the single gate between a set existing and
 * students being able to take it (the start-attempt endpoint only accepts a
 * published set; its questions' own status is irrelevant to that).
 *
 * Unpublishing is confirmed, publishing isn't: publishing an unfinished set
 * is recoverable by unpublishing it, but unpublishing is what yanks a live
 * diagnostic out from under students who may be mid-attempt.
 */
export function SetPublishButton({ set }: Props) {
    const { mutate: updateSet, isPending } = useUpdateDiagnosticSetMutation({
        setId: set.id,
    })
    const published = set.status === 'published'

    function handleClick() {
        if (published) {
            const ok = confirm(
                `Unpublish "${set.title}"? Students won't be able to start it, ` +
                    `and anyone part-way through won't be able to finish.`
            )
            if (!ok) return
        }
        updateSet(
            { status: published ? 'draft' : 'published' },
            {
                // Surface the backend's message verbatim — the publish gate's
                // 409 names exactly why (empty set, or the still-draft
                // questions) so the admin knows what to fix.
                onError: (err) => toast.error(err.message),
                onSuccess: () =>
                    toast.success(published ? 'Set unpublished' : 'Set published'),
            }
        )
    }

    return (
        <Button
            variant={published ? 'outline' : 'default'}
            size="sm"
            disabled={isPending}
            onClick={handleClick}
        >
            {published ? 'Unpublish' : 'Publish'}
        </Button>
    )
}
