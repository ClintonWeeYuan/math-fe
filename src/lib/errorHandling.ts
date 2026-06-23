// Describes the shape of `error.response.data`
import axios from 'axios'

interface ApiErrorPayload {
    detail: string
}

function isApiErrorPayload(data: unknown): data is ApiErrorPayload {
    return typeof data === 'object' && data !== null && 'detail' in data
}

export function extractErrorMessage(error: Error): string {
    if (axios.isAxiosError(error) && error.response) {
        const backendPayload = error.response.data

        if (isApiErrorPayload(backendPayload)) {
            return backendPayload.detail
        }
    }

    return error.message
}
