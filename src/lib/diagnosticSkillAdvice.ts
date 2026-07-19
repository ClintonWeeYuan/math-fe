import { normalizeSubject } from '@/lib/diagnosticSkillFrameworks.ts'

/**
 * One concrete, encouraging next step per skill, keyed by subject + code.
 * Static (topic-level names aren't stored yet, so we can't ground these in the
 * exact questions missed), revision-oriented, and phrased for a student. Kept
 * to a sentence or two. Falls back to a generic-but-warm line for anything we
 * don't have specific advice for.
 */
const ADVICE: Record<string, Record<string, string>> = {
    'esat math 1': {
        S1: 'Drill rearranging and simplifying expressions until the steps feel automatic — indices, brackets, and fractions are the foundation everything else stands on.',
        S2: 'Before diving in, pause to pick the shortest route: look for a substitution or a symmetry that avoids heavy algebra. Try timing a few problems to build that instinct.',
        S3: 'Revisit coordinate geometry and graph sketching — practise reading gradients, intercepts, and transformations straight from a diagram.',
        S4: 'Work through a few “show that” and proof-style questions, writing each logical step in full. The goal is a watertight chain of reasoning, not just the answer.',
        S5: 'Practise ratio, percentage, and proportion problems mentally where you can — quick numerical fluency saves time and cuts slips.',
        S7: 'Spend time on functions and sequences: domain and range, composing functions, and spotting the rule behind a pattern.',
    },
    'esat math 2': {
        S1: 'Drill rearranging and simplifying expressions until the steps feel automatic — indices, brackets, and fractions underpin the calculus too.',
        S2: 'Before diving in, pause to pick the shortest route: look for a substitution or a symmetry that avoids heavy algebra.',
        S3: 'Revisit coordinate geometry and graph sketching — practise reading gradients, intercepts, and transformations straight from a diagram.',
        S4: 'Work through a few proof-style questions, writing each logical step in full — a watertight chain of reasoning, not just the answer.',
        S5: 'Practise ratio, percentage, and proportion problems mentally to build quick, slip-free numerical fluency.',
        S6: 'Focus on differentiation and integration: what a derivative means as a rate of change, and the standard rules. Practise a mix of “find the gradient” and “find the area” questions.',
        S7: 'Spend time on functions and sequences: domain and range, composing functions, and spotting the rule behind a pattern.',
    },
    'esat physics': {
        S1: 'Go back to the core concepts and definitions — practise explaining what each quantity *means* in words before reaching for a formula.',
        S2: 'Build a habit of choosing the right equation first: list what you know and what you need, then match the formula. Practise clean symbol-to-number substitution.',
        S3: 'Drill proportional reasoning — “if this doubles, what happens to that?” Scaling and ratio questions reward spotting the relationship quickly.',
        S4: 'Practise multi-step problems by breaking them into stages and writing each result down before the next. Chaining steps cleanly is the skill here.',
        S5: 'Try unfamiliar, applied questions that put physics in a new context — the aim is transferring a principle you know to a situation you haven’t seen.',
        S6: 'Practise tracking units through a calculation and using them to check answers — dimensional reasoning catches mistakes before they cost marks.',
        S7: 'Work on reading graphs and data: gradients, areas under curves, and intercepts, and what each represents physically.',
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
