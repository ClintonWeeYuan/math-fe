import { normalizeSubject } from '@/lib/diagnosticSkillFrameworks.ts'

/**
 * One concrete, encouraging next step per skill, keyed by subject + code.
 * Static (topic-level names aren't stored yet, so we can't ground these in the
 * exact questions missed), revision-oriented, and phrased for a student. Kept
 * to a sentence or two. Falls back to a generic-but-warm line for anything we
 * don't have specific advice for.
 */
const ADVICE: Record<string, Record<string, string>> = {
    // Keyed to the house skill tables in diagnosticSkillFrameworks.ts — if a
    // table changes meaning, the advice for that code must change with it.
    'esat math 1': {
        S1: 'Practise number-structure questions: factors, primes, remainders and digit arguments. Write out the divisibility rule or the prime factorisation before you reason from it.',
        S2: 'Drill rearranging and simplifying expressions until the steps feel automatic — identities, brackets and fractions, then integer-solution hunts where you check every case.',
        S3: 'Revisit circle theorems, similar triangles and Pythagoras, and practise splitting an awkward shape into pieces you can find the area of.',
        S4: 'Practise ratio and proportion in context — maps, mixtures, rates and scaling — and always write down which quantity is the base before you scale.',
        S5: 'Work multi-step problems in stages: percentages, rates and compound chains. Write each intermediate result down before the next, and check the percentage base at every step.',
        S6: 'Spend time on statistics and probability: averages from tables, listing outcomes systematically, and combined or conditional probability from a possibility space.',
        S7: 'Practise units, bounds and compound measures — speed, flow and relative motion — and tracking units through a calculation to catch slips.',
        S8: 'Look for the pattern first: cycles, recurrences and invariants. Write out the first few terms and only then reach for a formula.',
    },
    'esat math 2': {
        S1: 'Drill polynomial structure: roots and coefficients, the factor and remainder theorems, and Vieta — so you can read a polynomial’s shape straight from its equation.',
        S2: 'Practise exponential and log reasoning: the log laws, solving exponential equations, and comparing growth without a calculator.',
        S3: 'Spend time on functions: composing and inverting them, and finding domain and range from the graph as well as the formula.',
        S4: 'Revisit coordinate geometry — lines, circles and tangency — and practise setting up the equation before you sketch.',
        S5: 'Work on trigonometry: exact values, identities, and solving equations within an interval without losing or inventing solutions.',
        S6: 'Practise the binomial expansion and counting arguments: a specific coefficient, a general term, and systematic enumeration when the answer is a count.',
        S7: 'Spend time on sequences and series: arithmetic and geometric sums, recurrences, and spotting the rule behind a pattern.',
        S8: 'Focus on differentiation and integration: what a derivative means as a rate of change, tangents and stationary points, and areas by definite integral.',
    },
    'esat physics': {
        S1: 'Go back to the core concepts and definitions — practise explaining what each quantity *means* in words before reaching for a formula.',
        S2: 'Drill proportional reasoning — “if this doubles, what happens to that?” Scaling and ratio questions reward spotting the relationship quickly.',
        S3: 'Build a habit of choosing the right equation first: list what you know and what you need, then match the formula and rearrange before substituting numbers.',
        S4: 'Work on reading graphs, tables and data: gradients, areas under curves, and intercepts, and what each represents physically.',
        S5: 'Practise multi-step problems by breaking them into stages and writing each result down before the next. Chaining steps cleanly is the skill here.',
        S6: 'Practise reasoning from the model — field lines, particles, energy stores — and explaining a result from the picture before doing any arithmetic.',
        S7: 'Try unfamiliar, applied questions that put physics in a new context — the aim is transferring a principle you know to a situation you haven’t seen.',
        S8: 'Work two-principle problems: energy then kinematics, forces then equilibrium, two phases of motion. Name both principles before you start the algebra.',
    },
}

const GENERIC =
    'Pick a handful of questions on this skill and work through them slowly, checking each step — steady practice here will pay off quickly.'

export function skillAdvice(
    subject: string | null | undefined,
    code: string
): string {
    return ADVICE[normalizeSubject(subject)]?.[code] ?? GENERIC
}
