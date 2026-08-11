import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The Docker image is where the build's Node version is actually decided,
 * and nothing else in the repo mentions it.
 *
 * Upgrading vite, vitest or react-router quietly raised the floor to Node 20+
 * while the image stayed on 18. Everything passed locally — a developer's own
 * Node is newer — and the only symptom was that production kept serving the
 * previous bundle, because the deploy failed rather than the tests.
 */

const ROOT = join(__dirname, '..', '..')

function dockerNodeMajor(): number {
    const dockerfile = readFileSync(join(ROOT, 'Dockerfile'), 'utf8')
    const match = dockerfile.match(/^FROM node:(\d+)/m)
    if (match === null) throw new Error('No `FROM node:<major>` in the Dockerfile')
    return Number(match[1])
}

/** The lowest major this package will run on, from its engines field. */
function requiredMajor(pkg: string): number | null {
    const path = join(ROOT, 'node_modules', pkg, 'package.json')
    if (!existsSync(path)) return null
    const engines = JSON.parse(readFileSync(path, 'utf8')).engines
    const range: string | undefined = engines?.node
    if (range === undefined) return null

    // A range like "^20.19.0 || >=22.12.0" is satisfied by the *lowest* major
    // it names — that is the floor the image has to clear.
    const majors = [...range.matchAll(/(\d+)\.\d+/g)].map((m) => Number(m[1]))
    return majors.length > 0 ? Math.min(...majors) : null
}

// The packages that run during `pnpm build` and `pnpm test`.
const BUILD_TOOLCHAIN = ['vite', 'vitest', 'react-router-dom', 'typescript']

describe('the Docker image can run the build', () => {
    it.each(BUILD_TOOLCHAIN)('is new enough for %s', (pkg) => {
        const required = requiredMajor(pkg)
        if (required === null) return // no constraint declared

        expect(
            dockerNodeMajor(),
            `Dockerfile builds on Node ${dockerNodeMajor()}, but ${pkg} needs ${required}+. ` +
                `The build passes locally and fails in the image.`
        ).toBeGreaterThanOrEqual(required)
    })

    it('agrees with the engines field this package declares', () => {
        const declared = JSON.parse(
            readFileSync(join(ROOT, 'package.json'), 'utf8')
        ).engines?.node
        expect(declared, 'package.json should declare engines.node').toBeDefined()

        const floor = Number(declared.match(/(\d+)/)![1])
        expect(dockerNodeMajor()).toBeGreaterThanOrEqual(floor)
    })
})
