import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'

export const StudentProtectedRoute = () => {
    const { isLoading, user } = useAuth()
    const location = useLocation()

    if (isLoading) return <LoadingPage />

    return user !== null
        ? <Outlet />
        : <Navigate to="/auth/login" state={{ from: location }} replace />
}
