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
import { QuestionOptionsDialog } from '@/components/questionManager/paperInstance/QuestionOptionsDialog.tsx'

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
                                <QuestionOptionsDialog
                                    currentQuestion={question}
                                />
                            )}

                            <DownloadButton
                                fileUrl={question.answerUrl}
                                fileName={`${question.paperVariant.year}-Paper ${question.paper.name}-Q${question.number}.html`}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
