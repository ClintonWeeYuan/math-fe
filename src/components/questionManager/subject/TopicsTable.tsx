import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { RingLoader } from 'react-spinners'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import { CreateTopicDialog } from '@/components/questionManager/subject/CreateTopicDialog.tsx'
import { DeleteTopicDialog } from '@/components/questionManager/subject/DeleteTopicDialog.tsx'
import { UpdateTopicDialog } from '@/components/questionManager/subject/UpdateTopicDialog.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import type { BaseLevel, BaseTopic } from '@/client'

type Props = {
    isLoading: boolean
    topics: BaseTopic[]
    subjectId: string
    levels: BaseLevel[]
}

export function TopicsTable({ isLoading, topics, subjectId, levels }: Props) {
    return (
        <Card className="col-span-1 flex min-h-[150px]">
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <RingLoader />
                </div>
            ) : (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Topics
                            {/* The count is what tells you the list is
                                complete. This box scrolls after about four
                                rows with nothing to say so, and seven imported
                                chapters read as four missing ones. */}
                            <Badge variant="secondary">{topics.length}</Badge>
                        </CardTitle>
                        <CardDescription>
                            The topics for this subject
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-y-auto">
                        <Table>
                            <TableCaption>
                                {topics.length === 0
                                    ? 'No topics yet.'
                                    : `${topics.length} topic${topics.length === 1 ? '' : 's'} for this subject`}
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">
                                        No.
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topics.map((topic) => (
                                    <TableRow key={topic.id}>
                                        <TableCell className="font-medium">
                                            {topic.sortOrder}
                                        </TableCell>
                                        <TableCell>{topic.name}</TableCell>
                                        <TableCell>
                                            {topic.level?.name}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <UpdateTopicDialog
                                                currentTopic={topic}
                                                levels={levels}
                                            />
                                            <DeleteTopicDialog topic={topic} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <CreateTopicDialog
                            subjectId={subjectId}
                            levels={levels}
                        />
                    </CardFooter>
                </>
            )}
        </Card>
    )
}
