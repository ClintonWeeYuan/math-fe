import { createContext, useContext, type PropsWithChildren } from 'react'
import { useGetCurrentUserQuery } from '@/components/auth/useGetCurrentUser.ts'

import type { User } from '@/client'

import { useQueryClient } from '@tanstack/react-query'

const AuthContext = createContext<AuthContext>({
    user: null,
    isLoading: true,
    logout: () => {},
    isAdmin: false,
    login: () => {},
})

type LoginParams = {
    user: User
    token: string
    callback?: () => void
}

type AuthContext = {
    user: User | null
    isLoading: boolean
    isAdmin: boolean
    logout: (callback?: () => void) => void
    login: (params: LoginParams) => void
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const { data, isLoading } = useGetCurrentUserQuery({
        enabled: true,
    })
    const queryClient = useQueryClient()

    const login = ({ user, token, callback }: LoginParams) => {
        queryClient.setQueryData(['current-user'], user)
        localStorage.setItem('token', token)
        callback?.()
    }

    const logout = (callback: (() => void) | undefined) => {
        localStorage.removeItem('token')
        // Cleared outright, the mirror of login, rather than left to the
        // refetch that invalidation schedules — otherwise the header keeps
        // showing the signed-in name until that round trip lands.
        queryClient.setQueryData(['current-user'], null)
        queryClient.invalidateQueries({
            queryKey: ['current-user'],
        })
        callback?.()
    }

    return (
        <AuthContext.Provider
            value={{
                user: data ?? null,
                isLoading,
                logout,
                login,
                isAdmin: data !== null && data?.userType === 'ADMIN',
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
