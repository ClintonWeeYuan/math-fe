import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Combobox } from './combobox'

function renderCombobox(
    value: string | null = null,
    onChange = vi.fn(),
    options: string[] = ['ESAT Maths I', 'ESAT Maths II', 'ESAT Physics']
) {
    render(
        <Combobox
            value={value}
            onChange={onChange}
            options={options}
            placeholder="Select…"
            clearLabel="Uncategorised"
        />
    )
    return onChange
}

describe('Combobox', () => {
    it('shows the placeholder when nothing is selected, and the value when it is', () => {
        const { rerender } = render(
            <Combobox value={null} onChange={vi.fn()} options={['A']} placeholder="Select…" />
        )
        expect(screen.getByRole('combobox')).toHaveTextContent('Select…')
        rerender(
            <Combobox value="A" onChange={vi.fn()} options={['A']} placeholder="Select…" />
        )
        expect(screen.getByRole('combobox')).toHaveTextContent('A')
    })

    it('picks an existing option', () => {
        const onChange = renderCombobox()
        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByText('ESAT Physics'))
        expect(onChange).toHaveBeenCalledWith('ESAT Physics')
    })

    it('accepts a typed-in value that is not in the list (free entry)', () => {
        const onChange = renderCombobox()
        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.change(screen.getByPlaceholderText(/search or type/i), {
            target: { value: 'ESAT Chemistry' },
        })
        fireEvent.click(screen.getByText(/Use “ESAT Chemistry”/))
        expect(onChange).toHaveBeenCalledWith('ESAT Chemistry')
    })

    it('does not offer free entry when the typed text is already an option', () => {
        renderCombobox()
        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.change(screen.getByPlaceholderText(/search or type/i), {
            target: { value: 'ESAT Physics' },
        })
        // The existing option is offered; a duplicate "Use ..." entry is not.
        expect(screen.getByText('ESAT Physics')).toBeInTheDocument()
        expect(screen.queryByText(/Use “ESAT Physics”/)).not.toBeInTheDocument()
    })

    it('clears to null via the clear entry', () => {
        const onChange = renderCombobox('ESAT Physics')
        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByText('Uncategorised'))
        expect(onChange).toHaveBeenCalledWith(null)
    })
})
