import type { Difficulty } from '@/lib/types.ts'
import type { QuestionResponse } from '@/client'

export const DifficultyList: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
]

export const QUESTIONS: QuestionResponse[] = [
    {
        id: '78e29f3d-9400-45f1-8ffa-a06c62eff1ba',
        createdAt: '2025-06-20T01:18:31.226212Z',
        topics: [
            {
                id: 'random',
                name: 'Random Topic',
                level: { name: 'Form 4', id: '123' },
                sortOrder: 1,
            },
        ],
        difficulty: 'easy',
        questionUrl:
            'https://qykdwbjdpyvrnnmckcxc.supabase.co/storage/v1/object/sign/questions/96571de3-ab77-4509-91bc-e36e86b03104_Another%20One.html?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mOTUwMjhiNC04NTAzLTRmM2MtODdjNi1jOGZlNDQ3ZTBkNWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJxdWVzdGlvbnMvOTY1NzFkZTMtYWI3Ny00NTA5LTkxYmMtZTM2ZTg2YjAzMTA0X0Fub3RoZXIgT25lLmh0bWwiLCJpYXQiOjE3NTAzODI2NDQsImV4cCI6MTc1MDM4NjI0NH0.1PBajcMptrrxLx7Clum1V-IUTtIiDTVlQ3p2m2wJLAU',
        answerUrl: '',
        number: 1,
        paper: { id: '123', name: 'Paper 1' },
        paperVariant: { id: '123', name: 'Mock', year: 2012 },
        marks: 5,
        status: 'NONE',
        type: 'default',
    },
]
