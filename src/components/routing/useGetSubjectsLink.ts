import { useAuth } from '@/components/auth/AuthContext.tsx'

export function useGetSubjectsLink() {
    const { user } = useAuth()

    if (user === null) {
        return '/auth/signup'
    } else {
        return '/subjects'
    }
}
