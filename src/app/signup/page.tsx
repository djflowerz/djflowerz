'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, Mail, CheckCircle } from 'lucide-react'
import GoTrue from 'gotrue-js'

const auth = new GoTrue({
    APIUrl: 'https://djflowerz.netlify.app/.netlify/identity',
    audience: '',
    setCookie: true,
})

export default function SignupPage() {
    const [step, setStep] = useState<'details' | 'otp'>('details')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [referralCode, setReferralCode] = useState('')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/.netlify/functions/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, fullName }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP')
            }

            setSuccess('Verification code sent! Check your email.')
            setStep('otp')
        } catch (err: any) {
            setError(err.message || 'Failed to send verification code')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch('/.netlify/functions/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify OTP')
            }

            // Log the user in after successful verification
            const user = await auth.login(email, password, true)

            if (user) {
                setSuccess('Account created successfully! Redirecting...')
                setTimeout(() => router.push('/dashboard'), 1500)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to verify code')
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch('/.netlify/functions/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, fullName }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to resend OTP')
            }

            setSuccess('New verification code sent!')
        } catch (err: any) {
            setError(err.message || 'Failed to resend code')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-slate-900 border border-white/5 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {step === 'details' ? 'Join the Tribe' : 'Verify Your Email'}
                    </h1>
                    <p className="text-slate-400">
                        {step === 'details'
                            ? 'Create an account to unlock the Music Pool.'
                            : `We sent a 6-digit code to ${email}`
                        }
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 text-sm">
                        <CheckCircle size={18} />
                        {success}
                    </div>
                )}

                {step === 'details' ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                placeholder="DJ Name (e.g. DJ Flowerz)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                placeholder="dj@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                placeholder="Min. 6 characters"
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                placeholder="Repeat password"
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Referral Code (Optional)</label>
                            <input
                                type="text"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors uppercase placeholder:text-slate-600"
                                placeholder="e.g. A1B2C3"
                                maxLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <Mail size={20} />
                                    Send Verification Code
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Verification Code</label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-rose-500 transition-colors"
                                placeholder="000000"
                                maxLength={6}
                                pattern="\d{6}"
                            />
                            <p className="text-xs text-slate-500 mt-2 text-center">Enter the 6-digit code from your email</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Create Account'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={loading}
                                className="text-sm text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
                            >
                                Didn't receive the code? Resend
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setStep('details')
                                setOtp('')
                                setError(null)
                                setSuccess(null)
                            }}
                            className="w-full text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            ← Back to signup
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-rose-500 hover:text-rose-400 font-bold">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}
