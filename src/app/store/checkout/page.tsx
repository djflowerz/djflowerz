'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { Loader2, Truck, Download, ShieldCheck, MapPin, Phone } from 'lucide-react'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'

export default function CheckoutPage() {
    const { items, total } = useCart()
    const { user } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
    const [timeLeft, setTimeLeft] = useState(30)

    // Form State
    const [phone, setPhone] = useState('')
    const [shipping, setShipping] = useState({
        address: '',
        city: '',
        postalCode: '',
        shippingPhone: ''
    })

    // Check if we need shipping
    const needsShipping = items.some(item => item.product_type === 'equipment' || item.product_type === 'merch')

    // Redirect if empty
    useEffect(() => {
        if (items.length === 0) {
            router.push('/store')
        }
    }, [items, router])

    // Timer Logic
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

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus('processing')
        setTimeLeft(30)

        // Calculate total (add shipping if needed? For now just cart total)
        const finalAmount = total // + shippingCost?

        try {
            // 1. Initiate STK Push
            const { data } = await axios.post('/api/mpesa/stkpush', {
                phoneNumber: phone,
                amount: finalAmount,
                accountReference: 'DJ Flowerz Store'
            })

            if (data.ResponseCode === '0') {
                // Simulation of success for "live in browser" testing
                setTimeout(async () => {
                    await createOrder(data.CheckoutRequestID || 'simulated_id')
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

    const createOrder = async (receipt: string) => {
        if (!user) return

        const orderData = {
            user_id: user.id,
            total_amount: total,
            status: 'completed',
            mpesa_receipt_number: receipt,
            items: items,
            ...(needsShipping ? {
                shipping_address: shipping.address,
                shipping_city: shipping.city,
                shipping_phone: shipping.shippingPhone
            } : {})
        }

        const { error } = await supabase.from('orders').insert(orderData)
        if (error) console.error('Error creating order:', error)
    }

    if (items.length === 0) return null

    if (status === 'success') {
        return (
            <div className="min-h-screen pt-24 px-4 container mx-auto flex items-center justify-center">
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h2>
                    <p className="text-slate-400 mb-6">
                        {needsShipping
                            ? "We'll start packing your order immediately. You'll receive shipping updates via email."
                            : "Your digital downloads are ready. Check your dashboard for access codes."}
                    </p>
                    <button onClick={() => router.push('/dashboard')} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Order Summary */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                        <div className="space-y-4 mb-6">
                            {items.map((item, i) => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image || '/placeholder.png'} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-white">{item.title}</h3>
                                        <p className="text-xs text-slate-400 capitalize">{item.product_type || 'Product'}</p>
                                    </div>
                                    <div className="text-right font-bold text-rose-500">
                                        KES {item.price.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xl font-bold text-white">
                            <span>Total</span>
                            <span>KES {total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm">
                        <ShieldCheck size={20} />
                        Payments are active and secured by M-Pesa & Supabase.
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 md:p-8">
                    {status === 'processing' ? (
                        <div className="text-center py-12">
                            <div className="relative inline-flex items-center justify-center mb-6">
                                <Loader2 className="animate-spin text-rose-600" size={80} />
                                <span className="absolute text-sm font-bold text-white">{timeLeft}s</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Payment in Progress</h3>
                            <p className="text-slate-400">Please check your phone and enter your M-Pesa PIN.</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePayment} className="space-y-6">
                            {needsShipping ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex items-center gap-2 text-rose-500 font-bold border-b border-white/10 pb-2 mb-4">
                                        <Truck size={20} /> Shipping Information
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Full Address</label>
                                            <input required type="text" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-rose-500 outline-none" placeholder="Street Name, Apt, etc" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">City</label>
                                            <input required type="text" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-rose-500 outline-none" placeholder="Nairobi" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Contact Phone</label>
                                            <input required type="tel" value={shipping.shippingPhone} onChange={e => setShipping({ ...shipping, shippingPhone: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-rose-500 outline-none" placeholder="For delivery updates" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-3">
                                    <Download size={20} />
                                    Digital Delivery: Access codes/downloads will be sent to your email instantly.
                                </div>
                            )}

                            <div className="space-y-4 pt-6">
                                <div className="flex items-center gap-2 text-rose-500 font-bold border-b border-white/10 pb-2 mb-4">
                                    <Phone size={20} /> Payment Details
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">M-Pesa Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-rose-500 outline-none text-lg tracking-wide placeholder:text-slate-600"
                                        placeholder="07XX XXX XXX"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-[0.99] text-lg">
                                Pay KES {total.toLocaleString()}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
