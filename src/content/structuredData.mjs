import { AUTHOR } from './author.mjs'

/**
 * schema.org JSON-LD for a guide.
 *
 * Plain data in .mjs for the same reason the guides are: the prerenderer
 * emits this into the static HTML that crawlers read, and the React page
 * emits the same object once it takes over. Structured data that disagreed
 * with the page it describes is worse than none.
 *
 * Only what the page genuinely contains is described. A FAQPage block is
 * emitted when there is a real question-and-answer section and omitted
 * otherwise — claiming Q&A that a reader cannot see is the kind of thing
 * that gets structured data ignored site-wide.
 */
export function guideJsonLd(guide, site) {
    const url = `${site}${guide.path}`

    const person = {
        '@type': 'Person',
        name: AUTHOR.name,
        jobTitle: AUTHOR.credential,
        url: `${site}${AUTHOR.path}`,
    }

    const article = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: guide.h1,
        description: guide.description,
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        author: person,
        publisher: {
            '@type': 'Organization',
            name: 'JomExam',
            url: site,
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        inLanguage: 'en-GB',
    }

    const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: site },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: `${site}/guides` },
            { '@type': 'ListItem', position: 3, name: guide.h1, item: url },
        ],
    }

    const blocks = [article, breadcrumbs]

    if (guide.faq.length > 0) {
        blocks.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: guide.faq.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
        })
    }

    return blocks
}

/**
 * The JSON, safe to sit inside a <script> element.
 *
 * A literal "</script>" anywhere in the content — quite possible in a guide
 * about writing — would end the block early and spill the rest onto the page
 * as markup. Escaping the slash is inert to a JSON parser.
 */
export function jsonLdText(blocks) {
    return JSON.stringify(blocks, null, 0).replace(/<\//g, '<\\/')
}
