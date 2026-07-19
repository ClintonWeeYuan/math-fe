/**
 * The seven canonical core-skill codes the Skills Radar is defined over —
 * the frontend mirror of the backend's CORE_SKILLS. Fixed at seven so the
 * Skills screen always offers all axes to label, in order, even the ones a
 * given subject hasn't named yet.
 */
export const CORE_SKILLS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'] as const

export type CoreSkill = (typeof CORE_SKILLS)[number]
