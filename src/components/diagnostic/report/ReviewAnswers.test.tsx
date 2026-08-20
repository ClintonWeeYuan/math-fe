import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewAnswers } from './ReviewAnswers'
import { toEmbedUrl } from './SolutionBlock'
import type { ReviewQuestion } from '@/hooks/diagnostic/useAttemptReviewQuery.ts'

const mockReview = vi.fn()
vi.mock('@/hooks/diagnostic/useAttemptReviewQuery.ts', () => ({
    default: () => mockReview(),
}))

let n = 0
const question = (over: Partial<ReviewQuestion> = {}): ReviewQuestion => ({
    questionId: `q-${++n}`,
    questionOrderIndex: 0,
    stem: 'What is 2+2?',
    diagramUrl: null,
    options: [
        { label: 'A', text: '3', isCorrect: false, isSelected: false },
        { label: 'B', text: '4', isCorrect: true, isSelected: true },
    ],
    correctOption: 'B',
    selectedOption: 'B',
    isCorrect: true,
    solutionText: null,
    solutionVideoUrl: null,
    ...over,
})

const wrong = (over: Partial<ReviewQuestion> = {}) =>
    question({
        options: [
            {
                label: 'A',
                text: '3',
                isCorrect: false,
                isSelected: true,
                misconception: 'You counted one short.',
            },
            { label: 'B', text: '4', isCorrect: true, isSelected: false },
        ],
        selectedOption: 'A',
        isCorrect: false,
        ...over,
    })

function show(questions: ReviewQuestion[]) {
    mockReview.mockReturnValue({
        data: { attemptId: 'att-1', subject: 'ESAT Math 1', questions },
        isLoading: false,
        isError: false,
    })
    return render(<ReviewAnswers attemptId="att-1" />)
}

beforeEach(() => {
    mockReview.mockReset()
})

describe('review mode', () => {
    it('renders nothing at all when review is refused', () => {
        // A 403 (in progress, or not yours) is an answer, not a failure. The
        // report above is already on screen; an error block under it would
        // make a working page look broken.
        mockReview.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        })
        const { container } = render(<ReviewAnswers attemptId="att-1" />)
        expect(container).toBeEmptyDOMElement()
    })

    it('shows only the wrong ones by default', () => {
        show([question(), wrong(), question()])

        expect(screen.getAllByRole('button', { name: /^Question \d/ })).toHaveLength(1)
        expect(screen.getByText(/1 of 3 went wrong/i)).toBeInTheDocument()
    })

    it('shows everything once the filter is turned off', async () => {
        show([question(), wrong(), question()])
        await userEvent.click(
            screen.getByRole('checkbox', { name: /only what i got wrong/i })
        )
        expect(screen.getAllByRole('button', { name: /^Question \d/ })).toHaveLength(3)
    })

    it('marks the student’s answer against the correct one', async () => {
        show([wrong()])
        await userEvent.click(screen.getByRole('button', { name: /^Question 1/ }))

        expect(screen.getByText('Your answer')).toBeInTheDocument()
        expect(screen.getByText('Correct answer')).toBeInTheDocument()
    })

    it('puts the misconception in front of them, not behind a disclosure', async () => {
        // It is the shortest useful thing on the card and the reason a wrong
        // answer is worth opening.
        show([wrong()])
        await userEvent.click(screen.getByRole('button', { name: /^Question 1/ }))

        expect(screen.getByText('You counted one short.')).toBeInTheDocument()
    })

    it('does not call an unanswered question wrong', async () => {
        show([
            question({ selectedOption: null, isCorrect: null }),
        ])
        await userEvent.click(
            screen.getByRole('checkbox', { name: /only what i got wrong/i })
        )

        expect(screen.getByText('Not answered')).toBeInTheDocument()
    })
})

