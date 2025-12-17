'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader2, Smartphone, CheckCircle, XCircle, Heart, Coffee } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthProvider'

export default function TipJarModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user } = useAuth()
    const [amount, setAmount] = useState('100')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
    const [timeLeft, setTimeLeft] = useState(30)

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

    if (!isOpen) return null

    const handleTip = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus('processing')
        setTimeLeft(30)

        try {
            // 1. Initiate STK Push
            const { data } = await axios.post('/api/mpesa/stkpush', {
                phoneNumber: phone,
                amount: parseInt(amount),
                accountReference: 'DJ Flowerz Tip'
            })

            if (data.ResponseCode === '0') {
                // Simulation
                setTimeout(async () => {
                    // Save Tip to DB
                    await supabase.from('tips').insert({
                        user_id: user?.id || null, // Optional
                        amount: parseInt(amount),
                        message: message,
                        mpesa_receipt: data.CheckoutRequestID
                    })
                    setStatus('success')
                }, 15000)
            } else {
                throw new Error(data.errorMessage)
            }
        } catch (error) {
            console.error(error)
            setStatus('failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                        <Heart fill="currentColor" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Support the DJ</h2>
                    <p className="text-slate-400 text-sm">Drop a tip to show some love!</p>
                </div>

                {status === 'processing' ? (
                    <div className="text-center py-8 space-y-4">
                        <div className="relative inline-flex items-center justify-center">
                            <Loader2 className="animate-spin text-rose-600" size={64} />
                            <span className="absolute text-xs font-bold text-white">{timeLeft}s</span>
                        </div>
                        <p className="text-white font-medium animate-pulse">Check your phone...</p>
                        <p className="text-sm text-slate-500">Enter M-Pesa PIN to complete.</p>
                    </div>
                ) : status === 'success' ? (
                    <div className="text-center py-8 space-y-4">
                        <CheckCircle className="text-green-500 mx-auto" size={48} />
                        <p className="text-white font-bold text-xl">Thank You!</p>
                        <p className="text-sm text-slate-500">Your support keeps the mixes coming.</p>
                        <button onClick={onClose} className="mt-4 px-6 py-2 bg-slate-800 rounded-full text-white text-sm hover:bg-slate-700">Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleTip} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Amount (KES)</label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {['100', '200', '500', '1000'].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setAmount(val)}
                                        className={`py-2 rounded-lg text-sm font-bold border transition-all ${amount === val ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-950 border-white/10 text-slate-400 hover:bg-slate-800'}`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-rose-500 outline-none font-bold text-center text-xl"
                                placeholder="Custom Amount"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">M-Pesa Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-rose-500 outline-none"
                                    placeholder="0712 345 678"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Message (Optional)</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-rose-500 outline-none text-sm"
                                placeholder="Keep up the good work!"
                                rows={2}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                        >
                            <Coffee size={18} /> Send Tip
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
