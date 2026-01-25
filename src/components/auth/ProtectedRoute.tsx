import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'

export const ProtectedRoute = () => {
    const { isLoading, isAdmin } = useAuth()

    if (isLoading) return <LoadingPage />

    return isAdmin ? <Outlet /> : <Navigate to="/admin/login" />
}
