import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import useListDiagnosticSetsQuery from '@/hooks/diagnostic/useListDiagnosticSetsQuery.ts'
import useSkillLabelsQuery from '@/hooks/diagnostic/useSkillLabelsQuery.ts'
import useUpdateSkillLabelsMutation from '@/hooks/diagnostic/useUpdateSkillLabelsMutation.ts'
import { subjectsInUse } from '@/lib/diagnosticSubjectsAdmin.ts'
import { CORE_SKILLS } from '@/lib/coreSkills.ts'

/**
 * Name the seven core skill codes per subject. Codes S1–S7 are shared across
 * subjects but mean different things (maths S1 ≠ physics S1), so labels are
 * scoped to a subject: pick one, give each code a readable name, save. Those
 * names then appear on the student report's Skills Radar for that subject;
 * an unnamed code just shows the bare code there. A blank field clears a
 * code's label. Subjects come from the sets tagged with them (a subject is a
 * free-text label, not a stored entity), so a subject only appears here once
 * at least one set uses it.
 */
export function DiagnosticSkillsPage() {
    const { data: sets, isLoading: setsLoading } = useListDiagnosticSetsQuery()
    const subjects = subjectsInUse(sets ?? []).map((g) => g.subject)

    const [subject, setSubject] = useState<string | null>(null)
    // Default to the first subject once the list loads.
    useEffect(() => {
        if (subject === null && subjects.length > 0) setSubject(subjects[0])
    }, [subjects, subject])

    const { data: labelData, isLoading: labelsLoading } =
        useSkillLabelsQuery(subject)
    const { mutate: save, isPending } = useUpdateSkillLabelsMutation()

    // One editable field per code, seeded from the saved labels each time the
    // subject or its loaded labels change. Keyed on the labels' *content* (and
    // the subject), not the query object's identity, so a new-but-equal
    // response can't retrigger a reseed and clobber in-progress edits — and so
    // the reseed can't loop if `data` ever isn't referentially stable.
    const [draft, setDraft] = useState<Record<string, string>>({})
    const labelsKey = labelData
        ? labelData.labels.map((l) => `${l.skillCode}=${l.label}`).join('|')
        : null
    useEffect(() => {
        if (!labelData) return
        const next: Record<string, string> = {}
        for (const code of CORE_SKILLS) next[code] = ''
        for (const { skillCode, label } of labelData.labels) {
            next[skillCode] = label
        }
        setDraft(next)
        // labelData is read but intentionally keyed via labelsKey + subject.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subject, labelsKey])

    function handleSave() {
        if (!subject) return
        const labels = CORE_SKILLS.map((code) => ({
            skillCode: code,
            label: (draft[code] ?? '').trim(),
        }))
        save(
            { subject, labels },
            {
                onSuccess: () => toast.success(`Saved labels for “${subject}”`),
                onError: (err) => toast.error(err.message),
            }
        )
    }

    return (
        <AdminLayout>
            <div className="mt-8 flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Skill labels</h1>
                    <p className="text-sm text-gray-500">
                        Give each skill code a readable name for a subject — it
                        shows on the student report’s Skills Radar. Codes mean
                        different things per subject, so labels are set per
                        subject. Leave a field blank to clear its label.
                    </p>
                </div>

                {setsLoading && <p className="text-gray-500">Loading…</p>}

                {!setsLoading && subjects.length === 0 && (
                    <p className="text-gray-500">
                        No subjects yet — tag a set with a subject from the
                        Diagnostic Sets screen first.
                    </p>
                )}

                {!setsLoading && subjects.length > 0 && (
                    <>
                        {/* Subject picker — one button per subject in use. */}
                        <div
                            className="flex flex-wrap gap-2"
                            role="group"
                            aria-label="Subject"
                        >
                            {subjects.map((s) => (
                                <Button
                                    key={s}
                                    size="sm"
                                    variant={s === subject ? 'default' : 'outline'}
                                    aria-pressed={s === subject}
                                    onClick={() => setSubject(s)}
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>

                        {labelsLoading && (
                            <p className="text-gray-500">Loading labels…</p>
                        )}

                        {!labelsLoading && subject && (
                            <Table className="max-w-xl">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">Code</TableHead>
                                        <TableHead>Label</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {CORE_SKILLS.map((code) => (
                                        <TableRow key={code}>
                                            <TableCell className="font-medium">
                                                {code}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    aria-label={`Label for ${code}`}
                                                    value={draft[code] ?? ''}
                                                    placeholder={`e.g. ${code} name`}
                                                    onChange={(e) =>
                                                        setDraft((d) => ({
                                                            ...d,
                                                            [code]: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        <div>
                            <Button
                                onClick={handleSave}
                                disabled={isPending || !subject || labelsLoading}
                            >
                                {isPending ? 'Saving…' : 'Save labels'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    )
}
