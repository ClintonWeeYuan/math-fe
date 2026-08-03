import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createSubjectSubjectsPost } from '@/client'

type Props = {
    syllabusId: string
}

type CreateSubjectInput = {
    name: string
    code: string
}

export default function useCreateSubjectMutation({ syllabusId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ name, code }: CreateSubjectInput) => {
            const result = await createSubjectSubjectsPost({
                body: { name, code, syllabusId },
            })
            // The generated client resolves { data: undefined, error } on an
            // HTTP error instead of throwing, so returning `.data` blindly
            // would report a failed create as a success and close the dialog
            // on a subject that was never made.
            if (result.error !== undefined) {
                throw new Error(
                    typeof result.error === 'object' &&
                    result.error !== null &&
                    'detail' in result.error &&
                    typeof result.error.detail === 'string'
                        ? result.error.detail
                        : 'Could not create the subject.'
                )
            }
            return result.data
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['syllabus'] }),
    })
}
