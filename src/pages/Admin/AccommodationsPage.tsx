import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
    EXTRA_TIME_CHOICES,
    describeAccommodation,
    fetchAccommodations,
    saveAccommodation,
    type Accommodation,
} from '@/lib/accommodationsApi.ts'

/**
 * Access arrangements, the admin side. One row per student who has one, and
 * a form to grant a new one by student id (taken from the results page,
 * which is where an admin is when they learn a student needs this).
 *
 * The page states plainly that arrangements apply to the next paper, not the
 * one in progress: the attempt snapshots what the student was entitled to
 * when it started, and a report has to explain the clock that attempt ran to.
 */
function ArrangementForm({
    initial,
    onSaved,
}: {
    initial?: Accommodation
    onSaved: () => void
}) {
    const [studentId, setStudentId] = useState(initial?.studentId ?? '')
    const [extraTimePercent, setExtraTime] = useState(initial?.extraTimePercent ?? 25)
    const [breakBudgetMinutes, setBreaks] = useState(initial?.breakBudgetMinutes ?? 0)
    const [note, setNote] = useState(initial?.note ?? '')

    const { mutate, isPending } = useMutation({
        mutationFn: saveAccommodation,
        onSuccess: () => {
            toast.success('Arrangement saved. It applies to papers started from now on.')
            onSaved()
        },
        onError: (e: Error) => toast.error(e.message),
    })

    return (
        <form
            className="flex flex-col gap-3 rounded-md border border-gray-200 p-4 dark:border-gray-800"
            onSubmit={(e) => {
                e.preventDefault()
                if (!studentId.trim()) {
                    toast.error('A student id is needed.')
                    return
                }
                mutate({ studentId: studentId.trim(), extraTimePercent, breakBudgetMinutes, note })
            }}
        >
            {!initial && (
                <label className="text-sm">
                    Student id
                    <Input
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="Copy it from the Results page"
                    />
                </label>
            )}
            <label className="text-sm">
                Extra time
                <select
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-700"
                    value={extraTimePercent}
                    onChange={(e) => setExtraTime(Number(e.target.value))}
                >
                    {EXTRA_TIME_CHOICES.map((c) => (
                        <option key={c} value={c}>
                            {c === 0 ? 'None' : `${c}%`}
                            {c === 25 ? ' (the usual grant)' : ''}
                        </option>
                    ))}
                </select>
            </label>
            <label className="text-sm">
                Rest break allowance (minutes per paper)
                <Input
                    type="number"
                    min={0}
                    max={120}
                    value={breakBudgetMinutes}
                    onChange={(e) => setBreaks(Number(e.target.value))}
                />
                <span className="mt-1 block text-xs text-gray-500">
                    The clock stops while the student is on a break. They can take it in
                    one go or several. When it runs out the clock restarts by itself.
                </span>
            </label>
            <label className="text-sm">
                Note (the evidence seen, who approved it)
                <Input value={note ?? ''} onChange={(e) => setNote(e.target.value)} />
            </label>
            <div>
                <Button type="submit" disabled={isPending}>
                    {initial ? 'Save changes' : 'Grant arrangement'}
                </Button>
            </div>
        </form>
    )
}

export function AccommodationsPage() {
    const queryClient = useQueryClient()
    const [editing, setEditing] = useState<string | null>(null)
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin', 'accommodations'],
        queryFn: fetchAccommodations,
    })
    const refresh = () => {
        setEditing(null)
        queryClient.invalidateQueries({ queryKey: ['admin', 'accommodations'] })
    }

    return (
        <AdminLayout>
            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Access arrangements</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Extra time and rest breaks, for students with a documented need.
                        Students declare their own before their first paper, and a
                        declaration applies straight away; you get an email and can
                        change it here. An arrangement applies to papers started from
                        now on: a paper already under way keeps the clock it started
                        with.
                    </p>
                </div>

                <ArrangementForm onSaved={refresh} />

                {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
                {isError && (
                    <p className="text-sm text-red-600">
                        Could not load the arrangements.
                    </p>
                )}
                {data && data.length === 0 && (
                    <p className="text-sm text-gray-500">
                        No student has answered yet.
                    </p>
                )}

                <ul className="flex flex-col gap-3">
                    {(data ?? []).map((a) => (
                        <li
                            key={a.studentId}
                            className="rounded-md border border-gray-200 p-3 dark:border-gray-800"
                        >
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <span className="font-medium">
                                    {a.studentName || a.studentEmail || a.studentId}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {describeAccommodation(a)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                {a.studentName && a.studentEmail ? `${a.studentEmail} · ` : ''}
                                {a.declaredByStudent
                                    ? 'Declared by the student'
                                    : 'Set by an admin'}
                                {a.updatedAt
                                    ? ` · ${new Date(a.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}`
                                    : ''}
                            </p>
                            {a.note && (
                                <p className="mt-1 text-sm text-gray-500">{a.note}</p>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                className="mt-2 px-0 text-sm"
                                onClick={() =>
                                    setEditing(editing === a.studentId ? null : a.studentId)
                                }
                            >
                                {editing === a.studentId ? 'Close' : 'Change'}
                            </Button>
                            {editing === a.studentId && (
                                <ArrangementForm initial={a} onSaved={refresh} />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </AdminLayout>
    )
}
