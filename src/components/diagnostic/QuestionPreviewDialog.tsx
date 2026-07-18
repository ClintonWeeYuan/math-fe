import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { StudentQuestionPreview } from '@/components/diagnostic/StudentQuestionPreview.tsx'
import type { DiagnosticQuestionResponse } from '@/client'

type Props = {
    /** One or more questions to preview. Prev/Next step through them (used
     * both for a single-question preview and the bulk preview). */
    questions: DiagnosticQuestionResponse[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function QuestionPreviewDialog({ questions, open, onOpenChange }: Props) {
    const [index, setIndex] = useState(0)

    // Restart at the first question whenever a new preview is opened.
    useEffect(() => {
        if (open) setIndex(0)
    }, [open])

    if (questions.length === 0) return null
    const clamped = Math.min(index, questions.length - 1)
    const question = questions[clamped]
    const many = questions.length > 1

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Student preview
                        {many && (
                            <span className="text-sm font-normal text-gray-500">
                                {clamped + 1} of {questions.length}
                            </span>
                        )}
                        {question.status === 'draft' && (
                            <Badge variant="secondary">draft</Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {question.topicCode} · {question.coreSkillPrimary}
                        {question.coreSkillSecondary
                            ? ` / ${question.coreSkillSecondary}`
                            : ''}
                    </DialogDescription>
                </DialogHeader>

                <StudentQuestionPreview question={question} />

                {many && (
                    <div className="flex items-center justify-between pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={clamped === 0}
                            onClick={() => setIndex(clamped - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={clamped === questions.length - 1}
                            onClick={() => setIndex(clamped + 1)}
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
