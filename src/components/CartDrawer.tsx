'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthProvider' // Import Auth
import { supabase } from '@/lib/supabaseClient' // Import Supabase
import { X, Trash2, ShoppingBag, Loader2, Smartphone, Tag } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function CartDrawer() {
    const { items, removeItem, total, isOpen, toggleCart, applyCoupon, removeCoupon, discount, couponCode } = useCart()
    const { user } = useAuth() // Get user
    const [phone, setPhone] = useState('')
    const [promoInput, setPromoInput] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)
    const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleApplyPromo = async () => {
        setPromoMessage(null)
        const code = promoInput.trim().toUpperCase()

        if (!code) return

        if (code === 'DJFLOWERZ') {
            if (!user) {
                setPromoMessage({ type: 'error', text: 'Login required for this code.' })
                return
            }

            setPromoLoading(true)
            // Check order history
            const { count, error } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            setPromoLoading(false)

            if (error) {
                console.error(error)
                setPromoMessage({ type: 'error', text: 'Validation failed.' })
                return
            }

            if (count && count > 0) {
                setPromoMessage({ type: 'error', text: 'Valid for first purchase only.' })
            } else {
                applyCoupon(code, 20)
                setPromoMessage({ type: 'success', text: '20% Discount Applied!' })
                setPromoInput('')
            }
        } else {
            // Future logic for other codes or invalid
            setPromoMessage({ type: 'error', text: 'Invalid promo code.' })
        }
    }

    const handleCheckout = async () => {
        if (!phone) {
            setMessage('Please enter a phone number')
            setStatus('error')
            return
        }

        setLoading(true)
        setMessage('')
        setStatus('idle')

        try {
            const res = await fetch('/api/mpesa/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    amount: total, // Total is already discounted in context
                    metadata: { coupon: couponCode }
                })
            })

            const data = await res.json()

            if (res.ok) {
                setStatus('success')
                setMessage('STK Push sent! Check your phone.')
            } else {
                setStatus('error')
                setMessage(data.error || 'Payment failed')
            }
        } catch (error) {
            setStatus('error')
            setMessage('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-white/10 z-50 shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingBag size={20} /> Your Cart ({items.length})
                            </h2>
                            <button onClick={toggleCart} className="text-slate-400 hover:text-white p-2">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center text-slate-500 py-12">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Your cart is empty.</p>
                                </div>
                            ) : (
                                items.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="flex gap-4 p-4 bg-slate-950 rounded-xl border border-white/5">
                                        <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium truncate">{item.title}</h4>
                                            <p className="text-sm text-slate-400">{item.category}</p>
                                            <p className="text-rose-500 font-bold mt-1">KES {item.price.toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400 p-2">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-950">
                            {/* Promo Code Section */}
                            <div className="mb-6 pb-6 border-b border-white/5">
                                {couponCode ? (
                                    <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                        <span className="text-green-400 text-sm font-bold flex items-center gap-2">
                                            <Tag size={16} /> Code applied: {couponCode} (-{discount}%)
                                        </span>
                                        <button onClick={removeCoupon} className="text-slate-400 hover:text-white"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Promo Code"
                                                value={promoInput}
                                                onChange={(e) => setPromoInput(e.target.value)}
                                                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 outline-none uppercase"
                                            />
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={promoLoading || !promoInput}
                                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                                            >
                                                {promoLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                                            </button>
                                        </div>
                                        {promoMessage && (
                                            <p className={`text-xs mt-2 ${promoMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                                {promoMessage.text}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-slate-400">Total</span>
                                <div className="text-right">
                                    {discount > 0 && (
                                        <span className="block text-sm text-slate-500 line-through">
                                            KES {Math.round(total / (1 - discount / 100)).toLocaleString()}
                                        </span>
                                    )}
                                    <span className="text-2xl font-bold text-white">KES {total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* M-Pesa Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-400 mb-2">M-Pesa Phone Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="07XX XXX XXX"
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`mb-4 p-3 rounded-lg text-sm ${status === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                    {message}
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={items.length === 0 || loading}
                                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Pay with M-Pesa'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
