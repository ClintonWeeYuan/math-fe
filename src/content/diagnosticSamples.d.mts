export type SampleQuestion = { stem: string; options: string[] }
export type SubjectSamples = { guidePath: string; questions: SampleQuestion[] }

export declare const SAMPLES_BY_SUBJECT: Record<string, SubjectSamples>
export declare function samplesFor(subject?: string | null): SubjectSamples | null
