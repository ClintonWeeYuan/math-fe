import { Link } from 'react-router-dom'
import {
    GUIDE_LINKS_HEADING,
    PRIMARY_GUIDE_LINKS,
    type GuideLink,
} from '@/content/guideLinks.mjs'

const PERIWINKLE = '#799ED1'

/**
 * A short block of links to the guides, for the foot of other pages.
 *
 * Deliberately plain. This is a navigation aid for a student who came for
 * SPM questions and might not know we have ESAT material at all — not a link
 * block, and it should not read like one.
 *
 * The same list is rendered into the static HTML by scripts/prerender.mjs,
 * because a link that only exists after hydration is a link Google may never
 * follow.
 */
export function GuideLinks({
    links = PRIMARY_GUIDE_LINKS,
    heading = GUIDE_LINKS_HEADING,
}: {
    links?: GuideLink[]
    heading?: string
}) {
    return (
        <section className="border-t border-slate-200 mt-12 pt-6">
            <h2 className="text-sm font-semibold text-slate-500 mb-3">
                {heading}
            </h2>
            <ul className="flex flex-col gap-2">
                {links.map((link) => (
                    <li key={link.path} className="text-sm">
                        <Link
                            to={link.path}
                            className="font-medium underline underline-offset-4"
                            style={{ color: PERIWINKLE }}
                        >
                            {link.anchor}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
