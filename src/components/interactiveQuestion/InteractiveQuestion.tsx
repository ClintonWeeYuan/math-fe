import { useEffect, useRef, useState } from 'react'
import { createShapeId, type Editor, Tldraw, type TLShapeId } from 'tldraw'
import {
    type PreviewShape,
    PreviewShapeUtil,
} from '@/components/interactiveQuestion/HtmlShape.tsx'

import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'

type Props = {
    questionHtml: string | null
}

export function InteractiveQuestion({ questionHtml }: Props) {
    const [loading, setLoading] = useState(true)

    const editorRef = useRef<Editor | null>(null)
    const currentShapeId = useRef<TLShapeId | null>(null)

    useEffect(() => {
        if (questionHtml !== null && editorRef.current) {
            if (currentShapeId.current) {
                editorRef.current.updateShape<PreviewShape>({
                    id: currentShapeId.current,
                    type: 'response',
                    isLocked: false,
                })
                editorRef.current.deleteShape(currentShapeId.current)
            }
            const newShapeId = createShapeId()
            currentShapeId.current = newShapeId
            editorRef.current?.createShape<PreviewShape>({
                id: newShapeId,
                type: 'response',
                x: 0,
                y: 0,
                isLocked: true,
                props: {
                    html: questionHtml,
                    h: editorRef.current
                        ?.getContainer()
                        ?.getBoundingClientRect().height,
                    isLoading: false,
                },
            })

            setLoading(false)

            // const { maxX, midY } = editorRef.current.getSelectionPageBounds()!
        }
    }, [questionHtml])

    return (
        <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
            {loading ?? <LoadingPage />}
            <Tldraw
                shapeUtils={[PreviewShapeUtil]}
                onMount={(editor) => {
                    editorRef.current = editor
                }}
                components={{
                    MenuPanel: null,
                }}
            />
        </div>
    )
}
