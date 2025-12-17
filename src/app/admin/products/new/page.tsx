'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Upload, AlertCircle } from 'lucide-react'

import { useAuth } from '@/context/AuthProvider'

const ADMIN_EMAIL = 'ianmuriithiflowerz@gmail.com'

export default function AddProductPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    // Admin Check
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
        router.push('/dashboard')
        return null
    }

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: 'Software',
        type: 'digital',
        images: [] as string[] // Array of image URLs
    })
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) return

            const newImages: string[] = []

            // Loop through all selected files
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data } = supabase.storage.from('products').getPublicUrl(filePath)
                newImages.push(data.publicUrl)
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
            }))

        } catch (error: any) {
            alert('Error uploading image: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.from('products').insert([
                {
                    title: formData.title,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    type: formData.type,
                    image: formData.images[0] || '', // Main image for backward compatibility
                    images: formData.images // Store all images
                }
            ])

            if (error) throw error

            router.push('/store')
        } catch (error: any) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-8">Add New Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-8 rounded-2xl border border-white/5">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Product Title</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {/* Price & Category */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-slate-400 mb-2 font-bold">Price (KES)</label>
                        <input
                            type="number"
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2 font-bold">Category</label>
                        <select
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option>Software</option>
                            <option>Mapping</option>
                            <option>SoundFX</option>
                            <option>Apparel</option>
                            <option>Hardware</option>
                        </select>
                    </div>
                </div>

                {/* Type */}
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Product Type</label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'digital' })}
                            className={`flex-1 py-3 rounded-lg border ${formData.type === 'digital' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-transparent border-white/10 text-slate-400'}`}
                        >
                            Digital (Download)
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'physical' })}
                            className={`flex-1 py-3 rounded-lg border ${formData.type === 'physical' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-transparent border-white/10 text-slate-400'}`}
                        >
                            Physical (Shipped)
                        </button>
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Product Images (Unlimited)</label>
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-rose-500/50 transition-colors relative">
                        {uploading ? (
                            <Loader2 className="animate-spin mx-auto text-rose-500" />
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple // Allow multiple files
                                    onChange={handleUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="mx-auto text-slate-500 mb-2" />
                                <p className="text-slate-400 text-sm">Click or drag to upload images</p>
                            </>
                        )}
                    </div>

                    {/* Gallery Preview */}
                    {formData.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative group">
                                    <img src={img} alt={`Preview ${idx}`} className="h-24 w-full rounded-lg object-cover border border-white/10" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <AlertCircle size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Create Product'}
                </button>
            </form>
        </div>
    )
}
