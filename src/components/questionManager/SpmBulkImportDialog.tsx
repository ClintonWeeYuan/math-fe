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
import useBulkImportSpmQuestionsMutation from '@/hooks/useBulkImportSpmQuestionsMutation.ts'
import type { SpmBulkImportRequest, SpmBulkImportResponse } from '@/client'
import { toast } from 'sonner'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    /**
     * Set when importing into a paper instance, omitted for a batch generated
     * chapter by chapter — which is the case that has no past paper at all.
     */
    paperInstanceId?: string
}

/**
 * Two-step by design: the file is always validated before anything is written,
 * and the report is shown before the admin commits. A 55-question batch with
 * four bad questions should be fixed in one editing pass, not discovered four
 * failed imports apart.
 */
export function SpmBulkImportDialog({
    open,
    onOpenChange,
    paperInstanceId,
}: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [parseError, setParseError] = useState<string | null>(null)
    const [report, setReport] = useState<SpmBulkImportResponse | null>(null)
    const { mutate: bulkImport, isPending } = useBulkImportSpmQuestionsMutation()

    function reset() {
        setFile(null)
        setParseError(null)
        setReport(null)
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setParseError(null)
        setReport(null)
        setFile(e.target.files?.[0] ?? null)
    }

    async function readBody(): Promise<SpmBulkImportRequest | null> {
        if (!file) return null
        try {
            const parsed = JSON.parse(await file.text())
            return {
                ...parsed,
                paperInstanceId: paperInstanceId ?? null,
            } as SpmBulkImportRequest
        } catch {
            setParseError('That file is not valid JSON.')
            return null
        }
    }

    async function handleValidate() {
        const body = await readBody()
        if (!body) return

        bulkImport(
            { ...body, dryRun: true },
            {
                onSuccess: (data) => {
                    if (data) setReport(data)
                },
                onError: (error) => {
                    toast.error(`Could not read that file: ${error.message}`)
                },
            }
        )
    }

    async function handleImport() {
        const body = await readBody()
        if (!body) return

        bulkImport(
            { ...body, dryRun: false },
            {
                onSuccess: (data) => {
                    toast.success(data?.message ?? 'Import completed.')
                    reset()
                    onOpenChange(false)
                },
                onError: (error) => {
                    toast.error(`Import failed: ${error.message}`)
                },
            }
        )
    }

    const hasProblems = (report?.problems.length ?? 0) > 0
    const canImport = report !== null && !hasProblems

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) reset()
                onOpenChange(next)
            }}
        >
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk import questions</DialogTitle>
                    <DialogDescription>
                        Upload a JSON file with a{' '}
                        <code>questionBank</code> header and a{' '}
                        <code>questions</code> array.{' '}
                        {paperInstanceId
                            ? 'Questions will be added to this paper instance, numbered by their position in questionOrder.'
                            : 'Questions will be filed by chapter and topic, with no paper instance.'}{' '}
                        Re-importing a file updates the questions it already
                        created rather than duplicating them.
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

                {report && (
                    <div className="rounded-md border p-3 text-sm">
                        <p className="font-medium">{report.message}</p>

                        {report.unknownTopicCodes.length > 0 && (
                            <p className="mt-2 text-muted-foreground">
                                {report.unknownTopicCodes.length} new topic
                                {report.unknownTopicCodes.length === 1
                                    ? ''
                                    : 's'}{' '}
                                will be created:{' '}
                                {report.unknownTopicCodes.join(', ')}
                            </p>
                        )}

                        {hasProblems ? (
                            <>
                                <p className="mt-3 font-medium text-red-600">
                                    Fix these before importing — nothing will be
                                    written until they're resolved:
                                </p>
                                <ul className="mt-1 list-disc pl-5 text-red-600">
                                    {report.problems.map((problem, i) => (
                                        <li key={`${problem.sourceRef}-${i}`}>
                                            <code>{problem.sourceRef}</code>:{' '}
                                            {problem.problem}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p className="mt-2 text-green-700">
                                No problems found — ready to import.
                            </p>
                        )}
                    </div>
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
                        variant="secondary"
                        onClick={handleValidate}
                        disabled={!file || isPending}
                    >
                        {isPending && !report ? 'Checking…' : 'Check file'}
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!canImport || isPending}
                    >
                        {isPending ? 'Importing…' : 'Import'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
