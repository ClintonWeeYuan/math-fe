import { useEffect, useState } from 'react'
import { client } from '@/client/client.gen'
import { CountrySelect } from '@/components/common/CountrySelect.tsx'

/**
 * A few questions, in the gap between submitting and reading the
 * report.
 *
 * The moment is chosen rather than convenient: a student has just spent forty
 * minutes and is waiting to see how they did, which is the one point they will
 * answer something about themselves. Asking at signup competes with getting
 * started; asking later competes with nothing, because they have gone.
 *
 * It cannot block the report, and this is built so that it structurally
 * cannot: "View your report" sits outside this component and is never
 * disabled, answers save fire-and-forget as they are tapped, and a failed save
 * is not surfaced. Nothing here is on the path to the thing they came for.
 */

const SITTINGS = [
    { value: 'october_2026', label: 'October 2026' },
    { value: 'january_2027', label: 'January 2027' },
    { value: 'undecided', label: 'Not decided' },
] as const

const UNIVERSITIES = [
    'Cambridge',
    'Oxford',
    'Imperial',
    'UCL',
    'Warwick',
    'Durham',
    'LSE',
    'Other/Not sure',
] as const

function authHeaders(): Record<string, string> {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Fire-and-forget. A survey answer is worth nothing next to the report the
 *  student is waiting for, so nothing here is awaited and no failure is shown
 *  to them. */
function save(body: Record<string, unknown>): void {
    void client
        .post({
            url: '/users/diagnostic-survey',
            body,
            headers: authHeaders(),
        })
        .catch(() => {})
}

/**
 * Whether to ask for a country: only if none is stored. Sitting and
 * universities are asked every time because both change over a season; a
 * country does not, and asking it after every paper would be noise.
 *
 * Null while loading, so the question does not flash up and vanish. A failed
 * read asks — asking twice is the worst that follows.
 */
function useNeedsCountry(): boolean | null {
    const [needs, setNeeds] = useState<boolean | null>(null)
    useEffect(() => {
        let live = true
        client
            .get({ url: '/users/diagnostic-survey', headers: authHeaders() })
            .then((result) => {
                const country = (result.data as { country?: string | null } | undefined)
                    ?.country
                if (live) setNeeds(result.error !== undefined || !country)
            })
            .catch(() => {
                if (live) setNeeds(true)
            })
        return () => {
            live = false
        }
    }, [])
    return needs
}

function Chip({
    selected,
    onClick,
    children,
}: {
    selected: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
            }`}
        >
            {children}
        </button>
    )
}

export function PostSubmissionSurvey() {
    const [dismissed, setDismissed] = useState(false)
    const [sitting, setSitting] = useState<string | null>(null)
    const [universities, setUniversities] = useState<string[]>([])
    const [country, setCountry] = useState<string | null>(null)
    const needsCountry = useNeedsCountry()

    if (dismissed) return null

    function chooseCountry(code: string) {
        setCountry(code)
        save({ country: code })
    }

    function chooseSitting(value: string) {
        setSitting(value)
        save({ testSitting: value })
    }

    function toggleUniversity(name: string) {
        setUniversities((previous) => {
            const next = previous.includes(name)
                ? previous.filter((u) => u !== name)
                : [...previous, name]
            save({ targetUniversities: next })
            return next
        })
    }

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
            <div className="mb-4 flex items-start justify-between gap-4">
                <p className="text-sm text-slate-600">
                    A few quick questions, so we can make this more useful to
                    you. Skip if you&apos;d rather not.
                </p>
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="shrink-0 text-sm text-slate-400 underline underline-offset-4 hover:text-slate-600"
                >
                    Skip
                </button>
            </div>

            <p className="mb-2 text-sm font-medium">
                When are you sitting the test?
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
                {SITTINGS.map((option) => (
                    <Chip
                        key={option.value}
                        selected={sitting === option.value}
                        onClick={() => chooseSitting(option.value)}
                    >
                        {option.label}
                    </Chip>
                ))}
            </div>

            <p className="mb-2 text-sm font-medium">
                Which universities are you targeting?
            </p>
            <div className="flex flex-wrap gap-2">
                {UNIVERSITIES.map((name) => (
                    <Chip
                        key={name}
                        selected={universities.includes(name)}
                        onClick={() => toggleUniversity(name)}
                    >
                        {name}
                    </Chip>
                ))}
            </div>

            {/* Kept once answered in this sitting, so choosing a country does
                not make the question disappear from under the student. */}
            {(needsCountry || country !== null) && (
                <div className="mt-5">
                    <p className="mb-2 text-sm font-medium" id="survey-country">
                        Which country are you in?
                    </p>
                    <CountrySelect
                        value={country}
                        onChange={chooseCountry}
                        aria-labelledby="survey-country"
                    />
                </div>
            )}
        </div>
    )
}
