import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

type Props = {
    fileUrl: string
    fileName: string
}
export const DownloadButton = ({ fileUrl, fileName }: Props) => {
    const handleDownload = async () => {
        try {
            // 1. Fetch the file data from the URL.
            const response = await fetch(fileUrl)
            if (!response.ok) {
                throw new Error('Network response was not ok.')
            }

            // 2. Get the data as a Blob (a file-like object).
            const blob = await response.blob()

            // 3. Create a temporary URL for the Blob.
            const url = window.URL.createObjectURL(blob)

            // 4. Create a hidden anchor element.
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = fileName // Set the desired file name.
            document.body.appendChild(a)

            // 5. Programmatically click the anchor to trigger the download.
            a.click()

            // 6. Clean up by revoking the temporary URL and removing the anchor.
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('There was a problem with the download:', error)
            // You could show an error message to the user here.
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={handleDownload}
            style={
                {
                    /* your styles */
                }
            }
        >
            <DownloadIcon />
        </Button>
    )
}
