'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { PlusCircle, Music, Upload, CheckCircle, ShieldAlert, DollarSign, Package, Calendar, User, Truck, Heart, Coffee, Send } from 'lucide-react'



import { isAdmin, ADMIN_EMAIL } from '@/lib/admin'

export default function AdminPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    // State management
    const [activeTab, setActiveTab] = useState<'content' | 'sales' | 'subs' | 'tips' | 'bookings'>('content')
    const [genres, setGenres] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [subs, setSubs] = useState<any[]>([])
    const [tips, setTips] = useState<any[]>([])
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        genre_id: '',
        youtube_url: '',
        download_url: '',
        description: '',
        is_premium: true
    })

    // Verify admin access
    useEffect(() => {
        if (authLoading) return

        if (!user || !isAdmin(user)) {
            router.push('/') // Redirect non-admins to home
            return
        }

        fetchAllData()
    }, [user, authLoading, router])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            // Genres
            const { data: gData } = await supabase.from('genres').select('*').order('name')
            if (gData) setGenres(gData)

            // Orders (Store)
            const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
            if (oData) setOrders(oData)

            // Subscriptions
            const { data: sData } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
            if (sData) setSubs(sData)

            // Tips
            const { data: tData } = await supabase.from('tips').select('*').order('created_at', { ascending: false })
            if (tData) setTips(tData)

            // Bookings
            const { data: bData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
            if (bData) setBookings(bData)

        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, is_premium: e.target.checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('mixes')
                .insert([formData])

            if (error) throw error

            setMessage({ type: 'success', text: 'Mix added successfully!' })
            setFormData({
                title: '',
                genre_id: '',
                youtube_url: '',
                download_url: '',
                description: '',
                is_premium: true
            })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to add mix' })
        } finally {
            setSubmitting(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-slate-400">Manage content, view orders, and track subscriptions.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-1 text-sm text-rose-400 flex items-center gap-2">
                            <ShieldAlert size={14} /> Super Admin
                        </div>
                        <button onClick={fetchAllData} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300">
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 border-b border-white/5 pb-1 overflow-x-auto">
                    {['content', 'sales', 'subs', 'tips', 'bookings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-3 px-2 font-bold text-sm transition-colors border-b-2 capitalize whitespace-nowrap ${activeTab === tab ? 'border-rose-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab === 'subs' ? 'Music Pool' : tab}
                        </button>
                    ))}
                </div>

                {/* CONTENT TAB */}
                {activeTab === 'content' && (
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-rose-600 p-2 rounded-lg">
                                <Upload size={24} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Upload New Mix</h2>
                        </div>

                        {message && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}>
                                {message.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Mix Title</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Summer Vibe Mix 2025" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Genre</label>
                                    <div className="relative">
                                        <select required name="genre_id" value={formData.genre_id} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:border-rose-500 outline-none">
                                            <option value="">Select a Genre</option>
                                            {genres.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                        <Music className="absolute right-4 top-3.5 text-slate-500 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">YouTube Embed URL</label>
                                    <input type="url" name="youtube_url" value={formData.youtube_url} onChange={handleChange} placeholder="https://youtube.com/..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Download Link</label>
                                    <input required type="url" name="download_url" value={formData.download_url} onChange={handleChange} placeholder="https://mediafire.com/..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" />
                            </div>

                            <div className="flex items-center gap-3 bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <input type="checkbox" id="is_premium" checked={formData.is_premium} onChange={handleCheckboxChange} className="w-5 h-5 accent-rose-600 rounded cursor-pointer" />
                                <label htmlFor="is_premium" className="text-sm text-slate-300 cursor-pointer select-none">Premium Content</label>
                            </div>

                            <button type="submit" disabled={submitting} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                                {submitting ? 'Uploading...' : <><PlusCircle size={20} /> Create Mix Post</>}
                            </button>
                        </form>
                    </div>
                )}

                {/* SALES TAB */}
                {activeTab === 'sales' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-slate-400 text-sm font-bold mb-2">Total Orders</h3>
                                <p className="text-3xl font-bold text-white">{orders.length}</p>
                            </div>
                            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-slate-400 text-sm font-bold mb-2">Revenue (Est)</h3>
                                <p className="text-3xl font-bold text-green-400">KES {orders.reduce((acc, o) => acc + (o.total_amount || 0), 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/5">
                                <h3 className="font-bold text-white">Transaction Logs (Equipment & Software)</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-medium">
                                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                                        <tr>
                                            <th className="p-4">Reference / Receipt</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Items / Shipping Details</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                                        {orders.map((order) => {
                                            const hasShipping = order.shipping_address
                                            return (
                                                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-mono text-xs">
                                                        <span className="block text-green-400">{order.mpesa_receipt_number || 'PENDING'}</span>
                                                        <span className="text-slate-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                                    </td>
                                                    <td className="p-4">{order.user_id?.slice(0, 8)}...</td>
                                                    <td className="p-4">
                                                        <div className="space-y-2">
                                                            <div>{(order.items || []).length} Items</div>
                                                            {hasShipping && (
                                                                <div className="text-xs bg-rose-500/10 text-rose-300 p-2 rounded-lg border border-rose-500/20">
                                                                    <div className="font-bold flex items-center gap-1 mb-1"><Truck size={10} /> SHIP TO:</div>
                                                                    {order.shipping_address}, {order.shipping_city}<br />
                                                                    Tel: {order.shipping_phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-white font-bold">KES {order.total_amount?.toLocaleString()}</td>
                                                    <td className="p-4 capitalized">{order.status}</td>
                                                </tr>
                                            )
                                        })}
                                        {orders.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No orders found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* SUBS TAB */}
                {activeTab === 'subs' && (
                    <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="font-bold text-white">Music Pool Subscriptions</h3>
                        </div>
                        <table className="w-full text-left font-medium">
                            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">User ID</th>
                                    <th className="p-4">Plan Type</th>
                                    <th className="p-4">Start Date</th>
                                    <th className="p-4">End Date</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                                {subs.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">{sub.user_id}</td>
                                        <td className="p-4 font-bold text-white">{sub.plan_type}</td>
                                        <td className="p-4">{new Date(sub.start_date).toLocaleDateString()}</td>
                                        <td className="p-4">{new Date(sub.end_date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {sub.is_active
                                                ? <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs">Active</span>
                                                : <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs">Expired</span>}
                                        </td>
                                    </tr>
                                ))}
                                {subs.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No subscriptions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TIPS TAB */}
                {activeTab === 'tips' && (
                    <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-white">Tip Jar Donations</h3>
                            <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                                Total: KES {tips.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()}
                            </div>
                        </div>
                        <table className="w-full text-left font-medium">
                            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">M-Pesa Receipt</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                                {tips.map((tip) => (
                                    <tr key={tip.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">{new Date(tip.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold text-white">KES {tip.amount}</td>
                                        <td className="p-4 font-mono text-green-400">{tip.mpesa_receipt}</td>
                                        <td className="p-4">{tip.user_id ? tip.user_id.slice(0, 8) : 'Anonymous'}</td>
                                        <td className="p-4 italic text-slate-500">"{tip.message || 'No message'}"</td>
                                    </tr>
                                ))}
                                {tips.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No tips received yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                    <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="font-bold text-white">Booking Enquiries</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="p-6 hover:bg-white/5 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{booking.client_name}</h4>
                                            <p className="text-rose-400 text-sm">{booking.event_type} • {new Date(booking.event_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={`mailto:${booking.client_email}`} className="px-3 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700 text-white">Email Client</a>
                                            {booking.client_phone && (
                                                <a href={`tel:${booking.client_phone}`} className="px-3 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700 text-white">Call Client</a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-lg text-sm text-slate-300 border border-white/5">
                                        <p className="mb-2 font-bold text-slate-500 text-xs uppercase">Message / Details:</p>
                                        {booking.message}
                                    </div>
                                    <div className="mt-4 flex gap-4 text-xs text-slate-500">
                                        <span>Email: {booking.client_email}</span>
                                        {booking.client_phone && <span>Phone: {booking.client_phone}</span>}
                                        <span>Received: {new Date(booking.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && (
                                <div className="p-12 text-center text-slate-500">
                                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No booking enquiries found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
