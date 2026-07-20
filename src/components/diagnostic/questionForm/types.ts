import type { DiagnosticQuestionResponse } from '@/client'

export const CORE_SKILLS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'] as const
export const DIFFICULTY_TAGS = ['creative', 'TMUA-stretch'] as const

export type OptionField = {
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
    // Paste-SVG mode. diagramSvgTouched tracks whether the admin interacted
    // with this field at all this session (typed into it, or clicked
    // "Remove diagram") — on update, omitting the key entirely (untouched)
    // must leave the existing diagram alone, which is a different outcome
    // from sending an explicit empty/null value (which clears it). See
    // getDiagramSvgForUpdate below — this mirrors the backend's own
    // omit-vs-explicit-null distinction (UpdateDiagnosticQuestionBody's
    // diagram_svg, gated by "diagram_svg" in update_data after
    // exclude_unset) exactly, on the frontend side of the same contract.
    diagramSvg: string
    diagramSvgTouched: boolean
    // Upload-image mode, entirely separate from the JSON body — handled by
    // the pages via a second request to POST .../{id}/diagram after
    // create/update succeeds, since a file can't ride along in the same
    // JSON payload as diagramSvg.
    diagramFile: File | null
}

/** Option labels are derived from position (A, B, C…), never free-typed, so a
 * removed/reordered option can't leave a stale or duplicate label behind. */
export function labelForIndex(index: number): string {
    return String.fromCharCode('A'.charCodeAt(0) + index)
}

export function defaultValues(
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
            diagramSvg: '',
            diagramSvgTouched: false,
            diagramFile: null,
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
        diagramSvg: '',
        diagramSvgTouched: false,
        diagramFile: null,
    }
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

/**
 * For create: there's no existing diagram to preserve, so the only
 * question is whether one was provided at all — matches the backend's
 * own `if body.diagram_svg:` truthiness check on create.
 */
export function getDiagramSvgForCreate(
    values: DiagnosticQuestionFormValues
): string | undefined {
    return values.diagramSvg.trim() === '' ? undefined : values.diagramSvg
}

/**
 * For update: omitted (untouched) must leave the existing diagram alone,
 * distinct from an explicit empty value (clears it) — the three-way
 * distinction the backend's UpdateDiagnosticQuestionBody.diagram_svg
 * itself enforces via exclude_unset. Returning undefined here means the
 * caller must NOT include the key in the request body at all (spreading
 * `{ ...(x !== undefined ? { diagramSvg: x } : {}) }`), not send it as
 * literally `undefined`, which would serialize away in JSON.stringify
 * anyway but the distinction matters for callers to get right.
 */
export function getDiagramSvgForUpdate(
    values: DiagnosticQuestionFormValues
): string | null | undefined {
    if (!values.diagramSvgTouched) return undefined
    return values.diagramSvg.trim() === '' ? null : values.diagramSvg
}
