import { useEffect } from 'react'

const SITE_URL = 'https://www.jomexam.com'
const OG_IMAGE = `${SITE_URL}/og-image.png`

type Props = {
    /** Full document title, e.g. "About | JomExam". */
    title: string
    /** Meta description — aim for ~150 chars, unique per page. */
    description: string
    /** Route path starting with "/", used for the canonical URL and og:url. */
    path: string
}

/** Create-or-update a <meta> tag identified by name= or property=. */
function setMeta(attr: 'name' | 'property', key: string, content: string) {
    let el = document.head.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"]`
    )
    if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
    }
    el.setAttribute('content', content)
}

/**
 * Per-page SEO tags for a CSR app: title, description, canonical, and
 * Open Graph/Twitter card, kept in sync on route change. index.html holds
 * the site-wide defaults that crawlers see before JS runs; this component
 * is the per-route layer on top. Every public marketing page should render
 * one — pages behind auth don't need it (they're excluded from the sitemap
 * and not meant to rank).
 */
export function Seo({ title, description, path }: Props) {
    useEffect(() => {
        document.title = title
        setMeta('name', 'description', description)
        setMeta('property', 'og:title', title)
        setMeta('property', 'og:description', description)
        setMeta('property', 'og:url', `${SITE_URL}${path}`)
        setMeta('property', 'og:image', OG_IMAGE)
        setMeta('property', 'og:type', 'website')
        setMeta('name', 'twitter:card', 'summary_large_image')

        let canonical = document.head.querySelector<HTMLLinkElement>(
            'link[rel="canonical"]'
        )
        if (!canonical) {
            canonical = document.createElement('link')
            canonical.setAttribute('rel', 'canonical')
            document.head.appendChild(canonical)
        }
        canonical.setAttribute('href', `${SITE_URL}${path}`)
    }, [title, description, path])

    return null
}
