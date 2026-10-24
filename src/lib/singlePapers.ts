import type { PublishedDiagnosticSet } from '@/client'

/**
 * Single papers: a Challenge or Foundations paper bought on its own.
 *
 * They are ordinary published, paid sets with a tier, drawn from the same
 * questions as the lettered sets. So they never count as "another paper in
 * the pass" or the next paper to suggest — a student who sat Set C and then
 * the Challenge paper would meet questions they had already answered.
 */
export type SinglePaperTier = 'challenge' | 'foundations'

/** The tier, or null for every set not sold on its own. Narrowed rather than
 *  typed: the generated client predates the field, the same reason `format`
 *  and `isFree` are read this way elsewhere. */
export function singlePaperTier(set: unknown): SinglePaperTier | null {
    const tier = (set as { singlePaper?: string | null } | undefined)
        ?.singlePaper
    return tier === 'challenge' || tier === 'foundations' ? tier : null
}

export function isSinglePaper(set: PublishedDiagnosticSet): boolean {
    return singlePaperTier(set) !== null
}

/** What each tier is, in a line a student can act on. */
export const TIER_COPY: Record<
    SinglePaperTier,
    { name: string; blurb: string }
> = {
    challenge: {
        name: 'Challenge paper',
        blurb: 'The hardest question types only — for students aiming high.',
    },
    foundations: {
        name: 'Foundations paper',
        blurb: 'Easier, entry-level questions — a confident start.',
    },
}
