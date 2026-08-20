import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Input } from '@/components/ui/input.tsx'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import type { DiagnosticQuestionFormValues } from './types.ts'

/**
 * The worked solution, on the question the solution belongs to.
 *
 * Here rather than on a separate authoring surface because the alternative is
 * a deploy: review mode ships before the solutions exist, and they will be
 * written over months by whoever is looking at a question at the time. A field
 * on the form the author is already in is what makes that possible.
 *
 * The preview renders through the same LatexText the student's review uses, so
 * what an author sees while writing is what a student reads — the same
 * property the stem and option editors already rely on.
 */
export function QuestionSolutionFields() {
    const { register, watch } = useFormContext<DiagnosticQuestionFormValues>()
    const solutionText = watch('solutionText')

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4">
            <div>
                <Label htmlFor="solutionVideoUrl">Solution video URL</Label>
                <Input
                    id="solutionVideoUrl"
                    placeholder="https://youtu.be/… (optional)"
                    {...register('solutionVideoUrl')}
                />
                <p className="mt-1 text-xs text-slate-500">
                    A watch, share or embed link — all three work.
                </p>
            </div>

            <div>
                <Label htmlFor="solutionText">Worked solution</Label>
                <Textarea
                    id="solutionText"
                    rows={6}
                    placeholder="Optional. Same LaTeX dialect as the stem: $x^2$ for inline maths."
                    {...register('solutionText')}
                />
            </div>

            {solutionText?.trim() && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                    <LatexText text={solutionText} />
                </div>
            )}
        </div>
    )
}
