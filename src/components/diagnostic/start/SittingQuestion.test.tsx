import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SittingQuestion } from './SittingQuestion'
import { client } from '@/client/client.gen'

/**
 * Asked once, before the first paper. The tests are about the "once" — it
 * does not nag a student who has already said — and about it never being in
 * the way: a failed read hides it, a failed save is not shown.
 */

const post = vi.spyOn(client, 'post')
const get = vi.spyOn(client, 'get')

const show = () =>
    render(
        <QueryClientProvider
            client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
            <SittingQuestion />
        </QueryClientProvider>
    )

beforeEach(() => {
    post.mockReset()
    post.mockResolvedValue({ data: { message: 'ok' } } as never)
    get.mockReset()
    get.mockResolvedValue({ data: { testSitting: null } } as never)
})

describe('SittingQuestion', () => {
    it('asks a student who has not said, with January 2027 first', async () => {
        show()
        await screen.findByText(/which sitting are you preparing for/i)
        const options = screen.getAllByRole('button')
        expect(options[0]).toHaveTextContent('January 2027')
        expect(screen.getByRole('button', { name: /later \(2027–28 entry\)/i })).toBeInTheDocument()
    })

    it('saves on one tap and says so', async () => {
        show()
        await userEvent.click(await screen.findByRole('button', { name: 'January 2027' }))

        expect(post).toHaveBeenCalledTimes(1)
        expect(post.mock.calls[0][0].body).toEqual({ testSitting: 'january_2027' })
        expect(await screen.findByText(/saved/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'January 2027' })).toHaveAttribute(
            'aria-pressed',
            'true'
        )
    })

    it('records a student starting early on the next cycle', async () => {
        show()
        await userEvent.click(
            await screen.findByRole('button', { name: /later \(2027–28 entry\)/i })
        )
        expect(post.mock.calls[0][0].body).toEqual({ testSitting: 'later' })
    })

    it('is not asked again once the sitting is known', async () => {
        get.mockResolvedValue({ data: { testSitting: 'january_2027' } } as never)
        const { container } = show()
        await waitFor(() => expect(get).toHaveBeenCalled())
        await new Promise((r) => setTimeout(r, 0))
        expect(container).toBeEmptyDOMElement()
    })

    it('stays out of the way if the answers cannot be read', async () => {
        get.mockResolvedValue({ error: { detail: 'nope' } } as never)
        const { container } = show()
        await waitFor(() => expect(get).toHaveBeenCalled())
        await new Promise((r) => setTimeout(r, 0))
        expect(container).toBeEmptyDOMElement()
    })

    it('does not surface a failed save, or claim it saved', async () => {
        post.mockResolvedValue({ error: { detail: 'nope' } } as never)
        show()
        await userEvent.click(await screen.findByRole('button', { name: 'January 2027' }))
        await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
        await new Promise((r) => setTimeout(r, 0))
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(screen.queryByText(/saved/i)).not.toBeInTheDocument()
    })

    it('does not claim it saved when the request never arrives', async () => {
        post.mockRejectedValue(new Error('offline'))
        show()
        await userEvent.click(await screen.findByRole('button', { name: 'January 2027' }))
        await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
        await new Promise((r) => setTimeout(r, 0))
        expect(screen.queryByText(/saved/i)).not.toBeInTheDocument()
    })

    it('saves on a second tap after a failed one', async () => {
        post.mockResolvedValueOnce({ error: { detail: 'nope' } } as never)
        show()
        const january = await screen.findByRole('button', { name: 'January 2027' })
        await userEvent.click(january)
        await waitFor(() => expect(january).toBeEnabled())
        await userEvent.click(january)
        expect(await screen.findByText(/saved/i)).toBeInTheDocument()
        expect(post).toHaveBeenCalledTimes(2)
    })
})
