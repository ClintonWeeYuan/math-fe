import { Button } from '@/components/ui/button.tsx'
import * as React from 'react'
import { Loader2Icon } from 'lucide-react'

type Props = {
    isLoading: boolean
    text: string
} & React.ComponentProps<'button'>

export function LoadingButton({
    isLoading,
    text,
    disabled,
    ...buttonProps
}: Props) {
    return (
        <Button type="submit" disabled={isLoading || disabled} {...buttonProps}>
            {isLoading ? <Loader2Icon className="animate-spin" /> : text}
        </Button>
    )
}
