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
import { DeletePaperVariantDialog } from '@/components/questionManager/syllabus/DeletePaperVariantDialog.tsx'
import { CreatePaperVariantDialog } from '@/components/questionManager/syllabus/CreatePaperVariantDialog.tsx'
import type { PaperVariant } from '@/client'

type Props = {
    isLoading: boolean
    paperVariants: PaperVariant[]
    syllabusId: string
}

export function PaperVariantTable({
    isLoading,
    paperVariants,
    syllabusId,
}: Props) {
    return (
        <Card className="col-span-1 flex min-h-[150px]">
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <RingLoader />
                </div>
            ) : (
                <>
                    <CardHeader>
                        <CardTitle>Paper Variants</CardTitle>
                        <CardDescription>
                            The Paper Variants for this syllabus
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-y-auto">
                        <Table className="">
                            <TableCaption>
                                A list of paper variants for this syllabus
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">
                                        No.
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paperVariants.map((paperVariant, index) => (
                                    <TableRow key={paperVariant.id}>
                                        <TableCell className="font-medium">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell>
                                            {paperVariant.name}
                                        </TableCell>
                                        <TableCell>
                                            {paperVariant.year}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DeletePaperVariantDialog
                                                paperVariant={paperVariant}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <CreatePaperVariantDialog
                            syllabusId={syllabusId ?? ''}
                        />
                    </CardFooter>
                </>
            )}
        </Card>
    )
}
