import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import useBulkImportDiagnosticQuestionsMutation from '@/hooks/diagnostic/useBulkImportDiagnosticQuestionsMutation.ts'
import { toast } from 'sonner'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function BulkImportDialog({ open, onOpenChange }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [parseError, setParseError] = useState<string | null>(null)
    const { mutate: bulkImport, isPending } =
        useBulkImportDiagnosticQuestionsMutation()

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setParseError(null)
        setFile(e.target.files?.[0] ?? null)
    }

    async function handleImport() {
        if (!file) return

        let parsed: unknown
        try {
            const text = await file.text()
            parsed = JSON.parse(text)
        } catch {
            setParseError('That file is not valid JSON.')
            return
        }

        bulkImport(
            // The bulk-import request body is exactly the shape of
            // supabase/seed-data/esat_mathsii_bulk_import.json — a
            // diagnosticSet + questions array, camelCased.
            parsed as Parameters<typeof bulkImport>[0],
            {
                onSuccess: (data) => {
                    toast.success(
                        data?.message ?? 'Bulk import completed successfully.'
                    )
                    setFile(null)
                    onOpenChange(false)
                },
                onError: (error) => {
                    toast.error(`Bulk import failed: ${error.message}`)
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk import questions</DialogTitle>
                    <DialogDescription>
                        Upload a JSON file matching the diagnostic_set +
                        questions[] schema (the same shape as
                        esat_mathsii_bulk_import.json). Imported questions
                        land as their own status field says; the set they're
                        grouped into always lands as draft.
                    </DialogDescription>
                </DialogHeader>

                <input
                    type="file"
                    accept="application/json"
                    onChange={handleFileChange}
                    disabled={isPending}
                />
                {parseError && (
                    <p className="text-sm text-red-600">{parseError}</p>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || isPending}
                    >
                        {isPending ? 'Importing...' : 'Import'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
