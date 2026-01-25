import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'
import { DeletePaperInstanceDialog } from '@/components/questionManager/subject/DeletePaperInstanceDialog.tsx'
import type { PaperInstance } from '@/client'

type Props = {
    paperInstances: PaperInstance[]
    subjectId: string
}

export const PaperInstanceTable = ({ paperInstances, subjectId }: Props) => {
    const navigate = useNavigate()

    return (
        <Table>
            <TableCaption>
                A list of paper instances for this subject
            </TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">No.</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Paper</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paperInstances.map((paperInstance, index) => (
                    <TableRow key={paperInstance.id}>
                        <TableCell className="font-medium">
                            {index + 1}
                        </TableCell>
                        <TableCell>{paperInstance.variant.year}</TableCell>
                        <TableCell>{paperInstance.paper.name}</TableCell>
                        <TableCell>{paperInstance.variant.name}</TableCell>

                        <TableCell className="text-right space-x-2">
                            <DeletePaperInstanceDialog
                                paperInstance={paperInstance}
                                subjectId={subjectId}
                            />
                            <Button
                                onClick={() =>
                                    navigate(
                                        `paperInstance/${paperInstance.id}`
                                    )
                                }
                            >
                                View
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
