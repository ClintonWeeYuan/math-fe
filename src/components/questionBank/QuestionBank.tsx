import { useMemo } from 'react'
import { MultiSelect } from '@/components/ui/multi-select.tsx'
import 'katex/dist/katex.min.css'
import { DifficultyList } from '@/components/questionBank/questions.ts'
import { MultiSelectGroup } from '@/components/ui/multi-select-group.tsx'
import useGetSubjectQuery from '@/hooks/useGetSubjectQuery.ts'
import { QuestionSkeleton } from '@/components/questionBank/QuestionSkeleton.tsx'
import { QuestionList } from '@/components/questionBank/QuestionList.tsx'
import useGetPaginatedQuestionsBySubjectQuery from '@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts'
import {
    Pagination,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '../ui/pagination'
import { PaginationContent } from '@/components/ui/pagination.tsx'
import { useFiltersFromSearchParams } from '@/hooks/useFiltersFromSearchParams.ts'

type Props = {
    subjectId: string
}

export function QuestionBank({ subjectId }: Props) {
    const { topics, difficulty, papers, page, setFilterSearchParams } =
        useFiltersFromSearchParams()

    const { data, isLoading, isFetching, isError } =
        useGetPaginatedQuestionsBySubjectQuery({
            subjectId,
            page,
            size: 5,
            topics,
            difficulty,
            papers,
        })

    const totalPages = data != undefined ? Math.ceil(data.total / data.size) : 1

    const questions = data?.items

    const { data: subject } = useGetSubjectQuery({
        subjectId,
    })

    const formattedTopics = useMemo(() => {
        if (subject?.topics == undefined) {
            return []
        }

        return subject.topics.map((topic) => ({
            value: topic.id,
            label: topic.name,
            group: topic.level?.name ?? 'No Level',
        }))
    }, [subject?.topics])

    const paperOptions = useMemo(() => {
        if (subject === undefined) return []

        return subject.papers.map((paper) => ({
            label: paper.name,
            value: paper.id,
        }))
    }, [subject])

    const questionList = useMemo(() => {
        return questions != undefined ? questions : []
    }, [questions])

    // Generate pagination items with ellipsis
    const paginationItems = useMemo(() => {
        const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
        const maxVisible = 4 // Maximum number of page numbers to show

        if (totalPages <= maxVisible + 2) {
            // If total pages is small, show all
            for (let i = 1; i <= totalPages; i++) {
                items.push(i)
            }
        } else {
            // Always show first page
            items.push(1)

            // Calculate range around current page
            let start = Math.max(2, page - 1)
            let end = Math.min(totalPages - 1, page + 1)

            // Adjust range if at the beginning or end
            if (page <= 2) {
                end = Math.min(maxVisible, totalPages - 1)
            } else if (page >= totalPages - 1) {
                start = Math.max(2, totalPages - maxVisible + 1)
            }

            // Add ellipsis before range if needed
            if (start > 2) {
                items.push('ellipsis-start')
            }

            // Add page numbers in range
            for (let i = start; i <= end; i++) {
                items.push(i)
            }

            // Add ellipsis after range if needed
            if (end < totalPages - 1) {
                items.push('ellipsis-end')
            }

            // Always show last page
            items.push(totalPages)
        }

        return items
    }, [page, totalPages])

    return (
        <div className="flex flex-col grow items-center py-6 w-full ">
            <div className="flex flex-col w-full max-w-[1000px] grow gap-2">
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold mb">
                        {subject?.name}
                    </h2>
                    <span className="text-md text-gray-400 my-2">
                        Practise with real exam questions to boost your
                        confidence
                    </span>
                </div>
                <div className="">
                    <MultiSelectGroup
                        className="mb-4"
                        options={formattedTopics}
                        values={topics}
                        onValueChange={(e) => {
                            setFilterSearchParams({ page: 1, topics: e })
                        }}
                        defaultValue={topics}
                        placeholder="Select topics"
                        variant="inverted"
                        maxCount={3}
                    />
                    <MultiSelect
                        className="mb-4"
                        options={DifficultyList}
                        onValueChange={(e) => {
                            setFilterSearchParams({ page: 1, difficulty: e })
                        }}
                        defaultValue={difficulty}
                        placeholder="Select difficulty"
                        variant="inverted"
                        maxCount={3}
                    />
                    {/* Hidden for a subject with no past papers — SPM
                        Chemistry's questions are generated against the
                        syllabus, so a paper filter there offers nothing to
                        pick and, if picked, would match nothing. */}
                    {paperOptions.length > 0 && (
                        <MultiSelect
                            value={papers}
                            options={paperOptions}
                            onValueChange={(e) => {
                                setFilterSearchParams({ page: 1, papers: e })
                            }}
                            defaultValue={papers}
                            placeholder="Select paper"
                            variant="inverted"
                            maxCount={2}
                        />
                    )}
                </div>
                <div className="w-full space-y-2 flex flex-col grow">
                    <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                    `}</style>
                    {isError ? (
                        // Distinct from an empty bank: "no questions match your
                        // filters" and "we couldn't ask" look identical to a
                        // student otherwise, and only one of them is worth
                        // retrying.
                        <p className="py-8 text-center text-gray-500">
                            Couldn't load these questions. Please refresh to try
                            again.
                        </p>
                    ) : isLoading || isFetching ? (
                        <QuestionSkeleton />
                    ) : (
                        <QuestionList
                            questions={questionList}
                            questionFilters={{
                                page,
                                subjectId,
                                topics,
                                difficulty,
                            }}
                        />
                    )}
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem
                            className="cursor-pointer"
                            onClick={() =>
                                setFilterSearchParams({
                                    page: Math.max(1, page - 1),
                                })
                            }
                        >
                            <PaginationPrevious />
                        </PaginationItem>

                        {paginationItems.map((item, index) => {
                            if (
                                item === 'ellipsis-start' ||
                                item === 'ellipsis-end'
                            ) {
                                return (
                                    <PaginationItem key={`${item}-${index}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )
                            }

                            return (
                                <PaginationItem
                                    key={item}
                                    className="cursor-pointer"
                                >
                                    <PaginationLink
                                        isActive={page === item}
                                        onClick={() =>
                                            setFilterSearchParams({
                                                page: item,
                                            })
                                        }
                                    >
                                        {item}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        })}

                        <PaginationItem className="cursor-pointer">
                            <PaginationNext
                                onClick={() =>
                                    setFilterSearchParams({
                                        page: Math.min(totalPages, page + 1),
                                    })
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
