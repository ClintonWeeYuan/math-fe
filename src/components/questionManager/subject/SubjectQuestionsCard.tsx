import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ClipLoader } from 'react-spinners'
import useGetPaginatedQuestionsBySubjectQuery from '@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts'
import useBulkSetQuestionStatusMutation from '@/hooks/useBulkSetQuestionStatusMutation.ts'
import { useState } from 'react'
import { toast } from 'sonner'
import type { QuestionResponse } from '@/client'
import { EditQuestionDialog } from '@/components/questionManager/subject/EditQuestionDialog.tsx'
import { DeleteQuestionByIdDialog } from '@/components/questionManager/subject/DeleteQuestionByIdDialog.tsx'

type StatusFilter = 'all' | 'draft' | 'published'

const PAGE_SIZE = 20

/**
 * Review screen for a subject's questions.
 *
 * Bulk-imported questions belong to no paper instance by design, so the
 * paper-instance page — which filters by exactly that — could never list them:
 * a batch of 40 imported cleanly and then appeared nowhere in the admin UI at
 * all. They also land as drafts, so this is where a batch is read through and
 * released to students.
 */
export function SubjectQuestionsCard({ subjectId }: { subjectId: string }) {
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState<StatusFilter>('all')
    const { data, isLoading, isError } = useGetPaginatedQuestionsBySubjectQuery({
        subjectId,
        page,
        size: PAGE_SIZE,
        topics: [],
        difficulty: [],
        papers: [],
        status: filter === 'all' ? undefined : filter,
    })
    const { mutateAsync, isPending } = useBulkSetQuestionStatusMutation()
    // One dialog each, holding the question being acted on, rather than a
    // dialog per row: 20 mounted dialogs per page would each fetch their own
    // options.
    const [editing, setEditing] = useState<QuestionResponse | null>(null)
    const [deleting, setDeleting] = useState<QuestionResponse | null>(null)

    const total = data?.total ?? 0
    const items = data?.items ?? []
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const draftsOnPage = items
        .filter((q) => q.publishStatus === 'draft')
        .map((q) => q.id)

    function switchFilter(next: StatusFilter) {
        setFilter(next)
        // Page 3 of "all" is rarely page 3 of "drafts"; staying put would show
        // an empty list that reads as "nothing to review".
        setPage(1)
    }

    async function setStatus(
        questionIds: string[],
        status: 'draft' | 'published'
    ) {
        if (questionIds.length === 0) return
        try {
            const result = await mutateAsync({ questionIds, status })
            toast.success(
                status === 'published'
                    ? `${result.updatedCount} question(s) are now live to students.`
                    : `${result.updatedCount} question(s) withdrawn from students.`
            )
        } catch {
            toast.error('Could not update the questions.')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Questions
                    {isLoading ? (
                        <ClipLoader size={15} />
                    ) : (
                        <Badge variant="secondary">{total}</Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Imported questions land as drafts. Students only see them
                    once they're published.
                </CardDescription>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    {(['all', 'draft', 'published'] as StatusFilter[]).map(
                        (value) => (
                            <Button
                                key={value}
                                size="sm"
                                variant={
                                    filter === value ? 'default' : 'outline'
                                }
                                onClick={() => switchFilter(value)}
                            >
                                {value === 'all'
                                    ? 'All'
                                    : value === 'draft'
                                      ? 'Drafts'
                                      : 'Published'}
                            </Button>
                        )
                    )}
                    {draftsOnPage.length > 0 && (
                        <Button
                            size="sm"
                            className="ml-auto"
                            disabled={isPending}
                            onClick={() => setStatus(draftsOnPage, 'published')}
                        >
                            {isPending
                                ? 'Publishing…'
                                : `Publish ${draftsOnPage.length} draft(s) on this page`}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isError && (
                    <p className="text-sm text-red-600">
                        Couldn't load these questions. If you've just signed in,
                        try refreshing; otherwise the server rejected the
                        request.
                    </p>
                )}
                {!isLoading && !isError && total === 0 && (
                    <p className="text-sm text-muted-foreground">
                        {filter === 'draft'
                            ? 'Nothing awaiting review.'
                            : filter === 'published'
                              ? 'Nothing published yet.'
                              : 'No questions yet. Add them from a paper instance, or use Bulk import above.'}
                    </p>
                )}

                <div className="space-y-2">
                    {items.map((question) => {
                        const isDraft = question.publishStatus === 'draft'
                        return (
                            <div
                                key={question.id}
                                className="flex items-start justify-between gap-4 rounded-md border p-3"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm">
                                        {/* A text question shows its stem; a
                                            converted past-paper one has none,
                                            so it's named by its position in
                                            the paper. */}
                                        {question.stem ??
                                            `${question.paper?.name ?? 'Question'} Q${question.number ?? '?'}`}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {question.chapterTitle && (
                                            <Badge variant="outline">
                                                {question.chapterTitle}
                                            </Badge>
                                        )}
                                        {question.topicCode && (
                                            <Badge variant="outline">
                                                {question.topicCode}
                                            </Badge>
                                        )}
                                        <Badge variant="outline">
                                            {question.difficulty}
                                        </Badge>
                                        {question.archetype && (
                                            <Badge variant="outline">
                                                {question.archetype}
                                            </Badge>
                                        )}
                                        {question.correctOption && (
                                            <Badge variant="outline">
                                                Answer: {question.correctOption}
                                            </Badge>
                                        )}
                                        <Badge
                                            variant={
                                                isDraft ? 'secondary' : 'default'
                                            }
                                        >
                                            {question.publishStatus ??
                                                'published'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditing(question)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => setDeleting(question)}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant={isDraft ? 'default' : 'ghost'}
                                        size="sm"
                                        disabled={isPending}
                                        onClick={() =>
                                            setStatus(
                                                [question.id],
                                                isDraft ? 'published' : 'draft'
                                            )
                                        }
                                    >
                                        {isDraft ? 'Publish' : 'Unpublish'}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {total > PAGE_SIZE && (
                    <div className="mt-4 flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {lastPage}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= lastPage}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Keyed by question id so reopening on a different question
                remounts with that question's own state rather than the
                previous one's. */}
            {editing && (
                <EditQuestionDialog
                    key={editing.id}
                    question={editing}
                    open
                    onOpenChange={(next) => !next && setEditing(null)}
                />
            )}
            {deleting && (
                <DeleteQuestionByIdDialog
                    key={deleting.id}
                    question={deleting}
                    open
                    onOpenChange={(next) => !next && setDeleting(null)}
                />
            )}
        </Card>
    )
}
