import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
    STUDENT_BREAK_CHOICES,
    STUDENT_EXTRA_TIME_CHOICES,
    MY_ARRANGEMENTS_QUERY_KEY,
    declareMyArrangements,
    describeAccommodation,
    type MyArrangements,
} from '@/lib/accommodationsApi.ts'

type Props = {
    arrangements: MyArrangements
    /** "ESAT" or "TMUA": the declaration is about the student's real test. */
    testName: string
}

/**
 * Asks, once, whether a student has access arrangements for the real test,
 * and afterwards reminds them what they have with a way to change it.
 *
 * Asked on the instructions screen because that is the last moment it can
 * matter: an attempt snapshots the arrangement when it starts, so a student
 * who only mentions it later has already sat that paper on the standard clock.
 *
 * Evidence is a declaration, never a document. Medical letters are health
 * data, and a practice platform has no business storing them; the student
 * confirms the arrangement matches the real test, and the admin is told.
 */
export function AccessArrangementsPrompt({ arrangements, testName }: Props) {
    const [mode, setMode] = useState<'closed' | 'form'>('closed')

    if (!arrangements.answered && mode === 'closed') {
        return <FirstAsk testName={testName} onYes={() => setMode('form')} />
    }
    if (mode === 'form') {
        return (
            <ArrangementsForm
                initial={arrangements}
                testName={testName}
                onDone={() => setMode('closed')}
                onCancel={arrangements.answered ? () => setMode('closed') : undefined}
            />
        )
    }
    return <Reminder arrangements={arrangements} onChange={() => setMode('form')} />
}

function useDeclare(onDone?: () => void) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: declareMyArrangements,
        onSuccess: (saved) => {
            queryClient.setQueryData(MY_ARRANGEMENTS_QUERY_KEY, saved)
            onDone?.()
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

function FirstAsk({ testName, onYes }: { testName: string; onYes: () => void }) {
    const { mutate, isPending } = useDeclare()
    return (
        <section
            aria-labelledby="arrangements-ask"
            className="rounded-md border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950"
        >
            <h2 id="arrangements-ask" className="text-base font-semibold">
                Before you start: do you have access arrangements for the {testName}?
            </h2>
            <p className="mt-1">
                For example extra time or rest breaks, granted because of a disability,
                a medical condition or a learning difficulty. If you do, we can give you
                the same here, so your practice matches the real test.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={onYes} disabled={isPending}>
                    Yes, I do
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() =>
                        mutate({ extraTimePercent: 0, breakBudgetMinutes: 0, confirmed: false })
                    }
                >
                    No, I don&apos;t
                </Button>
            </div>
            <p className="mt-2 text-xs text-sky-900/80">
                You can change this later, before any paper.
            </p>
        </section>
    )
}

function Reminder({
    arrangements,
    onChange,
}: {
    arrangements: MyArrangements
    onChange: () => void
}) {
    const has = arrangements.extraTimePercent > 0 || arrangements.breakBudgetMinutes > 0
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-200 px-4 py-3 text-sm">
            <span>
                <span className="text-gray-500">Access arrangements: </span>
                <span className="font-medium">
                    {has ? describeAccommodation(arrangements) : 'none'}
                </span>
                {arrangements.breakBudgetMinutes > 0 && (
                    <span className="block text-xs text-gray-500">
                        Use &ldquo;Take a break&rdquo; in the paper and your clock stops
                        until you come back.
                    </span>
                )}
            </span>
            <Button type="button" variant="ghost" className="h-auto px-2 py-1" onClick={onChange}>
                Change
            </Button>
        </div>
    )
}

function ArrangementsForm({
    initial,
    testName,
    onDone,
    onCancel,
}: {
    initial: MyArrangements
    testName: string
    onDone: () => void
    onCancel?: () => void
}) {
    const [extraTimePercent, setExtraTime] = useState(
        initial.answered ? initial.extraTimePercent : 25
    )
    const [breakBudgetMinutes, setBreaks] = useState(initial.breakBudgetMinutes)
    const [note, setNote] = useState(initial.note ?? '')
    const [confirmed, setConfirmed] = useState(false)
    const { mutate, isPending } = useDeclare(() => {
        toast.success('Saved. This applies to papers you start from now on.')
        onDone()
    })

    const claims = extraTimePercent > 0 || breakBudgetMinutes > 0
    const canSave = !isPending && (!claims || confirmed)

    return (
        <form
            aria-label="Your access arrangements"
            className="flex flex-col gap-3 rounded-md border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950"
            onSubmit={(e) => {
                e.preventDefault()
                if (!canSave) return
                mutate({ extraTimePercent, breakBudgetMinutes, note, confirmed })
            }}
        >
            <h2 className="text-base font-semibold">Your access arrangements</h2>
            <p>Choose what you have been granted, or have applied for, in the {testName}.</p>

            <label className="flex flex-col gap-1">
                <span className="font-medium">Extra time</span>
                <select
                    className="rounded-md border border-gray-300 bg-white p-2"
                    value={extraTimePercent}
                    onChange={(e) => setExtraTime(Number(e.target.value))}
                >
                    {STUDENT_EXTRA_TIME_CHOICES.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1">
                <span className="font-medium">Rest breaks (the clock stops)</span>
                <select
                    className="rounded-md border border-gray-300 bg-white p-2"
                    value={breakBudgetMinutes}
                    onChange={(e) => setBreaks(Number(e.target.value))}
                >
                    {STUDENT_BREAK_CHOICES.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1">
                <span className="font-medium">Anything we should know? (optional)</span>
                <textarea
                    className="min-h-[4rem] rounded-md border border-gray-300 bg-white p-2"
                    maxLength={1000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="For example, who granted it. Please don't include medical details."
                />
            </label>

            {claims && (
                <label className="flex items-start gap-2">
                    <Checkbox
                        checked={confirmed}
                        onCheckedChange={(v) => setConfirmed(v === true)}
                        aria-label="Confirm your arrangements"
                        className="mt-0.5 bg-white"
                    />
                    <span>
                        I confirm I have been granted, or have applied for, these
                        arrangements for the {testName}.
                    </span>
                </label>
            )}

            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={!canSave}>
                    {claims ? 'Save my arrangements' : 'Save: no arrangements'}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    )
}
