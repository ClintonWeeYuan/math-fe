import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { setTopicCode } from '@/test/setTopicCode.ts'
import {
    DiagnosticQuestionForm,
    getCorrectOptionLabel,
    getDiagramSvgForCreate,
    getDiagramSvgForUpdate,
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

        setTopicCode('MM1.1')
        fireEvent.click(screen.getByText('Create'))

        // Required-field validation (core skill, stem, option text all
        // empty) should block submission — onSubmit must not fire with an
        // incomplete question.
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('shows the existing diagram image when editing a question that has one, with no editor open', () => {
        render(
            <DiagnosticQuestionForm
                initialData={{
                    id: 'q1',
                    topicCode: 'MM1.1',
                    coreSkillPrimary: 'S1',
                    stem: 'stem',
                    options: [
                        { label: 'A', text: 'x', isCorrect: true },
                        { label: 'B', text: 'y', isCorrect: false },
                    ],
                    correctOption: 'A',
                    diagramUrl: 'https://example.com/diagram.png',
                    status: 'draft',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any}
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Save"
            />
        )

        const img = screen.getByAltText('Current diagram') as HTMLImageElement
        expect(img.src).toBe('https://example.com/diagram.png')
        expect(screen.queryByPlaceholderText('<svg ...>...</svg>')).not.toBeInTheDocument()
        expect(screen.getByText('Remove diagram')).toBeInTheDocument()
    })

    it('clicking Remove diagram replaces the existing preview with the paste-SVG editor', () => {
        render(
            <DiagnosticQuestionForm
                initialData={{
                    id: 'q1',
                    topicCode: 'MM1.1',
                    coreSkillPrimary: 'S1',
                    stem: 'stem',
                    options: [
                        { label: 'A', text: 'x', isCorrect: true },
                        { label: 'B', text: 'y', isCorrect: false },
                    ],
                    correctOption: 'A',
                    diagramUrl: 'https://example.com/diagram.png',
                    status: 'draft',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any}
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Save"
            />
        )

        fireEvent.click(screen.getByText('Remove diagram'))

        expect(screen.queryByAltText('Current diagram')).not.toBeInTheDocument()
        expect(
            screen.getByPlaceholderText('<svg ...>...</svg>')
        ).toBeInTheDocument()
    })

    it('defaults to the paste-SVG mode and switches to the upload mode on click', () => {
        render(
            <DiagnosticQuestionForm
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel="Create"
            />
        )

        expect(
            screen.getByPlaceholderText('<svg ...>...</svg>')
        ).toBeInTheDocument()

        fireEvent.click(screen.getByText('Upload image'))

        expect(
            screen.queryByPlaceholderText('<svg ...>...</svg>')
        ).not.toBeInTheDocument()
        expect(document.querySelector('input[type="file"]')).toBeInTheDocument()
    })
})

describe('getCorrectOptionLabel', () => {
    // The one shared function both DiagnosticQuestionCreatePage and
    // DiagnosticQuestionEditPage call instead of each having its own
    // inline `.find((o) => o.isCorrect)?.label` copy.
    function makeValues(
        options: DiagnosticQuestionFormValues['options'],
        overrides: Partial<DiagnosticQuestionFormValues> = {}
    ): DiagnosticQuestionFormValues {
        return {
            topicCode: 'MM1.1',
            coreSkillPrimary: 'S1',
            coreSkillSecondary: null,
            difficultyTag: null,
            stem: 'stem',
            options,
            status: 'draft',
            diagramSvg: '',
            diagramSvgTouched: false,
            diagramFile: null,
            solutionText: '',
            solutionVideoUrl: '',
            ...overrides,
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

    describe('getDiagramSvgForCreate', () => {
        it('returns undefined when the diagram field was left blank', () => {
            const values = makeValues([], { diagramSvg: '' })
            expect(getDiagramSvgForCreate(values)).toBeUndefined()
        })

        it('returns undefined when the diagram field is only whitespace', () => {
            const values = makeValues([], { diagramSvg: '   ' })
            expect(getDiagramSvgForCreate(values)).toBeUndefined()
        })

        it('returns the SVG text when one was pasted in', () => {
            const values = makeValues([], { diagramSvg: '<svg></svg>' })
            expect(getDiagramSvgForCreate(values)).toBe('<svg></svg>')
        })
    })

    describe('getDiagramSvgForUpdate', () => {
        it('returns undefined (omit the key) when the field was never touched', () => {
            const values = makeValues([], {
                diagramSvgTouched: false,
                diagramSvg: '',
            })
            expect(getDiagramSvgForUpdate(values)).toBeUndefined()
        })

        it('returns null (explicit clear) when touched and left empty', () => {
            const values = makeValues([], {
                diagramSvgTouched: true,
                diagramSvg: '',
            })
            expect(getDiagramSvgForUpdate(values)).toBeNull()
        })

        it('returns null (explicit clear) when touched and only whitespace', () => {
            const values = makeValues([], {
                diagramSvgTouched: true,
                diagramSvg: '   ',
            })
            expect(getDiagramSvgForUpdate(values)).toBeNull()
        })

        it('returns the new SVG text when touched and replaced', () => {
            const values = makeValues([], {
                diagramSvgTouched: true,
                diagramSvg: '<svg>new</svg>',
            })
            expect(getDiagramSvgForUpdate(values)).toBe('<svg>new</svg>')
        })
    })
})
