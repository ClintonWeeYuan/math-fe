import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RescorePanel } from './RescorePanel'
import { client } from '@/client/client.gen'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const get = vi.spyOn(client, 'get')
const post = vi.spyOn(client, 'post')

const preview = (rows: object[]) => ({
    data: {
        questionId: 'q1', correctOption: 'C', answeredAttempts: 17, inProgressAttempts: 1,
        gains: rows.length ? 1 : 0, losses: rows.length > 1 ? 1 : 0, rows,
    },
})
const row = (over: object) => ({
    attemptId: 'a1', studentEmail: 's@x.com', isInternal: false, setTitle: 'Set A',
    selectedOption: 'C', storedIsCorrect: false, newIsCorrect: true, totalScore: 10, newTotalScore: 11, ...over,
})

beforeEach(() => {
    get.mockReset()
    post.mockReset()
    window.confirm = vi.fn(() => true)
})

describe('RescorePanel', () => {
    it('renders nothing in the editor when past marks already match the key', async () => {
        get.mockResolvedValue(preview([]) as never)
        const { container } = render(<RescorePanel questionId="q1" />)
        await vi.waitFor(() => expect(get).toHaveBeenCalled())
        expect(container).toBeEmptyDOMElement()
    })

    it('says so on a report, where the admin came to check', async () => {
        get.mockResolvedValue(preview([]) as never)
        render(<RescorePanel questionId="q1" showWhenClean />)
        expect(await screen.findByText(/nothing to re-score/i)).toBeInTheDocument()
    })

    it('shows whose marks move, and re-scores on confirmation', async () => {
        get.mockResolvedValue(preview([row({}), row({ attemptId: 'a2', studentEmail: 't@x.com', selectedOption: 'B', storedIsCorrect: true, newIsCorrect: false, totalScore: 20, newTotalScore: 19 })]) as never)
        post.mockResolvedValue({ data: { rescored: 2, results: [] } } as never)
        render(<RescorePanel questionId="q1" />)

        expect(await screen.findByText(/2 past sittings were marked against a different answer/)).toBeInTheDocument()
        expect(screen.getByText(/gives 1 a mark and takes one from 1/)).toBeInTheDocument()
        expect(screen.getByText('t@x.com')).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Re-score 2 sittings' }))
        expect(window.confirm).toHaveBeenCalled()
        expect(post.mock.calls[0][0]).toMatchObject({ url: '/diagnostic/admin/questions/q1/rescore' })
        // Checks again afterwards, so the panel reflects the new marks.
        await vi.waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    })

    it('does nothing if the admin cancels', async () => {
        get.mockResolvedValue(preview([row({})]) as never)
        window.confirm = vi.fn(() => false)
        render(<RescorePanel questionId="q1" />)
        await userEvent.click(await screen.findByRole('button', { name: 'Re-score 1 sitting' }))
        expect(post).not.toHaveBeenCalled()
    })
})
