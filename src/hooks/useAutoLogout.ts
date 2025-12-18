'use client'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthProvider'

const TIMEOUT_MS = 15 * 60 * 1000 // 15 Minutes

export function useAutoLogout() {
    const { user, signOut } = useAuth()
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!user) return

        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                console.log('Auto-logging out due to inactivity...')
                signOut()
            }, TIMEOUT_MS)
        }

        // Events to listen to
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart']

        // Initial set
        resetTimer()

        // Attach listeners
        events.forEach(event => window.addEventListener(event, resetTimer))

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            events.forEach(event => window.removeEventListener(event, resetTimer))
        }
    }, [user, signOut])
}
