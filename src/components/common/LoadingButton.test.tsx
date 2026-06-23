import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingButton } from './LoadingButton'

describe('LoadingButton', () => {
    it('disables the button while isLoading is true (regression: previously not disabled, allowing double-submit)', () => {
        render(<LoadingButton isLoading={true} text="Save" />)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is not disabled when isLoading is false', () => {
        render(<LoadingButton isLoading={false} text="Save" />)
        expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('stays disabled when caller passes disabled explicitly, even if not loading', () => {
        render(<LoadingButton isLoading={false} text="Save" disabled={true} />)
        expect(screen.getByRole('button')).toBeDisabled()
    })
})
