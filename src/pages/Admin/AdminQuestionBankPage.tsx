import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { QuestionBank } from '@/components/questionBank/QuestionBank.tsx'

export function AdminQuestionBankPage() {
    return (
        <AdminLayout>
            <QuestionBank />
        </AdminLayout>
    )
}
