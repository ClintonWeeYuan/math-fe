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
import { SpmBulkImportDialog } from '@/components/questionManager/SpmBulkImportDialog.tsx'
import { SubjectQuestionsCard } from '@/components/questionManager/subject/SubjectQuestionsCard.tsx'
import { PublishSubjectCard } from '@/components/questionManager/subject/PublishSubjectCard.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useState } from 'react'

export function SubjectPage() {
    const { subjectId, syllabusId } = useParams()
    const [importOpen, setImportOpen] = useState(false)
    const [showPapers, setShowPapers] = useState(false)

    const { data: syllabus } = useGetSyllabusQuery({
        syllabusId: syllabusId ?? '',
    })

    const { data, isLoading } = useGetSubjectQuery({
        subjectId: subjectId ?? '',
    })

    const { data: paperInstances } = useGetPaperInstancesBySubjectQuery({
        subjectId: subjectId ?? '',
    })

    // Either one being non-empty means this subject does use past papers, so
    // both sections stay — a subject with papers but no instances yet is
    // mid-setup, not unused.
    const hasPastPapers =
        (data?.papers?.length ?? 0) > 0 || (paperInstances?.length ?? 0) > 0

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
                {/* Importing here rather than under a paper instance is the
                    path for content generated chapter by chapter — it belongs
                    to the subject and its topics, not to any past paper. */}
                <div className="mb-4 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => setImportOpen(true)}
                    >
                        Bulk import questions
                    </Button>
                </div>
                <SpmBulkImportDialog
                    open={importOpen}
                    onOpenChange={setImportOpen}
                />
                <div className="mb-4">
                    <PublishSubjectCard
                        subjectId={subjectId ?? ''}
                        subjectName={data?.name ?? ''}
                        isPublished={data?.isPublished ?? false}
                    />
                </div>
                {/* Papers and paper instances are about scanned past papers.
                    A subject whose questions are generated chapter by chapter
                    has none and never will, so two permanently empty tables
                    are just noise on the page — hidden until they hold
                    something, or until someone asks for them. Never removed:
                    hiding them outright would take away the only way to set
                    past papers up in the first place. */}
                {hasPastPapers || showPapers ? (
                    <>
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
                                        paperVariants={
                                            syllabus?.paperVariants ?? []
                                        }
                                        existingPaperInstances={
                                            paperInstances ?? []
                                        }
                                        subjectId={subjectId ?? ''}
                                    />
                                </CardFooter>
                            </Card>
                        </div>
                    </>
                ) : (
                    <>
                        <TopicsTable
                            isLoading={isLoading}
                            topics={data?.topics ?? []}
                            subjectId={data?.id ?? ''}
                            levels={syllabus?.levels ?? []}
                        />
                        <div className="mt-4 flex items-center justify-between rounded-md border border-dashed p-3">
                            <p className="text-sm text-muted-foreground">
                                No past papers. Questions imported chapter by
                                chapter don't need them.
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPapers(true)}
                            >
                                Set up past papers
                            </Button>
                        </div>
                    </>
                )}
                {/* Every question in the subject, including the bulk-imported
                    ones that belong to no paper instance and so appear on no
                    other admin screen. */}
                <div className="mt-4">
                    <SubjectQuestionsCard subjectId={subjectId ?? ''} />
                </div>
            </div>
        </AdminLayout>
    )
}
