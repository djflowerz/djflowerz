'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProductCard from '@/components/ProductCard'
import { Loader2, Music, ShoppingBag, Search as SearchIcon } from 'lucide-react'
import Link from 'next/link'

function SearchResults() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const [products, setProducts] = useState<any[]>([])
    const [mixes, setMixes] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (query) {
            handleSearch()
        }
    }, [query])

    const handleSearch = async () => {
        setLoading(true)
        try {
            // Search Products
            const { data: productData } = await supabase
                .from('products')
                .select('*')
                .ilike('name', `%${query}%`)
                .limit(10)

            if (productData) setProducts(productData)

            // Search Mixes
            const { data: mixData } = await supabase
                .from('mixes')
                .select('*, genres(name)')
                .ilike('title', `%${query}%`)
                .limit(10)

            if (mixData) setMixes(mixData)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!query) return <div className="text-center text-slate-500 py-20">Type something to search...</div>

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-bold text-white mb-6">Search Results for "{query}"</h1>
                {loading && <Loader2 className="animate-spin text-rose-500" />}
            </div>

            {!loading && products.length === 0 && mixes.length === 0 && (
                <div className="text-center text-slate-500 py-10 border border-dashed border-white/10 rounded-2xl">
                    <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No results found.</p>
                </div>
            )}

            {products.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ShoppingBag className="text-rose-500" /> Products
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(p => <ProductCard key={p.id} {...p} />)}
                    </div>
                </section>
            )}

            {mixes.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Music className="text-amber-500" /> Mixtapes & Pool
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mixes.map(mix => (
                            <div key={mix.id} className="bg-slate-900 border border-white/5 rounded-xl p-4 flex gap-4 hover:border-white/20 transition-all">
                                <div className="w-24 h-24 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                    <img src={mix.cover || `https://img.youtube.com/vi/${mix.youtube_url?.split('v=')[1]?.split('&')[0]}/hqdefault.jpg`} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white line-clamp-2">{mix.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{mix.genres?.name}</p>
                                    <Link href={mix.is_premium ? '/music-pool' : '/mixtapes'} className="mt-2 inline-block text-xs font-bold text-rose-500 hover:text-white">
                                        View in {mix.is_premium ? 'Music Pool' : 'Mixtapes'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <div className="container mx-auto px-4 py-24 min-h-screen">
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-rose-500" /></div>}>
                <SearchResults />
            </Suspense>
        </div>
    )
}
