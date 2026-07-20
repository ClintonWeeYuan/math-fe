import { useFieldArray, useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Plus, Trash2 } from 'lucide-react'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import { labelForIndex, type DiagnosticQuestionFormValues } from './types.ts'

/** The answer-options editor: add/remove options, mark exactly one correct
 * (mutual exclusivity), and per-option text (LaTeX preview) + misconception.
 * Labels are positional (A, B, C…) so they can't drift on remove/reorder. */
export function QuestionOptionsEditor() {
    const { control, register, watch, setValue } =
        useFormContext<DiagnosticQuestionFormValues>()
    const { fields, append, remove } = useFieldArray({ control, name: 'options' })

    const options = watch('options')
    const hasCorrectOption = options.some((o) => o.isCorrect)

    function handleAddOption() {
        append({
            label: labelForIndex(fields.length),
            text: '',
            isCorrect: false,
            misconception: '',
        })
    }

    function handleRemoveOption(index: number) {
        // If this was the correct option, nothing needs to happen to the
        // others — every other option's isCorrect is already false (only one
        // can ever be true, enforced by handleSetCorrect), so removing it
        // naturally leaves the set with zero correct options. Deliberately
        // not auto-picking a fallback: an admin should notice and choose, not
        // have the form silently decide. The banner below surfaces that state.
        remove(index)
    }

    function handleSetCorrect(index: number) {
        options.forEach((_, i) => {
            setValue(`options.${i}.isCorrect`, i === index)
        })
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Options</label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                    <Plus className="w-4 h-4" /> Add option
                </Button>
            </div>

            {!hasCorrectOption && (
                <div
                    role="alert"
                    className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                >
                    No option is marked as the correct answer. Select one below
                    before saving.
                </div>
            )}

            {fields.map((field, index) => (
                <Card key={field.id}>
                    <CardContent className="pt-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold w-6">
                                {labelForIndex(index)}
                            </span>
                            <label className="flex items-center gap-1.5 text-sm">
                                <input
                                    type="radio"
                                    name="correct-option"
                                    checked={options[index]?.isCorrect ?? false}
                                    onChange={() => handleSetCorrect(index)}
                                />
                                Correct answer
                            </label>
                            <div className="flex-1" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={fields.length <= 2}
                                onClick={() => handleRemoveOption(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Textarea
                                rows={2}
                                placeholder="Option text, LaTeX allowed"
                                {...register(`options.${index}.text`, { required: true })}
                            />
                            <div className="rounded-md border p-3 bg-gray-50 text-sm">
                                <LatexText text={options[index]?.text || ''} />
                            </div>
                        </div>

                        {!options[index]?.isCorrect && (
                            <Input
                                placeholder="Misconception (why a student might pick this wrong answer)"
                                {...register(`options.${index}.misconception`)}
                            />
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
