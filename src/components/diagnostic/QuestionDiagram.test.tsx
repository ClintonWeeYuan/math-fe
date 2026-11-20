import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { QuestionDiagram } from './QuestionDiagram'

/** Load the image as if the browser had drawn it at this size. */
function loadAt(width: number, height: number) {
    const img = screen.getByAltText('Question diagram')
    Object.defineProperty(img, 'offsetWidth', { value: width, configurable: true })
    Object.defineProperty(img, 'offsetHeight', { value: height, configurable: true })
    fireEvent.load(img)
    return img
}

describe('QuestionDiagram', () => {
    it('starts at the smaller cap, before the image has loaded', () => {
        render(<QuestionDiagram src="x.svg" alt="Question diagram" />)
        expect(screen.getByAltText('Question diagram')).toHaveClass('max-h-80')
    })

    it('gives a tall image room, so a stacked answer table can be read', () => {
        render(<QuestionDiagram src="x.svg" alt="Question diagram" />)
        // A drawing above an options table: 698 by 671, drawn at 333 by 320.
        const img = loadAt(333, 320)
        expect(img).toHaveClass('max-h-[30rem]')
        expect(img).not.toHaveClass('max-h-80')
    })

    it('leaves a wide image at the smaller cap', () => {
        render(<QuestionDiagram src="x.svg" alt="Question diagram" />)
        // A plain diagram, 737 by 560.
        expect(loadAt(421, 320)).toHaveClass('max-h-80')
    })

    it('goes back to the smaller cap when the next image is wide', () => {
        const { rerender } = render(
            <QuestionDiagram src="tall.svg" alt="Question diagram" />
        )
        expect(loadAt(333, 320)).toHaveClass('max-h-[30rem]')
        // The exam screen reuses the same element from question to question.
        rerender(<QuestionDiagram src="wide.svg" alt="Question diagram" />)
        expect(loadAt(632, 480)).toHaveClass('max-h-80')
    })

    it('keeps the smaller cap if nothing has been drawn', () => {
        render(<QuestionDiagram src="x.svg" alt="Question diagram" />)
        expect(loadAt(0, 0)).toHaveClass('max-h-80')
    })
})
