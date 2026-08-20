import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AttemptClosedView } from './AttemptClosedView'
import { client } from '@/client/client.gen'

/**
 * The survey's one hard requirement is that it cannot stand between a student
 * and the report they have just spent forty minutes earning. These tests are
 * mostly about that: the report button works whatever the survey is doing, and
 * a failing save is invisible.
 */

const post = vi.spyOn(client, 'post')

const attempt = {
    id: 'att-1',
    diagnosticSetId: 'set-1',
    status: 'submitted',
    startedAt: '2026-08-20T10:00:00Z',
    serverDeadlineAt: '2026-08-20T10:40:00Z',
    submittedAt: '2026-08-20T10:35:00Z',
    agreedToTerms: true,
    totalScore: 14,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

const show = () =>
    render(
        <MemoryRouter>
            <AttemptClosedView attempt={attempt} />
        </MemoryRouter>
    )

beforeEach(() => {
    post.mockReset()
    post.mockResolvedValue({ data: { message: 'ok' } } as never)
    localStorage.clear()
})

describe('the survey after a submission', () => {
    it('never gets between the student and their report', async () => {
        show()
        // Present before answering anything, and not disabled.
        const report = screen.getByRole('button', { name: /view your report/i })
        expect(report).toBeEnabled()

        await userEvent.click(screen.getByRole('button', { name: 'October 2026' }))
        expect(
            screen.getByRole('button', { name: /view your report/i })
        ).toBeEnabled()
    })

    it('records a sitting as soon as it is tapped — no submit step', async () => {
        show()
        await userEvent.click(screen.getByRole('button', { name: 'January 2027' }))

        expect(post).toHaveBeenCalledTimes(1)
        expect(post.mock.calls[0][0].body).toEqual({
            testSitting: 'january_2027',
        })
    })

    it('sends the whole university selection, not just the last tap', async () => {
        show()
        await userEvent.click(screen.getByRole('button', { name: 'Cambridge' }))
        await userEvent.click(screen.getByRole('button', { name: 'Imperial' }))

        const last = post.mock.calls[post.mock.calls.length - 1]
        expect(last[0].body).toEqual({
            targetUniversities: ['Cambridge', 'Imperial'],
        })
    })

    it('lets a university be deselected', async () => {
        show()
        await userEvent.click(screen.getByRole('button', { name: 'Oxford' }))
        await userEvent.click(screen.getByRole('button', { name: 'Oxford' }))

        const last = post.mock.calls[post.mock.calls.length - 1]
        expect(last[0].body).toEqual({
            targetUniversities: [],
        })
    })

    it('skipping removes it and asks nothing further', async () => {
        show()
        await userEvent.click(screen.getByRole('button', { name: 'Skip' }))

        expect(
            screen.queryByText(/when are you sitting the test/i)
        ).not.toBeInTheDocument()
        // Skipping is not an answer, so nothing is recorded.
        expect(post).not.toHaveBeenCalled()
        // And the report is still one click away.
        expect(
            screen.getByRole('button', { name: /view your report/i })
        ).toBeEnabled()
    })

    it('says nothing to the student when a save fails', async () => {
        post.mockRejectedValue(new Error('offline'))
        show()
        await userEvent.click(screen.getByRole('button', { name: 'Not decided' }))

        // The selection still shows as made, and no error surfaces: a survey
        // answer is not worth an error message on this screen.
        expect(screen.getByRole('button', { name: 'Not decided' })).toHaveAttribute(
            'aria-pressed',
            'true'
        )
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
})
