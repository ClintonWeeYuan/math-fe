import { describe, expect, it } from 'vitest'
import {
    NO_SET,
    filterQuestionsForList,
    setsByQuestionId,
} from './questionListFilters'
import type { DiagnosticQuestionResponse, DiagnosticSetResponse } from '@/client'

function q(over: Partial<DiagnosticQuestionResponse>): DiagnosticQuestionResponse {
    return {
        id: 'id',
        topicCode: 'MM1.1',
        coreSkillPrimary: 'S1',
        stem: 'stem',
        options: [],
        correctOption: 'A',
        status: 'published',
        createdAt: '2026-07-13T00:00:00Z',
        ...over,
    }
}
function s(id: string, title: string, questionIds: string[]): DiagnosticSetResponse {
    return {
        id,
        title,
        description: null,
        timeLimitMinutes: 40,
        questionIds,
        isFree: false,
        status: 'draft',
        subject: null,
        createdAt: '2026-07-13T00:00:00Z',
    }
}

const questions = [
    q({ id: 'a', topicCode: 'MM1.1', status: 'published', stem: 'derivative' }),
    q({ id: 'b', topicCode: 'MM2.3', status: 'draft', stem: 'integral' }),
    q({ id: 'c', topicCode: 'MM1.1', status: 'draft', stem: 'limit' }),
]
const sets = [s('set1', 'Physics A', ['a', 'b']), s('set2', 'Maths A', ['a'])]
const membership = setsByQuestionId(sets)

describe('setsByQuestionId', () => {
    it('maps each question to every set that contains it', () => {
        expect(membership.get('a')!.map((x) => x.id)).toEqual(['set1', 'set2'])
        expect(membership.get('b')!.map((x) => x.id)).toEqual(['set1'])
        expect(membership.get('c')).toBeUndefined() // in no set
    })
})

describe('filterQuestionsForList', () => {
    it('filters to a specific set (by membership, not a field on the question)', () => {
        expect(
            filterQuestionsForList(questions, membership, { setId: 'set1' }).map((x) => x.id)
        ).toEqual(['a', 'b'])
        expect(
            filterQuestionsForList(questions, membership, { setId: 'set2' }).map((x) => x.id)
        ).toEqual(['a'])
    })

    it('finds orphans — questions in no set', () => {
        expect(
            filterQuestionsForList(questions, membership, { setId: NO_SET }).map((x) => x.id)
        ).toEqual(['c'])
    })

    it('returns everything when the set filter is null', () => {
        expect(filterQuestionsForList(questions, membership, { setId: null })).toHaveLength(3)
    })

    it('combines the set filter with status/topic/search', () => {
        // set1 has a,b; of those, only the draft one is b.
        expect(
            filterQuestionsForList(questions, membership, {
                setId: 'set1',
                status: 'draft',
            }).map((x) => x.id)
        ).toEqual(['b'])
        // topic within a set
        expect(
            filterQuestionsForList(questions, membership, {
                setId: 'set1',
                topicCode: 'MM1.1',
            }).map((x) => x.id)
        ).toEqual(['a'])
        // search within a set
        expect(
            filterQuestionsForList(questions, membership, {
                setId: 'set1',
                search: 'integr',
            }).map((x) => x.id)
        ).toEqual(['b'])
    })
})
