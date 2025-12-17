'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            })

            if (error) throw error

            setMessage({
                text: 'Password reset link sent! Check your email.',
                type: 'success'
            })
        } catch (error: any) {
            setMessage({
                text: error.message,
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-slate-950">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                    <p className="mt-2 text-slate-400">Enter your email to receive reset instructions.</p>
                </div>

                <div className="bg-slate-900 border border-white/5 p-8 rounded-2xl shadow-xl">
                    <form onSubmit={handleReset} className="space-y-6">
                        {message && (
                            <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-slate-500" size={20} />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                                    placeholder="dj@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <Link href="/login" className="text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
