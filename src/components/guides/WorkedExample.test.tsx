import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkedExample } from './WorkedExample'
import type { WorkedExample as Example } from '@/content/guideTypes'

/**
 * The interactive worked example.
 *
 * The load-bearing test here is the crawlability one: these guide pages exist
 * to rank on having worked solutions, so the entire solution must be in the
 * DOM before anyone clicks anything. An implementation that renders steps
 * conditionally would pass every behavioural test below and quietly destroy
 * the reason the pages were written.
 */

const INTERACTIVE: Example = {
    id: 'percentage-change',
    module: 'Mathematics 1',
    question:
        'A price rises 20%, then falls by k% back to its original value. Find k.',
    options: [
        { letter: 'A', text: '20', misconception: 'Averages the two changes.' },
        { letter: 'B', text: '18', misconception: 'Undoes 20% with 20%.' },
        { letter: 'C', text: '16⅔', isCorrect: true },
        { letter: 'D', text: '15' },
    ],
    steps: [
        'Let the price be 100.',
        'After the rise it is 120.',
        'Solve 120(1 − k/100) = 100.',
    ],
    answer: 'k = 16⅔',
    takeaway: 'Percentage changes are multiplicative, not additive.',
}

const PROSE: Example = {
    id: 'stationary-points',
    module: 'Mathematics 2',
    question: 'Find the stationary points of y = x³ − 6x² + 9x + 1.',
    steps: ['Differentiate.', 'Set to zero.'],
    answer: 'x = 1 and x = 3',
    takeaway: 'The second derivative carries half the marks.',
}

/** Present in the HTML, whether or not a reader can currently see it. */
function inTheDom(text: string | RegExp) {
    return screen.queryByText(text) !== null
}

describe('what a crawler reads', () => {
    it('has every step in the DOM before anything is clicked', () => {
        render(<WorkedExample example={INTERACTIVE} />)
        for (const step of INTERACTIVE.steps) expect(inTheDom(step)).toBe(true)
    })

    it('has the answer and the trap in the DOM before anything is clicked', () => {
        render(<WorkedExample example={INTERACTIVE} />)
        expect(inTheDom(/k = 16⅔/)).toBe(true)
        expect(inTheDom(/multiplicative, not additive/)).toBe(true)
    })

    it('has every misconception in the DOM, not only the one you trigger', () => {
        // The misconception bank is the asset no competitor has. Rendering
        // only the chosen one would mean a crawler saw a quarter of it.
        render(<WorkedExample example={INTERACTIVE} />)
        expect(inTheDom(/Averages the two changes/)).toBe(true)
        expect(inTheDom(/Undoes 20% with 20%/)).toBe(true)
    })
})

describe('what a reader sees', () => {
    it('hides the solution until they have committed to an answer', () => {
        render(<WorkedExample example={INTERACTIVE} />)
        expect(screen.getByText('Let the price be 100.')).not.toBeVisible()
        expect(screen.getByText(/k = 16⅔/)).not.toBeVisible()
    })

    it('marks a right answer right', () => {
        render(<WorkedExample example={INTERACTIVE} />)
        fireEvent.click(screen.getByRole('button', { name: /16⅔/ }))
        expect(screen.getByText('Correct — C.')).toBeVisible()
    })

    it('names the misconception behind the option actually chosen', () => {
        render(<WorkedExample example={INTERACTIVE} />)
        fireEvent.click(screen.getByRole('button', { name: /^A 20$/ }))

        expect(screen.getByText(/Not quite — the answer is C/)).toBeVisible()
        expect(screen.getByText(/Averages the two changes/)).toBeVisible()
        // Somebody else's mistake stays hidden.
        expect(screen.getByText(/Undoes 20% with 20%/)).not.toBeVisible()
    })

    it('says nothing extra for a distractor with no rationale written', () => {
        // "where a rewrite gives fewer than four distractor rationales, write
        // NONE — do not invent."
        render(<WorkedExample example={INTERACTIVE} />)
        fireEvent.click(screen.getByRole('button', { name: /^D 15$/ }))

        expect(screen.getByText(/Not quite/)).toBeVisible()
        // Every "Your step:" block is in the DOM (that is the point), so
        // assert none of them is showing rather than that none exists.
        for (const block of screen.queryAllByText(/Your step:/)) {
            expect(block).not.toBeVisible()
        }
    })

    it('reveals the method one step at a time, then the answer', () => {
        render(<WorkedExample example={INTERACTIVE} />)
        fireEvent.click(screen.getByRole('button', { name: /16⅔/ }))

        fireEvent.click(screen.getByRole('button', { name: /step by step/i }))
        expect(screen.getByText('Let the price be 100.')).toBeVisible()
        expect(screen.getByText('After the rise it is 120.')).not.toBeVisible()

        fireEvent.click(screen.getByRole('button', { name: /next step/i }))
        fireEvent.click(screen.getByRole('button', { name: /next step/i }))
        fireEvent.click(
            screen.getByRole('button', { name: /show the answer/i })
        )
        expect(screen.getByText(/k = 16⅔/)).toBeVisible()
        expect(screen.getByText(/multiplicative, not additive/)).toBeVisible()
    })

    it('cannot be answered twice without resetting', () => {
        render(<WorkedExample example={INTERACTIVE} />)
        fireEvent.click(screen.getByRole('button', { name: /^A 20$/ }))
        fireEvent.click(screen.getByRole('button', { name: /16⅔/ }))

        // Still showing the first verdict — the second click did nothing.
        expect(screen.getByText(/Not quite/)).toBeVisible()
    })

    it('lets them start over', () => {
        render(<WorkedExample example={INTERACTIVE} />)
        fireEvent.click(screen.getByRole('button', { name: /^A 20$/ }))
        fireEvent.click(screen.getByRole('button', { name: /try it again/i }))

        expect(screen.getByText(/Not quite/)).not.toBeVisible()
        expect(screen.getByRole('button', { name: /^A 20$/ })).toBeEnabled()
    })
})

describe('an example with no options', () => {
    it('reads straight through, as every example did before', () => {
        render(<WorkedExample example={PROSE} />)

        expect(screen.getByText('Differentiate.')).toBeVisible()
        expect(screen.getByText(/x = 1 and x = 3/)).toBeVisible()
        expect(screen.getByText(/second derivative/)).toBeVisible()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
})
