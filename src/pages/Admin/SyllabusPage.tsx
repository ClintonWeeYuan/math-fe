import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { useParams } from 'react-router-dom'
import useGetSyllabusQuery from '@/hooks/useGetSyllabusQuery.ts'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { SubjectTable } from '@/components/questionManager/syllabus/SubjectTable.tsx'
import { LevelsTable } from '@/components/questionManager/syllabus/LevelsTable.tsx'
import { PaperVariantTable } from '@/components/questionManager/syllabus/PaperVariantTable.tsx'
import { BreadCrumbs } from '@/components/questionManager/BreadCrumbs.tsx'

export function SyllabusPage() {
    const { syllabusId } = useParams()

    const { data, isLoading } = useGetSyllabusQuery({
        syllabusId: syllabusId ?? '',
    })

    return (
        <AdminLayout>
            <div className="mt-8">
                <BreadCrumbs
                    crumbs={[
                        {
                            link: `/syllabus/${syllabusId}`,
                            text: data?.name ?? '',
                        },
                    ]}
                />
                <div className="grid grid-cols-2 gap-4">
                    <LevelsTable
                        isLoading={isLoading}
                        levels={data?.levels ?? []}
                        syllabusId={syllabusId ?? ''}
                    />
                    <PaperVariantTable
                        isLoading={isLoading}
                        paperVariants={data?.paperVariants ?? []}
                        syllabusId={syllabusId ?? ''}
                    />
                </div>
                <div className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subjects</CardTitle>
                            <CardContent>
                                <SubjectTable subjects={data?.subjects ?? []} />
                            </CardContent>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
