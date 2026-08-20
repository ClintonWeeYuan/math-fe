import { useForm, FormProvider } from 'react-hook-form'
import { useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Button } from '@/components/ui/button.tsx'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import type { DiagnosticQuestionResponse } from '@/client'
import {
    defaultValues,
    labelForIndex,
    type DiagnosticQuestionFormValues,
} from './questionForm/types.ts'
import { QuestionMetaFields } from './questionForm/QuestionMetaFields.tsx'
import { QuestionOptionsEditor } from './questionForm/QuestionOptionsEditor.tsx'
import { QuestionDiagramField } from './questionForm/QuestionDiagramField.tsx'
import { QuestionSolutionFields } from './questionForm/QuestionSolutionFields.tsx'

// Re-exported so callers (the create/edit pages, tests) keep importing the
// form's public API from one place even though the internals are now split.
export type { DiagnosticQuestionFormValues } from './questionForm/types.ts'
export {
    getCorrectOptionLabel,
    getDiagramSvgForCreate,
    getDiagramSvgForUpdate,
} from './questionForm/types.ts'

type Props = {
    initialData?: DiagnosticQuestionResponse
    onSubmit: (values: DiagnosticQuestionFormValues) => void
    isSubmitting: boolean
    submitLabel: string
    /**
     * Topic codes already in use, offered in the topic-code combobox so the
     * common case is picking an existing one rather than retyping it (a typo
     * silently mis-tags a question). Passed in rather than fetched here so
     * this stays a presentational form; a new code can always be typed, so an
     * empty list degrades to free entry rather than blocking.
     */
    topicCodeOptions?: string[]
}

/**
 * The diagnostic-question authoring form. Composes the metadata grid, the
 * stem, the answer-options editor, and the diagram field — each a focused
 * sub-component that reads the shared react-hook-form context (FormProvider).
 * This component owns the form instance, the reset-on-record-change, and the
 * submit (which re-derives positional option labels).
 */
export function DiagnosticQuestionForm({
    initialData,
    onSubmit,
    isSubmitting,
    submitLabel,
    topicCodeOptions = [],
}: Props) {
    const form = useForm<DiagnosticQuestionFormValues>({
        defaultValues: defaultValues(initialData),
    })

    useEffect(() => {
        form.reset(defaultValues(initialData))
        // Only re-run when the record identity changes (switching from create
        // to edit, or between two different questions) — not on every
        // initialData re-render, which would wipe in-progress edits.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData?.id])

    const stem = form.watch('stem')

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
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(submit)}
                className="flex flex-col gap-6 max-w-5xl"
            >
                <QuestionMetaFields topicCodeOptions={topicCodeOptions} />

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

                <QuestionOptionsEditor />

                <QuestionDiagramField initialData={initialData} />

                <QuestionSolutionFields />

                <div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : submitLabel}
                    </Button>
                </div>
            </form>
        </FormProvider>
    )
}
