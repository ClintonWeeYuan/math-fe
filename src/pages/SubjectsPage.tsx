import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo.tsx'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ArrowRight,
    Atom,
    BookOpen,
    Calculator,
    FlaskConical,
    Leaf,
    TrendingUp,
} from 'lucide-react'
import type { ElementType } from 'react'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import usePublishedSubjectsQuery from '@/hooks/usePublishedSubjectsQuery.ts'
import type { PublishedSubject } from '@/client'

type Presentation = {
    icon: ElementType
    gradient: string
    description: string
}

/**
 * How a subject looks on its card.
 *
 * Presentation is a design decision, not data — there is no sensible column
 * for "which lucide icon". Keyed by subject name, with a fallback, so a
 * subject created in the admin appears immediately with a reasonable default
 * rather than not appearing at all. That was the previous failure: the whole
 * list lived here, so a subject nobody had hand-written was invisible.
 */
const PRESENTATION: Record<string, Presentation> = {
    'Modern Mathematics': {
        icon: Calculator,
        gradient: 'from-blue-500 to-cyan-500',
        description: 'Master fundamental mathematics concepts for SPM',
    },
    'Additional Mathematics': {
        icon: TrendingUp,
        gradient: 'from-purple-500 to-pink-500',
        description: 'Advanced mathematics for SPM Additional Mathematics',
    },
    'SPM Chemistry': {
        icon: FlaskConical,
        gradient: 'from-emerald-500 to-teal-500',
        description: 'Practise SPM Chemistry chapter by chapter',
    },
    'SPM Physics': {
        icon: Atom,
        gradient: 'from-orange-500 to-amber-500',
        description: 'Practise SPM Physics chapter by chapter',
    },
    'SPM Biology': {
        icon: Leaf,
        gradient: 'from-lime-500 to-green-500',
        description: 'Practise SPM Biology chapter by chapter',
    },
}

const DEFAULT_PRESENTATION: Presentation = {
    icon: BookOpen,
    gradient: 'from-slate-500 to-slate-600',
    description: 'Practise by topic and difficulty',
}

function presentationFor(name: string): Presentation {
    return PRESENTATION[name] ?? DEFAULT_PRESENTATION
}

function SubjectCard({ subject }: { subject: PublishedSubject }) {
    const { icon: Icon, gradient, description } = presentationFor(subject.name)

    return (
        <Link to={`/questions/${subject.id}`}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-xl hover:scale-105 group">
                <CardHeader>
                    <div
                        className={`h-16 w-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                        <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{subject.name}</CardTitle>
                    <CardDescription className="text-base">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <Badge variant="secondary">
                                {subject.topicCount} topics
                            </Badge>
                            <Badge variant="secondary">
                                {subject.questionCount} questions
                            </Badge>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

function SubjectsGrid() {
    const { data: subjects, isLoading, isError } = usePublishedSubjectsQuery()

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Choose Your Subject
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Select a subject to start practicing. Each subject has
                        comprehensive topics aligned with the SPM syllabus.
                    </p>
                </div>

                {isLoading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[0, 1, 2].map((i) => (
                            <Card key={i} className="h-56 animate-pulse">
                                <CardHeader>
                                    <div className="h-16 w-16 rounded-xl bg-slate-200 mb-4" />
                                    <div className="h-6 w-40 bg-slate-200 rounded" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}

                {isError && (
                    <p className="text-center text-slate-600">
                        Couldn't load subjects just now. Please refresh to try
                        again.
                    </p>
                )}

                {!isLoading && !isError && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(subjects ?? []).map((subject) => (
                            <SubjectCard key={subject.id} subject={subject} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SubjectsPage({ embedded }: { embedded?: boolean }) {
    if (embedded) return <SubjectsGrid />
    return (
        <LandingLayout>
            <Seo
                title="SPM Practice by Subject | JomExam"
                description="Practise SPM Mathematics, Additional Mathematics and Chemistry by topic and difficulty — real exam-style questions for Malaysian Form 4–5 students, with more STEM subjects on the way."
                path="/subjects"
            />
            <SubjectsGrid />
        </LandingLayout>
    )
}
