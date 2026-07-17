import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { QuestionPicker } from './QuestionPicker'
import type { DiagnosticQuestionResponse } from '@/client'

function q(over: Partial<DiagnosticQuestionResponse>): DiagnosticQuestionResponse {
    return {
        id: 'id',
        topicCode: 'MM1.1',
        coreSkillPrimary: 'S1',
        stem: 'stem',
        options: [],
        correctOption: 'A',
        status: 'published',
        createdAt: '2026-07-13T00:00:00Z',
        ...over,
    }
}

const questions = [
    q({ id: 'a', topicCode: 'MM1.1', stem: 'first' }),
    q({ id: 'b', topicCode: 'MM2.3', stem: 'second', status: 'draft' }),
    q({ id: 'c', topicCode: 'MM3.5', stem: 'third' }),
]

describe('QuestionPicker', () => {
    it('adds a ticked question to the ordered selection', () => {
        const onChange = vi.fn()
        render(<QuestionPicker questions={questions} value={[]} onChange={onChange} />)
        // tick the first available question (its checkbox)
        fireEvent.click(screen.getByText('first').closest('label')!.querySelector('button')!)
        expect(onChange).toHaveBeenCalledWith(['a'])
    })

    it('removes a question from the selection', () => {
        const onChange = vi.fn()
        render(<QuestionPicker questions={questions} value={['a', 'b']} onChange={onChange} />)
        fireEvent.click(screen.getByRole('button', { name: /remove MM1.1/i }))
        expect(onChange).toHaveBeenCalledWith(['b'])
    })

    it('reorders with the up control', () => {
        const onChange = vi.fn()
        render(<QuestionPicker questions={questions} value={['a', 'b']} onChange={onChange} />)
        fireEvent.click(screen.getByRole('button', { name: /move MM2.3 up/i }))
        expect(onChange).toHaveBeenCalledWith(['b', 'a'])
    })

    it('marks a draft question in the available list, rather than hiding it', () => {
        render(<QuestionPicker questions={questions} value={[]} onChange={vi.fn()} />)
        // 'second' is draft and still shown, with a draft badge.
        const row = screen.getByText('second').closest('label')!
        expect(within(row).getByText('draft')).toBeInTheDocument()
    })

    it('shows the count of chosen questions', () => {
        render(<QuestionPicker questions={questions} value={['a', 'c']} onChange={vi.fn()} />)
        expect(screen.getByText('In this set (2)')).toBeInTheDocument()
    })
})
