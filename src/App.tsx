import { Route, Routes } from 'react-router-dom'
import { QuestionBankPage } from '@/pages/QuestionBankPage.tsx'
import { QuestionManagerPage } from '@/pages/Admin/QuestionManagerPage.tsx'
import { SandboxPage } from '@/pages/SandboxPage.tsx'
import { SyllabusPage } from '@/pages/Admin/SyllabusPage.tsx'
import { SubjectPage } from '@/pages/Admin/SubjectPage.tsx'
import { PaperInstancePage } from '@/pages/Admin/PaperInstancePage.tsx'
import { AdminQuestionBankPage } from '@/pages/Admin/AdminQuestionBankPage.tsx'
import { InteractiveQuestionPage } from '@/pages/InteractiveQuestionPage.tsx'
import { AdminLoginPage } from '@/pages/Auth/AdminLoginPage.tsx'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute.tsx'
import { QuestionBankPageV2 } from '@/pages/v2/QuestionBankPageV2.tsx'
import { QuestionByTopicPage } from '@/pages/v2/QuestionByTopicPage.tsx'
import { SignupPage } from '@/pages/Auth/SignupPage.tsx'
import { LoginPage } from '@/pages/Auth/LoginPage.tsx'
import { VerificationPage } from '@/pages/Auth/VerificationPage.tsx'
import { MoreInfoFormPage } from '@/pages/Auth/MoreInfoFormPage.tsx'
import { useEffect } from 'react'
import { LandingPage } from '@/pages/LandingPage.tsx'
import SubjectsPage from '@/pages/SubjectsPage.tsx'
import { QuizGeneratorPage } from '@/pages/v3/QuizGeneratorPage.tsx'
import { QuizPage } from './components/questionBank/v3/Quiz'

function App() {
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            const script = document.createElement('script')
            script.defer = true
            script.src =
                'https://umami-production-4f87.up.railway.app/script.js'
            script.setAttribute(
                'data-website-id',
                'aa5b3327-c964-4dd9-8ce8-bdca13e78c03'
            )
            document.head.appendChild(script)

            return () => {
                // Cleanup: remove script when component unmounts
                document.head.removeChild(script)
            }
        }
    }, [])

    return (
        <>
            <Routes>
                <Route path="" element={<LandingPage />} />
                <Route path="subjects" element={<SubjectsPage />} />
                <Route
                    path="questions/:subjectId"
                    element={<QuestionBankPage />}
                />
                <Route path="v2" element={<QuestionBankPageV2 />} />
                <Route
                    path="questions/v2/:subjectId"
                    element={<QuizGeneratorPage />}
                />
                <Route
                    path="questions/v2/:subjectId/quiz"
                    element={<QuizPage />}
                />
                <Route path="v2/:topicId" element={<QuestionByTopicPage />} />
                <Route path="admin/login" element={<AdminLoginPage />} />
                <Route path="/auth">
                    <Route path="signup" element={<SignupPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="verify" element={<VerificationPage />} />
                    <Route path="more-info" element={<MoreInfoFormPage />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<AdminQuestionBankPage />} />
                    <Route path="syllabus" element={<QuestionManagerPage />} />
                    <Route
                        path="syllabus/:syllabusId"
                        element={<SyllabusPage />}
                    />
                    <Route
                        path="syllabus/:syllabusId/subject/:subjectId"
                        element={<SubjectPage />}
                    />
                    <Route
                        path="syllabus/:syllabusId/subject/:subjectId/paperInstance/:paperInstanceId"
                        element={<PaperInstancePage />}
                    />
                    <Route path="sandbox" element={<SandboxPage />} />
                    <Route
                        path="interactive"
                        element={<InteractiveQuestionPage />}
                    />
                </Route>
            </Routes>
        </>
    )
}

export default App
