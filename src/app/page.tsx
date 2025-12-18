'use client';

import Link from 'next/link';
import { ArrowRight, Music, ShoppingBag, PlayCircle, Lock, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-20">

      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-slate-950 to-slate-950 z-0" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Now Trending: Afrobeat 2025 Mix
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Vibe</span>
            <br /> With DJ Flowerz.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Access exclusive high-quality mixes, join the VIP Music Pool, and shop premium DJ gear. All in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center gap-4"
          >
            <Link href="/music-pool" className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-lg transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-rose-600/25">
              <Lock size={20} /> Join Music Pool
            </Link>
            <Link href="/mixtapes" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold text-lg transition-all flex items-center gap-2 backdrop-blur-sm">
              <PlayCircle size={20} /> Free Mixes
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID (MUSIC POOL) */}
      <section className="container mx-auto px-4 md:px-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Join The Movement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Music size={40} className="text-rose-500" />}
            title="Exclusive Music Pool"
            description="Get access to extended edits, intros, and clean versions directly via Telegram."
            link="/music-pool"
            linkText="Join Now"
          />
          <FeatureCard
            icon={<PlayCircle size={40} className="text-amber-500" />}
            title="Weekly Mixtapes"
            description="Stream and download the hottest mixes covering Afrobeat, Dancehall, and Hip Hop."
            link="/mixtapes"
            linkText="Listen Free"
          />
          <FeatureCard
            icon={<ShoppingBag size={40} className="text-indigo-500" />}
            title="DJ Store"
            description="Purchase software packs, sound effects, and branded merchandise instantly."
            link="/store"
            linkText="Shop Now"
          />
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="container mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Elite Gear & Merchandise</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Discover professional-grade tools used by DJ Flowerz to create world-class performances.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            name="Pro DJ Controller"
            price="120,000"
            img="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80"
            category="Hardware"
          />
          <ProductCard
            name="Studio Headphones"
            price="35,000"
            img="https://images.unsplash.com/photo-1546435770-a3e426ff472b?auto=format&fit=crop&q=80"
            category="Accessories"
          />
          <ProductCard
            name="Exclusive Drum Kit"
            price="5,000"
            img="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80"
            category="Software"
          />
          <ProductCard
            name="DJ Flowerz Cap"
            price="2,500"
            img="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80"
            category="Merch"
          />
        </div>
      </section>

      {/* LATEST DROPS */}
      <LatestDropsSection />

      {/* YOUTUBE CHANNEL PROMOTION */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-red-600/10 to-rose-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="flex justify-center mb-2">
              <span className="p-4 bg-red-600 rounded-full text-white shadow-lg shadow-red-600/30 ring-4 ring-red-600/20">
                <Youtube size={32} />
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Watch & Vibe with <span className="text-red-500">DJ Flowerz</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Catch live sets, exclusive video mixes, and behind-the-scenes content directly on YouTube.
              Don't miss a beat—subscribe now!
            </p>

            <div className="pt-6">
              <a
                href="https://www.youtube.com/@dj_flowerz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-red-600 hover:bg-red-50 text-base md:text-lg font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-white/10"
              >
                <Youtube size={24} className="fill-current" />
                Subscribe to Channel
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ADVERTISEMENT SECTION */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden group">
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80"
            alt="Ad Banner"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-transparent flex items-center p-8 md:p-12">
            <div className="max-w-md space-y-4">
              <span className="text-rose-500 font-bold tracking-widest text-xs uppercase">Limited Offer</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Use Code <span className="text-rose-500 underline decoration-2 underline-offset-4">DJFLOWERZ</span> for 20% OFF Your First Gear Purchase</h2>
              <Link href="/store" className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95">
                Shop Equipment <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LatestDropsSection() {
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    const fetchDrops = async () => {
      const { data } = await supabase
        .from('mixes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setDrops(data);
    }

    fetchDrops();

    // Realtime Subscription
    const channel = supabase
      .channel('latest-drops')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mixes' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchDrops();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getThumbnail = (url: string) => {
    if (!url) return null;
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return null;
  }

  return (
    <section className="container mx-auto px-4 md:px-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Latest Drops</h2>
          <p className="text-slate-400">Fresh mixes just for you.</p>
        </div>
        <Link href="/mixtapes" className="text-rose-500 font-medium hover:text-rose-400 flex items-center gap-1">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drops.length === 0 ? (
          // Skeletons
          [1, 2, 3].map(i => (
            <div key={i} className="aspect-video bg-slate-900 rounded-xl border border-white/5 animate-pulse" />
          ))
        ) : (
          drops.map((item) => (
            <a key={item.id} href={item.youtube_url} target="_blank" rel="noreferrer" className="aspect-video bg-slate-900 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
              {getThumbnail(item.youtube_url) ? (
                <img src={getThumbnail(item.youtube_url)!} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
              )}

              <PlayCircle size={48} className="absolute text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all z-10" />
              <p className="absolute bottom-4 left-4 text-white font-bold z-10 truncate max-w-[90%]">{item.title}</p>
            </a>
          ))
        )}
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description, link, linkText }: any) {
  return (
    <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-rose-500/30 transition-colors group">
      <div className="mb-6 bg-slate-950 w-16 h-16 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 mb-6 leading-relaxed">{description}</p>
      <Link href={link} className="text-white font-bold hover:text-rose-500 flex items-center gap-2 text-sm uppercase tracking-wide">
        {linkText} <ArrowRight size={16} />
      </Link>
    </div>
  )
}
function ProductCard({ name, price, img, category }: any) {
  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden group hover:border-rose-500/30 transition-all">
      <div className="aspect-square overflow-hidden relative">
        <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
          {category}
        </div>
      </div>
      <div className="p-5 space-y-3">
        <h3 className="font-bold text-white group-hover:text-rose-500 transition-colors">{name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-bold text-sm">KES {price}</span>
          <Link href="/store" className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-full transition-colors">
            <ShoppingBag size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
