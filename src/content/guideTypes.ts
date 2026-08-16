/** Shared shape for guide content modules (the .mjs files in this folder).
 * They are plain data so the Node prerenderer and the React page can import
 * the same module; these types give the page real checking back. */
export type GuideSection = {
    id: string
    h2: string
    paras: string[]
    /** Where a fact this section used to state now lives. */
    links?: SectionLink[]
    /** Optional table. The first column of each row acts as its row header. */
    table?: { caption: string; head: string[]; rows: string[][] }
}

export type GuideFaqItem = {
    q: string
    a: string
    /** An official source backing the answer, rendered after it. */
    link?: { label: string; url: string }
}

/**
 * A question written to the style of the test, with its reasoning shown.
 *
 * Deliberately not pulled from the diagnostic bank: those are the scored
 * instrument, and publishing them with answers would mean students meet them
 * before they sit them. These are written for the page.
 */
export type WorkedExampleOption = {
    /** 'A'–'E', as printed. */
    letter: string
    text: string
    /** Exactly one option per example carries this — same convention as the
     * diagnostic question bank, rather than a second place to state which
     * letter is right and get out of step with. */
    isCorrect?: boolean
    /**
     * Why someone lands here — the specific error, not "incorrect". Absent on
     * the right answer, and absent on a distractor whose rationale was never
     * written: the widget then shows only the verdict rather than inventing
     * one.
     */
    misconception?: string
}

export type WorkedExample = {
    id: string
    /** Which module's style this is written to, e.g. "Mathematics 1". */
    module: string
    question: string
    /**
     * Present = the reader answers it first, and a wrong choice names the
     * misconception behind that particular option. Absent = the worked
     * solution reads straight through, as every example did before.
     *
     * Either way the full solution is in the HTML from the start; the
     * interactive version only toggles visibility. These pages rank on
     * having crawlable worked solutions, so content that appears only after
     * a click would be content Google never sees.
     */
    options?: WorkedExampleOption[]
    /** One step per line, in the order you would actually work. */
    steps: string[]
    answer: string
    /** What the question was really testing — the reason it is here. */
    takeaway: string
}

/** A pointer from a section to the page that owns a fact this page used to
 *  restate. The canonical-home rule is only worth anything if the page that
 *  gave up the fact still tells a reader where it went. */
export type SectionLink = {
    path: string
    label: string
    note: string
}

export type Guide = {
    path: string
    title: string
    description: string
    h1: string
    standfirst: string
    /** Label above the title, e.g. "ESAT guide". */
    eyebrow: string
    /** Where the primary CTA sends the reader. */
    ctaPath: string
    ctaLabel: string
    sections: GuideSection[]
    /** ISO dates, shown to readers and emitted as Article metadata — a guide
     *  to a test whose dates move every year is worth little undated.
     *
     *  updatedAt is when the *page* last changed, which is what <lastmod>
     *  means, and it is checked against git: change the content without
     *  moving it and the build fails rather than telling Google a date that
     *  is not true. */
    publishedAt: string
    updatedAt: string
    workedExamples?: WorkedExample[]
    /**
     * Paths of the guides to list at the foot, with the blurb to use.
     *
     * Absent, every other guide is listed — which was fine at three guides
     * and is noise at nine: eight near-identical links that say nothing about
     * which one this reader wants next. Three contextual ones carry more
     * weight, both for a reader and as an internal-linking signal.
     */
    related?: { path: string; blurb: string }[]
    faq: GuideFaqItem[]
    sources: { label: string; url: string }[]
}
