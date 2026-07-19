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
import { SignupPage } from '@/pages/Auth/SignupPage.tsx'
import { LoginPage } from '@/pages/Auth/LoginPage.tsx'
import { VerificationPage } from '@/pages/Auth/VerificationPage.tsx'
import { MoreInfoFormPage } from '@/pages/Auth/MoreInfoFormPage.tsx'
import { useEffect } from 'react'
import { LandingPage } from '@/pages/LandingPage.tsx'
import SubjectsPage from '@/pages/SubjectsPage.tsx'
import { QuizGeneratorPage } from '@/pages/v3/QuizGeneratorPage.tsx'
import { QuizPage } from './components/questionBank/v3/Quiz'
import { AboutPage } from '@/pages/AboutPage.tsx'
import { EsatTmuaPage } from '@/pages/EsatTmuaPage.tsx'
import { StudentProtectedRoute } from '@/components/auth/StudentProtectedRoute.tsx'
import { DiagnosticQuestionsListPage } from '@/pages/Admin/Diagnostic/DiagnosticQuestionsListPage.tsx'
import { DiagnosticSetsListPage } from '@/pages/Admin/Diagnostic/DiagnosticSetsListPage.tsx'
import { DiagnosticSetCreatePage } from '@/pages/Admin/Diagnostic/DiagnosticSetCreatePage.tsx'
import { DiagnosticSetQuestionsPage } from '@/pages/Admin/Diagnostic/DiagnosticSetQuestionsPage.tsx'
import { DiagnosticSetReviewPage } from '@/pages/Admin/Diagnostic/DiagnosticSetReviewPage.tsx'
import { DiagnosticSubjectsPage } from '@/pages/Admin/Diagnostic/DiagnosticSubjectsPage.tsx'
import { DiagnosticSkillsPage } from '@/pages/Admin/Diagnostic/DiagnosticSkillsPage.tsx'
import { DiagnosticQuestionCreatePage } from '@/pages/Admin/Diagnostic/DiagnosticQuestionCreatePage.tsx'
import { DiagnosticQuestionEditPage } from '@/pages/Admin/Diagnostic/DiagnosticQuestionEditPage.tsx'
import { SetInstructionsPage } from '@/pages/Diagnostic/SetInstructionsPage.tsx'
import { ExamPage } from '@/pages/Diagnostic/ExamPage.tsx'
import { DiagnosticReportPage } from '@/pages/Diagnostic/DiagnosticReportPage.tsx'

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
                <Route path="about" element={<AboutPage />} />
                <Route path="esat-tmua" element={<EsatTmuaPage />} />
                <Route path="subjects" element={<SubjectsPage />} />
                <Route
                    path="questions/:subjectId"
                    element={<QuestionBankPage />}
                />
                <Route element={<StudentProtectedRoute />}>
                    <Route
                        path="questions/v2/:subjectId"
                        element={<QuizGeneratorPage />}
                    />
                    <Route
                        path="questions/v2/:subjectId/quiz"
                        element={<QuizPage />}
                    />
                    <Route
                        path="diagnostic/sets/:setId"
                        element={<SetInstructionsPage />}
                    />
                    <Route
                        path="diagnostic/attempts/:attemptId"
                        element={<ExamPage />}
                    />
                    <Route
                        path="diagnostic/attempts/:attemptId/report"
                        element={<DiagnosticReportPage />}
                    />
                </Route>
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
                    <Route
                        path="admin/questions"
                        element={<DiagnosticQuestionsListPage />}
                    />
                    <Route
                        path="admin/questions/new"
                        element={<DiagnosticQuestionCreatePage />}
                    />
                    <Route
                        path="admin/questions/:questionId"
                        element={<DiagnosticQuestionEditPage />}
                    />
                    <Route path="admin/sets" element={<DiagnosticSetsListPage />} />
                    <Route path="admin/subjects" element={<DiagnosticSubjectsPage />} />
                    <Route path="admin/skills" element={<DiagnosticSkillsPage />} />
                    <Route path="admin/sets/new" element={<DiagnosticSetCreatePage />} />
                    <Route
                        path="admin/sets/:setId/questions"
                        element={<DiagnosticSetQuestionsPage />}
                    />
                    <Route
                        path="admin/sets/:setId/preview"
                        element={<DiagnosticSetReviewPage />}
                    />
                </Route>
            </Routes>
        </>
    )
}

export default App
