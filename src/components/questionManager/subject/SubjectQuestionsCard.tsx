import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ClipLoader } from 'react-spinners'
import useGetPaginatedQuestionsBySubjectQuery from '@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts'
import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Every question in a subject, however it was created.
 *
 * Bulk-imported questions belong to no paper instance by design, so the
 * paper-instance page — which filters by exactly that — could never list them.
 * A batch of 40 imported cleanly into the database and then appeared nowhere in
 * the admin UI at all. This is the screen that was missing.
 */
export function SubjectQuestionsCard({ subjectId }: { subjectId: string }) {
    const [page, setPage] = useState(1)
    const { data, isLoading } = useGetPaginatedQuestionsBySubjectQuery({
        subjectId,
        page,
        size: 20,
        // Unfiltered: this card exists to show everything in the subject,
        // including the imported questions that belong to no paper instance
        // and so appear on no other admin screen.
        topics: [],
        difficulty: [],
        papers: [],
    })

    const total = data?.total ?? 0
    const items = data?.items ?? []
    const lastPage = Math.max(1, Math.ceil(total / 20))

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
            </CardHeader>
            <CardContent>
                {!isLoading && total === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No questions yet. Add them one at a time from a paper
                        instance, or use Bulk import above.
                    </p>
                )}

                <div className="space-y-2">
                    {items.map((question) => (
                        <div
                            key={question.id}
                            className="flex items-start justify-between gap-4 rounded-md border p-3"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm">
                                    {/* A text question shows its stem; a
                                        converted past-paper one has no stem to
                                        show, so it's identified by its position
                                        in the paper. */}
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
                                    {question.publishStatus && (
                                        <Badge
                                            variant={
                                                question.publishStatus ===
                                                'published'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {question.publishStatus}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <Link
                                to={`/questions/${subjectId}`}
                                className="shrink-0"
                            >
                                <Button variant="ghost" size="sm">
                                    View in bank
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {total > 20 && (
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
        </Card>
    )
}
