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
import type { BaseSubject } from '@/client'

type Props = {
    subjects: BaseSubject[]
}

export const SubjectTable = ({ subjects }: Props) => {
    const navigate = useNavigate()

    return (
        <Table>
            <TableCaption>A list of subjects for this syllabus</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {subjects.map((subject, index) => (
                    <TableRow key={subject.id}>
                        <TableCell className="font-medium">
                            {index + 1}
                        </TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell className="text-right">
                            <Button
                                onClick={() =>
                                    navigate(`subject/${subject.id}`)
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
