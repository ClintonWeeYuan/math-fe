import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { downloadJson } from './downloadJson'

describe('downloadJson', () => {
    let createdUrl: string
    let revoked: string[]

    beforeEach(() => {
        createdUrl = 'blob:test'
        revoked = []
        global.URL.createObjectURL = vi.fn(() => createdUrl)
        global.URL.revokeObjectURL = vi.fn((u: string) => revoked.push(u))
    })

    afterEach(() => vi.restoreAllMocks())

    it('names the file and cleans up after itself', () => {
        const clicks: HTMLAnchorElement[] = []
        const realClick = HTMLAnchorElement.prototype.click
        HTMLAnchorElement.prototype.click = function () {
            clicks.push(this as HTMLAnchorElement)
        }

        downloadJson('esat-biology-set-b.json', { questions: [] })

        expect(clicks[0].download).toBe('esat-biology-set-b.json')
        expect(clicks[0].href).toContain('blob:')
        // Without this the blob is held for the lifetime of the page.
        expect(revoked).toEqual([createdUrl])
        expect(document.querySelector('a[download]')).toBeNull()

        HTMLAnchorElement.prototype.click = realClick
    })
})
