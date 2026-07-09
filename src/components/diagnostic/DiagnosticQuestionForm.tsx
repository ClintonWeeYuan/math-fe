import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Plus, Trash2 } from 'lucide-react'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import type { DiagnosticQuestionResponse } from '@/client'

const CORE_SKILLS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'] as const
const DIFFICULTY_TAGS = ['creative', 'TMUA-stretch'] as const

type OptionField = {
    label: string
    text: string
    isCorrect: boolean
    misconception: string
}

export type DiagnosticQuestionFormValues = {
    topicCode: string
    coreSkillPrimary: string
    coreSkillSecondary: string | null
    difficultyTag: string | null
    stem: string
    options: OptionField[]
    status: 'draft' | 'published'
}

/**
 * The one place "does this form have exactly one correct option" is
 * checked. Both the create and edit pages call this before submitting —
 * previously each had its own inline copy of the same
 * `.find((o) => o.isCorrect)` check, which is exactly the kind of
 * duplication that quietly drifts apart the next time either page
 * changes (the same class of risk as the backend's diagram-upload logic
 * before it was pulled into _upload_diagram_content).
 */
export function getCorrectOptionLabel(
    values: DiagnosticQuestionFormValues
): string | null {
    return values.options.find((o) => o.isCorrect)?.label ?? null
}

type Props = {
    initialData?: DiagnosticQuestionResponse
    onSubmit: (values: DiagnosticQuestionFormValues) => void
    isSubmitting: boolean
    submitLabel: string
}

function labelForIndex(index: number): string {
    return String.fromCharCode('A'.charCodeAt(0) + index)
}

function defaultValues(
    initialData?: DiagnosticQuestionResponse
): DiagnosticQuestionFormValues {
    if (!initialData) {
        return {
            topicCode: '',
            coreSkillPrimary: '',
            coreSkillSecondary: null,
            difficultyTag: null,
            stem: '',
            options: [
                { label: 'A', text: '', isCorrect: true, misconception: '' },
                { label: 'B', text: '', isCorrect: false, misconception: '' },
            ],
            status: 'draft',
        }
    }
    return {
        topicCode: initialData.topicCode,
        coreSkillPrimary: initialData.coreSkillPrimary,
        coreSkillSecondary: initialData.coreSkillSecondary ?? null,
        difficultyTag: initialData.difficultyTag ?? null,
        stem: initialData.stem,
        options: initialData.options.map((o) => ({
            label: o.label,
            text: o.text,
            isCorrect: o.isCorrect ?? false,
            misconception: o.misconception ?? '',
        })),
        status: initialData.status,
    }
}

export function DiagnosticQuestionForm({
    initialData,
    onSubmit,
    isSubmitting,
    submitLabel,
}: Props) {
    const form = useForm<DiagnosticQuestionFormValues>({
        defaultValues: defaultValues(initialData),
    })

    useEffect(() => {
        form.reset(defaultValues(initialData))
        // Only re-run when the record identity changes (switching from
        // create to edit, or between two different questions) — not on
        // every initialData re-render, which would wipe in-progress edits.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData?.id])

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'options',
    })

    const stem = form.watch('stem')
    const options = form.watch('options')
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
        // others — every other option's isCorrect is already false (only
        // one can ever be true, enforced by handleSetCorrect below), so
        // removing it naturally leaves the set with zero correct options.
        // Deliberately not auto-picking a fallback: an admin should notice
        // and choose, not have the form silently decide for them. The
        // hasCorrectOption banner below is what surfaces that state.
        remove(index)
    }

    function handleSetCorrect(index: number) {
        options.forEach((_, i) => {
            form.setValue(`options.${i}.isCorrect`, i === index)
        })
    }

    function submit(values: DiagnosticQuestionFormValues) {
        // Labels are derived from position, not free-typed, so a removed/
        // reordered option can't leave a stale or duplicate label behind.
        const relabelled = values.options.map((o, i) => ({
            ...o,
            label: labelForIndex(i),
        }))
        onSubmit({ ...values, options: relabelled })
    }

    return (
        <form
            onSubmit={form.handleSubmit(submit)}
            className="flex flex-col gap-6 max-w-5xl"
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Topic code</label>
                    <Input
                        placeholder="e.g. MM1.6"
                        {...form.register('topicCode', { required: true })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Status</label>
                    <Controller
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">
                                            Published
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">
                        Core skill (primary)
                    </label>
                    <Controller
                        control={form.control}
                        name="coreSkillPrimary"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a skill" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {CORE_SKILLS.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">
                        Core skill (secondary)
                    </label>
                    <Controller
                        control={form.control}
                        name="coreSkillSecondary"
                        render={({ field }) => (
                            <Select
                                onValueChange={(v) =>
                                    field.onChange(v === 'none' ? null : v)
                                }
                                value={field.value ?? 'none'}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="none">None</SelectItem>
                                        {CORE_SKILLS.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Difficulty tag</label>
                    <Controller
                        control={form.control}
                        name="difficultyTag"
                        render={({ field }) => (
                            <Select
                                onValueChange={(v) =>
                                    field.onChange(v === 'none' ? null : v)
                                }
                                value={field.value ?? 'none'}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="none">None</SelectItem>
                                        {DIFFICULTY_TAGS.map((tag) => (
                                            <SelectItem key={tag} value={tag}>
                                                {tag}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                    Stem (LaTeX, $...$-delimited)
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <Textarea
                        rows={4}
                        placeholder="Given that $x^2 + kx + 9 = 0$ has equal roots..."
                        {...form.register('stem', { required: true })}
                    />
                    <div className="rounded-md border p-3 bg-gray-50 text-sm">
                        <div className="text-xs uppercase text-gray-400 mb-2">
                            Preview
                        </div>
                        <LatexText text={stem || ''} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Options</label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                    >
                        <Plus className="w-4 h-4" /> Add option
                    </Button>
                </div>

                {!hasCorrectOption && (
                    <div
                        role="alert"
                        className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                    >
                        No option is marked as the correct answer. Select one
                        below before saving.
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
                                    {...form.register(`options.${index}.text`, {
                                        required: true,
                                    })}
                                />
                                <div className="rounded-md border p-3 bg-gray-50 text-sm">
                                    <LatexText text={options[index]?.text || ''} />
                                </div>
                            </div>

                            {!options[index]?.isCorrect && (
                                <Input
                                    placeholder="Misconception (why a student might pick this wrong answer)"
                                    {...form.register(
                                        `options.${index}.misconception`
                                    )}
                                />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : submitLabel}
                </Button>
            </div>
        </form>
    )
}
