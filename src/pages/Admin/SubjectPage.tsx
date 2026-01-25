import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { useParams } from 'react-router-dom'
import useGetSubjectQuery from '@/hooks/useGetSubjectQuery.ts'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import useGetSyllabusQuery from '@/hooks/useGetSyllabusQuery.ts'
import useGetPaperInstancesBySubjectQuery from '@/hooks/useGetPaperInstancesBySubjectQuery.ts'
import { PaperInstanceTable } from '@/components/questionManager/subject/PaperInstanceTable.tsx'
import { CreatePaperInstanceDialog } from '@/components/questionManager/subject/CreatePaperInstanceDialog.tsx'
import { TopicsTable } from '@/components/questionManager/subject/TopicsTable.tsx'
import { PapersTable } from '@/components/questionManager/subject/PapersTable.tsx'
import { BreadCrumbs } from '@/components/questionManager/BreadCrumbs.tsx'

export function SubjectPage() {
    const { subjectId, syllabusId } = useParams()

    const { data: syllabus } = useGetSyllabusQuery({
        syllabusId: syllabusId ?? '',
    })

    const { data, isLoading } = useGetSubjectQuery({
        subjectId: subjectId ?? '',
    })

    const { data: paperInstances } = useGetPaperInstancesBySubjectQuery({
        subjectId: subjectId ?? '',
    })

    console.log({ subjectId, paperInstances, data })

    return (
        <AdminLayout>
            <div className="mt-8">
                <BreadCrumbs
                    crumbs={[
                        {
                            link: `/syllabus/${syllabusId}`,
                            text: syllabus?.name ?? '',
                        },
                        {
                            link: `/syllabus/${syllabusId}/subject/${subjectId}`,
                            text: data?.name ?? '',
                        },
                    ]}
                />
                <div className="grid grid-cols-2 gap-4">
                    <TopicsTable
                        isLoading={isLoading}
                        topics={data?.topics ?? []}
                        subjectId={data?.id ?? ''}
                        levels={syllabus?.levels ?? []}
                    />
                    <PapersTable
                        isLoading={isLoading}
                        papers={data?.papers ?? []}
                        subjectId={subjectId ?? ''}
                    />
                </div>
                <div className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Paper Instances</CardTitle>
                            <CardContent>
                                <PaperInstanceTable
                                    paperInstances={paperInstances ?? []}
                                    subjectId={subjectId ?? ''}
                                />
                            </CardContent>
                        </CardHeader>
                        <CardFooter>
                            <CreatePaperInstanceDialog
                                papers={data?.papers ?? []}
                                paperVariants={syllabus?.paperVariants ?? []}
                                existingPaperInstances={paperInstances ?? []}
                                subjectId={subjectId ?? ''}
                            />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
