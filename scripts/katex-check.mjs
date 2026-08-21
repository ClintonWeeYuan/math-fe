/**
 * Render every piece of authored maths through KaTeX and fail on any error.
 *
 *   node scripts/katex-check.mjs path/to/content.json
 *
 * The content file is one array of {id, field, text}, exported from the
 * database by math-be/scripts/export_renderable_content.py. It lives outside
 * this repo's build because the strings live in the database, not in source —
 * which is also why this is a script you point at an export rather than a
 * vitest file: a test that needs production credentials is a test that fails
 * in CI for reasons that have nothing to do with the code.
 *
 * What it catches is the class of thing nobody notices until a student does:
 * a stem that renders a red katex-error span in the middle of a question
 * under exam conditions. The parser in LatexText decides which fragments are
 * maths; this hands those fragments to the same KaTeX that will render them.
 */
import { readFileSync } from 'node:fs'
import katex from 'katex'
import { parseLatexText } from '../src/components/diagnostic/latexParser.ts'

const file = process.argv[2]
if (!file) {
    console.error('usage: node scripts/katex-check.mjs <content.json>')
    process.exit(2)
}

const items = JSON.parse(readFileSync(file, 'utf8'))
const failures = []
let fragments = 0

for (const item of items) {
    let nodes
    try {
        nodes = parseLatexText(item.text)
    } catch (error) {
        failures.push({ ...item, fragment: '(whole string)', error: String(error) })
        continue
    }
    // Only the fragments the app will actually hand to KaTeX. Prose is not
    // maths and must not be judged as if it were.
    const maths = collectMaths(nodes)
    for (const fragment of maths) {
        fragments += 1
        try {
            katex.renderToString(fragment, { throwOnError: true, displayMode: false })
        } catch (error) {
            failures.push({
                ...item,
                fragment,
                error: String(error).split('\n')[0].slice(0, 160),
            })
        }
    }
}

function collectMaths(nodes) {
    const out = []
    for (const node of nodes ?? []) {
        if (node.kind === 'inlineMath' || node.kind === 'blockMath') out.push(node.value)
        if (node.kind === 'list') for (const item of node.items) out.push(...collectMaths(item))
    }
    return out
}

console.log(
    `checked ${fragments} maths fragments across ${items.length} strings`
)
if (failures.length === 0) {
    console.log('no KaTeX errors')
    process.exit(0)
}

console.log(`\n${failures.length} KaTeX failure(s):\n`)
for (const f of failures.slice(0, 40)) {
    console.log(`  ${f.id}  ${f.field}`)
    console.log(`    fragment: ${f.fragment.slice(0, 100)}`)
    console.log(`    ${f.error}`)
}
if (failures.length > 40) console.log(`  ... and ${failures.length - 40} more`)
process.exit(1)
