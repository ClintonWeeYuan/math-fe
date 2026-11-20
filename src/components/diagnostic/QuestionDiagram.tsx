import { useState } from 'react'

type Props = {
    src: string
    alt: string
}

/** An image narrower than this, as width ÷ height, gets the taller cap. */
const TALL_BELOW = 1.3

/**
 * A question's image, on the exam screen and in the admin's student preview,
 * sized so that what is written in it can be read.
 *
 * Every image used to be capped at 20rem (320px) tall. That suits a plain
 * diagram. But many images stack a drawing above the table of answer options,
 * and those are 600–700 units tall: squeezed into 320px, the options came out
 * at 5–7px and could not be read.
 *
 * So the cap depends on the image's shape. A tall or square image is almost
 * always one of those stacked ones and gets 30rem; a wide one keeps 20rem.
 * Measured over the 303 images in the published sets in November 2026, 22 had
 * text under 7px before and 5 do now, none of which a cap can fix (legends,
 * and tables drawn side by side).
 *
 * Not simply 30rem for everything: an SVG with a viewBox and no width fills
 * the pane, so a plain triangle would be drawn half as big again and push
 * every answer option off the screen. That would have made 162 images bigger
 * to fix 20.
 *
 * The shape is read from the image as drawn, once it has loaded, rather than
 * from naturalWidth: browsers disagree about the natural size of an SVG that
 * has only a viewBox, but all of them keep its proportions on screen.
 */
export function QuestionDiagram({ src, alt }: Props) {
    const [tall, setTall] = useState(false)

    return (
        <img
            src={src}
            alt={alt}
            onLoad={(e) => {
                const { offsetWidth, offsetHeight } = e.currentTarget
                // Nothing drawn yet (a hidden pane): keep the smaller cap.
                setTall(
                    offsetHeight > 0 && offsetWidth / offsetHeight < TALL_BELOW
                )
            }}
            className={tall ? 'max-h-[30rem]' : 'max-h-80'}
        />
    )
}
