import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useState } from 'react'
import {
    QuestionAnswer,
    QuestionContent,
} from '@/components/questionBank/QuestionContent.tsx'
import type { QuestionResponse } from '@/client'

type Props = {
    question: QuestionResponse
}
export const ViewQuestionDialog = ({ question }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button onClick={() => setDialogOpen(true)}>View</Button>
            <DialogContent className="max-h-[70%] min-w-[70%] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Question {question.number}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    {/* A bulk-imported question has no HTML asset — its stem
                        and options are the content, rendered the same way the
                        student bank renders them. */}
                    <QuestionContent question={question} onClick={() => {}} />
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg animate-in slide-in-from-top-2 duration-300">
                        <QuestionAnswer
                            question={question}
                            onClick={() => {}}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
