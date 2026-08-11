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

/**
 * The three a reader who is not already committed should be offered.
 *
 * Every guide used to be listed everywhere, which was fine at three and
 * became a block of eight the moment the module pages landed — on all 76 SPM
 * pages. That is the link block the whole thing was meant not to be, and it
 * spends a page's outward signal on eight targets instead of concentrating
 * it on the ones a passer-by would actually want.
 *
 * The module pages are for someone already preparing for a specific ESAT
 * paper. They are reached from /guides, from the ESAT diagnostics page, and
 * from each guide's own cross-links — all places where that reader already
 * is.
 */
export const PRIMARY_GUIDE_LINKS = GUIDE_LINKS.filter((link) =>
    [
        '/guides/esat-practice-tests',
        '/guides/esat-past-papers',
        '/guides/tmua-practice-tests',
    ].includes(link.path)
)

export const GUIDE_LINKS_HEADING = 'Preparing for the ESAT or TMUA?'
