import { Button } from '@/components/ui/button.tsx'
import * as React from 'react'
import { Loader2Icon } from 'lucide-react'

type Props = {
    isLoading: boolean
    text: string
} & React.ComponentProps<'button'>

export function LoadingButton({ isLoading, text, ...buttonProps }: Props) {
    return (
        <Button type="submit" {...buttonProps}>
            {isLoading ? <Loader2Icon className="animate-spin" /> : text}
        </Button>
    )
}
