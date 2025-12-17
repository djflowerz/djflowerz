'use client'
import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, SkipBack, SkipForward, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Create a simple custom event for global control
export const playTrack = (track: any) => {
    const event = new CustomEvent('play-track', { detail: track })
    window.dispatchEvent(event)
}

export default function AudioPlayer() {
    const [track, setTrack] = useState<any>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        const handlePlayTrack = (e: CustomEvent) => {
            setTrack(e.detail)
            setIsPlaying(true)
        }

        window.addEventListener('play-track', handlePlayTrack as EventListener)
        return () => window.removeEventListener('play-track', handlePlayTrack as EventListener)
    }, [])

    useEffect(() => {
        if (track && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Playback failed", e))
        }
    }, [track])

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.play()
            else audioRef.current.pause()
        }
    }, [isPlaying])

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime
            const duration = audioRef.current.duration || 1
            setProgress((current / duration) * 100)
        }
    }

    if (!track) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-4 z-40"
            >
                <div className="container mx-auto flex items-center justify-between gap-4">
                    {/* Track Info */}
                    <div className="flex items-center gap-4 w-1/4">
                        <img src={track.cover} alt={track.title} className="w-12 h-12 rounded bg-slate-800 object-cover" />
                        <div className="min-w-0">
                            <h4 className="text-white font-bold text-sm truncate">{track.title}</h4>
                            <p className="text-xs text-rose-500">{track.genre}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center flex-1 max-w-md">
                        <div className="flex items-center gap-6 mb-2">
                            <button className="text-slate-400 hover:text-white"><SkipBack size={20} /></button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                            </button>
                            <button className="text-slate-400 hover:text-white"><SkipForward size={20} /></button>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer">
                            <div className="h-full bg-rose-500 transition-all duration-100" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    {/* Volume / Close */}
                    <div className="flex items-center justify-end gap-4 w-1/4">
                        <Volume2 size={20} className="text-slate-400" />
                        <button onClick={() => { setIsPlaying(false); setTrack(null); }} className="text-slate-500 hover:text-red-400">
                            <X size={20} />
                        </button>
                    </div>

                    <audio
                        ref={audioRef}
                        src={track.audio_url}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
