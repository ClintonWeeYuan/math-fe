import { QuestionBank } from '@/components/questionBank/QuestionBank.tsx'
import { UserLayout } from '@/components/layout/UserLayout.tsx'
import { Seo } from '@/components/Seo.tsx'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import useGetSubjectBySlugQuery from '@/hooks/useGetSubjectBySlugQuery.ts'

/**
 * One topic of a subject: /spm/chemistry/acids-bases-and-salts.
 *
 * A subject page ranks for "SPM Chemistry practice questions"; these rank for
 * what students actually search, which is narrower — "mole concept questions".
 *
 * The bank does its own filtering from the query string, so rather than
 * teaching it a second way to be filtered, this page puts the topic there and
 * lets the existing mechanism work. The canonical stays the clean path.
 */
export function SpmTopicPage() {
    const { slug, topicSlug } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const { data: subject, isLoading, isError } = useGetSubjectBySlugQuery({
        slug: slug ?? '',
    })

    const topic = subject?.topics?.find((t) => t.slug === topicSlug)

    useEffect(() => {
        if (!topic) return
        if (searchParams.getAll('topics').includes(topic.id)) return
        const next = new URLSearchParams(searchParams)
        next.delete('topics')
        next.append('topics', topic.id)
        // replace: arriving here is one navigation, not two.
        setSearchParams(next, { replace: true })
    }, [topic, searchParams, setSearchParams])

    const notFound = isError || (!isLoading && subject && !topic)

    if (notFound) {
        return (
            <UserLayout>
                <div className="py-16 text-center">
                    <h1 className="text-2xl font-semibold">No such topic</h1>
                    <p className="mt-2 text-gray-500">
                        <Link className="underline" to={`/spm/${slug}`}>
                            See all topics for this subject
                        </Link>
                    </p>
                </div>
            </UserLayout>
        )
    }

    return (
        <UserLayout>
            {subject && topic && (
                <Seo
                    title={`${topic.name} — ${subject.name} Questions | JomExam`}
                    description={`Practise ${topic.name} for ${subject.name} — exam-style questions with answers, filterable by difficulty.`}
                    path={`/spm/${slug}/${topicSlug}`}
                />
            )}
            {isLoading || !subject || !topic ? (
                <div className="py-16 text-center text-gray-500">Loading…</div>
            ) : (
                <QuestionBank subjectId={subject.id} />
            )}
        </UserLayout>
    )
}
