import Link from 'next/link'
import { Home, Music } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
            <div className="text-center">
                <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full text-rose-500 mb-6">
                    <Music size={48} className="animate-pulse" />
                </div>
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <h2 className="text-2xl font-bold text-slate-300 mb-4">Track Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    The requested page seems to have skipped a beat. It might have been moved or doesn't exist.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full transition-colors"
                >
                    <Home size={20} /> Back to Decks
                </Link>
            </div>
        </div>
    )
}
