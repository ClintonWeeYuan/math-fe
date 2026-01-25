import { useState, useEffect, useRef, memo } from 'react'
import { RingLoader } from 'react-spinners' // Assuming you use this library

export const MemoizedHtmlBlock = memo(HtmlBlock)

export function HtmlBlock({
    src,
    onDimensionChange,
    onClick,
}: {
    src: string
    onDimensionChange?: (height: number, width: number) => void
    onClick: () => void
}) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [htmlContent, setHtmlContent] = useState('')
    const [loading, setLoading] = useState(true)

    // Effect for fetching the HTML content
    useEffect(() => {
        // Reset state when the src changes
        setLoading(true)
        setHtmlContent('')

        fetch(src)
            .then((response) => response.text())
            .then((html) => {
                const style = `
                    <style>
                        /* Basic transparent background */
                        html, body { 
                            background: transparent !important; 
                            color: inherit !important; 
                        }

                        /* Hide scrollbar for Chrome, Safari and Opera */
                        body::-webkit-scrollbar {
                            display: none;
                        }

                        /* Hide scrollbar for IE, Edge and Firefox */
                        body {
                            -ms-overflow-style: none;  /* IE and Edge */
                            scrollbar-width: none;  /* Firefox */
                        }
                    </style>
                `
                let finalHtml = html
                if (html.includes('</head>')) {
                    finalHtml = html.replace('</head>', `${style}</head>`)
                } else {
                    finalHtml = style + html
                }
                setHtmlContent(finalHtml)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching HTML:', error)
                setLoading(false)
            })
    }, [src]) // Re-run only when the src prop changes

    // Effect for adjusting iframe height
    useEffect(() => {
        const iframe = iframeRef.current
        if (!iframe) return

        const adjustHeight = () => {
            if (iframe.contentDocument) {
                // Set height based on the scroll height of the content
                const contentHeight =
                    iframe.contentDocument.documentElement.scrollHeight

                const contentWidth =
                    iframe.contentDocument.documentElement.scrollWidth

                iframe.style.height = `${contentHeight}px`
                iframe.style.width = `${contentWidth}px`

                if (onDimensionChange) {
                    onDimensionChange(contentHeight, contentWidth)
                }
            }
        }

        // The 'load' event fires after the srcDoc content is fully parsed and displayed.
        iframe.addEventListener('load', adjustHeight)

        // Optional: Set up a ResizeObserver for dynamic content changes within the iframe
        let resizeObserver: ResizeObserver
        if (iframe.contentWindow) {
            resizeObserver = new ResizeObserver(adjustHeight)
            // We observe the body of the iframe's document
            if (iframe.contentDocument?.body) {
                resizeObserver.observe(iframe.contentDocument.body)
            }
        }

        // Cleanup function to remove listeners and observer
        return () => {
            iframe.removeEventListener('load', adjustHeight)
            if (resizeObserver) {
                resizeObserver.disconnect()
            }
        }
        // This effect depends on the htmlContent being set
    }, [htmlContent, onDimensionChange])

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <RingLoader
                    color="green"
                    loading={loading}
                    size={50}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
        )
    }

    return (
        <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            onClick={onClick}
            scrolling="no" // We manage scrolling on a parent div, so iframe itself shouldn't scroll
            style={{
                border: 'none',
                width: '100%',
                height: '100%', // Fills the scrollable container managed by the parent
                display: 'block',
                pointerEvents: 'none',
            }}
            title="Embedded Content"
        />
    )
}
