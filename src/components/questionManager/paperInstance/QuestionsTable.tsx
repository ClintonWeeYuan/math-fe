import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import { ViewQuestionDialog } from '@/components/questionManager/paperInstance/ViewQuestionDialog.tsx'
import { DeleteQuestionDialog } from '@/components/questionManager/paperInstance/DeleteQuestionDialog.tsx'
import type { TopicByLevel } from '@/components/questionManager/UploadQuestion.tsx'
import { UpdateQuestionDialog } from '@/components/questionManager/paperInstance/UpdateQuestionDialog.tsx'
import { DownloadButton } from '@/components/common/DownloadButton.tsx'
import type { QuestionResponse } from '@/client'
import { QuestionOptionsButton } from '@/components/questionManager/paperInstance/QuestionOptionsButton.tsx'

type Props = {
    questions: QuestionResponse[]
    paperInstanceId: string
    topicsByLevel: Record<string, TopicByLevel>
}

export const QuestionsTable = ({
    questions,
    paperInstanceId,
    topicsByLevel,
}: Props) => {
    return (
        <Table>
            <TableCaption>
                A list of questions in this paper instance
            </TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">No.</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {questions.map((question) => (
                    <TableRow key={question.id}>
                        <TableCell className="font-medium">
                            {question.number}
                        </TableCell>
                        <TableCell>
                            {question.topics
                                .map((topic) => topic.name)
                                .join(', ')}
                        </TableCell>
                        <TableCell>{question.difficulty}</TableCell>
                        <TableCell>
                            {question.marks != undefined ? question.marks : ''}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                            <DeleteQuestionDialog
                                question={question}
                                paperInstanceId={paperInstanceId}
                            />
                            <ViewQuestionDialog question={question} />
                            <UpdateQuestionDialog
                                currentQuestion={question}
                                paperInstanceId={paperInstanceId}
                                topicsByLevel={topicsByLevel}
                            />
                            {question.type === 'multiple_choice' && (
                                <QuestionOptionsButton
                                    currentQuestion={question}
                                />
                            )}

                            {/* Only an asset question has a file to download;
                                a bulk-imported one is stored as data, and its
                                filename would have no paper to name anyway. */}
                            {question.answerUrl && (
                                <DownloadButton
                                    fileUrl={question.answerUrl}
                                    fileName={`${question.paperVariant?.year ?? 'unfiled'}-Paper ${question.paper?.name ?? '-'}-Q${question.number ?? question.sourceRef}.html`}
                                />
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
