import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every hook that writes to an admin endpoint must send an Authorization
 * header.
 *
 * This exists because the whole question-manager section was built without
 * one: sixteen mutation hooks and the converter upload called write endpoints
 * unauthenticated, which went unnoticed for as long as the backend didn't
 * check. Adding `require_admin` server-side turns a missing header from
 * invisible into a 403 the admin hits at the worst moment — mid-edit — so the
 * rule is pinned here rather than left to whoever writes the next hook.
 *
 * A file-level check rather than a per-hook test on purpose: the failure mode
 * is a *new* hook forgetting, and only something that walks the directory can
 * catch a file that doesn't exist yet.
 */

const HOOKS_DIR = join(process.cwd(), 'src/hooks')

/**
 * Hooks that legitimately call a write endpoint without an admin token.
 * Each needs a reason — this list is the only way to opt out, so an entry
 * added without one is the thing to question in review.
 */
const PUBLIC_OR_STUDENT: Record<string, string> = {
    'useGenerateHintMutation.ts':
        'student-facing hint on a question in the bank, not an admin action',
    'useUpdateQuestionStatusMutation.ts':
        "student's own progress; reads the token itself rather than via getAuthHeaders",
}

function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) return walk(full)
        return full.endsWith('.ts') && !full.endsWith('.test.ts') ? [full] : []
    })
}

describe('admin mutations send auth headers', () => {
    it('every hook calling a write endpoint sends an Authorization header', () => {
        const offenders: string[] = []

        for (const file of walk(HOOKS_DIR)) {
            const source = readFileSync(file, 'utf8')
            const writes = /\w+(?:Post|Patch|Delete)\(/.test(source)
            if (!writes) continue

            const name = file.slice(HOOKS_DIR.length + 1)
            const base = name.split('/').pop() as string
            if (base in PUBLIC_OR_STUDENT) continue

            if (!source.includes('getAuthHeaders')) offenders.push(name)
        }

        expect(offenders).toEqual([])
    })

    it('the converter upload sends one too', () => {
        // Not a hook: it posts a multipart form with axios directly, so the
        // sweep above can't see it, and it's the single most damaging one to
        // leave open — it writes files into the questions storage bucket.
        const source = readFileSync(
            join(process.cwd(), 'src/components/questionManager/UploadQuestion.tsx'),
            'utf8'
        )
        expect(source).toContain('getAuthHeaders()')
    })
})
