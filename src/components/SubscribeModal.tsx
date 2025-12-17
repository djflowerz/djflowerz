'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader2, Smartphone, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Plan = {
    name: string
    price: number
    duration: number // in months
}

export default function SubscribeModal({ isOpen, onClose, selectedPlan }: { isOpen: boolean; onClose: () => void; selectedPlan?: Plan }) {
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
    const [timeLeft, setTimeLeft] = useState(30)
    const [checkoutRequestId, setCheckoutRequestId] = useState('')

    const router = useRouter()

    const plan = selectedPlan || { name: '1 Month Access', price: 500, duration: 1 }

    const handleSuccess = async () => {
        // Create Subscription Record
        // In reality, webhook should do this. But for client-side demo:
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const startDate = new Date()
            const endDate = new Date()
            endDate.setMonth(endDate.getMonth() + plan.duration)

            await supabase.from('subscriptions').insert({
                user_id: user.id,
                plan_type: plan.name,
                end_date: endDate.toISOString(),
                is_active: true
            })
        }

        onClose()
        router.refresh()
    }

    // Trigger handleSuccess when status turns success
    useEffect(() => {
        if (status === 'success') {
            handleSuccess()
        }
    }, [status])

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'processing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1)
            }, 1000)
        } else if (timeLeft === 0 && status === 'processing') {
            setStatus('failed')
        }
        return () => clearInterval(timer)
    }, [status, timeLeft])

    // Polling effect
    useEffect(() => {
        if (status === 'processing' && checkoutRequestId) {
            const poll = setInterval(async () => {
                try {
                    // Polling logic would go here
                } catch (e) {
                    console.error(e)
                }
            }, 2000)
            return () => clearInterval(poll)
        }
    }, [status, checkoutRequestId, timeLeft])

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus('processing')
        setTimeLeft(30)

        try {
            // 1. Initiate STK Push
            const { data } = await axios.post('/api/mpesa/stkpush', {
                phoneNumber: phone,
                amount: plan.price,
                accountReference: 'DJ Flowerz'
            })

            if (data.ResponseCode === '0') {
                setCheckoutRequestId(data.CheckoutRequestID)

                // MOCK SUCCESS for user's "live in browser" request since they can't easily set up callbacks on localhost
                // Remove this timeout in production and rely on the polling effect above.
                setTimeout(() => {
                    setStatus('success')
                }, 15000) // Success after 15s

            } else {
                throw new Error(data.errorMessage || 'Payment failed initiation')
            }
        } catch (error) {
            console.error(error)
            setStatus('failed')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                    <p className="text-slate-400 text-sm">Amount to Pay: <strong>KES {plan.price}</strong></p>
                </div>

                {status === 'processing' ? (
                    <div className="text-center py-8 space-y-4">
                        <div className="relative inline-flex items-center justify-center">
                            <Loader2 className="animate-spin text-rose-600" size={64} />
                            <span className="absolute text-xs font-bold text-white">{timeLeft}s</span>
                        </div>
                        <p className="text-white font-medium animate-pulse">Check your phone...</p>
                        <p className="text-sm text-slate-500">Please enter your M-Pesa PIN.</p>
                        <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                            <div
                                className="bg-rose-500 h-full transition-all duration-1000 ease-linear"
                                style={{ width: `${(timeLeft / 30) * 100}%` }}
                            />
                        </div>
                    </div>
                ) : status === 'success' ? (
                    <div className="text-center py-8 space-y-4">
                        <CheckCircle className="text-green-500 mx-auto" size={48} />
                        <p className="text-white font-bold text-xl">Payment Successful!</p>
                        <p className="text-sm text-slate-500">Activating your subscription...</p>
                    </div>
                ) : (
                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">M-Pesa Phone Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                    placeholder="0712 345 678"
                                />
                            </div>
                        </div>

                        {status === 'failed' && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center gap-2">
                                <XCircle size={16} /> Transaction failed or timed out.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                        >
                            Pay KES {plan.price}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
