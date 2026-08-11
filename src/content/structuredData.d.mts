import type { Guide } from './guideTypes'

export declare function guideJsonLd(
    guide: Guide,
    site: string
): Record<string, unknown>[]

export declare function jsonLdText(blocks: Record<string, unknown>[]): string
