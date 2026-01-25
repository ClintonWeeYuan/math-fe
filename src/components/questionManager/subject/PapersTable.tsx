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
import { DeletePaperDialog } from '@/components/questionManager/subject/DeletePaperDialog.tsx'
import { CreatePaperDialog } from '@/components/questionManager/subject/CreatePaperDialog.tsx'
import type { Paper } from '@/client'

type Props = {
    isLoading: boolean
    papers: Paper[]
    subjectId: string
}

export function PapersTable({ isLoading, papers, subjectId }: Props) {
    return (
        <Card className="col-span-1 flex min-h-[150px]">
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <RingLoader />
                </div>
            ) : (
                <>
                    <CardHeader>
                        <CardTitle>Papers</CardTitle>
                        <CardDescription>
                            The papers for this subject
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-y-auto">
                        <Table>
                            <TableCaption>
                                A list of papers for this subject
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
                                {papers.map((paper, index) => (
                                    <TableRow key={paper.id}>
                                        <TableCell className="font-medium">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell>{paper.name}</TableCell>
                                        <TableCell className="text-right">
                                            <DeletePaperDialog paper={paper} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <CreatePaperDialog subjectId={subjectId} />
                    </CardFooter>
                </>
            )}
        </Card>
    )
}
