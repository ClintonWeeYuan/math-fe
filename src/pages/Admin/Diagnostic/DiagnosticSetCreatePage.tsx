import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Combobox } from '@/components/ui/combobox.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { QuestionPicker } from '@/components/diagnostic/QuestionPicker.tsx'
import useListDiagnosticQuestionsQuery from '@/hooks/diagnostic/useListDiagnosticQuestionsQuery.ts'
import useCreateDiagnosticSetMutation from '@/hooks/diagnostic/useCreateDiagnosticSetMutation.ts'
import {
    DIAGNOSTIC_SUBJECTS,
    UNCATEGORISED_LABEL,
} from '@/lib/diagnosticSubjects.ts'

/**
 * Compose a new set from existing questions (§3) — the counterpart to bulk
 * import, for questions authored one at a time. Lands as draft; publishing
 * is done later from the sets list (and gated on all-questions-published).
 */
export function DiagnosticSetCreatePage() {
    const navigate = useNavigate()
    const { data: questions, isLoading } = useListDiagnosticQuestionsQuery()
    const { mutate: createSet, isPending } = useCreateDiagnosticSetMutation()

    const [title, setTitle] = useState('')
    const [subject, setSubject] = useState<string | null>(null)
    const [timeLimit, setTimeLimit] = useState('40')
    const [isFree, setIsFree] = useState(false)
    const [questionIds, setQuestionIds] = useState<string[]>([])

    const minutes = Number(timeLimit)
    const timeValid = Number.isInteger(minutes) && minutes > 0
    const canSave = title.trim() !== '' && timeValid

    function handleCreate() {
        if (!canSave) return
        createSet(
            {
                title: title.trim(),
                subject,
                timeLimitMinutes: minutes,
                isFree,
                questionIds,
            },
            {
                onSuccess: () => {
                    toast.success('Set created')
                    navigate('/admin/sets')
                },
                onError: (err) => toast.error(err.message),
            }
        )
    }

    return (
        <AdminLayout>
            <div className="mt-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">New diagnostic set</h1>
                    <Button variant="outline" onClick={() => navigate('/admin/sets')}>
                        Cancel
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. ESAT Physics — Diagnostic Set A"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="subject">Subject</Label>
                        <Combobox
                            id="subject"
                            value={subject}
                            onChange={setSubject}
                            options={DIAGNOSTIC_SUBJECTS}
                            placeholder={UNCATEGORISED_LABEL}
                            clearLabel={UNCATEGORISED_LABEL}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="time">Time limit (minutes)</Label>
                        <Input
                            id="time"
                            type="number"
                            min={1}
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(e.target.value)}
                        />
                    </div>
                    <label className="mt-6 flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={isFree}
                            onCheckedChange={(v) => setIsFree(v === true)}
                        />
                        Free tier
                    </label>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Questions</h2>
                    {isLoading ? (
                        <p className="text-gray-500">Loading questions…</p>
                    ) : (
                        <QuestionPicker
                            questions={questions ?? []}
                            value={questionIds}
                            onChange={setQuestionIds}
                        />
                    )}
                </div>

                <div>
                    <Button onClick={handleCreate} disabled={!canSave || isPending}>
                        {isPending ? 'Creating…' : 'Create set'}
                    </Button>
                    <p className="mt-2 text-sm text-gray-400">
                        Saved as a draft. Publish it from the sets list once its
                        questions are ready.
                    </p>
                </div>
            </div>
        </AdminLayout>
    )
}
