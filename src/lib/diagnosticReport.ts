import type { PerQuestionTime } from '@/client'

/**
 * Pure view helpers for the report screen — kept out of the component so
 * the accuracy/label logic is unit-testable on its own.
 */

/** "1:05", "0:42", "12:03" — engaged seconds as m:ss. */
export function formatDuration(totalSeconds: number): string {
    const safe = Math.max(0, Math.round(totalSeconds))
    const minutes = Math.floor(safe / 60)
    const seconds = safe % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * A question's 1-based position label ("Question 3") from its 0-based
 * order index — the report returns ids, and perQuestionTime carries the
 * order index per id, so flagged/pacing rows can name questions without
 * fetching stems.
 */
export function questionLabelByIdFrom(
    perQuestionTime: PerQuestionTime[]
): Map<string, string> {
    return new Map(
        perQuestionTime.map((t) => [
            t.questionId,
            `Question ${t.questionOrderIndex + 1}`,
        ])
    )
}

/** score (0–1, or null = not assessed) → integer percent, or null. */
export function skillPercent(score: number | null | undefined): number | null {
    if (score === null || score === undefined) return null
    return Math.round(score * 100)
}
