import { GUIDES } from './guides.mjs'

/**
 * The guides, as links to put on other pages.
 *
 * One list, read by the React component and by the build-time prerenderer,
 * so a new guide appears in the cross-links everywhere without anyone having
 * to remember — and so the crawlable copy and the rendered page cannot
 * disagree about what links where.
 *
 * The anchor is the guide's own h1 rather than "read more" or "learn more".
 * Anchor text is one of the few things telling Google what the target page
 * is about, and generic wording spends the signal on nothing.
 */
export const GUIDE_LINKS = GUIDES.map((guide) => ({
    path: guide.path,
    anchor: guide.h1,
    /** A short reason to follow it, shown after the link. */
    blurb: guide.description,
}))

/** Only the ESAT ones, for pages where TMUA would be a non-sequitur. */
export const ESAT_GUIDE_LINKS = GUIDE_LINKS.filter((link) =>
    link.path.includes('esat')
)

export const GUIDE_LINKS_HEADING = 'Preparing for the ESAT or TMUA?'
