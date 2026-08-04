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
                    <Badge variant={isPublished ? 'default' : 'secondary'}>
                        {isPublished ? 'Live' : 'Not published'}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    {isPublished
                        ? 'Students see this subject on /subjects and can practise its questions.'
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
