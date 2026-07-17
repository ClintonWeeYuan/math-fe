import { describe, expect, it } from 'vitest'
import { filterQuestions, moveItem, orderedSelection } from './questionPicker'
import type { DiagnosticQuestionResponse } from '@/client'

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

describe('filterQuestions', () => {
    const qs = [
        q({ id: 'a', topicCode: 'MM1.1', status: 'published', stem: 'derivative of x' }),
        q({ id: 'b', topicCode: 'MM2.3', status: 'draft', stem: 'integrate this' }),
        q({ id: 'c', topicCode: 'MM1.1', status: 'draft', stem: 'limits' }),
    ]

    it('filters by status', () => {
        expect(filterQuestions(qs, { status: 'draft' }).map((x) => x.id)).toEqual(['b', 'c'])
    })
    it('filters by topic code', () => {
        expect(filterQuestions(qs, { topicCode: 'MM1.1' }).map((x) => x.id)).toEqual(['a', 'c'])
    })
    it('searches stem and topic (case-insensitive)', () => {
        expect(filterQuestions(qs, { search: 'INTEGRATE' }).map((x) => x.id)).toEqual(['b'])
        expect(filterQuestions(qs, { search: 'mm1.1' }).map((x) => x.id)).toEqual(['a', 'c'])
    })
    it('combines filters', () => {
        expect(
            filterQuestions(qs, { status: 'draft', topicCode: 'MM1.1' }).map((x) => x.id)
        ).toEqual(['c'])
    })
    it('returns everything with no filters', () => {
        expect(filterQuestions(qs, {})).toHaveLength(3)
    })
})

describe('moveItem', () => {
    it('moves an item up and down', () => {
        expect(moveItem(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c'])
        expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'c', 'b'])
    })
    it('is a no-op at the ends', () => {
        expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b'])
        expect(moveItem(['a', 'b'], 1, 1)).toEqual(['a', 'b'])
    })
    it('does not mutate the input', () => {
        const arr = ['a', 'b']
        moveItem(arr, 0, 1)
        expect(arr).toEqual(['a', 'b'])
    })
})

describe('orderedSelection', () => {
    const qs = [q({ id: 'a' }), q({ id: 'b' }), q({ id: 'c' })]
    it('resolves ids in selection order, not source order', () => {
        expect(orderedSelection(qs, ['c', 'a']).map((x) => x.id)).toEqual(['c', 'a'])
    })
    it('drops ids that no longer resolve', () => {
        expect(orderedSelection(qs, ['a', 'gone', 'b']).map((x) => x.id)).toEqual(['a', 'b'])
    })
})
