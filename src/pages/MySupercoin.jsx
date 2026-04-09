import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Coins, TrendingUp, ShoppingBag, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const MySupercoin = () => {
    const { profile } = useAuth();

    const supercoinBalance = profile?.supercoins || 0;
    const rawHistory = profile?.supercoinHistory;
    const supercoinHistory = Array.isArray(rawHistory)
        ? rawHistory
        : typeof rawHistory === 'string'
            ? (() => {
                try {
                    const parsed = JSON.parse(rawHistory);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (error) {
                    return [];
                }
            })()
            : [];

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}><Coins size={28} /> Supercoin</h1>
            </header>

            {/* Balance Card */}
            <section style={balanceCard}>
                <div style={balanceContent}>
                    <div style={coinIcon}>🪙</div>
                    <div>
                        <div style={balanceLabel}>Your Supercoin Balance</div>
                        <div style={balanceAmount}>₹{supercoinBalance}</div>
                        <div style={balanceDesc}>1 Supercoin = ₹1</div>
                    </div>
                </div>
                <button style={redeemBtn}>Redeem Now</button>
            </section>

            {/* How it Works */}
            <section style={infoSection}>
                <h2 style={sectionTitle}>How Supercoin Works</h2>
                <div style={infoGrid}>
                    <div style={infoCard}>
                        <div style={iconBox}>🛍️</div>
                        <div style={infoTitle}>Earn on Every Purchase</div>
                        <div style={infoDesc}>Get 1 Supercoin for every ₹100 spent</div>
                    </div>
                    <div style={infoCard}>
                        <div style={iconBox}>💰</div>
                        <div style={infoTitle}>Redeem for Discounts</div>
                        <div style={infoDesc}>Use Supercoins to get instant discounts</div>
                    </div>
                    <div style={infoCard}>
                        <div style={iconBox}>⏰</div>
                        <div style={infoTitle}>Valid for 1 Year</div>
                        <div style={infoDesc}>Supercoins expire after 365 days</div>
                    </div>
                </div>
            </section>

            {/* Transaction History */}
            <section style={historySection}>
                <h2 style={sectionTitle}>Transaction History</h2>
                <div style={historyList}>
                    {supercoinHistory.length > 0 ? (
                        supercoinHistory.map((txn) => (
                            <motion.div key={txn.id} whileHover={{ x: 5 }} style={historyItem}>
                                <div style={historyIcon}>
                                    {txn.type === 'earned' ? <TrendingUp size={20} color="#10b981" /> : <ShoppingBag size={20} color="#ef4444" />}
                                </div>
                                <div style={historyInfo}>
                                    <div style={historyDesc}>{txn.description}</div>
                                    <div style={historyDate}>{txn.date}</div>
                                </div>
                                <div style={{ ...historyAmount, color: txn.type === 'earned' ? '#10b981' : '#ef4444' }}>
                                    {txn.amount > 0 ? '+' : ''}{txn.amount} SC
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                            No supercoin transactions yet.
                        </div>
                    )}
                </div>
            </section>

            {/* Redemption Options */}
            <section style={redemptionSection}>
                <h2 style={sectionTitle}>Redemption Options</h2>
                <div style={redemptionGrid}>
                    <div style={redemptionCard}>
                        <div style={redemptionAmount}>₹50 OFF</div>
                        <div style={redemptionCost}>Use 50 Supercoins</div>
                        <button style={redemptionBtn} disabled>Not Enough Coins</button>
                    </div>
                    <div style={redemptionCard}>
                        <div style={redemptionAmount}>₹25 OFF</div>
                        <div style={redemptionCost}>Use 25 Supercoins</div>
                        <button style={redemptionBtn}>Redeem Now</button>
                    </div>
                    <div style={redemptionCard}>
                        <div style={redemptionAmount}>₹10 OFF</div>
                        <div style={redemptionCost}>Use 10 Supercoins</div>
                        <button style={redemptionBtn}>Redeem Now</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' };
const balanceCard = { background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', padding: '2rem', borderRadius: '24px', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const balanceContent = { display: 'flex', alignItems: 'center', gap: '1.5rem' };
const coinIcon = { fontSize: '4rem' };
const balanceLabel = { fontSize: '1rem', opacity: 0.9, marginBottom: '0.5rem' };
const balanceAmount = { fontSize: '3rem', fontWeight: 900, marginBottom: '0.25rem' };
const balanceDesc = { fontSize: '0.9rem', opacity: 0.8 };
const redeemBtn = { background: 'white', color: '#f59e0b', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' };
const infoSection = { background: 'var(--glass)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)', marginBottom: '2rem' };
const sectionTitle = { fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' };
const infoCard = { textAlign: 'center', padding: '1rem' };
const iconBox = { fontSize: '3rem', marginBottom: '1rem' };
const infoTitle = { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' };
const infoDesc = { fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 };
const historySection = { background: 'var(--glass)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)', marginBottom: '2rem' };
const historyList = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const historyItem = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' };
const historyIcon = { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const historyInfo = { flex: 1 };
const historyDesc = { fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' };
const historyDate = { fontSize: '0.85rem', color: 'var(--text-muted)' };
const historyAmount = { fontSize: '1.25rem', fontWeight: 900 };
const redemptionSection = { background: 'var(--glass)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' };
const redemptionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' };
const redemptionCard = { background: 'white', padding: '1.5rem', borderRadius: '16px', border: '2px solid var(--glass-border)', textAlign: 'center' };
const redemptionAmount = { fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' };
const redemptionCost = { fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' };
const redemptionBtn = { width: '100%', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' };

export default MySupercoin;
