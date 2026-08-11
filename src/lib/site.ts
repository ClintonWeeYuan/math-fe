/** The canonical origin, in one place.
 *
 * Was a private constant inside Seo.tsx; the structured data needs the same
 * value, and two copies of an origin is how a canonical and a JSON-LD @id
 * come to disagree about which site this is. */
export const SITE_URL = 'https://www.jomexam.com'
