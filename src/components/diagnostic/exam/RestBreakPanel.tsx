import { Button } from '@/components/ui/button.tsx'
import { formatAllowance } from '@/lib/restBreak.ts'

type Props = {
    breakSecondsRemaining: number
    isPaused: boolean
    onStart: () => void
    isStarting: boolean
}

/**
 * The "take a break" control, shown only to students whose arrangements
 * include rest breaks and only while some allowance is left. Everyone else
 * sees nothing at all: an exam screen should not advertise a provision the
 * student cannot use.
 *
 * The allowance is stated in the button's own neighbourhood, because the
 * decision it supports is "can I afford to stop now?".
 */
export function RestBreakPanel({
    breakSecondsRemaining,
    isPaused,
    onStart,
    isStarting,
}: Props) {
    if (isPaused || breakSecondsRemaining <= 0) return null

    return (
        <div className="rounded-md border border-gray-200 bg-white p-3">
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onStart}
                disabled={isStarting}
            >
                Take a break
            </Button>
            <p className="mt-2 text-xs text-gray-500">
                {formatAllowance(breakSecondsRemaining)} of break time left. The clock
                stops while you are away.
            </p>
        </div>
    )
}
