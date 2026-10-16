import { Card, CardContent } from '@/components/ui/card.tsx'
import type { ClockStory } from '@/lib/clockStory.ts'

/**
 * "What the clock did", straight under the score. See src/lib/clockStory.ts
 * for why it is words, and why it is near the top rather than beside the
 * chart at the bottom.
 */
export function ClockSummary({ story }: { story: ClockStory }) {
    return (
        <section className="flex flex-col gap-3" aria-labelledby="clock-summary">
            <h2 id="clock-summary" className="text-xl font-medium">
                What the clock did
            </h2>
            <Card>
                <CardContent className="flex flex-col gap-2 pt-6 text-sm text-gray-700">
                    <p className="font-medium text-gray-900">{story.lead}</p>
                    {story.detail && <p>{story.detail}</p>}
                    {story.tip && <p className="text-gray-600">{story.tip}</p>}
                </CardContent>
            </Card>
        </section>
    )
}
