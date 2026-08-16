import type { Guide } from './guideTypes'
export declare const GUIDES: Guide[]
export declare function relatedTo(guide: Guide): { guide: Guide; blurb: string }[]
