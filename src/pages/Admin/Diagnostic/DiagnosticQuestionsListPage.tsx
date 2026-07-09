import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import { Plus, Upload } from 'lucide-react'
import useListDiagnosticQuestionsQuery from '@/hooks/diagnostic/useListDiagnosticQuestionsQuery.ts'
import useDeleteDiagnosticQuestionMutation from '@/hooks/diagnostic/useDeleteDiagnosticQuestionMutation.ts'
import { BulkImportDialog } from '@/components/diagnostic/BulkImportDialog.tsx'
import { toast } from 'sonner'

export function DiagnosticQuestionsListPage() {
    const navigate = useNavigate()
    const [bulkImportOpen, setBulkImportOpen] = useState(false)
    const { data: questions, isLoading } = useListDiagnosticQuestionsQuery()
    const { mutate: deleteQuestion } = useDeleteDiagnosticQuestionMutation()

    function handleDelete(id: string) {
        if (!confirm('Delete this question? This cannot be undone.')) return
        deleteQuestion(id, {
            onError: () => toast.error('Failed to delete question'),
        })
    }

    return (
        <AdminLayout>
            <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Diagnostic Questions
                    </h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setBulkImportOpen(true)}
                        >
                            <Upload className="w-4 h-4" /> Bulk import
                        </Button>
                        <Button onClick={() => navigate('/admin/questions/new')}>
                            <Plus className="w-4 h-4" /> New question
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Topic</TableHead>
                            <TableHead>Skill</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Options</TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={5}>Loading...</TableCell>
                            </TableRow>
                        )}
                        {!isLoading && questions?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-gray-500">
                                    No diagnostic questions yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {questions?.map((q) => (
                            <TableRow key={q.id}>
                                <TableCell>{q.topicCode}</TableCell>
                                <TableCell>
                                    {q.coreSkillPrimary}
                                    {q.coreSkillSecondary
                                        ? ` / ${q.coreSkillSecondary}`
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            q.status === 'published'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {q.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{q.options.length}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/admin/questions/${q.id}`)
                                        }
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(q.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <BulkImportDialog
                open={bulkImportOpen}
                onOpenChange={setBulkImportOpen}
            />
        </AdminLayout>
    )
}
