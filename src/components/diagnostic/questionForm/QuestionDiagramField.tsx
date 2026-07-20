import { useState, type ChangeEvent } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Trash2 } from 'lucide-react'
import type { DiagnosticQuestionResponse } from '@/client'
import type { DiagnosticQuestionFormValues } from './types.ts'

type Props = {
    /** The record being edited (for its existing diagram), if any. */
    initialData?: DiagnosticQuestionResponse
}

/** The optional diagram field: shows the existing diagram on edit, or a
 * paste-SVG / upload-image editor. The svg-touched flag preserves the
 * omit-vs-clear distinction the backend enforces on update. */
export function QuestionDiagramField({ initialData }: Props) {
    const { register, watch, setValue } =
        useFormContext<DiagnosticQuestionFormValues>()
    const [diagramMode, setDiagramMode] = useState<'svg' | 'upload'>('svg')

    const diagramSvg = watch('diagramSvg')
    const diagramSvgTouched = watch('diagramSvgTouched')
    const diagramFile = watch('diagramFile')
    // Untouched + no new file + an existing diagram on the record: show the
    // current diagram (from the last save) rather than a blank editor.
    const showExistingDiagram =
        !diagramSvgTouched && !diagramFile && !!initialData?.diagramUrl

    function handleRemoveDiagram() {
        setValue('diagramSvg', '')
        setValue('diagramSvgTouched', true)
        setValue('diagramFile', null)
        setDiagramMode('svg')
    }

    function handleDiagramFileChange(e: ChangeEvent<HTMLInputElement>) {
        setValue('diagramFile', e.target.files?.[0] ?? null)
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Diagram (optional)</label>
                {(showExistingDiagram || diagramSvgTouched || diagramFile) && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveDiagram}
                    >
                        <Trash2 className="w-4 h-4" /> Remove diagram
                    </Button>
                )}
            </div>

            {showExistingDiagram && initialData?.diagramUrl && (
                <div className="rounded-md border p-3 bg-gray-50">
                    <img
                        src={initialData.diagramUrl}
                        alt="Current diagram"
                        className="max-h-64"
                    />
                </div>
            )}

            {!showExistingDiagram && (
                <>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={diagramMode === 'svg' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDiagramMode('svg')}
                        >
                            Paste SVG
                        </Button>
                        <Button
                            type="button"
                            variant={diagramMode === 'upload' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDiagramMode('upload')}
                        >
                            Upload image
                        </Button>
                    </div>

                    {diagramMode === 'svg' && (
                        <div className="grid grid-cols-2 gap-4">
                            <Textarea
                                rows={6}
                                placeholder="<svg ...>...</svg>"
                                {...register('diagramSvg', {
                                    onChange: () =>
                                        setValue('diagramSvgTouched', true),
                                })}
                            />
                            <div className="rounded-md border p-3 bg-gray-50 text-sm overflow-auto">
                                {diagramSvg ? (
                                    <div dangerouslySetInnerHTML={{ __html: diagramSvg }} />
                                ) : (
                                    <span className="text-gray-400">Preview</span>
                                )}
                            </div>
                        </div>
                    )}

                    {diagramMode === 'upload' && (
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleDiagramFileChange}
                        />
                    )}

                    {diagramFile && (
                        <span className="text-sm text-gray-500">
                            Selected: {diagramFile.name}
                        </span>
                    )}
                </>
            )}
        </div>
    )
}
