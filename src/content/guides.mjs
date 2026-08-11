import { GUIDE as esatPracticeGuide } from './esatPracticeGuide.mjs'
import { GUIDE as esatPastPapers } from './esatPastPapers.mjs'
import { GUIDE as tmuaPracticeGuide } from './tmuaPracticeGuide.mjs'

/**
 * Every search-facing guide, in the order they are listed on /guides.
 *
 * One list, read by the guides index, the cross-links at the foot of each
 * guide, and the build-time prerenderer — so a new guide is a content module
 * plus a route, and it appears everywhere it should without anyone having to
 * remember the other places.
 */
export const GUIDES = [esatPracticeGuide, esatPastPapers, tmuaPracticeGuide]
