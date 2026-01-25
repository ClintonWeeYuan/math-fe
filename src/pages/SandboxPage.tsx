import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Plot } from '@/components/sandbox/plot.tsx'
import { DetailedExplanation } from '@/components/sandbox/detailedExplanation.tsx'

export function SandboxPage() {
    return (
        <AdminLayout>
            <div className="mt-10">
                <InlineMath>\int_0^\infty x^2 dx</InlineMath>
                <BlockMath math=""></BlockMath>
            </div>

            <div className="mt-10">
                <Plot />
            </div>
            <div className="relative mt-10 h-[600px] my-20">
                <DetailedExplanation />
            </div>
        </AdminLayout>
    )
}
