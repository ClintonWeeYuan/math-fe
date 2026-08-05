import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { useEffect, useState } from 'react'
import type { QuestionResponse } from '@/client'
import useEditQuestionMutation from '@/hooks/useEditQuestionMutation.ts'
import useGetQuestionOptionQuery from '@/hooks/questionOptions/useGetQuestionOptionsQuery.ts'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import { toast } from 'sonner'

type DraftOption = {
    label: string
    text: string
    misconception: string
}

const DIFFICULTIES = ['easy', 'medium', 'hard']

/**
 * Edit an imported question in place.
 *
 * The chapter JSON file it came from stays the better place for wholesale
 * rewrites — re-importing updates in place and keeps the file authoritative —
 * so this is for the one-off correction you don't want to regenerate a file
 * for. Saving stamps the question as hand-edited, and the import's dry run
 * warns before a later re-import overwrites it.
 */
export function EditQuestionDialog({
    question,
    open,
    onOpenChange,
}: {
    question: QuestionResponse
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { data: existingOptions } = useGetQuestionOptionQuery({
        questionId: question.id,
    })
    const { mutateAsync, isPending } = useEditQuestionMutation({
        questionId: question.id,
    })

    const [stem, setStem] = useState(question.stem ?? '')
    const [difficulty, setDifficulty] = useState(question.difficulty)
    const [chapter, setChapter] = useState(question.chapter ?? '')
    const [topicCode, setTopicCode] = useState(question.topicCode ?? '')
    const [archetype, setArchetype] = useState(question.archetype ?? '')
    const [correctOption, setCorrectOption] = useState(
        question.correctOption ?? ''
    )
    const [options, setOptions] = useState<DraftOption[]>([])

    // Options arrive from their own request, so the draft can only be seeded
    // once they land — and re-seeded if the dialog is reopened on a question
    // whose options have since changed.
    useEffect(() => {
        if (!existingOptions) return
        setOptions(
            [...existingOptions]
                .sort((a, b) => a.position - b.position)
                .map((option, index) => ({
                    label: option.label ?? String.fromCharCode(65 + index),
                    text: option.value,
                    misconception: option.misconception ?? '',
                }))
        )
    }, [existingOptions])

    function updateOption(index: number, patch: Partial<DraftOption>) {
        setOptions((current) =>
            current.map((option, i) =>
                i === index ? { ...option, ...patch } : option
            )
        )
    }

    const labels = options.map((o) => o.label)
    const answerIsAnOption = labels.includes(correctOption)
    const canSave =
        stem.trim().length > 0 &&
        options.length > 0 &&
        options.every((o) => o.label.trim() && o.text.trim()) &&
        answerIsAnOption

    async function save() {
        try {
            await mutateAsync({
                stem: stem.trim(),
                difficulty,
                chapter: chapter.trim() || null,
                topicCode: topicCode.trim() || null,
                archetype: archetype.trim() || null,
                correctOption,
                options: options.map((o) => ({
                    label: o.label.trim(),
                    text: o.text.trim(),
                    // Empty means "no misconception recorded", not an empty
                    // string — the radar reads these and would narrate a blank.
                    misconception: o.misconception.trim() || null,
                })),
            })
            toast.success('Question saved.')
            onOpenChange(false)
        } catch {
            toast.error('Could not save the question.')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit question</DialogTitle>
                    <DialogDescription>
                        Saving marks this question as edited by hand. Importing
                        its chapter file again will overwrite it — the import
                        warns you first.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="stem">Question</Label>
                        <Textarea
                            id="stem"
                            rows={4}
                            value={stem}
                            onChange={(e) => setStem(e.target.value)}
                        />
                        {stem.trim() && (
                            <div className="rounded-md border bg-muted/40 p-3 text-sm">
                                {/* Rendered as the student sees it, so LaTeX
                                    that doesn't parse is obvious before saving
                                    rather than after publishing. */}
                                <LatexText text={stem} />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="grid gap-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <select
                                id="difficulty"
                                className="h-9 rounded-md border px-2 text-sm"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                {DIFFICULTIES.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="chapter">Chapter</Label>
                            <Input
                                id="chapter"
                                value={chapter}
                                onChange={(e) => setChapter(e.target.value)}
                                placeholder="C02"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="topicCode">Topic code</Label>
                            <Input
                                id="topicCode"
                                value={topicCode}
                                onChange={(e) => setTopicCode(e.target.value)}
                                placeholder="2.1.1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="archetype">Archetype</Label>
                            <Input
                                id="archetype"
                                value={archetype}
                                onChange={(e) => setArchetype(e.target.value)}
                                placeholder="Recall / concept"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Options</Label>
                        {options.map((option, index) => (
                            <div
                                key={index}
                                className="grid gap-2 rounded-md border p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <Input
                                        aria-label={`Option ${index + 1} label`}
                                        className="w-16"
                                        value={option.label}
                                        onChange={(e) =>
                                            updateOption(index, {
                                                label: e.target.value,
                                            })
                                        }
                                    />
                                    <Input
                                        aria-label={`Option ${index + 1} text`}
                                        value={option.text}
                                        onChange={(e) =>
                                            updateOption(index, {
                                                text: e.target.value,
                                            })
                                        }
                                    />
                                    <label className="flex shrink-0 items-center gap-1 text-sm">
                                        <input
                                            type="radio"
                                            name="correct-option"
                                            checked={
                                                correctOption === option.label
                                            }
                                            onChange={() =>
                                                setCorrectOption(option.label)
                                            }
                                        />
                                        Correct
                                    </label>
                                </div>
                                <Input
                                    aria-label={`Option ${index + 1} misconception`}
                                    placeholder="Why a student might pick this (optional)"
                                    value={option.misconception}
                                    onChange={(e) =>
                                        updateOption(index, {
                                            misconception: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        ))}
                        {!answerIsAnOption && options.length > 0 && (
                            <p className="text-sm text-red-600">
                                Choose which option is correct.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={save} disabled={!canSave || isPending}>
                        {isPending ? 'Saving…' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
