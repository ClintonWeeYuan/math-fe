import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import useUpdateSubjectMutation from '@/hooks/useUpdateSubjectMutation.ts'
import useGetPaginatedQuestionsBySubjectQuery from '@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts'
import { toast } from 'sonner'

/**
 * Whether students are offered this subject.
 *
 * The catalogue is served from the database now, so this toggle is the only
 * thing standing between a subject existing and students being sent to it —
 * which is why an unpublished subject is the default and why the state is
 * spelled out here rather than implied by a switch with no label.
 */
export function PublishSubjectCard({
    subjectId,
    subjectName,
    isPublished,
}: {
    subjectId: string
    subjectName: string
    isPublished: boolean
}) {
    const { mutateAsync, isPending } = useUpdateSubjectMutation({ subjectId })
    // A subject with no *published* questions is left off the catalogue
    // entirely, so publishing it can be a no-op with nothing to show for it.
    // Asking here is what stops that looking like a broken toggle.
    const { data: published } = useGetPaginatedQuestionsBySubjectQuery({
        subjectId,
        page: 1,
        size: 1,
        topics: [],
        difficulty: [],
        papers: [],
        status: 'published',
    })
    const publishedCount = published?.total ?? 0
    const liveButEmpty = isPublished && publishedCount === 0

    async function toggle() {
        try {
            await mutateAsync(!isPublished)
            toast.success(
                isPublished
                    ? `${subjectName} is no longer offered to students.`
                    : `${subjectName} is now live on /subjects.`
            )
        } catch {
            toast.error('Could not update the subject.')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Student visibility
                    <Badge
                        variant={
                            liveButEmpty
                                ? 'secondary'
                                : isPublished
                                  ? 'default'
                                  : 'secondary'
                        }
                    >
                        {liveButEmpty
                            ? 'Published, but not visible'
                            : isPublished
                              ? 'Live'
                              : 'Not published'}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    {liveButEmpty
                        ? 'This subject is published but has no published questions, so it stays off /subjects — students are never sent to an empty subject. Publish some questions below and it appears.'
                        : isPublished
                          ? `Students see this subject on /subjects and can practise its ${publishedCount} published question(s).`
                          : 'Students cannot see this subject. Publish it once it has questions worth practising.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    variant={isPublished ? 'outline' : 'default'}
                    onClick={toggle}
                    disabled={isPending}
                >
                    {isPending
                        ? 'Saving…'
                        : isPublished
                          ? 'Unpublish'
                          : 'Publish to students'}
                </Button>
            </CardContent>
        </Card>
    )
}
