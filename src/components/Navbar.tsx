'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Music, User } from 'lucide-react';
import TipJarModal from './TipJarModal';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Free Mixtapes', href: '/mixtapes' },
        { name: 'Music Pool', href: '/music-pool', pro: true },
        { name: 'Store', href: '/store' },
        { name: 'Book DJ', href: '/bookings' },
    ];

    const router = useRouter();
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const query = e.currentTarget.value;
            if (query.trim()) {
                router.push(`/store?search=${encodeURIComponent(query)}`);
            }
        }
    };

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/5 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl py-3 shadow-lg shadow-rose-900/5' : 'bg-transparent py-5'
                }`}>
                <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                            DJ <span className="text-rose-600">FLOWERZ</span>
                        </h1>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
                            >
                                {link.name}
                                {link.pro && (
                                    <span className="absolute -top-3 -right-6 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-1.5 py-0.5 rounded-full">
                                        PRO
                                    </span>
                                )}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-600 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search..."
                                onKeyDown={handleSearch}
                                className="bg-slate-900 border border-white/10 rounded-full py-2 px-4 text-sm text-white w-32 focus:w-64 transition-all outline-none focus:border-rose-500 group-hover:border-white/20"
                            />
                        </div>

                        <button
                            onClick={() => setIsTipModalOpen(true)}
                            className="p-2 text-rose-500 hover:text-white transition-colors flex items-center gap-2 border border-rose-500/30 rounded-full hover:bg-rose-600 px-4"
                        >
                            <span className="text-xs font-bold">Tip DJ</span>
                        </button>

                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                            <ShoppingBag size={20} />
                        </button>
                        <a href="/api/auth/login" className="px-5 py-2 text-sm font-bold text-white bg-rose-600 rounded-full hover:bg-rose-700 transition-transform active:scale-95 shadow-lg shadow-rose-600/20">
                            Join Pool
                        </a>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-300 hover:text-white">
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl h-screen">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-slate-300 hover:text-white py-2 border-b border-white/5"
                            >
                                {link.name} {link.pro && '👑'}
                            </Link>
                        ))}
                        <button
                            onClick={() => { setIsTipModalOpen(true); setIsOpen(false); }}
                            className="text-lg font-medium text-rose-400 hover:text-white py-2 border-b border-white/5 text-left"
                        >
                            Tip DJ Jar ❤️
                        </button>
                        <a href="/api/auth/login" onClick={() => setIsOpen(false)} className="mt-4 w-full py-3 text-center font-bold text-white bg-rose-600 rounded-lg">
                            Login / Join
                        </a>
                    </div>
                )}
            </nav>
            <TipJarModal isOpen={isTipModalOpen} onClose={() => setIsTipModalOpen(false)} />
        </>
    );
}
