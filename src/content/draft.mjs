/**
 * Placeholder copy, marked so it cannot ship.
 *
 * New pages are built with their structure, metadata and links in place and
 * the prose left for the author. Every placeholder goes through here, so the
 * marker is spelled one way, and scripts/prerender.mjs refuses to finish a
 * build that still contains it. A merged draft therefore fails the deploy and
 * the previous site keeps serving, rather than a page of instructions-to-self
 * going live and being indexed.
 *
 * Locally, PRERENDER_ALLOW_DRAFTS=1 lets a draft page be built and looked at.
 */
export const DRAFT_MARKER = '[DRAFT:'

/** "[DRAFT: what to write here]" — shown as-is on the page until replaced. */
export function draft(note) {
    return `${DRAFT_MARKER} ${note}]`
}
