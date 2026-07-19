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

function headlineFor(totalScore: number, answeredCount: number): string {
    if (answeredCount === 0) {
        return "You didn't answer any questions this time — give it another go when you're ready and we'll map out your strengths."
    }
    const ratio = totalScore / answeredCount
    if (ratio >= 0.7) {
        return `You answered ${totalScore} of ${answeredCount} correct — a strong result. Here's where you shone and a couple of areas to push even further.`
    }
    if (ratio >= 0.4) {
        return `You answered ${totalScore} of ${answeredCount} correct — a solid base to build on, with a few clear areas to focus on next.`
    }
    return `You answered ${totalScore} of ${answeredCount} correct — a starting point, and the focus areas below are where the quickest gains are.`
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
    answeredCount: number
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
        headline: headlineFor(totalScore, answeredCount),
        strengths,
        focusAreas,
    }
}
