import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReportQuestionDialog } from './ReportQuestionDialog'
import { client } from '@/client/client.gen'

const post = vi.spyOn(client, 'post')

function show(context: 'exam' | 'review') {
    render(
        <ReportQuestionDialog
            attemptId="att-1"
            questionId="q-9"
            questionNumber={4}
            context={context}
        />
    )
}

beforeEach(() => {
    post.mockReset()
    post.mockResolvedValue({ data: { message: "Thanks — we'll take a look." } } as never)
})

describe('reporting a problem with a question', () => {
    it('mid-exam, offers only what can be judged without the answer', async () => {
        show('exam')
        await userEvent.click(screen.getByRole('button', { name: /report a problem/i }))
        expect(screen.getByText(/your timer keeps running/i)).toBeInTheDocument()
        expect(screen.getByLabelText('Typo or unclear wording')).toBeInTheDocument()
        expect(screen.queryByLabelText('The marked answer is wrong')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Mistake in the worked solution')).not.toBeInTheDocument()
    })

    it('in the review, offers the answer and solution categories too', async () => {
        show('review')
        await userEvent.click(screen.getByRole('button', { name: /report a problem/i }))
        expect(screen.getByLabelText('The marked answer is wrong')).toBeInTheDocument()
        expect(screen.getByLabelText('Mistake in the worked solution')).toBeInTheDocument()
    })

    it('cannot be sent without choosing what is wrong', async () => {
        show('review')
        await userEvent.click(screen.getByRole('button', { name: /report a problem/i }))
        expect(screen.getByRole('button', { name: 'Send report' })).toBeDisabled()
    })

    it('sends the category and message for this attempt and question, then thanks', async () => {
        show('review')
        await userEvent.click(screen.getByRole('button', { name: /report a problem/i }))
        await userEvent.click(screen.getByLabelText('The marked answer is wrong'))
        await userEvent.type(screen.getByRole('textbox'), 'B should be right')
        await userEvent.click(screen.getByRole('button', { name: 'Send report' }))

        expect(post).toHaveBeenCalledTimes(1)
        expect(post.mock.calls[0][0]).toMatchObject({
            url: '/diagnostic/attempts/att-1/questions/q-9/report',
            body: { category: 'wrong_answer', message: 'B should be right' },
        })
        expect(await screen.findByRole('status')).toHaveTextContent("we'll take a look")
    })

    it('shows the server’s reason when a report is refused', async () => {
        post.mockResolvedValue({
            data: undefined,
            error: { detail: "You've sent a lot of reports today — thank you." },
            response: { status: 429 },
        } as never)
        show('exam')
        await userEvent.click(screen.getByRole('button', { name: /report a problem/i }))
        await userEvent.click(screen.getByLabelText('Diagram missing or wrong'))
        await userEvent.click(screen.getByRole('button', { name: 'Send report' }))
        expect(await screen.findByRole('alert')).toHaveTextContent(/a lot of reports today/)
    })
})
