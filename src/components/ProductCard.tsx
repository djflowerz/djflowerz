'use client'
import { Link } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

// ProductCard.tsx
export default function ProductCard({ title, price, category, image, images, type, id }: any) {
    const { addItem } = useCart()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Combine main image with images array if both exist, or use what's available
    const allImages = images && images.length > 0 ? images : [image]

    // Handle price input (string with commas or raw number)
    const priceNumber = typeof price === 'string'
        ? parseInt(price.replace(/,/g, ''), 10)
        : typeof price === 'number' ? price : 0;

    const displayPrice = priceNumber.toLocaleString()

    const handleAddToCart = () => {
        addItem({ id, title, price: priceNumber, image: allImages[0], category })
    }

    return (
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all group hover:shadow-xl hover:shadow-rose-900/10">
            <div className="aspect-[4/3] bg-slate-800 relative overflow-hidden group/image">
                <img
                    src={allImages[currentImageIndex] || "https://placehold.co/600x400?text=No+Image"}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500"
                />

                {/* Image Navigation Dots (if multiple) */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover/image:opacity-100 transition-opacity">
                        {allImages.map((_: string, idx: number) => (
                            <button
                                key={idx}
                                onMouseEnter={() => setCurrentImageIndex(idx)}
                                className={`w-2 h-2 rounded-full ${currentImageIndex === idx ? 'bg-rose-500' : 'bg-white/50 hover:bg-white'}`}
                            />
                        ))}
                    </div>
                )}

                <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-bold text-white uppercase tracking-wider">
                    {category}
                </span>
                {type === 'digital' && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-blue-600/80 backdrop-blur-md rounded text-xs font-bold text-white">
                        Digital
                    </span>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-1 truncate">{title}</h3>
                <p className="text-sm text-slate-400 mb-4">{type === 'digital' ? 'Instant Download' : 'Physical Item'}</p>

                <div className="flex items-center justify-between">
                    <span className="text-rose-500 font-bold text-lg">KES {displayPrice}</span>
                    <button onClick={handleAddToCart} className="px-4 py-2 bg-white/5 hover:bg-white/10 hover:text-rose-500 text-white font-medium rounded-lg transition-colors text-sm">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}
