/**
 * Types for the guide content. The content itself is plain .mjs so the
 * build-time prerenderer (Node, no TypeScript) can import the very same
 * module the React page renders; this file gives the page real types back.
 */
export type GuideSection = {
    id: string
    h2: string
    paras: string[]
    table?: {
        caption: string
        head: string[]
        rows: string[][]
    }
}

export type GuideFaqItem = {
    q: string
    a: string
    /** An official source backing the answer, rendered after it. */
    link?: { label: string; url: string }
}

export type Guide = {
    path: string
    title: string
    description: string
    h1: string
    standfirst: string
    sections: GuideSection[]
    faq: GuideFaqItem[]
    sources: { label: string; url: string }[]
}

export declare const GUIDE: Guide
