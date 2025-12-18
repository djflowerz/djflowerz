'use client'
import { createContext, useContext } from 'react'
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'

type AuthContextType = {
    user: any | null
    isLoading: boolean
    signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signOut: () => { },
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <AuthInternal>{children}</AuthInternal>
        </UserProvider>
    )
}

function AuthInternal({ children }: { children: React.ReactNode }) {
    const { user, isLoading, error } = useUser()
    const router = useRouter()

    const signOut = () => {
        window.location.href = '/api/auth/logout'
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
