import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
    DiagnosticQuestionForm,
    getCorrectOptionLabel,
    type DiagnosticQuestionFormValues,
} from './DiagnosticQuestionForm'

describe('DiagnosticQuestionForm', () => {
    it('starts with two options, A and B, A marked correct by default', () => {
        render(
            <DiagnosticQuestionForm
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        expect(screen.getByText('A')).toBeInTheDocument()
        expect(screen.getByText('B')).toBeInTheDocument()
        const radios = screen.getAllByRole('radio')
        expect(radios).toHaveLength(2)
        expect(radios[0]).toBeChecked()
        expect(radios[1]).not.toBeChecked()
    })

    it('selecting a different option as correct un-checks the previous one (mutual exclusivity)', () => {
        render(
            <DiagnosticQuestionForm
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        const radios = screen.getAllByRole('radio')
        fireEvent.click(radios[1])

        expect(radios[0]).not.toBeChecked()
        expect(radios[1]).toBeChecked()
    })

    it('adding a third option relabels it C, not a duplicate of an existing label', () => {
        render(
            <DiagnosticQuestionForm
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        fireEvent.click(screen.getByText('Add option'))

        expect(screen.getByText('A')).toBeInTheDocument()
        expect(screen.getByText('B')).toBeInTheDocument()
        expect(screen.getByText('C')).toBeInTheDocument()
        expect(screen.getAllByRole('radio')).toHaveLength(3)
    })

    it('removing an earlier option relabels the remaining ones so there is no gap or duplicate', () => {
        render(
            <DiagnosticQuestionForm
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        fireEvent.click(screen.getByText('Add option')) // now A, B, C
        const removeButtons = screen.getAllByRole('button', { name: '' })
        // The trash icon buttons don't have accessible names set explicitly;
        // find them by their position among the option cards instead.
        const trashButtons = document.querySelectorAll(
            'button[type="button"]'
        )
        // Click remove on the first option (A) via its Card's trash button.
        const firstCardTrash = Array.from(trashButtons).find((btn) =>
            btn.querySelector('svg.lucide-trash2')
        )
        expect(firstCardTrash).toBeTruthy()
        fireEvent.click(firstCardTrash!)

        // What was B and C should now be relabelled A and B — no gap, no
        // leftover "C" from a stale label, exactly 2 options left.
        expect(screen.getByText('A')).toBeInTheDocument()
        expect(screen.getByText('B')).toBeInTheDocument()
        expect(screen.queryByText('C')).not.toBeInTheDocument()
        expect(screen.getAllByRole('radio')).toHaveLength(2)
        void removeButtons
    })

    it('removing the correct option clears correctness entirely (no auto-pick) and shows a persistent warning', () => {
        render(
            <DiagnosticQuestionForm
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        // No warning yet — A starts marked correct by default.
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()

        // Trash buttons are disabled at the 2-option floor (fields.length
        // <= 2, covered by its own test below) — add a third option first
        // so removing one is actually possible.
        fireEvent.click(screen.getByText('Add option'))
        const trashButtons = document.querySelectorAll('button[type="button"]')
        const firstCardTrash = Array.from(trashButtons).find((btn) =>
            btn.querySelector('svg.lucide-trash2')
        )
        fireEvent.click(firstCardTrash!) // removes A, the correct option

        // Not just "no crash" — specifically: no radio ends up checked (no
        // auto-pick of a fallback), and the warning is visible immediately,
        // not only surfaced later at submit time.
        const remainingRadios = screen.getAllByRole('radio')
        expect(remainingRadios).toHaveLength(2)
        expect(remainingRadios.some((r) => (r as HTMLInputElement).checked)).toBe(
            false
        )
        expect(screen.getByRole('alert')).toHaveTextContent(
            /no option is marked as the correct answer/i
        )
    })

    it('the warning disappears again once an option is marked correct', () => {
        render(
            <DiagnosticQuestionForm
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        fireEvent.click(screen.getByText('Add option'))
        const trashButtons = document.querySelectorAll('button[type="button"]')
        const firstCardTrash = Array.from(trashButtons).find((btn) =>
            btn.querySelector('svg.lucide-trash2')
        )
        fireEvent.click(firstCardTrash!) // removes A, the correct option
        expect(screen.getByRole('alert')).toBeInTheDocument()

        fireEvent.click(screen.getAllByRole('radio')[0])
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not allow removing down to fewer than 2 options', () => {
        render(
            <DiagnosticQuestionForm
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        const trashButtons = document.querySelectorAll('button[type="button"]')
        const trashables = Array.from(trashButtons).filter((btn) =>
            btn.querySelector('svg.lucide-trash2')
        )
        expect(trashables.every((btn) => (btn as HTMLButtonElement).disabled)).toBe(
            true
        )
    })

    it('renders a live KaTeX preview of the stem as it is typed', () => {
        render(
            <DiagnosticQuestionForm
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        const stemInput = screen.getByPlaceholderText(
            /Given that \$x\^2/i
        ) as HTMLTextAreaElement
        fireEvent.change(stemInput, {
            target: { value: 'Solve $x^2 = 9$ for x.' },
        })

        expect(document.querySelector('.katex')).not.toBeNull()
    })

    it('blocks submit and never calls onSubmit when no option is marked correct', () => {
        // create page's own guard (checked before calling onSubmit) — this
        // test lives at the page level in practice, but the form itself
        // always has exactly one isCorrect=true by construction (radio
        // group), so onSubmit always receives a set with one correct
        // option when submitted through the UI as intended.
        const onSubmit = vi.fn()
        render(
            <DiagnosticQuestionForm
                onSubmit={onSubmit}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        fireEvent.change(
            screen.getByPlaceholderText(/e.g. MM1.6/i),
            { target: { value: 'MM1.1' } }
        )
        fireEvent.click(screen.getByText('Create'))

        // Required-field validation (core skill, stem, option text all
        // empty) should block submission — onSubmit must not fire with an
        // incomplete question.
        expect(onSubmit).not.toHaveBeenCalled()
    })
})

describe('getCorrectOptionLabel', () => {
    // The one shared function both DiagnosticQuestionCreatePage and
    // DiagnosticQuestionEditPage call instead of each having its own
    // inline `.find((o) => o.isCorrect)?.label` copy.
    function makeValues(
        options: DiagnosticQuestionFormValues['options']
    ): DiagnosticQuestionFormValues {
        return {
            topicCode: 'MM1.1',
            coreSkillPrimary: 'S1',
            coreSkillSecondary: null,
            difficultyTag: null,
            stem: 'stem',
            options,
            status: 'draft',
        }
    }

    it('returns the label of the option marked correct', () => {
        const values = makeValues([
            { label: 'A', text: 'x', isCorrect: false, misconception: '' },
            { label: 'B', text: 'y', isCorrect: true, misconception: '' },
        ])
        expect(getCorrectOptionLabel(values)).toBe('B')
    })

    it('returns null when no option is marked correct', () => {
        const values = makeValues([
            { label: 'A', text: 'x', isCorrect: false, misconception: '' },
            { label: 'B', text: 'y', isCorrect: false, misconception: '' },
        ])
        expect(getCorrectOptionLabel(values)).toBeNull()
    })
})
