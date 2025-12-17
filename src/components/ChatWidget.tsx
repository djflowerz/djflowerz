'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
    id: string
    text: string
    sender: 'user' | 'bot'
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hi! I am the DJ Flowerz AI Assistant. How can I help you today?', sender: 'bot' }
    ])
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSend = () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' }
        setMessages(prev => [...prev, userMsg])
        setInput('')

        // Simulate AI Response logic
        setTimeout(() => {
            let botText = "I can help with that! For specific inquiries, you might want to speak to a human."
            const lowerInput = input.toLowerCase()

            if (lowerInput.includes('price') || lowerInput.includes('cost')) {
                botText = "Our Music Pool subscription starts at KES 700 per month."
            } else if (lowerInput.includes('genre') || lowerInput.includes('mix')) {
                botText = "We have over 20 genres including Amapiano, Reggae, and Gengetone. Check out the Music Pool page!"
            } else if (lowerInput.includes('human') || lowerInput.includes('agent') || lowerInput.includes('help')) {
                botText = "Sure, I can connect you to a human agent via WhatsApp."
            }

            const botMsg: Message = { id: (Date.now() + 1).toString(), text: botText, sender: 'bot' }
            setMessages(prev => [...prev, botMsg])

            if (lowerInput.includes('human') || lowerInput.includes('agent')) {
                setTimeout(() => {
                    const whatsappMsg: Message = { id: (Date.now() + 2).toString(), text: "WHATSAPP_LINK", sender: 'bot' }
                    setMessages(prev => [...prev, whatsappMsg])
                }, 500)
            }

        }, 1000)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-2xl z-40 transition-transform hover:scale-110 active:scale-95 ${isOpen ? 'hidden' : 'flex'}`}
            >
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
                <MessageCircle size={28} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-[90vw] md:w-96 h-[500px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-rose-600 to-rose-800 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-full">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">DJ Flowerz AI</h3>
                                    <p className="text-xs text-rose-200 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-md transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'bot' && msg.text === 'WHATSAPP_LINK' ? (
                                        <a
                                            href="https://wa.me/254789783258"
                                            target="_blank"
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl rounded-tl-none font-bold text-sm flex items-center gap-2 transition-colors shadow-lg"
                                        >
                                            <MessageCircle size={16} /> Chat with Human on WhatsApp
                                        </a>
                                    ) : (
                                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                                ? 'bg-rose-600 text-white rounded-tr-none'
                                                : 'bg-slate-800 border border-white/5 text-slate-200 rounded-tl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors placeholder:text-slate-600"
                            />
                            <button
                                onClick={handleSend}
                                className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
