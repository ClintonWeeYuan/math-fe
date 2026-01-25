import { QuestionBank } from '@/components/questionBank/QuestionBank.tsx'
import { UserLayout } from '@/components/layout/UserLayout.tsx'

export function QuestionBankPage() {
    return (
        <UserLayout>
            <QuestionBank />
        </UserLayout>
    )
}
