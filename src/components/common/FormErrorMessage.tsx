import type { ComponentProps } from 'react'
import { ErrorMessage } from '@hookform/error-message'

export function FormErrorMessage(props: ComponentProps<typeof ErrorMessage>) {
    return (
        <ErrorMessage
            {...props}
            render={({ message }) => <p className="text-red-500">{message}</p>}
        />
    )
}
