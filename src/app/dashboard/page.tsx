'use client'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, User, CreditCard, Download, Settings, Send, Loader2, Music, Play, Lock, ExternalLink, Calendar, Key, ShieldCheck, Gift, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
    const { user, session, isLoading, signOut } = useAuth()
    const router = useRouter()

    // Data state
    const [genres, setGenres] = useState<any[]>([])
    const [mixes, setMixes] = useState<any[]>([])
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
    const [fetching, setFetching] = useState(false)

    // User Data
    const [orders, setOrders] = useState<any[]>([])
    const [subscription, setSubscription] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [coupons, setCoupons] = useState<any[]>([])

    // Profile Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({ full_name: '', phone_number: '', address: '' })
    const [claiming, setClaiming] = useState(false)

    const openEditModal = () => {
        setEditForm({
            full_name: profile?.full_name || '',
            phone_number: profile?.phone_number || '',
            address: profile?.address || ''
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        try {
            const { error } = await supabase
                .from('profiles')
                .update(editForm)
                .eq('id', user.id)

            if (error) throw error

            // Refresh data
            fetchInitialData()
            setIsEditModalOpen(false)
        } catch (error) {
            console.error(error)
            alert('Failed to update profile')
        }
    }

    const handleClaimReward = async () => {
        if (!user || claiming || !session) return
        setClaiming(true)
        try {
            const res = await fetch('/api/referrals/claim', {
                method: 'POST',
                headers: { Authorization: `Bearer ${session.access_token}` }
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            alert(`Success! Coupon Code: ${data.coupon}`)
            fetchInitialData() // refresh points and coupons
        } catch (e: any) {
            alert(e.message)
        } finally {
            setClaiming(false)
        }
    }

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        } else if (user) {
            fetchInitialData()
        }
    }, [user, isLoading, router])

    const fetchInitialData = async () => {
        // Fetch Genres
        const { data: genreData } = await supabase.from('genres').select('*').order('name')
        if (genreData) setGenres(genreData)

        // Fetch Profile & Referral Stats
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user!.id)
            .single()

        if (profileData) setProfile(profileData)

        // Fetch Coupons
        const { data: couponData } = await supabase
            .from('coupons')
            .select('*')
            .eq('assigned_to', user!.id)
            .order('created_at', { ascending: false })

        if (couponData) setCoupons(couponData)

        // Fetch Orders for Software/History
        const { data: orderData } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*))') // Join items and products
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false })

        if (orderData) setOrders(orderData)

        // Fetch Subscription
        const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user!.id)
            .eq('is_active', true)
            .gt('end_date', new Date().toISOString())
            .single()

        if (subData) setSubscription(subData)
    }

    const fetchMixes = async (genreId: string) => {
        setFetching(true)
        setSelectedGenre(genreId)
        try {
            const { data, error } = await supabase
                .from('mixes')
                .select('*')
                .eq('genre_id', genreId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setMixes(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setFetching(false)
        }
    }

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="animate-spin text-rose-600" size={32} />
            </div>
        )
    }

    const isAdmin = user.email === 'ianmuriithiflowerz@gmail.com'

    // Extract software items from orders
    const softwareItems = orders.flatMap(order =>
        (order.order_items || []).filter((item: any) =>
            item.products?.type === 'software' || item.products?.type === 'digital'
        ).map((item: any) => ({
            ...item.products,
            purchase_date: order.created_at
        }))
    )

    // Extract physical orders
    const physicalOrders = orders.filter(order =>
        (order.order_items || []).some((item: any) =>
            item.products?.type === 'physical' || item.products?.type === 'merch'
        )
    )

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 pt-24">
            <div className="container mx-auto flex flex-col lg:flex-row gap-8">

                {/* Sidebar / Profile Card */}
                <aside className="w-full lg:w-1/4 space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center shadow-xl shadow-black/20">

                        <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-slate-950 outline outline-2 outline-rose-500 relative">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1 truncate">{profile?.full_name || user.user_metadata?.full_name || 'DJ Flowerz Fan'}</h2>
                        <p className="text-xs text-slate-400 mb-6 truncate">{user.email}</p>

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300 border border-white/10">
                            Status: {subscription ? 'VIP Member' : 'Free Account'}
                        </div>

                        {/* Referral Stats */}
                        {profile?.referral_code && (
                            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-left">
                                <p className="text-xs text-indigo-400 font-bold mb-2 flex items-center gap-1 uppercase tracking-wide">
                                    <Gift size={12} /> Referral Program
                                </p>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className="text-2xl font-bold text-white">{profile.referral_count || 0}</span>
                                        <span className="text-xs text-slate-400 ml-1">Referrals</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-emerald-400">{profile.points || 0}</span>
                                        <span className="text-xs text-slate-400 ml-1">Pts</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-white/10">
                                    <code className="flex-1 text-center font-mono text-sm font-bold text-indigo-300">{profile.referral_code}</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(profile.referral_code)}
                                        className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                                        title="Copy Code"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 text-center">Share code to earn discounts!</p>

                                <button
                                    onClick={handleClaimReward}
                                    disabled={!profile.points || profile.points < 30 || claiming}
                                    className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    {claiming ? 'Processing...' : `Redeem 30 Pts for 20% Off`}
                                </button>
                            </div>
                        )}

                        {/* Coupons List */}
                        {coupons.length > 0 && (
                            <div className="mt-4 text-left">
                                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">My Coupons</h4>
                                <div className="space-y-2">
                                    {coupons.map(coupon => (
                                        <div key={coupon.id} className="bg-slate-950 border border-white/10 p-2 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-white tracking-wider font-mono">{coupon.code}</p>
                                                <p className="text-[10px] text-green-400">{coupon.discount_percent}% Off</p>
                                            </div>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(coupon.code)}
                                                className="text-slate-500 hover:text-white"
                                            >
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {subscription && (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-left">
                                <p className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1">
                                    <ShieldCheck size={12} /> Active Subscription
                                </p>
                                <p className="text-xs text-slate-400">
                                    Expires: <span className="text-white">{new Date(subscription.end_date).toLocaleDateString()}</span>
                                </p>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                            <button onClick={openEditModal} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-bold text-sm">
                                <User size={16} /> Edit Profile
                            </button>
                            {isAdmin && (
                                <button onClick={() => router.push('/admin')} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-bold text-sm shadow-lg shadow-rose-900/20">
                                    <Settings size={16} /> Admin Portal
                                </button>
                            )}
                            <button onClick={() => signOut()} className="flex items-center justify-center gap-2 w-full text-red-400 hover:text-red-300 transition-colors pt-2 text-sm">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-8">
                    {/* Software & Downloads Section */}
                    {softwareItems.length > 0 && (
                        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Download size={20} className="text-rose-500" /> My Software & Downloads
                            </h3>
                            <div className="grid gap-4">
                                {softwareItems.map((item: any, i: number) => (
                                    <div key={i} className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-500 text-xl">
                                                {item.title.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">{item.title}</h4>
                                                <p className="text-xs text-slate-500">Purchased on {new Date(item.purchase_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 items-end">
                                            {item.download_link ? (
                                                <a href={item.download_link} target="_blank" className="flex items-center gap-2 text-rose-500 hover:text-white font-bold text-sm bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-600 hover:border-rose-600 transition-all">
                                                    <Download size={14} /> Download Software
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">Processing Link...</span>
                                            )}
                                            {item.file_password && (
                                                <p className="text-xs text-slate-400 flex items-center gap-1 font-mono bg-slate-900 px-2 py-1 rounded border border-white/5">
                                                    <Key size={10} /> Pass: {item.file_password}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Physical Orders Section */}
                    {physicalOrders.length > 0 && (
                        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Gift size={20} className="text-indigo-500" /> Physical Orders & Status
                            </h3>
                            <div className="grid gap-4">
                                {physicalOrders.map((order: any) => (
                                    <div key={order.id} className="bg-slate-950 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-xs text-slate-500">Order #{order.id.slice(0, 8)}</p>
                                                <p className="text-sm font-bold text-white mt-1">
                                                    {order.order_items?.length} items • KES {order.total_amount?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${order.shipping_status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                order.shipping_status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {order.shipping_status?.toUpperCase() || 'PENDING'}
                                            </div>
                                        </div>

                                        {order.tracking_number && (
                                            <div className="bg-slate-900 p-3 rounded-lg border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tracking Number</p>
                                                    <p className="text-sm font-mono text-white">{order.tracking_number}</p>
                                                </div>
                                                <button onClick={() => navigator.clipboard.writeText(order.tracking_number)} className="text-slate-500 hover:text-white"><Copy size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Genres Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Content Library</h2>
                        {/* Genres Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                            {genres.map((genre) => (
                                <button
                                    key={genre.id}
                                    onClick={() => fetchMixes(genre.id)}
                                    className={`p-4 rounded-xl text-sm font-bold transition-all border ${selectedGenre === genre.id
                                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/20 scale-105'
                                        : 'bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800 hover:border-white/10 hover:text-white'
                                        }`}
                                >
                                    {genre.name}
                                </button>
                            ))}
                        </div>

                        {/* Content Display */}
                        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 min-h-[400px]">
                            {!selectedGenre ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 py-20">
                                    <Music size={48} className="opacity-20" />
                                    <p>Select a genre above to load mixes</p>
                                </div>
                            ) : fetching ? (
                                <div className="h-full flex items-center justify-center py-20">
                                    <Loader2 className="animate-spin text-rose-600" size={32} />
                                </div>
                            ) : mixes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 py-20">
                                    <p>No mixes found for this genre yet.</p>
                                    {isAdmin && (
                                        <button onClick={() => router.push('/admin')} className="text-rose-500 hover:underline">
                                            Upload one now
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {mixes.map((mix) => (
                                        <div key={mix.id} className="bg-slate-950 rounded-xl overflow-hidden border border-white/5 group hover:border-rose-500/30 transition-all">
                                            <div className="aspect-video bg-black relative">
                                                {mix.youtube_url ? (
                                                    <iframe
                                                        src={mix.youtube_url.replace('watch?v=', 'embed/')}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                                        <Music className="text-slate-700" size={40} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-bold text-white line-clamp-2 group-hover:text-rose-500 transition-colors">{mix.title}</h3>
                                                    {mix.is_premium && <Lock size={14} className="text-amber-500 mt-1 flex-shrink-0" />}
                                                </div>

                                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{mix.description}</p>

                                                <a
                                                    href={mix.download_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-bold text-sm"
                                                >
                                                    <Download size={16} /> Download Mix
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main >
            </div >

            {/* Edit Profile Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <ExternalLink size={20} className="rotate-45" /> {/* Makeshift Close Icon or import X */}
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.full_name}
                                        onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={editForm.phone_number}
                                        onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
                                        placeholder="+254..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Address / Location</label>
                                    <input
                                        type="text"
                                        value={editForm.address}
                                        onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
                                        placeholder="Nairobi, Kenya"
                                    />
                                </div>

                                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg mt-4">
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
