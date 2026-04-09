// Gift Cards Component
import React, { useState } from 'react';
import { Gift, Send } from 'lucide-react';
import api from '../utils/api';

const GiftCards = ({ userId }) => {
    const [amount, setAmount] = useState(500);
    const [email, setEmail] = useState('');
    const [created, setCreated] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!email || !amount) {
            alert('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/gift-cards', {
                amount: parseFloat(amount),
                recipientEmail: email,
                buyerId: userId
            });
            setCreated(res.data);
            setEmail('');
            setAmount(500);
            alert('Gift card created successfully!');
        } catch {
            alert('Failed to create gift card');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={container}>
            <div style={header}>
                <Gift size={28} color="#EC4899" />
                <h2 style={title}>Gift Cards</h2>
            </div>

            <div style={createCard}>
                <h3 style={sectionTitle}>Create a Gift Card</h3>

                <div style={formGroup}>
                    <label style={label}>Recipient Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        style={input}
                    />
                </div>

                <div style={formGroup}>
                    <label style={label}>Gift Amount (₹)</label>
                    <div style={amountGrid}>
                        {[500, 1000, 2500, 5000, 10000].map(a => (
                            <button
                                key={a}
                                onClick={() => setAmount(a)}
                                style={{ ...amountBtn, background: amount === a ? '#EC4899' : '#E5E7EB', color: amount === a ? 'white' : '#1F2937' }}
                            >
                                ₹{a}
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={customInput}
                        placeholder="Or enter custom amount"
                    />
                </div>

                <button onClick={handleCreate} disabled={loading} style={createBtn}>
                    <Send size={18} /> {loading ? 'Creating...' : 'Send Gift Card'}
                </button>
            </div>

            {created && (
                <div style={successBox}>
                    <h3>✅ Gift Card Created!</h3>
                    <div style={codeBox}>{created.code}</div>
                    <p>Gift card worth ₹{created.amount} sent to {created.recipientEmail}</p>
                    <p style={expiryText}>Valid until {new Date(created.expiresAt).toLocaleDateString()}</p>
                </div>
            )}

            <div style={infoBox}>
                <h3>📋 About Gift Cards</h3>
                <ul style={infoList}>
                    <li>🎁 Perfect for gifts and special occasions</li>
                    <li>💳 Can be used on any product</li>
                    <li>📅 Valid for 1 year from purchase</li>
                    <li>🔄 No expiration - can be used anytime</li>
                </ul>
            </div>
        </div>
    );
};

const container = { padding: '2rem', background: 'var(--glass)', borderRadius: '16px', marginTop: '2rem' };
const header = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' };
const title = { fontSize: '1.5rem', fontWeight: 900, margin: 0 };
const createCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #E5E7EB' };
const sectionTitle = { margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700 };
const formGroup = { marginBottom: '1rem' };
const label = { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 };
const input = { width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' };
const amountGrid = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' };
const amountBtn = { padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' };
const customInput = { width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' };
const createBtn = { width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #EC4899, #F43F5E)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
const successBox = { background: '#ECFDF5', border: '2px solid #10B981', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' };
const codeBox = { background: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 900, color: '#EC4899', margin: '1rem 0', letterSpacing: '2px' };
const expiryText = { color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0 0' };
const infoBox = { background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB' };
const infoList = { margin: '0.75rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem' };

export default GiftCards;
