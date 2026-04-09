import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Gift, Plus, Loader2, CreditCard, Ticket, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const MyGiftCards = () => {
    const { user, profile } = useAuth();
    const [giftCards, setGiftCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchGiftCards = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/gift-cards/user/${user.id}`);
            setGiftCards(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch gift cards:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGiftCards();
    }, [user?.id]);

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!redeemCode.trim()) return;

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.post('/gift-cards/redeem', {
                code: redeemCode,
                userId: user.id
            });
            setMessage({ type: 'success', text: res.data.message });
            setRedeemCode('');
            fetchGiftCards();
            // Optional: Reload profile to show new wallet balance
            setTimeout(() => setShowRedeemModal(false), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to redeem gift card' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}><Gift size={32} color="var(--primary)" /> My Gift Cards</h1>
                <button style={addBtn} onClick={() => setShowRedeemModal(true)}>
                    <Plus size={18} /> Add Gift Card
                </button>
            </header>

            {loading ? (
                <div style={loadingState}>
                    <Loader2 size={40} className="animate-spin" color="var(--primary)" />
                    <p>Fetching your cards...</p>
                </div>
            ) : (
                <div style={cardGrid}>
                    {giftCards.length > 0 ? (
                        giftCards.map((card) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                                style={{
                                    ...giftCard,
                                    background: card.isActive
                                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                        : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                                    filter: card.isActive ? 'none' : 'grayscale(1)'
                                }}
                            >
                                <div style={cardPattern}>
                                    <div style={cardIcon}>{card.isActive ? '🎁' : '✔️'}</div>
                                </div>
                                <div style={cardContent}>
                                    <div style={cardLabel}>{card.isActive ? 'Active' : 'Redeemed'} Gift Card</div>
                                    <div style={cardAmount}>₹{Number(card.amount).toLocaleString()}</div>
                                    <div style={cardBalance}>
                                        {card.isActive ? `Balance: ₹${Number(card.balance).toLocaleString()}` : 'Added to Wallet'}
                                    </div>
                                    <div style={cardCode}>
                                        <Ticket size={14} style={{ marginRight: '0.5rem' }} />
                                        {card.code}
                                    </div>
                                    <div style={cardExpiry}>
                                        {card.redeemedAt
                                            ? `Redeemed on ${new Date(card.redeemedAt).toLocaleDateString()}`
                                            : `Expires on ${new Date(card.expiresAt).toLocaleDateString()}`}
                                    </div>
                                </div>
                                {card.isActive && (
                                    <div style={cardActions}>
                                        <button style={useBtn} onClick={() => {
                                            setRedeemCode(card.code);
                                            setShowRedeemModal(true);
                                        }}>Redeem to Wallet</button>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div style={emptyState}>
                            <Gift size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                            <h3>No Gift Cards found</h3>
                            <p>You haven't purchased or received any gift cards yet.</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {showRedeemModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={modalContent}
                        >
                            <div style={modalHeader}>
                                <h2>Redeem Gift Card</h2>
                                <button onClick={() => setShowRedeemModal(false)} style={closeBtn}>×</button>
                            </div>

                            <form onSubmit={handleRedeem}>
                                <div style={inputGroup}>
                                    <label style={modalLabel}>Enter Gift Card Code</label>
                                    <input
                                        type="text"
                                        value={redeemCode}
                                        onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                        placeholder="GC-XXXX-XXXX"
                                        style={modalInput}
                                        required
                                    />
                                </div>

                                {message.text && (
                                    <div style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        marginBottom: '1.5rem',
                                        fontSize: '0.9rem',
                                        background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                        color: message.type === 'success' ? '#065f46' : '#991b1b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {message.type === 'success' ? <CheckCircle2 size={18} /> : null}
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={submitBtn}
                                >
                                    {isSubmitting ? 'Verifying...' : 'Redeem Now'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <section style={infoSection}>
                <h2 style={infoTitle}>How to Use Gift Cards</h2>
                <div style={infoGrid}>
                    <div style={infoCard}>
                        <div style={stepNumber}>1</div>
                        <div style={stepTitle}>Add to Account</div>
                        <div style={stepDesc}>Enter your gift card code to add its value to your wallet</div>
                    </div>
                    <div style={infoCard}>
                        <div style={stepNumber}>2</div>
                        <div style={stepTitle}>Shop & Checkout</div>
                        <div style={stepDesc}>Add items to your cart and proceed to secure checkout</div>
                    </div>
                    <div style={infoCard}>
                        <div style={stepNumber}>3</div>
                        <div style={stepTitle}>Pay with Wallet</div>
                        <div style={stepDesc}>Select 'Wallet' as payment method to use your credits</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' };
const title = { fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' };
const addBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)', transition: '0.3s' };
const cardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem', marginBottom: '4rem' };
const giftCard = { borderRadius: '24px', padding: '2.5rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const cardPattern = { position: 'absolute', top: '-10px', right: '-10px', width: '150px', height: '150px', opacity: 0.15 };
const cardIcon = { fontSize: '8rem', transform: 'rotate(-15deg)' };
const cardContent = { position: 'relative', zIndex: 1 };
const cardLabel = { fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '0.75rem' };
const cardAmount = { fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.25rem', letterSpacing: '-1px' };
const cardBalance = { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', opacity: 0.95 };
const cardCode = { fontSize: '1rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', padding: '0.75rem 1.25rem', borderRadius: '12px', marginBottom: '0.75rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)', letterSpacing: '1px' };
const cardExpiry = { fontSize: '0.85rem', opacity: 0.8, fontWeight: 500 };
const cardActions = { display: 'flex', gap: '1rem', marginTop: '2rem' };
const useBtn = { flex: 1, background: 'white', color: '#f5576c', border: 'none', padding: '1rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };

const infoSection = { background: 'white', padding: '3rem', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 30px rgba(0,0,0,0.02)' };
const infoTitle = { fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '3rem', textAlign: 'center' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' };
const infoCard = { textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '24px' };
const stepNumber = { width: '60px', height: '60px', borderRadius: '20px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900, margin: '0 auto 1.5rem', transform: 'rotate(-5deg)' };
const stepTitle = { fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' };
const stepDesc = { fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6 };

const loadingState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', color: 'var(--text-muted)' };
const emptyState = { gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '32px', color: 'var(--text-muted)' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' };
const modalContent = { background: 'white', padding: '3rem', borderRadius: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' };
const closeBtn = { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--text-muted)' };
const inputGroup = { marginBottom: '2rem' };
const modalLabel = { display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' };
const modalInput = { width: '100%', padding: '1.25rem', borderRadius: '16px', border: '2px solid #e2e8f0', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1px', transition: '0.2s' };
const submitBtn = { width: '100%', padding: '1.25rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(236, 72, 153, 0.3)' };

export default MyGiftCards;
