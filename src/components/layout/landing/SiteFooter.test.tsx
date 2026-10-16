import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'

describe('the site footer', () => {
    it('gives a way to contact us on every page that has it', () => {
        render(
            <MemoryRouter>
                <SiteFooter />
            </MemoryRouter>
        )
        expect(screen.getByRole('link', { name: 'Contact us: hello@jomexam.com' })).toHaveAttribute(
            'href',
            'mailto:hello@jomexam.com'
        )
    })
})
