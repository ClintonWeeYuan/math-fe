import { QuestionBank } from '@/components/questionBank/QuestionBank.tsx'
import { UserLayout } from '@/components/layout/UserLayout.tsx'
import { useParams } from 'react-router-dom'

export function QuestionBankPage() {
    const { subjectId } = useParams()

    if (subjectId === undefined) {
        return <div>Subject not found</div>
    }

    return (
        <UserLayout>
            <QuestionBank subjectId={subjectId} />
        </UserLayout>
    )
}
