import type { PacingSummary, SlowQuestion } from '@/client/types.gen'

/**
 * The report's "What the clock did": the pacing summary in words.
 *
 * In October 2026 a third of full papers ran out of time with most of the
 * questions answered. The time-per-question chart shows where the time went,
 * but it sits at the bottom of the report and has to be read. This says it
 * near the top, in the form a student can act on: whether the clock beat
 * them, which questions took more than their share and whether those were
 * even right, and what to do differently in the exam.
 *
 * Pure, so every case can be tested without rendering the report.
 */

export type ClockStory = {
    /** What happened, in one sentence. */
    lead: string
    /** Which questions cost the time, when that is the story. */
    detail?: string
    /** What to do about it in the exam. */
    tip?: string
}

/** "89 s", "6 min", "6 min 10 s": durations as they are said. */
export function spokenDuration(totalSeconds: number): string {
    const safe = Math.max(0, Math.round(totalSeconds))
    if (safe < 60) return `${safe} s`
    const minutes = Math.floor(safe / 60)
    const seconds = safe % 60
    return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`
}

const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

function questionsWord(n: number): string {
    return n === 1 ? 'question' : 'questions'
}

function countedQuestions(n: number): string {
    const word = n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n)
    return `${word} ${questionsWord(n)}`
}

const OUTCOME_WORDS: Record<SlowQuestion['outcome'], string> = {
    right: 'right',
    wrong: 'wrong',
    blank: 'left blank',
}

function joinWithAnd(items: string[]): string {
    if (items.length <= 1) return items.join('')
    return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function namedSlow(questions: SlowQuestion[]): string {
    return joinWithAnd(
        questions.map(
            (q) =>
                `Q${q.questionOrderIndex + 1} (${spokenDuration(q.seconds)}, ${OUTCOME_WORDS[q.outcome]})`
        )
    )
}

function slowSentence(pacing: PacingSummary, ending: string): string {
    const named = namedSlow(pacing.slowQuestions)
    const lead = `${countedQuestions(pacing.slowCount)} took more than twice the ${spokenDuration(
        pacing.allowanceSeconds
    )} a question your time allows`
    return pacing.slowCount > pacing.slowQuestions.length
        ? `${lead}. The longest were ${named}${ending}`
        : `${lead}: ${named}${ending}`
}

const NO_PENALTY_TIP =
    "There's no negative marking and every question is worth one mark"

export function buildClockStory(
    pacing: PacingSummary | null | undefined,
    { answeredCount, unanswered }: { answeredCount: number; unanswered: number }
): ClockStory | null {
    if (!pacing || answeredCount === 0) return null

    if (pacing.ranOut) {
        const lead =
            unanswered > 0
                ? `The clock ran out with ${unanswered} ${questionsWord(unanswered)} unanswered.`
                : 'You answered every question and used all of the time.'

        if (pacing.slowCount > 0) {
            // What the slow questions cost, set against what was left
            // undone: "enough to reach the 4 you didn't" is the sentence
            // that makes the trade visible.
            const worth = Math.floor(pacing.excessSeconds / pacing.allowanceSeconds)
            const cost =
                unanswered > 0 && worth >= unanswered
                    ? `, enough time to have reached the ${unanswered} you didn't`
                    : worth === 1
                      ? ", about one question's worth of time"
                      : worth > 1
                        ? `, about ${worth} questions' worth of time`
                        : ''
            return {
                lead,
                detail: slowSentence(
                    pacing,
                    `. Together they took ${spokenDuration(pacing.excessSeconds)} more than their share${cost}.`
                ),
                tip: `${NO_PENALTY_TIP}. When a question passes ${spokenDuration(
                    pacing.slowAfterSeconds
                )}, pick your best answer, flag it and move on; come back to it at the end if there's time.`,
            }
        }

        // Nothing ran away with the time, so the pace itself was the issue.
        const perAnswered = pacing.engagedSeconds / answeredCount
        return {
            lead,
            detail:
                perAnswered > pacing.allowanceSeconds
                    ? `No single question ran away with the time: you spent about ${spokenDuration(
                          perAnswered
                      )} on each question you answered, against the ${spokenDuration(
                          pacing.allowanceSeconds
                      )} your time allows.`
                    : undefined,
            tip: `${NO_PENALTY_TIP}, so a guess beats a blank. Practise against the clock at ${spokenDuration(
                pacing.allowanceSeconds
            )} a question, and move on sooner when you're stuck.`,
        }
    }

    // Whole minutes: "21 min 29 s to spare" is more precise than anyone
    // needs, and the precision makes it harder to read.
    const spare =
        pacing.spareSeconds < 60
            ? 'under a minute'
            : pacing.spareSeconds < 120
              ? 'just over a minute'
              : `${Math.floor(pacing.spareSeconds / 60)} minutes`

    // Finished early with questions left: the cheapest marks there are.
    if (unanswered > 0 && pacing.spareSeconds >= 60) {
        return {
            lead: `You finished with ${spare} left and ${unanswered} ${questionsWord(unanswered)} unanswered.`,
            tip: `${NO_PENALTY_TIP}, so a guess can only gain marks. In the exam, use the time left to put an answer on every question.`,
        }
    }

    const lead = `You finished with ${spare} to spare.`
    if (pacing.slowCount > 0) {
        return {
            lead,
            detail: slowSentence(
                pacing,
                ". Fine today, but on a paper that feels harder, that is where the time would go."
            ),
        }
    }
    return {
        lead,
        detail: `No question took more than twice the ${spokenDuration(
            pacing.allowanceSeconds
        )} your time allows. Time wasn't the problem on this paper.`,
    }
}
