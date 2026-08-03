import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import useGetQuestionQuery from '@/hooks/useGetQuestionQuery.ts'
import { createShapeId, type Editor, Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import {
    type PreviewShape,
    PreviewShapeUtil,
} from '@/components/interactiveQuestion/HtmlShape.tsx'
import { useEffect, useRef, useState } from 'react'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'

export function InteractiveQuestionPage() {
    const { data } = useGetQuestionQuery({
        questionId: '0678ab38-2aca-44b3-8335-4b9ef1843f0b',
    })
    const [loading, setLoading] = useState(true)

    const editorRef = useRef<Editor | null>(null)

    useEffect(() => {
        // Null for a question authored as text: there is no HTML asset to
        // load onto the canvas, so the interactive view has nothing to show.
        if (data?.questionUrl && editorRef.current) {
            const newShapeId = createShapeId()

            fetch(data.questionUrl)
                .then((response) => response.text())
                .then((html) => {
                    const style =
                        '<style>html, body { background: transparent !important; color: inherit !important; }</style>'
                    let finalHtml = html
                    if (html.includes('</head>')) {
                        finalHtml = html.replace('</head>', `${style}</head>`)
                    } else {
                        finalHtml = style + html
                    }

                    editorRef.current?.createShape<PreviewShape>({
                        id: newShapeId,
                        type: 'response',
                        x: 300,
                        y: 0,
                        isLocked: true,
                        props: {
                            html: finalHtml,
                            h: editorRef.current
                                ?.getContainer()
                                ?.getBoundingClientRect().height,
                        },
                    })
                    setLoading(false)
                })
                .catch((error) => {
                    console.error('Error fetching HTML:', error)
                })
            // const { maxX, midY } = editorRef.current.getSelectionPageBounds()!
        }
    })

    return (
        <AdminLayout>
            <div style={{ position: 'fixed', inset: 0 }}>
                {loading ?? <LoadingPage />}
                <Tldraw
                    shapeUtils={[PreviewShapeUtil]}
                    onMount={(editor) => {
                        editorRef.current = editor
                    }}
                />
            </div>
        </AdminLayout>
    )
}
