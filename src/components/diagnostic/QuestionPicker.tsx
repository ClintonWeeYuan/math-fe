import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Combobox } from '@/components/ui/combobox.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx'
import {
    filterQuestions,
    moveItem,
    orderedSelection,
} from '@/lib/questionPicker.ts'
import type { DiagnosticQuestionResponse } from '@/client'

type Props = {
    questions: DiagnosticQuestionResponse[]
    /** Chosen question ids, in exam order. */
    value: string[]
    onChange: (next: string[]) => void
}

const ALL = '__all__'

function truncate(text: string, n = 80) {
    return text.length > n ? `${text.slice(0, n)}…` : text
}

/**
 * Choose and order the questions in a set. Two panels: an "available" list
 * (filterable by status / topic / text) you tick to add, and the ordered
 * "in this set" list you reorder and remove from. Order is the exam
 * sequence (§3), so it's explicit and controllable, not incidental.
 *
 * A draft question is shown, not hidden, but marked — you can put drafts in
 * a draft set freely; the publish gate (PR C) is what later blocks going
 * live until they're published, and names them when it does.
 */
export function QuestionPicker({ questions, value, onChange }: Props) {
    const [status, setStatus] = useState<'draft' | 'published' | typeof ALL>(ALL)
    const [topicCode, setTopicCode] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const topicCodes = useMemo(
        () => [...new Set(questions.map((q) => q.topicCode).filter(Boolean))].sort(),
        [questions]
    )

    const selectedIds = new Set(value)
    const available = useMemo(
        () =>
            filterQuestions(questions, {
                status: status === ALL ? null : status,
                topicCode,
                search,
            }),
        [questions, status, topicCode, search]
    )
    const chosen = orderedSelection(questions, value)

    function toggle(id: string, checked: boolean) {
        if (checked) onChange([...value, id])
        else onChange(value.filter((x) => x !== id))
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Available */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                        <SelectTrigger className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All statuses</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="w-44">
                        <Combobox
                            value={topicCode}
                            onChange={setTopicCode}
                            options={topicCodes}
                            placeholder="All topics"
                            clearLabel="All topics"
                        />
                    </div>
                    <Input
                        className="w-40 flex-1"
                        placeholder="Search stem…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col divide-y rounded-md border">
                    {available.length === 0 && (
                        <p className="p-3 text-sm text-gray-400">No questions match.</p>
                    )}
                    {available.map((q) => (
                        <label
                            key={q.id}
                            className="flex cursor-pointer items-start gap-3 p-3 text-sm hover:bg-gray-50"
                        >
                            <Checkbox
                                checked={selectedIds.has(q.id)}
                                onCheckedChange={(c) => toggle(q.id, c === true)}
                                className="mt-0.5"
                            />
                            <span className="flex flex-col gap-1">
                                <span className="flex items-center gap-2">
                                    <span className="font-medium">{q.topicCode}</span>
                                    <span className="text-gray-400">{q.coreSkillPrimary}</span>
                                    {q.status === 'draft' && (
                                        <Badge variant="secondary">draft</Badge>
                                    )}
                                </span>
                                <span className="text-gray-600">{truncate(q.stem)}</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Chosen, ordered */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">In this set ({chosen.length})</h3>
                {chosen.length === 0 ? (
                    <p className="rounded-md border border-dashed p-3 text-sm text-gray-400">
                        No questions yet — tick some from the left.
                    </p>
                ) : (
                    <ol className="flex flex-col divide-y rounded-md border">
                        {chosen.map((q, index) => (
                            <li key={q.id} className="flex items-center gap-2 p-2 text-sm">
                                <span className="w-6 text-right tabular-nums text-gray-400">
                                    {index + 1}.
                                </span>
                                <span className="flex flex-1 flex-col">
                                    <span className="flex items-center gap-2">
                                        <span className="font-medium">{q.topicCode}</span>
                                        {q.status === 'draft' && (
                                            <Badge variant="secondary">draft</Badge>
                                        )}
                                    </span>
                                    <span className="text-gray-500">{truncate(q.stem, 60)}</span>
                                </span>
                                <div className="flex items-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Move ${q.topicCode} up`}
                                        disabled={index === 0}
                                        onClick={() => onChange(moveItem(value, index, -1))}
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Move ${q.topicCode} down`}
                                        disabled={index === chosen.length - 1}
                                        onClick={() => onChange(moveItem(value, index, 1))}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Remove ${q.topicCode}`}
                                        onClick={() => onChange(value.filter((x) => x !== q.id))}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </div>
    )
}
