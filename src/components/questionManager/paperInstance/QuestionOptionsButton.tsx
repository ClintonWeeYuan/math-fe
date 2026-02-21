import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useState } from 'react'
import type { QuestionResponse, OptionResponse } from '@/client'
import useAddQuestionOptionMutation from '@/hooks/questionOptions/useAddQuestionOptionMutation.ts'
import useGetQuestionOptionQuery from '@/hooks/questionOptions/useGetQuestionOptionsQuery.ts'
import useUpdateQuestionOptionMutation from '@/hooks/questionOptions/useUpdateQuestionOptionMutation.ts'
import useRemoveQuestionOptionMutation from '@/hooks/questionOptions/useRemoveQuestionOptionMutation.ts'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Pencil, Trash2, Check, X } from 'lucide-react'

import { BlockMath } from 'react-katex'
import Mathfield from '@/components/questionBank/v3/MathField.tsx'

type Props = {
    currentQuestion: QuestionResponse
}

export const QuestionOptionsButton = ({ currentQuestion }: Props) => {
    const [showOptions, setShowOptions] = useState<boolean>(false)

    return (
        <>
            <Button onClick={() => setShowOptions(!showOptions)}>
                Options
            </Button>
            {showOptions && (
                <QuestionOptionsContent currentQuestion={currentQuestion} />
            )}
        </>
    )
}

const QuestionOptionsContent = ({ currentQuestion }: Props) => {
    const [newOptionValue, setNewOptionValue] = useState('')
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')

    const { data: options } = useGetQuestionOptionQuery({
        questionId: currentQuestion.id,
    })

    const { mutateAsync: addOption, isPending: isAddingOption } =
        useAddQuestionOptionMutation({
            questionId: currentQuestion.id,
        })

    const { mutateAsync: updateOption, isPending: isUpdatingOption } =
        useUpdateQuestionOptionMutation({
            questionId: currentQuestion.id,
        })

    const { mutateAsync: removeOption, isPending: isRemovingOption } =
        useRemoveQuestionOptionMutation({
            questionId: currentQuestion.id,
        })

    const handleAddOption = async () => {
        if (!newOptionValue.trim()) return
        if (options === undefined) {
            return
        }
        const nextPositionNumber =
            Math.max(...options.map((option) => option.position)) + 1

        await addOption({
            optionValue: newOptionValue,
            position: nextPositionNumber,
        })
        setNewOptionValue('')
    }

    const handleToggleCorrect = async (option: OptionResponse) => {
        await updateOption({
            optionId: option.id,
            optionValue: option.value,
            isCorrect: !option.isCorrect,
        })
    }

    const handleStartEdit = (option: OptionResponse) => {
        setEditingOptionId(option.id)
        setEditValue(option.value)
    }

    const handleSaveEdit = async (option: OptionResponse) => {
        if (!editValue.trim()) return

        await updateOption({
            optionId: option.id,
            optionValue: editValue,
            isCorrect: option.isCorrect,
        })
        setEditingOptionId(null)
        setEditValue('')
    }

    const handleCancelEdit = () => {
        setEditingOptionId(null)
        setEditValue('')
    }

    const handleDeleteOption = async (optionId: string) => {
        await removeOption({ optionId })
    }

    const isPending = isAddingOption || isUpdatingOption || isRemovingOption
    console.log({ options })
    return (
        <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {options && options.length > 0 ? (
                    options.map((option) => (
                        <Card
                            key={option.id}
                            className="transition-shadow hover:shadow-md"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    {/* Checkbox for marking as correct */}
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`correct-${option.id}`}
                                            checked={option.isCorrect}
                                            onCheckedChange={() =>
                                                handleToggleCorrect(option)
                                            }
                                            disabled={isPending}
                                        />
                                        <Label
                                            htmlFor={`correct-${option.id}`}
                                            className="text-xs text-muted-foreground cursor-pointer"
                                        >
                                            Correct
                                        </Label>
                                    </div>

                                    {/* Option value (editable or display) */}
                                    <div className="flex-1">
                                        {editingOptionId === option.id ? (
                                            <Input
                                                value={editValue}
                                                onChange={(e) =>
                                                    setEditValue(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSaveEdit(option)
                                                    } else if (
                                                        e.key === 'Escape'
                                                    ) {
                                                        handleCancelEdit()
                                                    }
                                                }}
                                                disabled={isPending}
                                                autoFocus
                                                className="h-8"
                                            />
                                        ) : (
                                            <div
                                                className={`text-sm ${
                                                    option.isCorrect
                                                        ? 'font-semibold text-green-700'
                                                        : ''
                                                }`}
                                            >
                                                <BlockMath
                                                    math={option.value}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1">
                                        {editingOptionId === option.id ? (
                                            <>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleSaveEdit(option)
                                                    }
                                                    disabled={isPending}
                                                    className="h-8 w-8"
                                                >
                                                    <Check className="h-4 w-4 text-green-600" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={handleCancelEdit}
                                                    disabled={isPending}
                                                    className="h-8 w-8"
                                                >
                                                    <X className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleStartEdit(option)
                                                    }
                                                    disabled={isPending}
                                                    className="h-8 w-8"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleDeleteOption(
                                                            option.id
                                                        )
                                                    }
                                                    disabled={isPending}
                                                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No options yet. Add your first option below.</p>
                    </div>
                )}
            </div>

            {/* Add new option section */}
            <div className="border-t pt-4 space-y-2">
                <Label htmlFor="new-option">Add New Option</Label>
                <div className="flex gap-2">
                    <Mathfield
                        value={newOptionValue}
                        onChange={(value) => {
                            setNewOptionValue(value)
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 0, 0, .3)',
                            boxShadow: '0 0 8px rgba(0, 0, 0, .2)',
                        }}
                    />
                    <Button
                        onClick={handleAddOption}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={!newOptionValue.trim() || isPending}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </>
    )
}
