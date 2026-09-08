import type { SkillScore } from '@/client'
import { skillName } from '@/lib/diagnosticSkillFrameworks.ts'

/** A measured skill, decoded for the written summary. */
export type SkillInsight = {
    code: string
    name: string
    pct: number // 0–100, rounded
    attempted: number
    correct: number
    limitedData: boolean // fewer than RELIABLE_MIN questions — read with care
}

export type ReportInsights = {
    headline: string
    strengths: SkillInsight[]
    focusAreas: SkillInsight[]
}

// Below this many primary questions, a skill's percentage is too noisy to
// call a confident strength; focus areas still surface it but flagged.
const RELIABLE_MIN = 3
// A strength must clear this and be reliable; a focus area sits below it.
const STRENGTH_PCT = 60
const MAX_PER_LIST = 3

/** A skill is "measured" when at least one of its primary questions was
 * answered (score not null) — the not-measured axes are excluded entirely. */
function measured(skills: SkillScore[]): SkillScore[] {
    return skills.filter((s) => s.score !== null && s.score !== undefined)
}

function toInsight(subject: string | null | undefined, s: SkillScore): SkillInsight {
    const attempted = s.attempted ?? 0
    return {
        code: s.skill,
        name: skillName(subject, s.skill),
        pct: Math.round((s.score ?? 0) * 100),
        attempted,
        correct: s.correct ?? 0,
        limitedData: attempted < RELIABLE_MIN,
    }
}

/**
 * The opening sentence, scored against the whole paper.
 *
 * It has to agree with the headline card above it, which reads out of the set
 * rather than out of what was reached — otherwise a student who answered 15
 * of 27 sees "15/27 correct" and, directly beneath it, "you answered 15 of 15
 * correct — a strong result". Two numbers for one thing, and the flattering
 * one in the sentence a reader is most likely to believe.
 *
 * `paperTotal` of 0 means the set's size is unknown, and the fallback scores
 * against what was attempted rather than inventing a denominator.
 */
function headlineFor(
    totalScore: number,
    answeredCount: number,
    paperTotal: number
): string {
    if (answeredCount === 0 && totalScore === 0) {
        return "You didn't answer any questions this time — give it another go when you're ready and we'll map out your strengths."
    }
    const outOf = paperTotal > 0 ? paperTotal : answeredCount
    if (outOf === 0) {
        return "You didn't answer any questions this time — give it another go when you're ready and we'll map out your strengths."
    }
    // Naming the unanswered questions keeps the verdict fair: a low ratio
    // earned by running out of time is a pacing problem, not a knowledge one,
    // and the sentence should not read as though the student got them wrong.
    const unanswered = paperTotal > 0 ? paperTotal - answeredCount : 0
    const gap =
        unanswered > 0
            ? ` (${unanswered} left unanswered)`
            : ''
    const ratio = totalScore / outOf
    if (ratio >= 0.7) {
        return `You scored ${totalScore} out of ${outOf}${gap} — a strong result. Here's where you shone and a couple of areas to push even further.`
    }
    if (ratio >= 0.4) {
        return `You scored ${totalScore} out of ${outOf}${gap} — a solid base to build on, with a few clear areas to focus on next.`
    }
    return `You scored ${totalScore} out of ${outOf}${gap} — a starting point, and the focus areas below are where the quickest gains are.`
}

/**
 * Turn the skills radar into a plain-English strengths/focus summary. Uses
 * only *measured* skills (never n/a). Strengths are the highest-scoring
 * reliable skills (≥ 60%, ≥ 3 questions); focus areas are the lowest-scoring
 * measured skills (< 60%), carrying denominators so small samples read
 * honestly. Both capped at three and decoded to full subject names.
 */
export function buildReportInsights(
    skills: SkillScore[],
    subject: string | null | undefined,
    totalScore: number,
    answeredCount: number,
    /** The set's size. 0 when unknown, in which case the opening sentence
     *  falls back to scoring against what was attempted. */
    paperTotal = 0
): ReportInsights {
    const insights = measured(skills).map((s) => toInsight(subject, s))

    const strengths = insights
        .filter((i) => i.pct >= STRENGTH_PCT && !i.limitedData)
        .sort((a, b) => b.pct - a.pct)
        .slice(0, MAX_PER_LIST)

    const focusAreas = insights
        .filter((i) => i.pct < STRENGTH_PCT)
        .sort((a, b) => a.pct - b.pct)
        .slice(0, MAX_PER_LIST)

    return {
        headline: headlineFor(totalScore, answeredCount, paperTotal),
        strengths,
        focusAreas,
    }
}
