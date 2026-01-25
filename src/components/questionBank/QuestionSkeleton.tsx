import { Skeleton } from '@/components/ui/skeleton.tsx'

export function QuestionSkeleton() {
    return (
        <div className="w-full grow flex flex-col grow items-center">
            <Skeleton className="grow w-full rounded-xl mb-4" />
            <Skeleton className="grow w-full rounded-xl mb-4" />
            <Skeleton className="grow w-full rounded-xl mb-4" />
        </div>
    )
}
