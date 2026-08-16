import { GUIDE as esatPracticeGuide } from './esatPracticeGuide.mjs'
import { GUIDE as esatPastPapers } from './esatPastPapers.mjs'
import { GUIDE as esatDates } from './esatDates.mjs'
import { GUIDE as esatMaths1 } from './esatMaths1.mjs'
import { GUIDE as esatMaths2 } from './esatMaths2.mjs'
import { GUIDE as esatPhysics } from './esatPhysics.mjs'
import { GUIDE as esatChemistry } from './esatChemistry.mjs'
import { GUIDE as esatBiology } from './esatBiology.mjs'
import { GUIDE as tmuaPracticeGuide } from './tmuaPracticeGuide.mjs'

/**
 * Every search-facing guide, in the order they are listed on /guides.
 *
 * One list, read by the guides index, the cross-links at the foot of each
 * guide, and the build-time prerenderer — so a new guide is a content module
 * plus a route, and it appears everywhere it should without anyone having to
 * remember the other places.
 */
export const GUIDES = [
    esatPracticeGuide,
    esatPastPapers,
    esatDates,
    esatMaths1,
    esatMaths2,
    esatPhysics,
    esatChemistry,
    esatBiology,
    tmuaPracticeGuide,
]

/**
 * The guides to list at the foot of `guide`, and what to say about each.
 *
 * A guide that names its own `related` gets exactly those, in that order,
 * with its own blurb — a contextual "read this next" rather than a directory.
 * One that doesn't falls back to listing every other guide with its meta
 * description, which is what all of them did when there were three of them.
 *
 * Shared by the React page and the prerenderer so the static HTML and the
 * rendered page cannot list different things.
 */
export function relatedTo(guide) {
    const byPath = new Map(GUIDES.map((g) => [g.path, g]))
    if (guide.related !== undefined) {
        return (
            guide.related
                .map(({ path, blurb }) => ({ guide: byPath.get(path), blurb }))
                // A path that matches no guide is dropped rather than rendered as
                // a dead link: the rewrites reference pages by name, and a typo
                // should cost a link, not ship a 404 to every reader.
                .filter((entry) => entry.guide !== undefined)
        )
    }
    return GUIDES.filter((g) => g.path !== guide.path).map((g) => ({
        guide: g,
        blurb: g.description,
    }))
}
