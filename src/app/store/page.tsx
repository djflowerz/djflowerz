'use client'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { Filter, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function StorePage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: true })

            if (error) throw error
            if (data) setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">DJ Store</h1>
                    <p className="text-slate-400">Upgrade your setup with premium software and exclusive merch.</p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors">
                    <Filter size={16} /> Filter
                </button>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-rose-500" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            )}
        </div>
    )
}
