import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every tool the image installs must name its version.
 *
 * `npm install -g pnpm` installs whatever is newest on the day the image is
 * built, so the build environment changes on its own. pnpm 11 turned "ignored
 * build scripts" into a hard error, every deploy began failing on a lockfile
 * nobody had touched, and local installs stayed green on pnpm 10. Production
 * went on serving the previous bundle, so the only symptom was that new work
 * quietly never appeared.
 *
 * A pinned version turns that into a decision someone makes in a diff.
 */

const DOCKERFILE = readFileSync(join(__dirname, '..', '..', 'Dockerfile'), 'utf8')

/** Global npm installs, as [line, packages] pairs. */
function globalInstalls(): { line: string; packages: string[] }[] {
    return DOCKERFILE.split('\n')
        .filter((line) => /^\s*RUN\s+npm\s+install\s+-g\s/.test(line))
        .map((line) => ({
            line: line.trim(),
            packages: line
                .replace(/^\s*RUN\s+npm\s+install\s+-g\s+/, '')
                .split(/\s+/)
                .filter((token) => token.length > 0 && !token.startsWith('-')),
        }))
}

describe('the Docker build toolchain is pinned', () => {
    it('installs something globally, or this test is watching nothing', () => {
        expect(globalInstalls().length).toBeGreaterThan(0)
    })

    it.each(globalInstalls())('pins every package in `$line`', ({ packages }) => {
        for (const pkg of packages) {
            // A scoped name carries its own @, so look past the first character.
            expect(
                pkg.slice(1).includes('@'),
                `"${pkg}" has no version. Unpinned, the image installs whatever ` +
                    `is newest that day and the build changes without a diff.`
            ).toBe(true)
        }
    })

    it('pins pnpm to a major that accepts this lockfile', () => {
        // pnpm 11 rejects it outright: ERR_PNPM_IGNORED_BUILDS on
        // @tailwindcss/oxide, core-js and esbuild. Moving to 11 means
        // recording approved build scripts in the lockfile first — a
        // deliberate change, not a version drift.
        const match = DOCKERFILE.match(/npm install -g pnpm@(\d+)/)
        expect(match, 'pnpm should be installed with an explicit version').not.toBeNull()
        expect(Number(match![1])).toBe(10)
    })
})
