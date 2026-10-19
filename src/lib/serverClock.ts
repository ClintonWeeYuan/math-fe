/**
 * How far the server's clock is ahead of this device's, in milliseconds.
 *
 * The exam timer counts down to a deadline set by the server. Counting down
 * with the device's own clock is only right if that clock is right, and some
 * are not: from August to October 2026, 11 of 651 attempts ran on a device
 * clock over 10 seconds fast, by up to 3 minutes 47 seconds, and four papers
 * were submitted early by exactly that much. A slow clock does the opposite
 * and shows time that has already run out.
 *
 * So the attempt state carries the server's time, and the screen measures
 * itself against it. The server stamped that time somewhere between sending
 * the request and receiving the reply, so it is compared with the midpoint of
 * the two, which keeps the network's delay out of the estimate.
 *
 * Returns 0 when the server's time is missing or unreadable: the timer then
 * behaves exactly as it did before.
 */
export function clockOffsetMs(
    serverNow: string | null | undefined,
    sentAtMs: number,
    receivedAtMs: number
): number {
    if (!serverNow) return 0
    const server = new Date(serverNow).getTime()
    if (Number.isNaN(server)) return 0
    return Math.round(server - (sentAtMs + receivedAtMs) / 2)
}

/** The server's time now, as best this device can tell. */
export function serverNowMs(offsetMs: number | undefined): number {
    return Date.now() + (offsetMs ?? 0)
}
