import { fireEvent, screen } from '@testing-library/react'

/**
 * Sets the question form's topic-code combobox in tests.
 *
 * Named-role query, not getByRole('combobox') alone: Radix's Select
 * triggers (core skill, difficulty, status) report role="combobox" too, so
 * an unnamed query matches five things on this form.
 */
export function setTopicCode(value: string) {
    fireEvent.click(screen.getByRole('combobox', { name: /topic code/i }))
    fireEvent.change(screen.getByPlaceholderText(/search or type a new topic code/i), {
        target: { value },
    })
    // Free-entry item — the tests use codes that aren't in the (stubbed,
    // empty) option list, so this is the entry that commits the value.
    fireEvent.click(screen.getByText(`Use “${value}”`))
}
