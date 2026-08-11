/**
 * Who writes the guides.
 *
 * One record, because it is one person and repeating it per guide is how the
 * credential ends up spelled three ways. Rendered as a visible byline and
 * emitted as schema.org Person — the qualification is a real reason to
 * believe the pages, and until now it appeared nowhere on the site at all.
 */

export const AUTHOR = {
    name: 'Hazel Wee Ling',
    /** Shown after the name, and used as the Person jobTitle in JSON-LD. */
    credential: 'DPhil in Engineering Science, University of Oxford',
    /** Where a reader can check who that is. */
    path: '/about',
}
