'use client'
import { PlayCircle, Download, Share2, Loader2, Music } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function MixtapesPage() {
    const [mixes, setMixes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState<string>('All');
    const [genres, setGenres] = useState<any[]>([]);

    const genreRef = useRef('All'); // Track current genre for realtime updates

    useEffect(() => {
        genreRef.current = selectedGenre;
    }, [selectedGenre]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Genres
                const { data: genreData } = await supabase.from('genres').select('*').order('name');
                if (genreData) setGenres(genreData);

                // Fetch Mixes
                await fetchMixes('All');
            } catch (e) {
                console.error("Fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('public:mixes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'mixes' },
                () => {
                    console.log('Realtime update detected. Refreshing...');
                    fetchMixes(genreRef.current, false); // Pass false to avoid full loading state if desired
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchMixes = async (genreName: string, showLoading = true) => {
        if (showLoading) setLoading(true);
        setSelectedGenre(genreName);
        try {
            let query = supabase
                .from('mixes')
                .select('*, genres(name)')
                .eq('is_premium', false)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            if (genreName !== 'All') {
                setMixes(data?.filter((m: any) => m.genres?.name === genreName) || []);
            } else {
                setMixes(data || []);
            }

        } catch (e) {
            console.error(e);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const getThumbnail = (url: string) => {
        if (!url) return null;
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 pt-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Free Mixtapes</h1>
                    <p className="text-slate-400">Stream and download the latest mixes for free.</p>
                </div>

                {/* Genre Filter */}
                <div className="flex gap-2 text-sm overflow-x-auto pb-2 w-full md:w-auto max-w-full">
                    <button
                        onClick={() => fetchMixes('All')}
                        className={`px-4 py-2 rounded-full border border-white/10 whitespace-nowrap transition-colors ${selectedGenre === 'All' ? 'bg-rose-600 text-white border-rose-600' : 'bg-transparent text-slate-400 hover:text-white'}`}
                    >
                        All
                    </button>
                    {genres.map(g => (
                        <button
                            key={g.id}
                            onClick={() => {
                                // Redirect to Telegram with hashtag search
                                const telegramUrl = `https://t.me/djflowerzpool?q=%23${g.name.replace(/\s+/g, '')}`;  // Assumes channel username 'djflowerzpool'
                                window.open(telegramUrl, '_blank');
                            }}
                            className={`px-4 py-2 rounded-full border border-white/10 whitespace-nowrap transition-colors bg-transparent text-slate-400 hover:text-white hover:border-rose-500`}
                        >
                            {g.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-rose-500" size={40} />
                </div>
            ) : mixes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Music size={48} className="mb-4 opacity-20" />
                    <p>No mixes found in this category yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mixes.map((mix, i) => (
                        <motion.div
                            key={mix.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group bg-slate-900 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/50 transition-all hover:shadow-xl hover:shadow-rose-900/10"
                        >
                            {/* Cover Image (YouTube Thumbnail) */}
                            <div className="relative aspect-video bg-slate-800 overflow-hidden group">
                                {getThumbnail(mix.youtube_url) ? (
                                    <img
                                        src={getThumbnail(mix.youtube_url)!}
                                        alt={mix.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                        <Music className="text-slate-700" size={32} />
                                    </div>
                                )}

                                <a
                                    href={mix.youtube_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                                        <PlayCircle size={24} />
                                    </div>
                                </a>
                                {mix.genres?.name && (
                                    <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-bold text-white border border-white/10">
                                        {mix.genres.name}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-white truncate mb-1">{mix.title}</h3>
                                <p className="text-xs text-slate-500 mb-4">{new Date(mix.created_at).toLocaleDateString()} • DJ Flowerz</p>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={mix.download_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 font-medium transition-colors"
                                    >
                                        <Download size={16} /> Download
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
