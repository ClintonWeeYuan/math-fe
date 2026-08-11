import { GUIDE as esatPracticeGuide } from './esatPracticeGuide.mjs'
import { GUIDE as esatPastPapers } from './esatPastPapers.mjs'
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
    esatMaths1,
    esatMaths2,
    esatPhysics,
    esatChemistry,
    esatBiology,
    tmuaPracticeGuide,
]
