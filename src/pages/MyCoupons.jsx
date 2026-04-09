import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Tag, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const MyCoupons = () => {
    const { profile } = useAuth();

    const coupons = [
        { id: 1, code: 'SAVE500', discount: '₹500 OFF', description: 'On orders above ₹2,999', expiry: 'Valid till 15 Feb 2026', active: true },
        { id: 2, code: 'FIRST20', discount: '20% OFF', description: 'First order discount', expiry: 'Valid till 28 Feb 2026', active: true },
        { id: 3, code: 'FLASH100', discount: '₹100 OFF', description: 'On all electronics', expiry: 'Valid till 10 Feb 2026', active: true },
        { id: 4, code: 'WINTER50', discount: '₹50 OFF', description: 'Winter sale special', expiry: 'Expired on 31 Jan 2026', active: false }
    ];

    const [copiedId, setCopiedId] = React.useState(null);

    const copyCoupon = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}><Tag size={28} /> My Coupons</h1>
                <div style={count}>{coupons.filter(c => c.active).length} Active</div>
            </header>

            <div style={couponGrid}>
                {coupons.map((coupon) => (
                    <motion.div
                        key={coupon.id}
                        whileHover={{ scale: 1.02 }}
                        style={{ ...couponCard, opacity: coupon.active ? 1 : 0.6 }}
                    >
                        <div style={couponLeft}>
                            <div style={discountBadge}>{coupon.discount}</div>
                            <div style={couponCode}>{coupon.code}</div>
                            <div style={couponDesc}>{coupon.description}</div>
                            <div style={couponExpiry}>{coupon.expiry}</div>
                        </div>
                        <div style={couponRight}>
                            {coupon.active ? (
                                <button
                                    onClick={() => copyCoupon(coupon.code, coupon.id)}
                                    style={copyBtn}
                                >
                                    {copiedId === coupon.id ? (
                                        <>
                                            <Check size={16} /> Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} /> Copy Code
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div style={expiredBadge}>Expired</div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' };
const count = { fontSize: '1rem', fontWeight: 700, color: 'white', background: '#10b981', padding: '0.5rem 1rem', borderRadius: '50px' };
const couponGrid = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const couponCard = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'relative', overflow: 'hidden' };
const couponLeft = { flex: 1 };
const discountBadge = { fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' };
const couponCode = { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '2px', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '8px' };
const couponDesc = { fontSize: '1rem', marginBottom: '0.5rem', opacity: 0.9 };
const couponExpiry = { fontSize: '0.85rem', opacity: 0.8 };
const couponRight = { marginLeft: '2rem' };
const copyBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#667eea', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.3s' };
const expiredBadge = { background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem' };

export default MyCoupons;
