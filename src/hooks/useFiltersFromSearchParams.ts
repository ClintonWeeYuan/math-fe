import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

export const FILTERS = {
    TOPIC: 'topics',
    DIFFICULTY: 'difficulty',
    PAPER: 'papers',
    PAGE: 'page',
}

type SetFilterSearchParams = {
    topics?: string[]
    difficulty?: string[]
    papers?: string[]
    page?: number
}

export function useFiltersFromSearchParams() {
    const [searchParams, setSearchParams] = useSearchParams()

    const topics = useMemo(() => {
        const topicsFromUrl = searchParams.get(FILTERS.TOPIC)
        if (topicsFromUrl == null) {
            return []
        }

        return topicsFromUrl.split(',')
    }, [searchParams])

    const difficulty = useMemo(() => {
        const difficultyFromUrl = searchParams.get(FILTERS.DIFFICULTY)
        if (difficultyFromUrl == null) {
            return []
        }

        return difficultyFromUrl.split(',')
    }, [searchParams])

    const papers = useMemo(() => {
        const papersFromUrl = searchParams.get(FILTERS.PAPER)
        if (papersFromUrl == null) {
            return []
        }

        return papersFromUrl.split(',')
    }, [searchParams])

    const page = useMemo(() => {
        const pageFromUrl = searchParams.get(FILTERS.PAGE)
        if (pageFromUrl == null) {
            return 1
        } else {
            try {
                return parseInt(pageFromUrl)
            } catch {
                return 1
            }
        }
    }, [searchParams])

    const setFilterSearchParams = ({
        topics,
        difficulty,
        papers,
        page,
    }: SetFilterSearchParams) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev)
            if (topics !== undefined) {
                if (topics.length == 0) {
                    newParams.delete(FILTERS.TOPIC)
                } else {
                    newParams.set(FILTERS.TOPIC, topics.join(','))
                }
            }

            if (difficulty !== undefined) {
                if (difficulty.length == 0) {
                    newParams.delete(FILTERS.DIFFICULTY)
                } else {
                    newParams.set(FILTERS.DIFFICULTY, difficulty.join(','))
                }
            }

            if (papers !== undefined) {
                if (papers.length == 0) {
                    newParams.delete(FILTERS.PAPER)
                } else {
                    newParams.set(FILTERS.PAPER, papers.join(','))
                }
            }

            if (page !== undefined) {
                newParams.set(FILTERS.PAGE, page.toString())
            }

            return newParams
        })
    }

    return {
        setFilterSearchParams,
        topics,
        difficulty,
        page,
        papers,
    }
}
