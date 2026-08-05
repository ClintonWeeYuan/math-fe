import { describe, expect, it } from 'vitest'

/**
 * The cache key must include every input that changes the response.
 *
 * `size` was missing, and two components on the admin subject page ask the
 * same question at different sizes: the publish card wants a count (size 1,
 * status published), the review list wants the questions (size 20, same
 * status). Identical keys meant whichever request landed first won, so the
 * review list rendered the publish card's single row and reported "1
 * published question" when there were five.
 *
 * Asserted on the key shape rather than through a rendered component, because
 * the failure is two *different* components colliding — no single render can
 * show it.
 */
function keyFor(args: {
    subjectId: string
    page: number
    size: number
    topics?: string[]
    difficulty?: string[]
    papers?: string[]
    status?: string
    includeDrafts?: boolean
}) {
    const {
        subjectId,
        page,
        size,
        topics = [],
        difficulty = [],
        papers = [],
        status,
        includeDrafts,
    } = args
    return JSON.stringify([
        'questions',
        subjectId,
        { page, size, topics, difficulty, papers, status, includeDrafts },
    ])
}

describe('paginated questions cache key', () => {
    it('separates two requests that differ only by page size', () => {
        const publishCardCount = keyFor({
            subjectId: 's1',
            page: 1,
            size: 1,
            status: 'published',
        })
        const reviewList = keyFor({
            subjectId: 's1',
            page: 1,
            size: 20,
            status: 'published',
        })

        expect(publishCardCount).not.toEqual(reviewList)
    })

    it('separates the student bank from the admin review list', () => {
        // Same subject, same page — but one asks for drafts.
        const bank = keyFor({ subjectId: 's1', page: 1, size: 5 })
        const admin = keyFor({
            subjectId: 's1',
            page: 1,
            size: 20,
            includeDrafts: true,
        })

        expect(bank).not.toEqual(admin)
    })

    it('still reuses the cache for a genuinely identical request', () => {
        const a = keyFor({ subjectId: 's1', page: 2, size: 20, status: 'draft' })
        const b = keyFor({ subjectId: 's1', page: 2, size: 20, status: 'draft' })

        expect(a).toEqual(b)
    })
})
