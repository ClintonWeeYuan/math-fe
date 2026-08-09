/**
 * Save an object as a .json file the browser downloads.
 *
 * A Blob URL rather than a data: URI — a 27-question set with inlined
 * diagrams runs to six figures of characters, and data: URIs hit length
 * limits at roughly that size in some browsers.
 */
export function downloadJson(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Released once the download has started; without this the blob is held
    // for the lifetime of the page.
    URL.revokeObjectURL(url)
}
