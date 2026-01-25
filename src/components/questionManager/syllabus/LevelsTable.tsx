import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { RingLoader } from 'react-spinners'
import { CreateLevelDialog } from '@/components/questionManager/syllabus/CreateLevelDialog.tsx'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import { DeleteLevelDialog } from '@/components/questionManager/syllabus/DeleteLevelDialog.tsx'
import type { BaseLevel } from '@/client'

type Props = {
    isLoading: boolean
    levels: BaseLevel[]
    syllabusId: string
}

export function LevelsTable({ isLoading, levels, syllabusId }: Props) {
    return (
        <Card className="col-span-1 flex min-h-[150px]">
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <RingLoader />
                </div>
            ) : (
                <>
                    <CardHeader>
                        <CardTitle>Levels</CardTitle>
                        <CardDescription>
                            The levels for this syllabus
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-y-auto">
                        <Table>
                            <TableCaption>
                                A list of levels for this syllabus
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">
                                        No.
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {levels.map((level, index) => (
                                    <TableRow key={level.id}>
                                        <TableCell className="font-medium">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell>{level.name}</TableCell>
                                        <TableCell className="text-right">
                                            <DeleteLevelDialog level={level} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <CreateLevelDialog syllabusId={syllabusId ?? ''} />
                    </CardFooter>
                </>
            )}
        </Card>
    )
}
