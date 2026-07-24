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
import { ArrowRight, Calculator, TrendingUp } from 'lucide-react'
import type { ElementType } from 'react'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import useGetTopicsBySubjectQuery from '@/hooks/useGetTopicsBySubjectQuery.ts'

interface Topic {
    id: string
    title: string
    description: string
    icon: ElementType
    color: string
    questions: number
}

interface Subject {
    id: string
    name: string
    description: string
    icon: ElementType
    color: string
    gradient: string
    topics: Topic[]
    url: string
}

export const subjectsPage: Subject[] = [
    {
        id: '8d4a1938-789f-4c57-96b2-1c079941a59e',
        url: '/questions/8d4a1938-789f-4c57-96b2-1c079941a59e',
        name: 'Mathematics',
        description: 'Master fundamental mathematics concepts for SPM',
        icon: Calculator,
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-500',
        topics: [
            {
                id: 'algebra',
                title: 'Algebra',
                description:
                    'Master algebraic expressions, factorization, and expansions',
                icon: Calculator,
                color: 'bg-blue-100 text-blue-600',
                questions: 250,
            },
            {
                id: 'functions',
                title: 'Functions',
                description:
                    'Understand function concepts, composite and inverse functions',
                icon: TrendingUp,
                color: 'bg-purple-100 text-purple-600',
                questions: 180,
            },
            {
                id: 'quadratic',
                title: 'Quadratic Equations',
                description:
                    'Solve quadratic equations, inequalities, and graph quadratic functions',
                icon: TrendingUp,
                color: 'bg-green-100 text-green-600',
                questions: 200,
            },
            {
                id: 'simultaneous',
                title: 'Simultaneous Equations',
                description:
                    'Learn to solve two or three linear equations simultaneously',
                icon: Calculator,
                color: 'bg-orange-100 text-orange-600',
                questions: 150,
            },
            {
                id: 'indices',
                title: 'Indices & Logarithms',
                description:
                    'Master laws of indices and logarithmic operations',
                icon: TrendingUp,
                color: 'bg-yellow-100 text-yellow-600',
                questions: 120,
            },
            {
                id: 'coordinate',
                title: 'Coordinate Geometry',
                description:
                    'Study points, lines, and geometric shapes on coordinate planes',
                icon: Calculator,
                color: 'bg-red-100 text-red-600',
                questions: 170,
            },
            {
                id: 'statistics',
                title: 'Statistics',
                description:
                    'Analyze data with mean, median, mode, and standard deviation',
                icon: TrendingUp,
                color: 'bg-indigo-100 text-indigo-600',
                questions: 160,
            },
            {
                id: 'probability',
                title: 'Probability',
                description:
                    'Calculate probabilities and understand probability distributions',
                icon: Calculator,
                color: 'bg-pink-100 text-pink-600',
                questions: 140,
            },
        ],
    },
    {
        url: '/questions/00246712-44e0-415e-aa87-d0e8c70e94d9',
        id: '00246712-44e0-415e-aa87-d0e8c70e94d9',
        name: 'Add Math',
        description: 'Advanced mathematical concepts and techniques',
        icon: TrendingUp,
        color: 'purple',
        gradient: 'from-purple-500 to-pink-500',
        topics: [
            {
                id: 'functions',
                title: 'Functions',
                description:
                    'Advanced function concepts including absolute value and composite functions',
                icon: TrendingUp,
                color: 'bg-purple-100 text-purple-600',
                questions: 180,
            },
            {
                id: 'quadratic-equations',
                title: 'Quadratic Equations',
                description:
                    'Advanced quadratic equations and their applications',
                icon: Calculator,
                color: 'bg-pink-100 text-pink-600',
                questions: 200,
            },
            {
                id: 'indices-logarithms',
                title: 'Indices & Logarithms',
                description: 'Complex indices and logarithmic equations',
                icon: TrendingUp,
                color: 'bg-violet-100 text-violet-600',
                questions: 150,
            },
            {
                id: 'coordinate-geometry',
                title: 'Coordinate Geometry',
                description: 'Advanced topics in analytical geometry',
                icon: Calculator,
                color: 'bg-fuchsia-100 text-fuchsia-600',
                questions: 170,
            },
            {
                id: 'differentiation',
                title: 'Differentiation',
                description: 'Learn derivatives and their applications',
                icon: TrendingUp,
                color: 'bg-purple-100 text-purple-600',
                questions: 220,
            },
            {
                id: 'integration',
                title: 'Integration',
                description: 'Master integration techniques and applications',
                icon: Calculator,
                color: 'bg-pink-100 text-pink-600',
                questions: 200,
            },
        ],
    },
    // {
    //     id: 'chemistry',
    //     name: 'Chemistry',
    //     description: 'Explore the composition and properties of matter',
    //     icon: FlaskConical,
    //     color: 'green',
    //     gradient: 'from-green-500 to-emerald-500',
    //     topics: [
    //         {
    //             id: 'atomic-structure',
    //             title: 'Atomic Structure',
    //             description:
    //                 'Understanding atoms, protons, neutrons, and electrons',
    //             icon: Atom,
    //             color: 'bg-green-100 text-green-600',
    //             questions: 180,
    //         },
    //         {
    //             id: 'periodic-table',
    //             title: 'Periodic Table',
    //             description: 'Elements, groups, and periodic trends',
    //             icon: FlaskConical,
    //             color: 'bg-emerald-100 text-emerald-600',
    //             questions: 160,
    //         },
    //         {
    //             id: 'chemical-bonds',
    //             title: 'Chemical Bonds',
    //             description: 'Ionic, covalent, and metallic bonding',
    //             icon: Atom,
    //             color: 'bg-teal-100 text-teal-600',
    //             questions: 190,
    //         },
    //         {
    //             id: 'acids-bases',
    //             title: 'Acids & Bases',
    //             description: 'pH, neutralization, and salt formation',
    //             icon: FlaskConical,
    //             color: 'bg-lime-100 text-lime-600',
    //             questions: 150,
    //         },
    //         {
    //             id: 'electrochemistry',
    //             title: 'Electrochemistry',
    //             description: 'Electrolysis and electrochemical cells',
    //             icon: Atom,
    //             color: 'bg-green-100 text-green-600',
    //             questions: 140,
    //         },
    //     ],
    // },
    // {
    //     id: 'physics',
    //     name: 'Physics',
    //     description: 'Understand the fundamental laws of nature',
    //     icon: Atom,
    //     color: 'orange',
    //     gradient: 'from-orange-500 to-red-500',
    //     topics: [
    //         {
    //             id: 'mechanics',
    //             title: 'Mechanics',
    //             description: 'Motion, forces, work, energy, and power',
    //             icon: Atom,
    //             color: 'bg-orange-100 text-orange-600',
    //             questions: 200,
    //         },
    //         {
    //             id: 'waves',
    //             title: 'Waves',
    //             description: 'Wave properties, sound, and light',
    //             icon: Atom,
    //             color: 'bg-red-100 text-red-600',
    //             questions: 180,
    //         },
    //         {
    //             id: 'electricity',
    //             title: 'Electricity',
    //             description: 'Current, voltage, resistance, and circuits',
    //             icon: Atom,
    //             color: 'bg-amber-100 text-amber-600',
    //             questions: 190,
    //         },
    //         {
    //             id: 'electromagnetism',
    //             title: 'Electromagnetism',
    //             description: 'Magnetic fields and electromagnetic induction',
    //             icon: Atom,
    //             color: 'bg-orange-100 text-orange-600',
    //             questions: 160,
    //         },
    //         {
    //             id: 'radioactivity',
    //             title: 'Radioactivity',
    //             description: 'Nuclear physics and radioactive decay',
    //             icon: Atom,
    //             color: 'bg-red-100 text-red-600',
    //             questions: 140,
    //         },
    //     ],
    // },
    // {
    //     id: 'biology',
    //     name: 'Biology',
    //     description: 'Study living organisms and life processes',
    //     icon: Dna,
    //     color: 'teal',
    //     gradient: 'from-teal-500 to-cyan-500',
    //     topics: [
    //         {
    //             id: 'cell-structure',
    //             title: 'Cell Structure',
    //             description: 'Cell organelles and their functions',
    //             icon: Dna,
    //             color: 'bg-teal-100 text-teal-600',
    //             questions: 170,
    //         },
    //         {
    //             id: 'nutrition',
    //             title: 'Nutrition',
    //             description: 'Food, nutrients, and digestive system',
    //             icon: Dna,
    //             color: 'bg-cyan-100 text-cyan-600',
    //             questions: 160,
    //         },
    //         {
    //             id: 'respiration',
    //             title: 'Respiration',
    //             description: 'Cellular respiration and gas exchange',
    //             icon: Dna,
    //             color: 'bg-teal-100 text-teal-600',
    //             questions: 150,
    //         },
    //         {
    //             id: 'reproduction',
    //             title: 'Reproduction',
    //             description: 'Sexual and asexual reproduction',
    //             icon: Dna,
    //             color: 'bg-cyan-100 text-cyan-600',
    //             questions: 140,
    //         },
    //         {
    //             id: 'genetics',
    //             title: 'Genetics',
    //             description: 'DNA, genes, and inheritance',
    //             icon: Dna,
    //             color: 'bg-teal-100 text-teal-600',
    //             questions: 180,
    //         },
    //         {
    //             id: 'ecology',
    //             title: 'Ecology',
    //             description:
    //                 'Ecosystems, food chains, and environmental conservation',
    //             icon: Dna,
    //             color: 'bg-cyan-100 text-cyan-600',
    //             questions: 160,
    //         },
    //     ],
    // },
]

function TopicCountBadge({ subjectId }: { subjectId: string }) {
    const { data: topics, isLoading } = useGetTopicsBySubjectQuery(subjectId)
    return (
        <Badge variant="secondary">
            {isLoading ? '...' : (topics?.length ?? 0)} topics
        </Badge>
    )
}

function SubjectsGrid() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Choose Your Subject
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Select a subject to start practicing. Each subject
                        has comprehensive topics aligned with the SPM
                        syllabus.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectsPage.map((subject) => {
                        const Icon = subject.icon

                        return (
                            <Link key={subject.id} to={subject.url}>
                                <Card className="h-full cursor-pointer transition-all hover:shadow-xl hover:scale-105 group">
                                    <CardHeader>
                                        <div
                                            className={`h-16 w-16 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                        >
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <CardTitle className="text-2xl">
                                            {subject.name}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {subject.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <TopicCountBadge subjectId={subject.id} />
                                            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
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
                description="Practise SPM Mathematics and Additional Mathematics by topic and difficulty — real exam-style questions for Malaysian Form 4–5 students, with more STEM subjects on the way."
                path="/subjects"
            />
            <SubjectsGrid />
        </LandingLayout>
    )
}
