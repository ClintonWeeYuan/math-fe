import type { DiagnosticSetResponse } from '@/client'

export type SubjectGroup = {
    subject: string
    setIds: string[]
    setTitles: string[]
}

/**
 * The subjects actually in use, derived from the sets tagged with them —
 * since a subject is only a free-text label on sets, not a stored entity.
 * Uncategorised sets (null subject) are excluded; a subject appears only if
 * at least one set carries it. Sorted by name for a stable roster.
 */
export function subjectsInUse(sets: DiagnosticSetResponse[]): SubjectGroup[] {
    const bySubject = new Map<string, DiagnosticSetResponse[]>()
    for (const set of sets) {
        if (!set.subject) continue
        const list = bySubject.get(set.subject)
        if (list) list.push(set)
        else bySubject.set(set.subject, [set])
    }
    return [...bySubject.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([subject, subjectSets]) => ({
            subject,
            setIds: subjectSets.map((s) => s.id),
            setTitles: subjectSets.map((s) => s.title),
        }))
}
