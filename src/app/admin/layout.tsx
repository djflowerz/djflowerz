'use client'
import Link from 'next/link'
import { LayoutDashboard, Music, ShoppingBag, Users, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthProvider'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { signOut } = useAuth()

    // In a real app, we would verify role === 'admin' here

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
        { icon: Music, label: 'Mixtapes', href: '/admin/mixtapes' },
        { icon: ShoppingBag, label: 'Products', href: '/admin/products' },
        { icon: Users, label: 'Users', href: '/admin/users' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
    ]

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-white/5 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        DJ<span className="text-rose-600">FLOWERZ</span> <span className="text-xs bg-rose-600 px-1 py-0.5 rounded text-white ml-1">ADMIN</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 transition-colors w-full">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    )
}
