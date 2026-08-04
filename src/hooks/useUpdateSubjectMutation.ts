import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSubjectSubjectsSubjectIdPatch } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * Publish or unpublish a subject — what puts it on, or takes it off, the
 * student-facing catalogue.
 */
export default function useUpdateSubjectMutation({
    subjectId,
}: {
    subjectId: string
}) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (isPublished: boolean) => {
            const result = await updateSubjectSubjectsSubjectIdPatch({
                path: { subject_id: subjectId },
                body: { isPublished },
                headers: getAuthHeaders(),
            })
            // The generated client resolves { data: undefined, error } rather
            // than throwing, so returning `.data` blindly would show the toggle
            // flipped for a change the server rejected.
            if (result.error !== undefined) {
                throw new Error('Could not update the subject.')
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subject'] })
            queryClient.invalidateQueries({ queryKey: ['published-subjects'] })
        },
    })
}
