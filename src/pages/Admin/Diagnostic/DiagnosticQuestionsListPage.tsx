import { useNavigate } from 'react-router-dom'
import {
    NO_SUBJECT,
    skillLabel,
    subjectOfQuestion,
    subjectsInUse,
} from '@/lib/questionSubject.ts'
import { useMemo, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
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
import { QuestionPreviewDialog } from '@/components/diagnostic/QuestionPreviewDialog.tsx'
import type { DiagnosticQuestionResponse } from '@/client'
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
    // null = closed; a non-empty array previews those questions (one row's
    // Preview passes [q]; the bulk preview will pass the selection).
    const [previewing, setPreviewing] = useState<
        DiagnosticQuestionResponse[] | null
    >(null)
    const { data: questions, isLoading } = useListDiagnosticQuestionsQuery()
    const { data: sets } = useListDiagnosticSetsQuery()
    const { mutate: deleteQuestion, mutateAsync: deleteQuestionAsync } =
        useDeleteDiagnosticQuestionMutation()

    const [setFilter, setSetFilter] = useState<string>(ALL)
    const [statusFilter, setStatusFilter] = useState<
        'draft' | 'published' | typeof ALL
    >(ALL)
    const [topicFilter, setTopicFilter] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [subjectFilter, setSubjectFilter] = useState<string>(ALL)
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const membership = useMemo(() => setsByQuestionId(sets ?? []), [sets])
    // Derived from set membership, falling back to the topic prefix only
    // where that prefix means one subject — see questionSubject.ts.
    const subjects = useMemo(
        () => subjectsInUse(questions ?? [], membership),
        [questions, membership]
    )
    const topicCodes = useMemo(
        () =>
            [
                ...new Set(
                    (questions ?? []).map((q) => q.topicCode).filter(Boolean)
                ),
            ].sort(),
        [questions]
    )

    const filtered = useMemo(
        () =>
            filterQuestionsForList(questions ?? [], membership, {
                setId: setFilter === ALL ? null : setFilter,
                status: statusFilter === ALL ? null : statusFilter,
                topicCode: topicFilter,
                subject: subjectFilter === ALL ? null : subjectFilter,
                search,
            }),
        [
            questions,
            membership,
            setFilter,
            statusFilter,
            topicFilter,
            subjectFilter,
            search,
        ]
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

    const selectedQuestions = (questions ?? []).filter((q) =>
        selected.has(q.id)
    )
    const allFilteredSelected =
        filtered.length > 0 && filtered.every((q) => selected.has(q.id))

    function toggleOne(id: string, on: boolean) {
        setSelected((prev) => {
            const next = new Set(prev)
            if (on) next.add(id)
            else next.delete(id)
            return next
        })
    }
    function toggleAllFiltered(on: boolean) {
        setSelected((prev) => {
            const next = new Set(prev)
            for (const q of filtered) {
                if (on) next.add(q.id)
                else next.delete(q.id)
            }
            return next
        })
    }

    async function handleBulkDelete() {
        const ids = [...selected]
        // Only questions in no set can be deleted (the delete-protection 409s
        // the rest). Split up front so we don't fire doomed requests, and tell
        // the admin exactly what's being skipped.
        const deletable = ids.filter(
            (id) => (membership.get(id)?.length ?? 0) === 0
        )
        const blocked = ids.length - deletable.length
        if (deletable.length === 0) {
            toast.error(
                `All ${blocked} selected question${blocked === 1 ? '' : 's'} ` +
                    `belong to a set — remove them from their sets first.`
            )
            return
        }
        const suffix =
            blocked > 0
                ? ` (${blocked} in a set will be skipped)`
                : ' This cannot be undone.'
        if (!confirm(`Delete ${deletable.length} question(s)?${suffix}`)) return

        const results = await Promise.allSettled(
            deletable.map((id) => deleteQuestionAsync(id))
        )
        const ok = results.filter((r) => r.status === 'fulfilled').length
        const failed = results.length - ok
        toast.success(
            `Deleted ${ok} question${ok === 1 ? '' : 's'}` +
                (failed > 0 ? `, ${failed} failed` : '')
        )
        setSelected(new Set())
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
                        <Button
                            onClick={() => navigate('/admin/questions/new')}
                        >
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
                        value={subjectFilter}
                        onValueChange={setSubjectFilter}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All subjects" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All subjects</SelectItem>
                            {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                    {subject}
                                </SelectItem>
                            ))}
                            {/* The questions in no set whose topic code does
                                not settle a subject. Finding them is the
                                reason to have this filter at all. */}
                            <SelectItem value={NO_SUBJECT}>
                                Subject unknown
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) =>
                            setStatusFilter(v as typeof statusFilter)
                        }
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

                {selected.size > 0 && (
                    <div className="flex items-center gap-3 rounded-md border bg-gray-50 px-3 py-2 text-sm">
                        <span className="font-medium">
                            {selected.size} selected
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewing(selectedQuestions)}
                        >
                            Preview
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={handleBulkDelete}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelected(new Set())}
                        >
                            Clear
                        </Button>
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-8">
                                <Checkbox
                                    aria-label="Select all"
                                    checked={allFilteredSelected}
                                    onCheckedChange={(v) =>
                                        toggleAllFiltered(v === true)
                                    }
                                />
                            </TableHead>
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
                                <TableCell colSpan={7}>Loading...</TableCell>
                            </TableRow>
                        )}
                        {!isLoading && (questions?.length ?? 0) === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-gray-500"
                                >
                                    No diagnostic questions yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading &&
                            (questions?.length ?? 0) > 0 &&
                            filtered.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-gray-500"
                                    >
                                        No questions match these filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        {filtered.map((q) => {
                            const inSets = membership.get(q.id) ?? []
                            return (
                                <TableRow key={q.id}>
                                    <TableCell>
                                        <Checkbox
                                            aria-label={`Select ${q.topicCode}`}
                                            checked={selected.has(q.id)}
                                            onCheckedChange={(v) =>
                                                toggleOne(q.id, v === true)
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>{q.topicCode}</TableCell>
                                    <TableCell>
                                        {/* Named where the subject is known.
                                            S4 is a different skill in Physics
                                            and Biology, so a bare code beats
                                            a confidently wrong name. */}
                                        {skillLabel(
                                            q.coreSkillPrimary,
                                            subjectOfQuestion(q, membership)
                                        )}
                                        {q.coreSkillSecondary
                                            ? ` / ${q.coreSkillSecondary}`
                                            : ''}
                                    </TableCell>
                                    <TableCell>
                                        {inSets.length === 0 ? (
                                            <span className="text-gray-300">
                                                —
                                            </span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {inSets.map((s) => (
                                                    <Badge
                                                        key={s.id}
                                                        variant="outline"
                                                    >
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
                                            onClick={() => setPreviewing([q])}
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/questions/${q.id}`
                                                )
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

            <BulkImportDialog
                open={bulkImportOpen}
                onOpenChange={setBulkImportOpen}
            />

            <QuestionPreviewDialog
                questions={previewing ?? []}
                open={previewing !== null}
                onOpenChange={(open) => !open && setPreviewing(null)}
            />
        </AdminLayout>
    )
}
