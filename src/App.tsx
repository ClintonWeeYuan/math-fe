import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { SpmSubjectPage } from '@/pages/SpmSubjectPage.tsx'
import { SpmTopicPage } from '@/pages/SpmTopicPage.tsx'
import { LegacySubjectRedirect } from '@/components/routing/LegacySubjectRedirect.tsx'
import { QuestionManagerPage } from '@/pages/Admin/QuestionManagerPage.tsx'
import { SandboxPage } from '@/pages/SandboxPage.tsx'
import { SyllabusPage } from '@/pages/Admin/SyllabusPage.tsx'
import { SubjectPage } from '@/pages/Admin/SubjectPage.tsx'
import { PaperInstancePage } from '@/pages/Admin/PaperInstancePage.tsx'
import { AdminOverviewPage } from '@/pages/Admin/AdminOverviewPage.tsx'
import { InteractiveQuestionPage } from '@/pages/InteractiveQuestionPage.tsx'
import { AdminLoginPage } from '@/pages/Auth/AdminLoginPage.tsx'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute.tsx'
import { SignupPage } from '@/pages/Auth/SignupPage.tsx'
import { LoginPage } from '@/pages/Auth/LoginPage.tsx'
import { VerificationPage } from '@/pages/Auth/VerificationPage.tsx'
import { MoreInfoFormPage } from '@/pages/Auth/MoreInfoFormPage.tsx'
import { useEffect } from 'react'
import { LandingPage } from '@/pages/LandingPage.tsx'
import { AdmissionsPickerPage } from '@/pages/AdmissionsPickerPage.tsx'
import SubjectsPage from '@/pages/SubjectsPage.tsx'
import { AboutPage } from '@/pages/AboutPage.tsx'
import { EsatTmuaPage } from '@/pages/EsatTmuaPage.tsx'
import { DiagnosticsCatalogPage } from '@/pages/DiagnosticsCatalogPage.tsx'
import { GuidesIndexPage } from '@/pages/GuidesIndexPage.tsx'
import { EsatPracticeGuidePage } from '@/pages/EsatPracticeGuidePage.tsx'
import { EsatPastPapersPage } from '@/pages/EsatPastPapersPage.tsx'
import { EsatMaths1Page } from '@/pages/EsatMaths1Page.tsx'
import { EsatMaths2Page } from '@/pages/EsatMaths2Page.tsx'
import { EsatPhysicsPage } from '@/pages/EsatPhysicsPage.tsx'
import { EsatChemistryPage } from '@/pages/EsatChemistryPage.tsx'
import { EsatBiologyPage } from '@/pages/EsatBiologyPage.tsx'
import { TmuaPracticeGuidePage } from '@/pages/TmuaPracticeGuidePage.tsx'
import { StudentProtectedRoute } from '@/components/auth/StudentProtectedRoute.tsx'
import { DiagnosticQuestionsListPage } from '@/pages/Admin/Diagnostic/DiagnosticQuestionsListPage.tsx'
import { DiagnosticSetPreviewPage } from '@/pages/Admin/Diagnostic/DiagnosticSetPreviewPage.tsx'
import { DiagnosticSetsListPage } from '@/pages/Admin/Diagnostic/DiagnosticSetsListPage.tsx'
import { DiagnosticSetCreatePage } from '@/pages/Admin/Diagnostic/DiagnosticSetCreatePage.tsx'
import { DiagnosticSetQuestionsPage } from '@/pages/Admin/Diagnostic/DiagnosticSetQuestionsPage.tsx'
import { DiagnosticSetReviewPage } from '@/pages/Admin/Diagnostic/DiagnosticSetReviewPage.tsx'
import { DiagnosticSubjectsPage } from '@/pages/Admin/Diagnostic/DiagnosticSubjectsPage.tsx'
import { DiagnosticResultsPage } from '@/pages/Admin/Diagnostic/DiagnosticResultsPage.tsx'
import { WaitlistPage } from '@/pages/Admin/Diagnostic/WaitlistPage.tsx'
import { DiagnosticAdminReportPage } from '@/pages/Admin/Diagnostic/DiagnosticAdminReportPage.tsx'
import { DiagnosticQuestionCreatePage } from '@/pages/Admin/Diagnostic/DiagnosticQuestionCreatePage.tsx'
import { DiagnosticQuestionEditPage } from '@/pages/Admin/Diagnostic/DiagnosticQuestionEditPage.tsx'
import { SetInstructionsPage } from '@/pages/Diagnostic/SetInstructionsPage.tsx'
import { ExamPage } from '@/pages/Diagnostic/ExamPage.tsx'
import { DiagnosticReportPage } from '@/pages/Diagnostic/DiagnosticReportPage.tsx'

