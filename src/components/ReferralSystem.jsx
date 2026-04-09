// Referral System Component
import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, Target } from 'lucide-react';
import api from '../utils/api';

const ReferralSystem = ({ userId }) => {
    const [stats, setStats] = useState(null);
    const [referralCode, setReferralCode] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const generateCode = async () => {
            try {
                const res = await api.post('/referrals/generate', { referrerId: userId });
                setReferralCode(res.data.code);
            } catch (__) {
                console.error('Failed to generate code:', __);
            }
        };

        const fetchStats = async () => {
            try {
                const res = await api.get(`/referrals/stats/${userId}`);
                setStats(res.data);
            } catch (__) {
                console.error('Failed to fetch stats:', __);
            }
        };

        generateCode();
        fetchStats();
    }, [userId]);

    const copyToClipboard = async () => {
        const text = `Join my store! Use my referral code: ${referralCode}\n${window.location.origin}/signup?ref=${referralCode}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!stats) return <div>Loading referral data...</div>;

    return (
        <div style={container}>
            <div style={header}>
                <Share2 size={28} color="#3B82F6" />
                <h2 style={title}>Refer & Earn</h2>
            </div>

            <div style={codeCard}>
                <div style={codeLabel}>Your Referral Code</div>
                <div style={codeDisplay}>{referralCode}</div>
                <button onClick={copyToClipboard} style={copyBtn}>
                    {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                </button>
            </div>

            <div style={statsGrid}>
                <div style={statBox}>
                    <div style={statNumber}>{stats.totalReferrals}</div>
                    <div style={statName}>People Referred</div>
                </div>
                <div style={statBox}>
                    <div style={statNumber}>{stats.signedUp}</div>
                    <div style={statName}>Signed Up</div>
                </div>
                <div style={statBox}>
                    <div style={statNumber}>{stats.completed}</div>
                    <div style={statName}>Completed Orders</div>
                </div>
                <div style={statBox}>
                    <div style={statAmount}>₹{stats.totalEarnings}</div>
                    <div style={statName}>Total Earned</div>
                </div>
            </div>

            <div style={benefitsBox}>
                <h3 style={benefitsTitle}>💰 How It Works</h3>
                <ul style={benefitsList}>
                    <li>✅ Share your referral code</li>
                    <li>💳 They sign up and place their first order</li>
                    <li>🎁 You both get Supercoins bonus</li>
                    <li>📈 Earn rewards on their future purchases</li>
                </ul>
            </div>
        </div>
    );
};

const container = { padding: '2rem', background: 'var(--glass)', borderRadius: '16px', marginTop: '2rem', border: '1px solid var(--glass-border)' };
const header = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' };
const title = { fontSize: '1.5rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' };
const codeCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', border: '2px solid var(--primary)' };
const codeLabel = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 };
const codeDisplay = { fontSize: '1.75rem', fontFamily: 'monospace', fontWeight: 900, color: 'var(--primary)', margin: '0.75rem 0', letterSpacing: '2px' };
const copyBtn = { padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' };
const statBox = { background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #E5E7EB' };
const statNumber = { fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' };
const statAmount = { fontSize: '1.5rem', fontWeight: 900, color: '#10B981' };
const statName = { fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' };
const benefitsBox = { background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB' };
const benefitsTitle = { margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' };
const benefitsList = { margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' };

export default ReferralSystem;
