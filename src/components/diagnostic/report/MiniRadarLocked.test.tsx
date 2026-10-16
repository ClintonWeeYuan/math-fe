import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MiniRadarLocked } from './MiniRadarLocked'

describe('MiniRadarLocked', () => {
    it('names the real lengths for a TMUA mini: 5 questions, and 20 in a full paper', () => {
        render(<MiniRadarLocked subject="TMUA Paper 1" miniQuestions={5} fullPaperQuestions={20} />)
        expect(screen.getByText(/Five questions give an indication, not a diagnosis\. 20 questions/)).toBeInTheDocument()
        expect(screen.getByText(/the parts five questions can measure/)).toBeInTheDocument()
    })

    it('keeps the ESAT wording', () => {
        render(<MiniRadarLocked subject="ESAT Physics" />)
        expect(screen.getByText(/Ten questions give an indication, not a diagnosis\. 27 questions/)).toBeInTheDocument()
    })
})
