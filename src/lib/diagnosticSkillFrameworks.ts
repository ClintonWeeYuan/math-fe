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

/** TMUA Paper 1 — Applications of Mathematical Knowledge. Nine topic-named
 * skills, from the TMUA Skills Frameworks reference.
 *
 * Note these are deliberately NOT reused for ESAT Maths 2 even though the two
 * share a specification: the existing ESAT Maths questions are tagged against
 * the more abstract MATHS_SHARED taxonomy above, so borrowing these names
 * would silently re-interpret every historic ESAT tag and change what past
 * reports mean. */
const TMUA_PAPER_1: Record<string, string> = {
    S1: 'Algebraic Manipulation (Indices, Surds & Partial Fractions)',
    S2: 'Quadratics & Polynomial Equations',
    S3: 'Inequalities & Case Analysis',
    S4: 'Coordinate Geometry (Lines & Circles)',
    S5: 'Trigonometry (Exact Values & Equations)',
    S6: 'Sequences & Series',
    S7: 'Exponential & Logarithmic Equations',
    S8: 'Calculus (Differentiation & Integration)',
    S9: 'Graphs & Functions (Transformations)',
}

/** TMUA Paper 2 — Mathematical Reasoning. Eight skills: the same AS-level
 * content seen through a reasoning lens, so the codes mean something quite
 * different from Paper 1's. */
const TMUA_PAPER_2: Record<string, string> = {
    S1: 'Logical Connectives & Conditional Statements',
    S2: 'Necessary & Sufficient Conditions',
    S3: 'Quantifiers & Negation',
    S4: 'Proof Construction & Strategy',
    S5: 'Identifying Errors in Proofs',
    S6: 'Deduction & Valid Inference',
    S7: 'Logic Puzzles & Systematic Case-Work',
    S8: 'Computational Fluency Under a Reasoning Frame',
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
    // TMUA — its own taxonomy per paper, and the papers differ from each other.
    'tmua paper 1': { ...TMUA_PAPER_1 },
    'tmua paper 2': { ...TMUA_PAPER_2 },
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
