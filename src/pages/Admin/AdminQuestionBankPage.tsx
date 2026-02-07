import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { QuestionBank } from '@/components/questionBank/QuestionBank.tsx'

export function AdminQuestionBankPage() {
    const ADD_MATHS_ID = '00246712-44e0-415e-aa87-d0e8c70e94d9'
    return (
        <AdminLayout>
            <QuestionBank subjectId={ADD_MATHS_ID} />
        </AdminLayout>
    )
}
