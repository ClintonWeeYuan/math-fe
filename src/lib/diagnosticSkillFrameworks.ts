/**
 * Skill-code → full-name frameworks, per subject. The S1–S7 codes are shared
 * but mean *different things* in each subject (Physics S3 is "Proportional &
 * Ratio Reasoning"; Maths S3 is "Graphical & Geometric Reasoning"), and Maths 1
 * has no S6 (no calculus). Selecting the wrong framework mislabels a student's
 * whole profile, so this is keyed by the diagnostic's subject.
 *
 * The canonical `_detail` strings from the import JSON aren't persisted in the
 * DB, so this constant is the single source of truth for names. Subject strings
 * have drifted in real data ("ESAT Math 2" vs "ESAT Maths 2"), so we normalise
 * before matching.
 */

const MATHS_SHARED: Record<string, string> = {
    S1: 'Algebraic Manipulation & Fluency',
    S2: 'Strategic & Efficient Problem Solving',
    S3: 'Graphical & Geometric Reasoning',
    S4: 'Logical Reasoning & Rigour',
    S5: 'Proportional & Numerical Fluency',
    S7: 'Functions, Sequences & Structure',
}

const FRAMEWORKS: Record<string, Record<string, string>> = {
    // Maths 1 — no S6 (no calculus in the spec).
    'esat math 1': { ...MATHS_SHARED },
    // Maths 2 — Maths 1 plus calculus.
    'esat math 2': { ...MATHS_SHARED, S6: 'Calculus & Rate of Change' },
    // Physics — same codes, different meanings.
    'esat physics': {
        S1: 'Conceptual Understanding',
        S2: 'Equation Selection & Substitution',
        S3: 'Proportional & Ratio Reasoning',
        S4: 'Multi-Step Problem Solving',
        S5: 'Novel/Transfer Application',
        S6: 'Units & Dimensional Reasoning',
        S7: 'Graphical & Data Interpretation',
    },
}

/** Fold subject-name drift to a stable key: lowercase, collapse spaces, and
 * treat "maths" as "math" so "ESAT Maths 2" and "ESAT Math 2" both match. */
export function normalizeSubject(subject: string | null | undefined): string {
    return (subject ?? '')
        .trim()
        .toLowerCase()
        .replace(/\bmaths\b/g, 'math')
        .replace(/\s+/g, ' ')
}

/** The framework for a subject, or null when we don't recognise it (the report
 * then falls back to bare codes rather than mislabelling). */
export function frameworkFor(
    subject: string | null | undefined
): Record<string, string> | null {
    return FRAMEWORKS[normalizeSubject(subject)] ?? null
}

/** Full name for a skill code in a subject; falls back to the bare code when
 * the subject or code is unknown, so a code is always shown, never nothing. */
export function skillName(
    subject: string | null | undefined,
    code: string
): string {
    return frameworkFor(subject)?.[code] ?? code
}
