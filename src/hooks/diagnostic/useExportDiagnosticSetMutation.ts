import { useMutation } from '@tanstack/react-query'
import { exportDiagnosticSetDiagnosticSetsSetIdExportGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { downloadJson } from '@/lib/downloadJson.ts'

/**
 * Download a set as the bulk-import file that could recreate it.
 *
 * A mutation rather than a query: it's an action the admin takes, not state
 * the page holds, and a cached export would hand back a stale file after an
 * edit — the exact problem exporting exists to solve.
 */
export default function useExportDiagnosticSetMutation() {
    return useMutation({
        mutationFn: async (setId: string) => {
            const result = await exportDiagnosticSetDiagnosticSetsSetIdExportGet({
                path: { set_id: setId },
                headers: getAuthHeaders(),
            })
            // The generated client resolves { data: undefined, error } rather
            // than throwing, so returning `.data` would download a file
            // containing the word "undefined".
            if (result.error !== undefined || result.data === undefined) {
                throw new Error('Could not export this set.')
            }
            const payload = result.data as Record<string, unknown>
            const { filename, ...body } = payload
            downloadJson(
                typeof filename === 'string' ? filename : 'diagnostic-set.json',
                body
            )
            return body
        },
    })
}
