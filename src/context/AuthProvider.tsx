'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GoTrue from 'gotrue-js'

const auth = new GoTrue({
    APIUrl: 'https://djflowerz.netlify.app/.netlify/identity',
    audience: '',
    setCookie: true,
})

type NetlifyUser = {
    id: string
    email: string
    user_metadata?: {
        full_name?: string
    }
    app_metadata?: any
}

type AuthContextType = {
    user: NetlifyUser | null
    isLoading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signOut: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<NetlifyUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check for existing session
        const getSession = async () => {
            try {
                const currentUser = auth.currentUser()
                if (currentUser) {
                    setUser(currentUser as NetlifyUser)
                } else {
                    // Try to restore from localStorage
                    const storedUser = localStorage.getItem('netlify_user')
                    if (storedUser) {
                        setUser(JSON.parse(storedUser))
                    }
                }
            } catch (error) {
                console.error('Error getting session:', error)
            } finally {
                setIsLoading(false)
            }
        }

        getSession()

        // Listen for auth state changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'netlify_user') {
                if (e.newValue) {
                    setUser(JSON.parse(e.newValue))
                } else {
                    setUser(null)
                }
            }
        })
    }, [])

    const signOut = async () => {
        try {
            const currentUser = auth.currentUser()
            if (currentUser) {
                await currentUser.logout()
            }
            localStorage.removeItem('netlify_user')
            setUser(null)
            router.push('/')
            router.refresh()
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
