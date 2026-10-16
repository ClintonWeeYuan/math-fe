/**
 * Tests where a newcomer is pointed at the mini before the full paper.
 *
 * TMUA, from 16 October 2026: of 40 TMUA students, the 21 who opened the mini
 * first sat it properly 62% of the time; the 19 who opened a 75-minute full
 * paper first, 37%. TMUA's full papers are mostly left blank. ESAT's full
 * paper is 40 minutes, a smaller step, so it keeps Mini and Set A side by side
 * for now; adding 'esat' here would treat it the same way, in the catalogue
 * and on the start screen.
 */
export const MINI_FIRST_TESTS: ReadonlySet<string> = new Set(['tmua'])
