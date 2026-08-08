import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ClipLoader } from 'react-spinners'
import useAdminOverviewQuery from '@/hooks/useAdminOverviewQuery.ts'

/**
 * The admin landing page.
 *
 * This was a read-only student view of Additional Mathematics with the subject
 * id written into the source — sensible when Add Maths was the only subject,
 * misleading once there were three, a review workflow and a publish gate. It
 * showed one subject's published questions and offered nothing to do with them.
 *
 * What it shows now is what exists and what is waiting: anything sitting in
 * draft is a link to the screen where you act on it.
 */
export function AdminOverviewPage() {
    const { data, isLoading, isError } = useAdminOverviewQuery()

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center py-24">
                    <ClipLoader />
                </div>
            </AdminLayout>
        )
    }

    if (isError || !data) {
        return (
            <AdminLayout>
                <div className="py-24 text-center">
                    <h1 className="text-2xl font-semibold">
                        Couldn't load the overview
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        If you've just signed in, try refreshing.
                    </p>
                </div>
            </AdminLayout>
        )
    }

    // Only surfaced when there is something to act on: a dashboard that always
    // shows "0 awaiting review" trains you to stop reading it.
    const waiting = [
        data.diagnosticQuestionsDraft > 0 && {
            label: `${data.diagnosticQuestionsDraft} diagnostic question${data.diagnosticQuestionsDraft === 1 ? '' : 's'} in draft`,
            to: '/admin/questions',
        },
        data.diagnosticSetsDraft > 0 && {
            label: `${data.diagnosticSetsDraft} diagnostic set${data.diagnosticSetsDraft === 1 ? '' : 's'} unpublished`,
            to: '/admin/sets',
        },
        data.waitlistSignups > 0 && {
            label: `${data.waitlistSignups} waitlist signup${data.waitlistSignups === 1 ? '' : 's'}`,
            to: '/admin/waitlist',
        },
    ].filter(Boolean) as { label: string; to: string }[]

    return (
        <AdminLayout>
            <div className="mt-8 space-y-4">
                <div>
                    <h1 className="text-2xl font-semibold">Overview</h1>
                    <p className="text-muted-foreground">
                        What's on the site, and what's waiting on you.
                    </p>
                </div>

                {waiting.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Waiting on you</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {waiting.map((item) => (
                                <Link key={item.to} to={item.to}>
                                    <Button variant="outline" size="sm">
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>SPM subjects</CardTitle>
                        <CardDescription>
                            Students only see published subjects, and only their
                            published questions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {data.subjects.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No subjects yet.
                            </p>
                        )}
                        {data.subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="flex flex-wrap items-center gap-2 rounded-md border p-3"
                            >
                                <span className="font-medium">
                                    {subject.name}
                                </span>
                                <Badge
                                    variant={
                                        subject.isPublished
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {subject.isPublished ? 'Live' : 'Not published'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {subject.topicCount} topics ·{' '}
                                    {subject.publishedQuestions} published
                                    {subject.draftQuestions > 0 &&
                                        ` · ${subject.draftQuestions} draft`}
                                </span>
                                <div className="ml-auto flex gap-2">
                                    {/* The student view, but only where there
                                        is one — an unpublished subject has no
                                        public page to link to. */}
                                    {subject.isPublished && subject.slug && (
                                        <Link to={`/spm/${subject.slug}`}>
                                            <Button variant="ghost" size="sm">
                                                Student view
                                            </Button>
                                        </Link>
                                    )}
                                    <Link to="/syllabus">
                                        <Button variant="outline" size="sm">
                                            Manage
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Diagnostics</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-3">
                        <Badge variant="default">
                            {data.diagnosticSetsPublished} published
                        </Badge>
                        <Badge variant="secondary">
                            {data.diagnosticSetsDraft} draft
                        </Badge>
                        <Link to="/admin/sets" className="ml-auto">
                            <Button variant="outline" size="sm">
                                Diagnostic sets
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
