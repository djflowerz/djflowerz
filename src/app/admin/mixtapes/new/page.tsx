'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Upload, AlertCircle, Music } from 'lucide-react'

import { useAuth } from '@/context/AuthProvider'

const ADMIN_EMAIL = 'ianmuriithiflowerz@gmail.com'

export default function AddMixtapePage() {
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
        genre: 'Afrobeat',
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        cover: 'https://placehold.co/600x600/1e293b/ef4444?text=Mix',
        audio_url: '',
        audio_download_url: '',
        video_download_url: ''
    })
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) return

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('mixtapes')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data } = supabase.storage.from('mixtapes').getPublicUrl(filePath)
            // Fix: update formData instead of undefined setCoverArtUrl
            setFormData(prev => ({ ...prev, cover: data.publicUrl }))
        } catch (error: any) {
            alert('Error uploading cover: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.from('mixes').insert([
                {
                    title: formData.title,
                    genre_id: formData.genre,
                    audio_stream_url: formData.audio_url,
                    audio_download_url: formData.audio_download_url, // Added to formData state
                    video_download_url: formData.video_download_url, // Added to formData state
                    cover: formData.cover,
                    is_premium: true
                }
            ])

            if (error) throw error
            router.push('/mixtapes')
        } catch (error: any) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-8">Add New Mixtape</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-8 rounded-2xl border border-white/5">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Mixtape Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                        placeholder="e.g. Afrobeat Vibes Vol. 10"
                    />
                </div>

                {/* Genre */}
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Genre</label>
                    <select
                        required
                        value={formData.genre}
                        onChange={e => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    >
                        <option>Afrobeat</option>
                        <option>R&B</option>
                        <option>Reggae</option>
                        <option>Amapiano</option>
                        <option>Hip Hop</option>
                    </select>
                </div>

                {/* Audio URL */}
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Audio Stream URL (MP3)</label>
                    <div className="relative">
                        <Music className="absolute left-3 top-3.5 text-slate-500" size={20} />
                        <input
                            type="url"
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                            value={formData.audio_url}
                            onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                            placeholder="https://... (Direct link to MP3)"
                        />
                    </div>
                </div>

                {/* Download URLs (Optional) */}
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Audio Download URL</label>
                    <input
                        type="url"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                        value={formData.audio_download_url}
                        onChange={(e) => setFormData({ ...formData, audio_download_url: e.target.value })}
                        placeholder="https://..."
                    />
                </div>
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Video Download URL</label>
                    <input
                        type="url"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                        value={formData.video_download_url}
                        onChange={(e) => setFormData({ ...formData, video_download_url: e.target.value })}
                        placeholder="https://..."
                    />
                </div>

                {/* Cover Upload */}
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Cover Art</label>
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-rose-500/50 transition-colors relative">
                        {uploading ? (
                            <Loader2 className="animate-spin mx-auto text-rose-500" />
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="mx-auto text-slate-500 mb-2" />
                                <p className="text-slate-400 text-sm">Click or drag to upload cover</p>
                            </>
                        )}
                    </div>
                    {formData.cover && (
                        <div className="mt-4">
                            <p className="text-xs text-slate-500 mb-2">Preview:</p>
                            <img src={formData.cover} alt="Preview" className="h-40 rounded-lg object-cover border border-white/10" />
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Publish Mixtape'}
                </button>
            </form>
        </div>
    )
}

