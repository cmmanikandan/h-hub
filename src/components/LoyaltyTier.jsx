// Loyalty Tier Component
import React, { useState, useEffect } from 'react';
import { Award, Gift, TrendingUp, Star } from 'lucide-react';
import api from '../utils/api';

const LoyaltyTier = ({ userId }) => {
    const [tier, setTier] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTier = async () => {
            try {
                const res = await api.get(`/loyalty/tier/${userId}`);
                setTier(res.data);
            } catch (err) {
                console.error('Failed to fetch tier:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTier();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (!tier) return null;

    const tiers = [
        { name: 'bronze', color: '#CD7F32', bonus: '1.0x', discount: 0, requirement: 0 },
        { name: 'silver', color: '#C0C0C0', bonus: '1.25x', discount: 5, requirement: 5000 },
        { name: 'gold', color: '#FFD700', bonus: '1.5x', discount: 10, requirement: 10000 },
        { name: 'platinum', color: '#E5E4E2', bonus: '1.75x', discount: 12, requirement: 20000 },
        { name: 'diamond', color: '#B9F2FF', bonus: '2.0x', discount: 15, requirement: 50000 }
    ];

    const currentTierData = tiers.find(t => t.name === tier.tier) || tiers[0];
    const nextTierData = tiers[tiers.findIndex(t => t.name === tier.tier) + 1];
    const nextRequirement = nextTierData?.requirement || tier.totalSpent + 10000;

    return (
        <div style={container}>
            <div style={header}>
                <Award size={28} color={currentTierData.color} />
                <h2 style={title}>{tier.tier.toUpperCase()} MEMBER</h2>
            </div>

            <div style={tierBadge(currentTierData.color)}>
                <div style={tierName}>{tier.tier}</div>
                <div style={tierBenefits}>
                    <div style={benefit}>🪙 {currentTierData.bonus} SuperCoins</div>
                    <div style={benefit}>🎁 {currentTierData.discount}% Discount</div>
                </div>
            </div>

            <div style={progressSection}>
                <div style={progressLabel}>
                    <span>Progress to {nextTierData?.name || 'MAX'}</span>
                    <span style={spentAmount}>₹{tier.totalSpent.toLocaleString('en-IN')} / ₹{nextRequirement.toLocaleString('en-IN')}</span>
                </div>
                <div style={progressBar}>
                    <div style={{ ...progressFill, width: `${Math.min((tier.totalSpent / nextRequirement) * 100, 100)}%` }}></div>
                </div>
            </div>

            <div style={statsGrid}>
                <div style={statCard}>
                    <TrendingUp size={24} color="#10B981" />
                    <div style={statValue}>₹{tier.totalSpent.toLocaleString('en-IN')}</div>
                    <div style={statLabel}>Total Spent</div>
                </div>
                <div style={statCard}>
                    <Gift size={24} color="#F59E0B" />
                    <div style={statValue}>{tier.ordersCompleted}</div>
                    <div style={statLabel}>Orders</div>
                </div>
                <div style={statCard}>
                    <Star size={24} color="#FF

D700" />
                    <div style={statValue}>Since {new Date(tier.tierSince).toLocaleDateString()}</div>
                    <div style={statLabel}>Member</div>
                </div>
            </div>

            {nextTierData && (
                <div style={nextTierBox}>
                    <h3 style={nextTierTitle}>Next Tier Benefits: {nextTierData.name.toUpperCase()}</h3>
                    <ul style={benefitsList}>
                        <li>🪙 {nextTierData.bonus} SuperCoins on every purchase</li>
                        <li>💳 {nextTierData.discount}% discount on all orders</li>
                        <li>⭐ Priority customer support</li>
                        <li>🎁 Exclusive member-only deals</li>
                        <li>📦 Free shipping above ₹500</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const container = { padding: '2rem', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)', borderRadius: '16px', color: 'white', marginTop: '2rem' };
const header = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' };
const title = { fontSize: '1.5rem', fontWeight: 900, margin: 0 };
const tierBadge = (color) => ({ background: color, padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', opacity: 0.9 });
const tierName = { fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' };
const tierBenefits = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };
const benefit = { fontSize: '0.9rem', fontWeight: 600 };
const progressSection = { marginBottom: '1.5rem' };
const progressLabel = { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' };
const spentAmount = { fontWeight: 700 };
const progressBar = { height: '10px', background: 'rgba(255,255,255,0.3)', borderRadius: '5px', overflow: 'hidden' };
const progressFill = { height: '100%', background: '#FFD700', transition: 'width 0.3s' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' };
const statCard = { background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', textAlign: 'center', backdropFilter: 'blur(10px)' };
const statValue = { fontSize: '1.25rem', fontWeight: 900, margin: '0.5rem 0' };
const statLabel = { fontSize: '0.85rem', opacity: 0.9 };
const nextTierBox = { background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(10px)' };
const nextTierTitle = { margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 700 };
const benefitsList = { margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', opacity: 0.95 };

export default LoyaltyTier;
