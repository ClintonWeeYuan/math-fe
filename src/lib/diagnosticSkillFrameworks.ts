/**
 * Skill-code → full-name frameworks, per subject. The S1–S9 codes are shared
 * but mean *different things* in each subject (Physics S3 is "Formula
 * Selection & Rearrangement"; Maths 2 S3 is "Functions"). Selecting the wrong
 * framework mislabels a student's whole profile, so this is keyed by the
 * diagnostic's subject.
 *
 * The canonical `_detail` strings from the import JSON aren't persisted in the
 * DB, so this constant is the single source of truth for names. Subject strings
 * have drifted in real data ("ESAT Math 2" vs "ESAT Maths 2"), so we normalise
 * before matching.
 */

/** House skill tables from the ESAT & TMUA code dictionary (8 October 2026).
 * Every set is tagged against these; the names here are what the Skills
 * Radar prints, so a change to one table must be matched by a re-tag of the
 * questions in that subject (and by math-be/app/services/skill_names.py). */
const ESAT_MATH_1: Record<string, string> = {
    S1: 'Number Structure (Divisors, Primes, Digits & Remainders)',
    S2: 'Algebraic Manipulation (Identities, Equations & Integer Solutions)',
    S3: 'Geometric Reasoning (Circles, Similarity, Pythagoras & Areas)',
    S4: 'Ratio, Proportion & Scaling',
    S5: 'Multi-Step Quantitative Synthesis',
    S6: 'Statistics & Probability Reasoning',
    S7: 'Units, Bounds, Estimation & Compound Measures',
    S8: 'Pattern, Sequence & Structural Reasoning',
}

const ESAT_MATH_2: Record<string, string> = {
    S1: 'Polynomial & Algebraic Structure',
    S2: 'Exponential & Logarithmic Reasoning',
    S3: 'Functions (Composition, Inverse, Domain & Range)',
    S4: 'Coordinate Geometry',
    S5: 'Trigonometry',
    S6: 'Binomial Expansion & Counting',
    S7: 'Sequences & Series',
    S8: 'Calculus',
}

const ESAT_PHYSICS: Record<string, string> = {
    S1: 'Spec Recall & Qualitative Reasoning',
    S2: 'Single-Step Proportional Reasoning',
    S3: 'Formula Selection & Rearrangement',
    S4: 'Data, Graph & Table Extraction',
    S5: 'Multi-Step Quantitative Synthesis',
    S6: 'Model-Based Reasoning (Fields, Particles & Energy)',
    S7: 'Deduction in Unfamiliar Contexts',
    S8: 'Extended Two-Principle Problems',
}

/** TMUA Paper 1 — Applications of Mathematical Knowledge. Nine reasoning
 * skills (house table). Not reused for ESAT Maths 2 even though the papers
 * share a specification: the two question banks are tagged separately. */
const TMUA_PAPER_1: Record<string, string> = {
    S1: 'Algebraic Manipulation & Polynomial Structure',
    S2: 'Sequences, Series & Probability Chains',
    S3: 'Inequalities & Bounding Arguments',
    S4: 'Geometric & Coordinate Reasoning',
    S5: 'Trigonometric & Equation Techniques',
    S6: 'Counting & Case Enumeration',
    S7: 'Logarithmic, Exponential & Ordering Arguments',
    S8: 'Calculus & Function Analysis',
    S9: 'Constraint, Optimisation & Symmetry Reasoning',
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

/** ESAT Chemistry — seven skills, from the ESAT Chemistry Skills Framework.
 *
 * The topic code (C1–C17) records what a question is about; these record what
 * it asks the student to do, which is why a report can be cut either way. Named
 * natively rather than borrowed from Physics: the framework is explicit that
 * the codes are not meant to mean the same thing across subjects. */
const ESAT_CHEMISTRY: Record<string, string> = {
    S1: 'Spec Recall & Definitions',
    S2: 'Mole & Proportional Reasoning',
    S3: 'Formulae, Equations & Electron Bookkeeping',
    S4: 'Data, Graph & Table Interpretation',
    S5: 'Multi-Step Quantitative Synthesis',
    S6: 'Particle & Model-Based Explanation',
    S7: 'Deduction in Unfamiliar Contexts',
}

/** ESAT Biology — eight skills, from the Biology Skills Framework v3.
 *
 * v3 renamed these from BS1–BS8 to S1–S8 to match the convention every other
 * subject already used; the BS codes never existed here, because this subject
 * had no framework at all until now and its radar showed bare codes. Note S8:
 * Biology is the second subject after TMUA Paper 2 to need an eighth axis. */
const ESAT_BIOLOGY: Record<string, string> = {
    S1: 'Recall Precision & Categorical Discrimination',
    S2: 'Structure–Function & Mechanism Inference',
    S3: 'Scale, Units & Magnification',
    S4: 'Proportional & Rate Reasoning',
    S5: 'Graph & Data Interpretation',
    S6: 'Experimental Reasoning & Conclusion Validity',
    S7: 'Genetic & Probabilistic Reasoning',
    S8: 'Systems & Pathway Tracing',
}

const FRAMEWORKS: Record<string, Record<string, string>> = {
    'esat math 1': { ...ESAT_MATH_1 },
    'esat math 2': { ...ESAT_MATH_2 },
    'esat physics': { ...ESAT_PHYSICS },
    'esat chemistry': { ...ESAT_CHEMISTRY },
    'esat biology': { ...ESAT_BIOLOGY },
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
