import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { useParams } from 'react-router-dom'
import useGetSubjectQuery from '@/hooks/useGetSubjectQuery.ts'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { ClipLoader } from 'react-spinners'

import useGetQuestionsByPaperInstanceQuery from '@/hooks/useGetQuestionsByPaperInstanceQuery.ts'
import { QuestionsTable } from '@/components/questionManager/paperInstance/QuestionsTable.tsx'
import { UploadQuestion } from '@/components/questionManager/UploadQuestion.tsx'
import useGetPaperInstance from '@/hooks/useGetPaperInstance.ts'
import { BreadCrumbs } from '@/components/questionManager/BreadCrumbs.tsx'
import useGetSyllabusQuery from '@/hooks/useGetSyllabusQuery.ts'
import { useTopicByLevels } from '@/hooks/useTopicByLevels.ts'

export function PaperInstancePage() {
    const { subjectId, paperInstanceId, syllabusId } = useParams()

    const { data } = useGetQuestionsByPaperInstanceQuery({
        paperInstanceId: paperInstanceId ?? '',
    })

    const { data: syllabus } = useGetSyllabusQuery({
        syllabusId: syllabusId ?? '',
    })

    const { data: subject, isLoading } = useGetSubjectQuery({
        subjectId: subjectId ?? '',
    })

    const { data: paperInstance } = useGetPaperInstance({
        paperInstanceId: paperInstanceId ?? '',
    })

    const topicByLevels = useTopicByLevels({ subject })

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
                            text: subject?.name ?? '',
                        },
                        {
                            link: `/syllabus/${syllabusId}/subject/${subjectId}/paperInstance/${paperInstanceId}`,
                            text: `${paperInstance?.paper.name} (${paperInstance?.variant.name} ${paperInstance?.variant.year})`,
                        },
                    ]}
                />
                <Card className="mb-4">
                    <UploadQuestion
                        paperInstance={paperInstance}
                        topicsByLevel={topicByLevels}
                    />
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Questions{' '}
                            {isLoading && (
                                <ClipLoader className="ml-2" size={15} />
                            )}
                        </CardTitle>
                        <CardContent>
                            <QuestionsTable
                                questions={data ?? []}
                                paperInstanceId={paperInstanceId ?? ''}
                                topicsByLevel={topicByLevels}
                            />
                        </CardContent>
                    </CardHeader>
                </Card>
            </div>
        </AdminLayout>
    )
}
