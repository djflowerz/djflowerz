'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import SubscribeModal from '@/components/SubscribeModal'
import { Lock, Music, Play, ExternalLink, Check, Loader2, Download, Share2, ArrowLeft, Layers } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { playTrack } from '@/components/AudioPlayer'

type Plan = {
    name: string
    price: number
    duration: number
}

const PLANS: Plan[] = [
    { name: '1 Month', price: 700, duration: 1 },
    { name: '3 Months', price: 1800, duration: 3 },
    { name: '6 Months', price: 3200, duration: 6 },
    { name: '1 Year', price: 6000, duration: 12 },
]

export default function MusicPoolPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[0])
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [loading, setLoading] = useState(true)

    // Genre State
    const [genres, setGenres] = useState<any[]>([])
    const [selectedGenre, setSelectedGenre] = useState<any>(null)

    useEffect(() => {
        fetchGenres()
        if (!authLoading && user) {
            checkSubscription()
        } else if (!authLoading && !user) {
            setLoading(false)
        }
    }, [user, authLoading])

    const fetchGenres = async () => {
        const { data } = await supabase.from('genres').select('*').order('name')
        if (data) setGenres(data)
    }

    const checkSubscription = async () => {
        try {
            const { data } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user!.id)
                .eq('is_active', true)
                .gt('end_date', new Date().toISOString())
                .single() // Assume one active sub at a time

            if (data) setIsSubscribed(true)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const openModal = (plan: Plan = PLANS[0]) => {
        if (!user) {
            // Redirect to login if not logged in
            window.location.href = '/login?redirect=/music-pool'
            return
        }
        setSelectedPlan(plan)
        setIsModalOpen(true)
    }

    const handleGenreClick = (genre: any) => {
        if (isSubscribed) {
            if (genre.external_url) {
                // Redirect to Admin/External Link
                window.open(genre.external_url, '_blank')
            } else {
                setSelectedGenre(genre)
            }
        } else {
            // Trigger Subscription Modal
            openModal()
        }
    }

    if (authLoading || (loading && user)) return (
        <div className="min-h-screen pt-20 flex justify-center items-center bg-slate-950">
            <div className="animate-spin h-8 w-8 border-2 border-rose-600 rounded-full border-t-transparent"></div>
        </div>
    )

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">DJ Music Pool</h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-6">
                    Exclusive extended edits, intros, and clean versions for professional DJs.
                </p>
                {isSubscribed ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 font-bold">
                        <Check size={18} /> Active Subscriber
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold transition-all shadow-lg shadow-rose-900/20 mb-4"
                        >
                            Unlock Premium Access
                        </button>
                        <p className="text-sm text-slate-500 max-w-lg">
                            We accept payments globally: M-Pesa, MTN, WorldRemit, Remitly, Wise, and Bank Transfers.
                            <br />Secure checkout via M-Pesa.
                        </p>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            {!selectedGenre ? (
                /* GENRE GRID VIEW */
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Layers className="text-rose-500" /> Browse by Genre
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {genres.map((genre) => (
                            <div
                                key={genre.id}
                                onClick={() => handleGenreClick(genre)}
                                className="group relative aspect-square bg-slate-900 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-rose-500/50 transition-all"
                            >
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-100 group-hover:scale-105 transition-transform duration-500`}></div>

                                {/* Lock Icon if not subscribed */}
                                {!isSubscribed && (
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 z-10">
                                        <Lock size={14} className="text-amber-500" />
                                    </div>
                                )}

                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-0">
                                    <Music size={48} className={`mb-4 ${!isSubscribed ? 'text-slate-700' : 'text-rose-500'} group-hover:scale-110 transition-transform`} />
                                    <h3 className="text-xl font-bold text-white text-center group-hover:text-rose-400 transition-colors">{genre.name}</h3>
                                    {!isSubscribed && <p className="text-xs text-slate-500 mt-2 font-medium">Premium Only</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Show Pricing Plans below if not subscribed */}
                    {!isSubscribed && (
                        <div className="mt-20 border-t border-white/5 pt-16">
                            <h2 className="text-3xl font-bold text-white text-center mb-10">Choose Your Plan</h2>
                            <p className="text-center text-slate-400 mb-8 max-w-2xl mx-auto text-sm">
                                Start downloading instantly. Pay via M-Pesa or Global Transfer (WorldRemit, Remitly, Wise, MTN) to +254 7XX XXX XXX.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {PLANS.map((plan) => (
                                    <div key={plan.name} className="bg-slate-900 border border-white/10 rounded-2xl p-6 hover:border-rose-500/50 transition-all flex flex-col relative group">
                                        {plan.duration === 3 && (
                                            <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                                        )}
                                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                        <div className="text-3xl font-bold text-rose-500 mb-4">KES {plan.price.toLocaleString()}</div>
                                        <button
                                            onClick={() => openModal(plan)}
                                            className="w-full py-3 bg-white/5 hover:bg-rose-600 text-white font-bold rounded-xl transition-all mt-auto"
                                        >
                                            Choose Plan
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* SELECTED GENRE VIEW (MIXES) */
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => setSelectedGenre(null)}
                        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
                    >
                        <ArrowLeft size={20} /> Back to Genres
                    </button>

                    <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 mb-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white">{selectedGenre.name} Mixes</h2>
                                <p className="text-slate-400 mt-1">Premium content unlocked.</p>
                            </div>
                            <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Lock size={14} className="text-rose-500" /> Premium Access Active
                            </div>
                        </div>
                    </div>

                    <MusicPoolGrid genreId={selectedGenre.id} />
                </div>
            )}

            <SubscribeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedPlan={selectedPlan}
            />
        </div>
    )
}

function MusicPoolGrid({ genreId }: { genreId: string }) {
    const { session } = useAuth()
    const [mixes, setMixes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMixes()

        const channel = supabase
            .channel('public:mixes:premium')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'mixes', filter: `is_premium=eq.true` }, // Filtering by genre in realtime is harder, just refetch
                () => {
                    console.log('Premium mix update');
                    fetchMixes(false)
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [genreId])

    const fetchMixes = async (showLoading = true) => {
        if (showLoading) setLoading(true)
        const { data } = await supabase
            .from('mixes')
            .select('*, genres(name)')
            .eq('is_premium', true)
            .eq('genre_id', genreId)
            .order('created_at', { ascending: false })

        if (data) setMixes(data)
        if (showLoading) setLoading(false)
    }

    const handleDownload = async (mixId: string, title: string) => {
        if (!session) {
            window.location.href = '/login?redirect=/music-pool'
            return
        }

        try {
            const res = await fetch(`/api/download?fileId=${mixId}&type=mix`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Download failed')

            if (data.url) {
                window.open(data.url, '_blank')
            }
        } catch (e: any) {
            console.error(e)
            alert(e.message)
        }
    }

    const getThumbnail = (url: string) => {
        if (!url) return null;
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return null;
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-rose-500" size={40} />
        </div>
    )

    if (mixes.length === 0) return (
        <div className="text-center py-20 text-slate-500 border border-dashed border-white/10 rounded-2xl">
            <Music size={48} className="mx-auto mb-4 opacity-20" />
            <p>No premium mixes found for this genre yet.</p>
        </div>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {mixes.map((mix) => (
                <div key={mix.id} className="bg-slate-900 border border-white/5 rounded-xl p-4 hover:border-rose-500/30 transition-all group flex flex-col">
                    <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden mb-4 group-hover:shadow-lg transition-all">
                        <img
                            src={mix.cover || getThumbnail(mix.youtube_url) || "https://placehold.co/600x400/1e293b/ef4444?text=Mix"}
                            alt={mix.title}
                            className="w-full h-full object-cover"
                        />

                        <button
                            onClick={() => playTrack({
                                title: mix.title,
                                audio_url: mix.audio_stream_url || mix.audio_url || '',
                                cover: mix.cover || getThumbnail(mix.youtube_url),
                                genre: mix.genres?.name
                            })}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                            <div className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                                <Play size={24} fill="currentColor" className="ml-1" />
                            </div>
                        </button>
                    </div>

                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-white truncate flex-1 mr-2" title={mix.title}>{mix.title}</h3>
                        <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded whitespace-nowrap border border-amber-500/20">PREMIUM</span>
                    </div>

                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{mix.description || 'Exclusive mix for music pool members.'}</p>

                    <div className="mt-auto grid grid-cols-2 gap-2">
                        {mix.audio_download_url && (
                            <a
                                href={mix.audio_download_url}
                                target="_blank"
                                className="py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                                <Download size={14} /> MP3
                            </a>
                        )}
                        {mix.video_download_url && (
                            <a
                                href={mix.video_download_url}
                                target="_blank"
                                className="py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                                <Download size={14} /> Video
                            </a>
                        )}
                        {!mix.audio_download_url && !mix.video_download_url && (
                            <button disabled className="col-span-2 py-2 bg-slate-800 text-slate-500 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-not-allowed">
                                <Lock size={14} /> Unavailable
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