/** The v2 quiz routes are retired: the guided-quiz UI only works for
 * subjects with authored MCQ options (Modern Maths: 507/513; Add Math:
 * 0/560), so the browsable bank is the one SPM experience. Old links and
 * bookmarks land on the bank for the same subject. The v3 quiz components
 * stay in the tree, parked for the future drill tier. */
function LegacyQuizRedirect() {
    const { subjectId } = useParams()
    return <Navigate to={`/questions/${subjectId}`} replace />
}

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
                {/* The revision track is SPM-only now (we specialise in
                    ESAT & TMUA rather than A-Level/IB), so the picker is
                    gone; crawled /revision URLs land on the subjects page. */}
                <Route
                    path="revision"
                    element={<Navigate to="/subjects" replace />}
                />
                <Route
                    path="admissions"
                    element={<AdmissionsPickerPage />}
                />
                <Route path="about" element={<AboutPage />} />
                <Route path="esat-tmua" element={<EsatTmuaPage />} />
                <Route path="diagnostics" element={<DiagnosticsCatalogPage />} />
                {/* Guides are written to be found in search, so they are
                    prerendered in full — see scripts/prerender.mjs. */}
                <Route path="guides" element={<GuidesIndexPage />} />
                <Route
                    path="guides/esat-practice-tests"
                    element={<EsatPracticeGuidePage />}
                />
                <Route
                    path="guides/esat-past-papers"
                    element={<EsatPastPapersPage />}
                />
                <Route
                    path="guides/esat-maths-1"
                    element={<EsatMaths1Page />}
                />
                <Route
                    path="guides/esat-maths-2"
                    element={<EsatMaths2Page />}
                />
                <Route
                    path="guides/esat-physics"
                    element={<EsatPhysicsPage />}
                />
                <Route
                    path="guides/esat-chemistry"
                    element={<EsatChemistryPage />}
                />
                <Route
                    path="guides/esat-biology"
                    element={<EsatBiologyPage />}
                />
                <Route
                    path="guides/tmua-practice-tests"
                    element={<TmuaPracticeGuidePage />}
                />
                {/* ESAT and TMUA are separate products, so each has its own
                    catalogue page (own heading, copy and search metadata);
                    /diagnostics stays as the combined listing. */}
                <Route
                    path="diagnostics/esat"
                    element={<DiagnosticsCatalogPage test="esat" />}
                />
                <Route
                    path="diagnostics/tmua"
                    element={<DiagnosticsCatalogPage test="tmua" />}
                />
                <Route path="subjects" element={<SubjectsPage />} />
                <Route path="spm/:slug" element={<SpmSubjectPage />} />
                <Route
                    path="spm/:slug/:topicSlug"
                    element={<SpmTopicPage />}
                />
                {/* The old uuid URLs have been shared and may be indexed, so
                    they redirect rather than 404. */}
                <Route
                    path="questions/:subjectId"
                    element={<LegacySubjectRedirect />}
                />
                <Route
                    path="questions/v2/:subjectId"
                    element={<LegacyQuizRedirect />}
                />
                <Route
                    path="questions/v2/:subjectId/quiz"
                    element={<LegacyQuizRedirect />}
                />
                <Route element={<StudentProtectedRoute />}>
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
                    <Route path="/admin" element={<AdminOverviewPage />} />
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
                    <Route path="admin/results" element={<DiagnosticResultsPage />} />
                    <Route path="admin/waitlist" element={<WaitlistPage />} />
                    <Route
                        path="admin/attempts/:attemptId/report"
                        element={<DiagnosticAdminReportPage />}
                    />
                    <Route path="admin/sets/new" element={<DiagnosticSetCreatePage />} />
                    <Route
                        path="admin/sets/:setId/questions"
                        element={<DiagnosticSetQuestionsPage />}
                    />
                    <Route
                        path="admin/sets/:setId/preview"
                        element={<DiagnosticSetReviewPage />}
                    />
                    <Route
                        path="admin/sets/:setId/student-view"
                        element={<DiagnosticSetPreviewPage />}
                    />
                </Route>
            </Routes>
        </>
    )
}

export default App
