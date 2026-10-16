/**
 * The pace guide under the exam timer: ahead of, on, or behind the pace that
 * finishes the paper in time.
 *
 * Pure, so the arithmetic can be tested without a clock.
 *
 * The pace is the student's own time over the paper's questions, so extra
 * time is included without being told about it: the deadline already carries
 * it. Rest breaks are taken out, because the deadline is moved forward by
 * exactly the break taken.
 *
 * The question in progress gets its allowance before the student counts as
 * behind. Without that, a student 61 seconds into question 1 would read
 * "1 min behind" while still well inside its 89 seconds.
 */

export type PaceInput = {
    startedAt: string
    serverDeadlineAt: string
    breakBudgetSeconds?: number
    breakSecondsRemaining?: number
    questionCount: number
    answered: number
    nowMs: number
}

export type PaceStatus =
    | { kind: 'done' }
    | { kind: 'on'; allowanceSeconds: number }
    | { kind: 'ahead' | 'behind'; minutes: number; allowanceSeconds: number }

/** Behind by less than this (beyond the question in progress) still reads
 *  as on pace: half a minute is noise. */
const BEHIND_AFTER_SECONDS = 30
/** Ahead by less than this reads as on pace. */
const AHEAD_AFTER_SECONDS = 60

export function paceStatus(input: PaceInput): PaceStatus | null {
    const started = new Date(input.startedAt).getTime()
    const deadline = new Date(input.serverDeadlineAt).getTime()
    if (Number.isNaN(started) || Number.isNaN(deadline)) return null
    if (input.questionCount <= 0) return null

    const breaksUsed = Math.max(
        0,
        (input.breakBudgetSeconds ?? 0) - (input.breakSecondsRemaining ?? 0)
    )
    const limitSeconds = (deadline - started) / 1000 - breaksUsed
    if (limitSeconds <= 0) return null
    if (input.answered >= input.questionCount) return { kind: 'done' }

    const allowance = limitSeconds / input.questionCount
    const elapsed = Math.min(
        limitSeconds,
        Math.max(0, (input.nowMs - started) / 1000 - breaksUsed)
    )
    const allowanceSeconds = Math.round(allowance)

    const behind = elapsed - (input.answered + 1) * allowance
    if (behind > BEHIND_AFTER_SECONDS) {
        return { kind: 'behind', minutes: Math.max(1, Math.round(behind / 60)), allowanceSeconds }
    }
    const ahead = input.answered * allowance - elapsed
    if (ahead >= AHEAD_AFTER_SECONDS) {
        return { kind: 'ahead', minutes: Math.max(1, Math.round(ahead / 60)), allowanceSeconds }
    }
    return { kind: 'on', allowanceSeconds }
}

export function paceLabel(status: PaceStatus): string {
    switch (status.kind) {
        case 'done':
            return 'All answered'
        case 'on':
            return 'On pace'
        case 'ahead':
            return `${status.minutes} min ahead`
        case 'behind':
            return `${status.minutes} min behind`
    }
}
