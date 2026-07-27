import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkillsRadarPaywall } from './SkillsRadarPaywall'

describe('SkillsRadarPaywall', () => {
    it('names the real skills so the lock is informative', () => {
        render(<SkillsRadarPaywall subject="ESAT Physics" />)
        // A real framework name, not a placeholder or an S-code.
        expect(screen.getByText(/Unlock your skill-by-skill/i)).toBeInTheDocument()
        const labels = screen.getAllByText(/[a-z]/i)
        expect(labels.length).toBeGreaterThan(3)
    })

    it('reassures that the free tier is retained', () => {
        render(<SkillsRadarPaywall subject="ESAT Physics" />)
        expect(screen.getByText(/score and timing above stay free/i)).toBeInTheDocument()
    })

    it('calls onUnlock from the CTA', () => {
        const onUnlock = vi.fn()
        render(<SkillsRadarPaywall subject="ESAT Physics" onUnlock={onUnlock} />)
        fireEvent.click(screen.getByText(/Unlock full report/i))
        expect(onUnlock).toHaveBeenCalledOnce()
    })

    it('omits the CTA when no handler is given (billing not wired yet)', () => {
        render(<SkillsRadarPaywall subject="ESAT Physics" />)
        expect(screen.queryByText(/Unlock full report/i)).not.toBeInTheDocument()
    })
})
