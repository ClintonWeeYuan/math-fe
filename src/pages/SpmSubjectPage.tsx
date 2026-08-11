import { QuestionBank } from '@/components/questionBank/QuestionBank.tsx'
import { UserLayout } from '@/components/layout/UserLayout.tsx'
import { Seo } from '@/components/Seo.tsx'
import { useParams, Link } from 'react-router-dom'
import useGetSubjectBySlugQuery from '@/hooks/useGetSubjectBySlugQuery.ts'
import { GuideLinks } from '@/components/guides/GuideLinks.tsx'

/**
 * The public question bank at /spm/{slug}.
 *
 * Replaces /questions/{uuid}, which was unreadable and — worse — served the
 * prerendered homepage, canonical tag included, so all three subject pages
 * told search engines they were duplicates of the front page.
 */
export function SpmSubjectPage() {
    const { slug } = useParams()
    const { data: subject, isLoading, isError } = useGetSubjectBySlugQuery({
        slug: slug ?? '',
    })

    if (isError) {
        return (
            <UserLayout>
                <div className="py-16 text-center">
                    <h1 className="text-2xl font-semibold">
                        No such subject
                    </h1>
                    <p className="mt-2 text-gray-500">
                        <Link className="underline" to="/subjects">
                            See the subjects we offer
                        </Link>
                    </p>
                </div>
            </UserLayout>
        )
    }

    return (
        <UserLayout>
            {subject && (
                <Seo
                    title={`${subject.name} Practice Questions | JomExam`}
                    description={`Practise ${subject.name} by topic and difficulty — exam-style questions for SPM, free to work through at your own pace.`}
                    path={`/spm/${slug}`}
                />
            )}
            {/* The bank needs an id; rendering it before the slug resolves
                would fire a request for subject "undefined". */}
            {isLoading || !subject ? (
                <div className="py-16 text-center text-gray-500">Loading…</div>
            ) : (
                <QuestionBank subjectId={subject.id} />
            )}
            <GuideLinks />
            </UserLayout>
    )
}
