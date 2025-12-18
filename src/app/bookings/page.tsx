'use client'
import { useState } from 'react'
import { Mail, Calendar, User, Phone, MapPin, Send, CheckCircle, Smartphone } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function BookingsPage() {
    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        event_date: '',
        event_type: 'Club Gig',
        message: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await supabase.from('bookings').insert([formData])
            setSuccess(true)
        } catch (error) {
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">

                {/* Contact Info */}
                <div className="w-full md:w-1/3 space-y-8 animate-in slide-in-from-left-4 duration-500">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4">Book DJ Flowerz</h1>
                        <p className="text-slate-400 leading-relaxed">
                            Available for club gigs, festivals, parties, corporate events, and private functions across East Africa and beyond.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <a href="mailto:djflowerz254@gmail.com" className="flex items-center gap-4 text-slate-300 hover:text-white group">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Email Us</h3>
                                <p className="text-sm">djflowerz254@gmail.com</p>
                            </div>
                        </a>

                        <a href="https://wa.me/254789783258" className="flex items-center gap-4 text-slate-300 hover:text-white group">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Call / WhatsApp</h3>
                                <p className="text-sm">+254 789 783 258</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Booking Form */}
                <div className="w-full md:w-2/3 bg-slate-900 border border-white/5 rounded-2xl p-6 md:p-8 animate-in slide-in-from-right-4 duration-500">
                    {success ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Request Sent!</h2>
                            <p className="text-slate-400 max-w-sm">
                                Thanks for reaching out. We've received your booking inquiry and will get back to you shortly at {formData.client_email}.
                            </p>
                            <button onClick={() => setSuccess(false)} className="mt-8 text-rose-500 hover:text-rose-400 font-bold">Send another request</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Your Name / Organization</label>
                                    <input required type="text" name="client_name" value={formData.client_name} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Email Address</label>
                                    <input required type="email" name="client_email" value={formData.client_email} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Event Date</label>
                                    <input required type="date" name="event_date" value={formData.event_date} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Event Type</label>
                                    <select name="event_type" value={formData.event_type} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none">
                                        <option>Club Gig</option>
                                        <option>Private Party</option>
                                        <option>Wedding</option>
                                        <option>Festival</option>
                                        <option>Corporate Event</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Phone Number (Optional)</label>
                                    <input type="tel" name="client_phone" value={formData.client_phone} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">Additional Details</label>
                                <textarea name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" placeholder="Tell us more about the venue, time, and vibe..." />
                            </div>

                            <button type="submit" disabled={submitting} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                                {submitting ? 'Sending...' : <><Send size={20} /> Submit Booking Request</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
