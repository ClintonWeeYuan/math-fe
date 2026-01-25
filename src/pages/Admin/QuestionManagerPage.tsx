import { AdminLayout } from '@/components/layout/AdminLayout.tsx'

import useGetAllSyllabusQuery from '@/hooks/useGetAllSyllabusQuery.ts'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card.tsx'
import { useNavigate } from 'react-router-dom'

export function QuestionManagerPage() {
    const { data } = useGetAllSyllabusQuery()
    const navigate = useNavigate()

    return (
        <AdminLayout>
            <div className="mt-8">
                <div className="grid grid-cols-12 gap-2">
                    {data?.map((syllabus) => (
                        <Card key={syllabus.id} className="col-span-4">
                            <CardHeader>
                                <CardTitle>{syllabus.code}</CardTitle>
                                <CardDescription>
                                    {syllabus.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2">
                                    {/** @ts-expect-error Types here are wrong **/}
                                    <HoverCard className="col-span-1">
                                        <HoverCardTrigger className="cursor-pointer">
                                            {syllabus.levels.length} Levels
                                        </HoverCardTrigger>
                                        <HoverCardContent>
                                            <ol>
                                                {syllabus.levels.map(
                                                    (level) => (
                                                        <li key={level.id}>
                                                            {level.name}
                                                        </li>
                                                    )
                                                )}
                                            </ol>
                                        </HoverCardContent>
                                    </HoverCard>
                                    {/** @ts-expect-error Types here are wrong **/}
                                    <HoverCard className="col-span-1">
                                        <HoverCardTrigger className="cursor-pointer">
                                            {syllabus.subjects.length} Subjects
                                        </HoverCardTrigger>
                                        <HoverCardContent>
                                            <ol>
                                                {syllabus.subjects.map(
                                                    (subject) => (
                                                        <li key={subject.id}>
                                                            {subject.name}
                                                        </li>
                                                    )
                                                )}
                                            </ol>
                                        </HoverCardContent>
                                    </HoverCard>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <Button
                                    onClick={() =>
                                        navigate(`/syllabus/${syllabus.id}`)
                                    }
                                    className="w-full"
                                >
                                    View
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    )
}
