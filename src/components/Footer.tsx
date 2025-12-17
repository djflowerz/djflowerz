'use client'
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Mail, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Custom TikTok SVG
const TikTokIcon = ({ size = 18, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

export default function Footer() {
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [subscribed, setSubscribed] = useState(false)

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await supabase.from('newsletter').insert({ email })
            setSubscribed(true)
            setEmail('')
        } catch (error) {
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link href="/" className="relative block h-10 w-32 hover:opacity-80 transition-opacity">
                            <h2 className="text-2xl font-black text-white">DJ <span className="text-rose-600">FLOWERZ</span></h2>
                        </Link>
                        <p className="mt-4 text-slate-400 max-w-sm leading-relaxed">
                            The ultimate destination for exclusive DJ mixes, high-quality music pool tracks, and professional DJ gear.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <SocialLink href="https://www.facebook.com/vdj.flowerz" icon={<Facebook size={18} />} />
                            <SocialLink href="https://www.instagram.com/djflowerz/" icon={<Instagram size={18} />} />
                            <SocialLink href="https://www.tiktok.com/@dj.flowerz" icon={<TikTokIcon size={18} />} />
                            <SocialLink href="https://www.youtube.com/@dj_flowerz" icon={<Youtube size={18} />} />
                        </div>
                        <div className="pt-6 border-t border-white/5 mt-6">
                            <h5 className="font-bold text-white mb-2">Contact Us</h5>
                            <p className="text-slate-400 text-sm mb-1">Email: <a href="mailto:djflowerz254@gmail.com" className="text-rose-500 hover:underline">djflowerz254@gmail.com</a></p>
                            <p className="text-slate-400 text-sm">WhatsApp: <a href="https://wa.me/254789783258" className="text-green-500 hover:underline">+254 789 783 258</a></p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Explore</h4>
                        <ul className="space-y-3">
                            {['Free Mixtapes', 'Music Pool', 'DJ Store', 'Merchandise'].map(item => (
                                <li key={item}><Link href="#" className="text-slate-400 hover:text-rose-500 transition-colors">{item}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter & Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                        <p className="text-sm text-slate-400 mb-4">Join our newsletter for fresh drops.</p>

                        {subscribed ? (
                            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                <Check size={16} /> Subscribed successfully!
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="relative mb-8">
                                <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="absolute right-1 top-1 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-md transition-colors disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                </button>
                            </form>
                        )}

                        <h4 className="text-white font-bold mb-4 mt-6">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li key="contact"><Link href="/contact" className="text-slate-400 hover:text-rose-500 transition-colors">Contact Us</Link></li>
                            <li key="tos"><Link href="/terms" className="text-slate-400 hover:text-rose-500 transition-colors">Terms</Link> & <Link href="/privacy" className="text-slate-400 hover:text-rose-500 transition-colors">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} DJ Flowerz. All rights reserved. Built for the culture.</p>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-all transform hover:-translate-y-1"
        >
            {icon}
        </a>
    )
}
