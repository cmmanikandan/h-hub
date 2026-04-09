import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const FloatingWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "👋 Hi there! I'm H-Hub's AI Assistant. How can I help you today?", sender: 'ai', time: new Date() }
    ]);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // First, try to call the real backend if implemented
            const res = await api.post('/chat', { message: input }).catch(() => null);

            if (res && res.data && res.data.reply) {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: res.data.reply, sender: 'ai', time: new Date() }]);
            } else {
                // Fallback: Mock AI Logic
                setTimeout(() => {
                    let reply = "I'm not sure how to help with that. Could you please specify?";
                    const query = input.toLowerCase();

                    if (query.includes('hello') || query.includes('hi')) reply = "Hello! How can I assist you with your shopping today?";
                    else if (query.includes('order')) reply = "You can track your orders in the 'My Orders' section of your profile.";
                    else if (query.includes('refund') || query.includes('return')) reply = "Return requests can be initiated within 7 days of delivery from the Order Details page.";
                    else if (query.includes('payment') || query.includes('wallet')) reply = "We support card payments, UPI, and H-Hub Wallet. You can manage your wallet in your profile.";
                    else if (query.includes('shipping') || query.includes('delivery')) reply = "Standard delivery takes 3-5 business days. Express delivery is available for eligible products.";
                    else if (query.includes('discount') || query.includes('coupon')) reply = "Check out the 'Offers' section in the navbar for active promo codes!";

                    setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'ai', time: new Date() }]);
                    setLoading(false);
                }, 1000);
                return; // Exit early to avoid double loading state reset
            }
        } catch (err) {
            console.error('Chat error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.button
                style={floatBtn}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Open support chat"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        style={cardStyle}
                    >
                        <div style={headerStyle}>
                            <div style={headerInfo}>
                                <div style={aiAvatar}><Bot size={18} /></div>
                                <div>
                                    <h3 style={titleStyle}>H-Hub AI Assistant</h3>
                                    <div style={statusRow}>
                                        <div style={onlineDot} />
                                        <p style={subtitleStyle}>Online - Ready to help</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={closeBtn}><X size={20} /></button>
                        </div>

                        <div style={bodyStyle} ref={scrollRef}>
                            {messages.map((m) => (
                                <div key={m.id} style={m.sender === 'ai' ? msgAiRow : msgUserRow}>
                                    <div style={m.sender === 'ai' ? msgAi : msgUser}>
                                        {m.text}
                                        <div style={m.sender === 'ai' ? timeAi : timeUser}>
                                            {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={msgAiRow}>
                                    <div style={msgAi}>
                                        <div style={typingContainer}>
                                            <div style={typingDot} />
                                            <div style={typingDot} />
                                            <div style={typingDot} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form style={footerStyle} onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                style={inputStyle}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button style={sendBtn} type="submit" disabled={!input.trim() || loading}>
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Styles
const floatBtn = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
};

const cardStyle = {
    position: 'fixed',
    bottom: '100px',
    right: '30px',
    width: '350px',
    height: '500px',
    background: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9998
};

const headerStyle = {
    background: '#6366f1',
    padding: '1.25rem',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const headerInfo = { display: 'flex', alignItems: 'center', gap: '1rem' };
const aiAvatar = { width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const onlineDot = { width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' };
const statusRow = { display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' };
const titleStyle = { margin: 0, fontSize: '1rem', fontWeight: 800 };
const subtitleStyle = { margin: 0, fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 };
const closeBtn = { background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 };

const bodyStyle = {
    flex: 1,
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    overflowY: 'auto',
    background: '#f8fafc'
};

const msgAiRow = { display: 'flex', justifyContent: 'flex-start' };
const msgUserRow = { display: 'flex', justifyContent: 'flex-end' };

const msgAi = {
    padding: '0.8rem 1rem',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px 16px 16px 4px',
    maxWidth: '85%',
    fontSize: '0.9rem',
    color: '#1e293b',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    lineHeight: '1.4'
};

const msgUser = {
    padding: '0.8rem 1rem',
    background: '#6366f1',
    borderRadius: '16px 16px 4px 16px',
    maxWidth: '85%',
    fontSize: '0.9rem',
    color: '#ffffff',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
    lineHeight: '1.4'
};

const timeAi = { fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.4rem', textAlign: 'right' };
const timeUser = { fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem', textAlign: 'left' };

const footerStyle = {
    padding: '1rem',
    borderTop: '1px solid #e1e8f0',
    display: 'flex',
    gap: '0.75rem',
    background: '#ffffff'
};

const inputStyle = {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid #e1e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    outline: 'none',
    fontSize: '0.9rem'
};

const sendBtn = {
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const typingContainer = { display: 'flex', gap: '0.3rem', padding: '0.2rem 0' };
const typingDot = { width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'typing 1.4s infinite' };

export default FloatingWidget;
