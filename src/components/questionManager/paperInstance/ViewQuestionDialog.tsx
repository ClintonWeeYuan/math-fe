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
import { HtmlBlock } from '@/components/questionBank/HtmlBlock.tsx'
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
                    <HtmlBlock src={question.questionUrl} onClick={() => {}} />
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg animate-in slide-in-from-top-2 duration-300">
                        <HtmlBlock
                            src={question.answerUrl}
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
