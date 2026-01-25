import Reveal from 'reveal.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/beige.css'
import { useEffect, useRef } from 'react'
import RevealMath from 'reveal.js/plugin/math/math.esm.js'

export function DetailedExplanation() {
    const deckDivRef = useRef<HTMLDivElement>(null) // reference to deck container div
    const deckRef = useRef<Reveal.Api | null>(null) // reference to deck reveal instance

    useEffect(() => {
        // Prevents double initialization in strict mode
        if (deckRef.current) return

        deckRef.current = new Reveal(deckDivRef.current!, {
            transition: 'slide',
            embedded: true,
            plugins: [RevealMath.KaTeX],
            // other config options
        })

        deckRef.current.initialize().then(() => {
            // good place for event handlers and plugin setups
        })

        return () => {
            try {
                if (deckRef.current) {
                    deckRef.current.destroy()
                    deckRef.current = null
                }
            } catch (e) {
                console.warn('Reveal.js destroy call failed. Error: ', e)
            }
        }
    }, [])

    const firstColumnStyle: React.CSSProperties = {
        textAlign: 'right',
        paddingRight: '1em',
        border: 'none',
    }

    const secondColumnStyle: React.CSSProperties = {
        textAlign: 'left',
        border: 'none',
    }

    return (
        // Your presentation is sized based on the width and height of
        // our parent element. Make sure the parent is not 0-height.
        <div className="reveal" ref={deckDivRef}>
            <div className="slides">
                <section>
                    <table
                        style={{
                            margin: '0 auto',
                            border: 'none',
                            borderCollapse: 'collapse',
                            fontSize: 20,
                        }}
                    >
                        <tbody>
                            {/* This first line will appear by default */}
                            <tr>
                                <td
                                    style={firstColumnStyle}
                                    className="fragment highlight-current-blue"
                                    data-fragment-index="1"
                                >
                                    {'$ \\text{(1)} $'}
                                </td>
                                <td
                                    style={secondColumnStyle}
                                    className="fragment highlight-current-blue"
                                    data-fragment-index="1"
                                >
                                    {'$ 4x + y + 2z = 0 $'}
                                </td>
                            </tr>

                            {/* This line is a fragment and will slide in */}
                            <tr>
                                <td style={firstColumnStyle}>
                                    {'$ \\text{(2)} $'}
                                </td>
                                <td style={secondColumnStyle}>
                                    <span
                                        className="fragment highlight-current-blue"
                                        data-fragment-index="3"
                                    >
                                        {'$ -2x + 3y + z = 8 $'}
                                    </span>
                                </td>
                            </tr>

                            <tr>
                                <td style={firstColumnStyle}>
                                    {'$ \\text{(3)} $'}
                                </td>
                                <td style={secondColumnStyle}>
                                    <span
                                        className="fragment highlight-current-blue"
                                        data-fragment-index="9"
                                    >
                                        {'$ x - y - z = -\\frac{1}{2} $'}
                                    </span>
                                </td>
                            </tr>

                            <tr
                                className="fragment fade-left"
                                data-fragment-index="1"
                            >
                                <td style={firstColumnStyle}>
                                    {'$ \\text{From 1 ... (4)} $'}
                                </td>
                                <td
                                    className="fragment fade-left"
                                    data-fragment-index="2"
                                    style={secondColumnStyle}
                                >
                                    <span
                                        className="fragment highlight-current-blue"
                                        data-fragment-index="3"
                                    >
                                        <span
                                            className="fragment highlight-current-blue"
                                            data-fragment-index="9"
                                        >
                                            {'$ y = -4x - 2z  $'}
                                        </span>
                                    </span>
                                </td>
                            </tr>

                            {/*Substitute */}
                            <tr
                                className="fragment fade-left"
                                data-fragment-index="3"
                            >
                                <td style={firstColumnStyle}>
                                    {'$ \\text{Substitute (4) into (2)} $'}
                                </td>
                                <td
                                    className="fragment fade-left"
                                    data-fragment-index="4"
                                    style={secondColumnStyle}
                                >
                                    {'$ -2x + 3(-4x - 2z) + z = 8  $'}
                                </td>
                            </tr>
                            <tr
                                className="fragment fade-left"
                                data-fragment-index="6"
                            >
                                <td style={firstColumnStyle}></td>
                                <td style={secondColumnStyle}>
                                    {'$ -2x - 12x - 6z + z = 8  $'}
                                </td>
                            </tr>
                            <tr
                                className="fragment fade-left"
                                data-fragment-index="7"
                            >
                                <td style={firstColumnStyle}></td>
                                <td style={secondColumnStyle}>
                                    {'$ -14x - 5z = 8  $'}
                                </td>
                            </tr>
                            <tr
                                className="fragment fade-left"
                                data-fragment-index="8"
                            >
                                <td style={firstColumnStyle}>
                                    {' '}
                                    {'$ \\text{(5)} $'}
                                </td>
                                <td style={secondColumnStyle}>
                                    <span
                                        className="fragment highlight-current-blue"
                                        data-fragment-index="9"
                                    >
                                        {'$ x = \\frac{-5z - 8}{14}  $'}
                                    </span>
                                </td>
                            </tr>
                            <tr
                                className="fragment fade-left "
                                data-fragment-index="9"
                            >
                                <td style={firstColumnStyle}>
                                    {
                                        '$ \\text{Substitute (4) and (5) into (3)} $'
                                    }
                                </td>
                                <td
                                    className="fragment fade-left"
                                    data-fragment-index="10"
                                    style={secondColumnStyle}
                                >
                                    {
                                        '$ ( \\frac{-5z - 8}{14}) - [-4( \\frac{-5z - 8}{14}) - 2z ] - z = -\\frac{1}{2} $'
                                    }
                                </td>
                            </tr>
                            <tr
                                className="fragment fade-left"
                                data-fragment-index="11"
                            >
                                <td style={firstColumnStyle}></td>
                                <td style={secondColumnStyle}>
                                    {'$ -5z - 8 - 20z - 32 + 28z - 14z = -7 $'}
                                </td>
                            </tr>
                            <tr
                                className="fragment fade-left"
                                data-fragment-index="12"
                            >
                                <td style={firstColumnStyle}></td>
                                <td style={secondColumnStyle}>
                                    {'$ -11z = 33 $'}
                                </td>
                            </tr>
                            <tr
                                className="fragment fade-left"
                                data-fragment-index="13"
                            >
                                <td style={firstColumnStyle}></td>
                                <td
                                    style={secondColumnStyle}
                                    className="fragment highlight-green grow"
                                    data-fragment-index="14"
                                >
                                    {'$ z = -3 $'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    )
}
