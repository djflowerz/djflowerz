export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">Contact Us</h1>

            <div className="max-w-2xl mx-auto bg-slate-900 border border-white/5 rounded-2xl p-8">
                <form className="space-y-6">
                    <div>
                        <label className="block text-slate-400 mb-2">Your Name</label>
                        <input type="text" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2">Email Address</label>
                        <input type="email" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none" placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2">Message</label>
                        <textarea className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500 outline-none h-32" placeholder="How can we help you?"></textarea>
                    </div>
                    <button className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    )
}