describe('the four solution states', () => {
    async function open(over: Partial<ReviewQuestion>) {
        show([wrong(over)])
        await userEvent.click(screen.getByRole('button', { name: /^Question 1/ }))
    }

    it('says so plainly when there is no solution yet', async () => {
        // Review ships before the content does; an empty panel would look
        // broken where a sentence is simply true.
        await open({})
        expect(screen.getByText(/worked solution coming soon/i)).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /show full solution/i })
        ).not.toBeInTheDocument()
    })

    it('renders text alone behind the disclosure', async () => {
        await open({ solutionText: 'Add the two numbers.' })
        expect(screen.queryByText('Add the two numbers.')).not.toBeInTheDocument()

        await userEvent.click(
            screen.getByRole('button', { name: /show full solution/i })
        )
        expect(screen.getByText('Add the two numbers.')).toBeInTheDocument()
        expect(screen.queryByTitle('Worked solution')).not.toBeInTheDocument()
    })

    it('renders a video alone', async () => {
        await open({ solutionVideoUrl: 'https://youtu.be/abc123' })
        await userEvent.click(
            screen.getByRole('button', { name: /show full solution/i })
        )

        const iframe = screen.getByTitle('Worked solution')
        expect(iframe).toHaveAttribute(
            'src',
            'https://www.youtube.com/embed/abc123'
        )
    })

    it('renders the video with the text beneath it when both exist', async () => {
        await open({
            solutionText: 'Add them.',
            solutionVideoUrl: 'https://youtu.be/abc123',
        })
        await userEvent.click(
            screen.getByRole('button', { name: /show full solution/i })
        )

        expect(screen.getByTitle('Worked solution')).toBeInTheDocument()
        expect(screen.getByText('Add them.')).toBeInTheDocument()
    })

    it('does not mount the player until the solution is opened', async () => {
        // A twenty-seven question report must not fetch twenty-seven players
        // on load.
        await open({ solutionVideoUrl: 'https://youtu.be/abc123' })
        expect(screen.queryByTitle('Worked solution')).not.toBeInTheDocument()
    })
})

describe('accepting the URLs an author will actually paste', () => {
    it('handles a watch link', () => {
        expect(toEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(
            'https://www.youtube.com/embed/abc123'
        )
    })

    it('handles a share link', () => {
        expect(toEmbedUrl('https://youtu.be/abc123')).toBe(
            'https://www.youtube.com/embed/abc123'
        )
    })

    it('leaves an embed link alone', () => {
        expect(toEmbedUrl('https://www.youtube.com/embed/abc123')).toBe(
            'https://www.youtube.com/embed/abc123'
        )
    })

    it('does not mangle something it does not recognise', () => {
        expect(toEmbedUrl('not a url')).toBe('not a url')
    })
})

describe('a solution written as numbered steps', () => {
    const stepped = [
        '1. Factorise: $2x^2-7x+3=(2x-1)(x-3)$.',
        '2. The roots are $x=\\tfrac12$ and $x=3$.',
        'Answer: A',
    ].join('\n')

    // The options are a <ul> of <li> too, so a bare listitem query matches
    // both. The steps are the <ol>, which is what these assertions mean.
    async function openSolution(over: Partial<ReviewQuestion>) {
        const { container } = show([wrong(over)])
        await userEvent.click(screen.getByRole('button', { name: /^Question 1/ }))
        await userEvent.click(
            screen.getByRole('button', { name: /show full solution/i })
        )
        return container
    }

    it('renders the steps as a list', async () => {
        const container = await openSolution({ solutionText: stepped })
        expect(container.querySelectorAll('ol > li')).toHaveLength(2)
    })

    it('strips the typed number so the list does the numbering', async () => {
        // Otherwise inserting a step means renumbering every line by hand, and
        // the first time someone forgets there are two step fours.
        const container = await openSolution({ solutionText: stepped })
        const first = container.querySelector('ol > li')
        expect(first?.textContent).not.toMatch(/^1\./)
        expect(first?.textContent).toContain('Factorise')
    })

    it('sets the answer line off beneath the list, not inside it', async () => {
        // It is not a step — it is what the steps arrived at.
        await openSolution({ solutionText: stepped })
        const answer = screen.getByText(/Answer: A/)
        expect(answer.tagName).toBe('P')
        expect(answer.closest('li')).toBeNull()
    })

    it('leaves a legacy single-line solution as a paragraph', async () => {
        // The path that must not break: solutions written before the step
        // format existed have no newlines at all.
        const container = await openSolution({
            solutionText: 'Just add the two numbers together.',
        })
        expect(container.querySelector('ol')).toBeNull()
        expect(
            screen.getByText('Just add the two numbers together.')
        ).toBeInTheDocument()
    })

    it('copes with unnumbered prose across several lines', async () => {
        const container = await openSolution({
            solutionText: 'First thought.\nSecond thought.',
        })
        expect(container.querySelector('ol')).toBeNull()
        expect(screen.getByText('First thought.')).toBeInTheDocument()
        expect(screen.getByText('Second thought.')).toBeInTheDocument()
    })
})
