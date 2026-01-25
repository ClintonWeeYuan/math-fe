export const DifficultyOptions = ['easy', 'medium', 'hard'] as const

export type Difficulty = (typeof DifficultyOptions)[number]
