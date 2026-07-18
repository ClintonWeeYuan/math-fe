import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Combobox } from '@/components/ui/combobox.tsx'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx'
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
import useListDiagnosticSetsQuery from '@/hooks/diagnostic/useListDiagnosticSetsQuery.ts'
import useDeleteDiagnosticQuestionMutation from '@/hooks/diagnostic/useDeleteDiagnosticQuestionMutation.ts'
import { BulkImportDialog } from '@/components/diagnostic/BulkImportDialog.tsx'
import {
    NO_SET,
    filterQuestionsForList,
    setsByQuestionId,
} from '@/lib/questionListFilters.ts'
import { toast } from 'sonner'

const ALL = '__all__'

export function DiagnosticQuestionsListPage() {
    const navigate = useNavigate()
    const [bulkImportOpen, setBulkImportOpen] = useState(false)
    const { data: questions, isLoading } = useListDiagnosticQuestionsQuery()
    const { data: sets } = useListDiagnosticSetsQuery()
    const { mutate: deleteQuestion } = useDeleteDiagnosticQuestionMutation()

    const [setFilter, setSetFilter] = useState<string>(ALL)
    const [statusFilter, setStatusFilter] = useState<'draft' | 'published' | typeof ALL>(ALL)
    const [topicFilter, setTopicFilter] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const membership = useMemo(() => setsByQuestionId(sets ?? []), [sets])
    const topicCodes = useMemo(
        () => [...new Set((questions ?? []).map((q) => q.topicCode).filter(Boolean))].sort(),
        [questions]
    )

    const filtered = useMemo(
        () =>
            filterQuestionsForList(questions ?? [], membership, {
                setId: setFilter === ALL ? null : setFilter,
                status: statusFilter === ALL ? null : statusFilter,
                topicCode: topicFilter,
                search,
            }),
        [questions, membership, setFilter, statusFilter, topicFilter, search]
    )

    function handleDelete(id: string) {
        if (!confirm('Delete this question? This cannot be undone.')) return
        deleteQuestion(id, {
            // Surface the backend's message — the 409 names the sets that
            // still hold this question, so the admin knows to unlink it first.
            onError: (err) => toast.error(err.message),
            onSuccess: () => toast.success('Question deleted'),
        })
    }

    return (
        <AdminLayout>
            <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Diagnostic Questions</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
                            <Upload className="w-4 h-4" /> Bulk import
                        </Button>
                        <Button onClick={() => navigate('/admin/questions/new')}>
                            <Plus className="w-4 h-4" /> New question
                        </Button>
                    </div>
                </div>

                {/* Filters — keep a growing library navigable across many sets. */}
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={setFilter} onValueChange={setSetFilter}>
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder="All sets" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All sets</SelectItem>
                            <SelectItem value={NO_SET}>In no set</SelectItem>
                            {(sets ?? []).map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All statuses</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="w-44">
                        <Combobox
                            value={topicFilter}
                            onChange={setTopicFilter}
                            options={topicCodes}
                            placeholder="All topics"
                            clearLabel="All topics"
                        />
                    </div>
                    <Input
                        className="w-52 flex-1"
                        placeholder="Search stem…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="text-sm text-gray-400">
                        {filtered.length} of {questions?.length ?? 0}
                    </span>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Topic</TableHead>
                            <TableHead>Skill</TableHead>
                            <TableHead>Sets</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Options</TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6}>Loading...</TableCell>
                            </TableRow>
                        )}
                        {!isLoading && (questions?.length ?? 0) === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-gray-500">
                                    No diagnostic questions yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading &&
                            (questions?.length ?? 0) > 0 &&
                            filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-gray-500">
                                        No questions match these filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        {filtered.map((q) => {
                            const inSets = membership.get(q.id) ?? []
                            return (
                                <TableRow key={q.id}>
                                    <TableCell>{q.topicCode}</TableCell>
                                    <TableCell>
                                        {q.coreSkillPrimary}
                                        {q.coreSkillSecondary
                                            ? ` / ${q.coreSkillSecondary}`
                                            : ''}
                                    </TableCell>
                                    <TableCell>
                                        {inSets.length === 0 ? (
                                            <span className="text-gray-300">—</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {inSets.map((s) => (
                                                    <Badge key={s.id} variant="outline">
                                                        {s.title}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
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
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            <BulkImportDialog open={bulkImportOpen} onOpenChange={setBulkImportOpen} />
        </AdminLayout>
    )
}
