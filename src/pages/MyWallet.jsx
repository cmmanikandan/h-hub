import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Plus, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import GiftCards from '../components/GiftCards';
import api from '../utils/api';

const MyWallet = () => {
    const { profile } = useAuth();
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinData, setPinData] = useState({ currentPin: '', newPin: '', confirmPin: '' });
    const [showPins, setShowPins] = useState({ current: false, new: false, confirm: false });
    const [pinError, setPinError] = useState('');
    const [pinSuccess, setPinSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const hasPin = profile?.paymentPinHash || (profile?.paymentPin ? true : false);

    // Send Money Modal State
    const [showSendModal, setShowSendModal] = useState(false);
    const [sendData, setSendData] = useState({ recipient: '', amount: '', pin: '', note: '' });
    const [showTransferPin, setShowTransferPin] = useState(false);
    const [sendError, setSendError] = useState('');
    const [sendSuccess, setSendSuccess] = useState('');
    const [sending, setSending] = useState(false);

    // Safe profile access with defaults
    const walletBalance = profile?.wallet || 0;
    const cashbackBalance = profile?.cashback || 0;
    const supercoinsBalance = profile?.supercoins || 0;
    const transactions = Array.isArray(profile?.transactions) ? profile.transactions : [];

    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleSetPin = async () => {
        setPinError('');
        setPinSuccess('');

        if (!pinData.newPin || pinData.newPin.length < 4) {
            setPinError('PIN must be at least 4 digits');
            return;
        }

        if (pinData.newPin !== pinData.confirmPin) {
            setPinError('PINs do not match');
            return;
        }

        if (hasPin && !pinData.currentPin) {
            setPinError('Current PIN is required to change PIN');
            return;
        }

        if (!profile?.id) {
            setPinError('User session not found. Please login again.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                pin: pinData.newPin,
                userId: profile.id
            };
            if (hasPin) payload.currentPin = pinData.currentPin;

            await api.post('/wallet/pin/set', payload);
            setPinSuccess(hasPin ? 'Payment PIN changed successfully!' : 'Payment PIN set successfully!');
            setTimeout(() => {
                setShowPinModal(false);
                setPinData({ currentPin: '', newPin: '', confirmPin: '' });
                setPinSuccess('');
                window.location.reload(); // Refresh to update profile
            }, 2000);
        } catch (error) {
            setPinError(error.response?.data?.error || 'Failed to set PIN');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMoney = async () => {
        setSendError('');
        setSendSuccess('');

        if (!hasPin) {
            setSendError('Please set up a Payment PIN first');
            return;
        }

        if (!sendData.recipient) {
            setSendError('Please enter recipient phone or email');
            return;
        }

        const amount = parseFloat(sendData.amount);
        if (!amount || amount <= 0) {
            setSendError('Please enter a valid amount');
            return;
        }

        if (amount < 1) {
            setSendError('Minimum transfer amount is ₹1');
            return;
        }

        if (amount > walletBalance) {
            setSendError('Insufficient wallet balance');
            return;
        }

        if (!sendData.pin || sendData.pin.length < 4) {
            setSendError('Please enter your Payment PIN');
            return;
        }

        setSending(true);
        try {
            const response = await api.post('/wallet/transfer', {
                recipientIdentifier: sendData.recipient,
                amount: amount,
                pin: sendData.pin,
                note: sendData.note || 'Wallet transfer',
                userId: profile.id
            });

            setSendSuccess(response.data.message || 'Money sent successfully! 🎉');
            setTimeout(() => {
                setShowSendModal(false);
                setSendData({ recipient: '', amount: '', pin: '', note: '' });
                setSendSuccess('');
                window.location.reload(); // Refresh to update balance
            }, 2500);
        } catch (error) {
            setSendError(error.response?.data?.error || 'Failed to send money. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}><Wallet size={28} /> Wallet & Rewards</h1>
            </header>

            <div style={content}>
                {/* Wallet Balance */}
                <section style={card}>
                    <h2 style={cardTitle}>Wallet Balance</h2>
                    <div style={balanceBox}>
                        <div style={balanceAmount}>₹{formatCurrency(walletBalance)}</div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button style={addMoneyBtn}><Plus size={18} /> Add Money</button>
                            <button
                                style={{ ...addMoneyBtn, background: '#10b981' }}
                                onClick={() => {
                                    if (!hasPin) {
                                        alert('Please set up a Payment PIN first from the Security section below');
                                        return;
                                    }
                                    setShowSendModal(true);
                                }}
                            >
                                <Lock size={18} /> Send Money
                            </button>
                        </div>
                    </div>
                </section>

                {/* Security & Rewards */}
                <div style={grid}>
                    {/* Payment PIN Security */}
                    <section style={securityCard}>
                        <div style={{ ...rewardIcon, background: '#dbeafe' }}>
                            <Shield size={28} color="#3b82f6" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={rewardLabel}>Payment PIN</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: hasPin ? '#10b981' : '#f59e0b', marginBottom: '0.5rem' }}>
                                {hasPin ? '✓ Enabled' : '⚠ Not Set'}
                            </div>
                            <button
                                onClick={() => setShowPinModal(true)}
                                style={setPinBtn}
                            >
                                <Lock size={14} /> {hasPin ? 'Change PIN' : 'Set PIN'}
                            </button>
                        </div>
                    </section>

                    <section style={rewardCard}>
                        <div style={rewardIcon}>💰</div>
                        <div>
                            <div style={rewardLabel}>Cashback Earned</div>
                            <div style={rewardValue}>₹{formatCurrency(cashbackBalance)}</div>
                        </div>
                    </section>

                    <section style={rewardCard}>
                        <div style={{ ...rewardIcon, background: '#fef3c7' }}>🪙</div>
                        <div>
                            <div style={rewardLabel}>Supercoin</div>
                            <div style={rewardValue}>₹{formatCurrency(supercoinsBalance)}</div>
                        </div>
                    </section>
                </div>

                {/* Gift Cards */}
                {profile?.id && <GiftCards userId={profile.id} />}

                {/* Transactions */}
                <section style={card}>
                    <h2 style={cardTitle}>Recent Transactions</h2>
                    <div style={transactionList}>
                        {transactions.length > 0 ? (
                            transactions.map((txn) => (
                                <div key={txn.id || Math.random()} style={transactionItem}>
                                    <div>
                                        <div style={txnName}>{txn.item || 'Transaction'}</div>
                                        <div style={txnDate}>{txn.date || new Date().toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ ...txnAmount, color: txn.type === 'Credit' ? '#10b981' : '#ef4444' }}>
                                        {txn.type === 'Credit' ? '+' : '-'}₹{formatCurrency(txn.amount || 0)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={emptyMessage}>No transactions yet</div>
                        )}
                    </div>
                </section>
            </div>

            {/* Send Money Modal */}
            {showSendModal && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                                <Wallet size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                Send Money
                            </h2>
                            <button onClick={() => setShowSendModal(false)} style={closeBtn}>✕</button>
                        </div>

                        <div style={inputGroup}>
                            <label style={label}>Recipient Phone or Email *</label>
                            <input
                                type="text"
                                placeholder="Enter phone number or email"
                                value={sendData.recipient}
                                onChange={(e) => setSendData({ ...sendData, recipient: e.target.value })}
                                style={{ ...input, letterSpacing: 'normal', fontFamily: 'inherit' }}
                            />
                        </div>

                        <div style={inputGroup}>
                            <label style={label}>Amount * (Available: ₹{formatCurrency(walletBalance)})</label>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                value={sendData.amount}
                                onChange={(e) => setSendData({ ...sendData, amount: e.target.value })}
                                style={{ ...input, letterSpacing: 'normal', fontFamily: 'inherit' }}
                                min="1"
                                step="0.01"
                            />
                        </div>

                        <div style={inputGroup}>
                            <label style={label}>Note (Optional)</label>
                            <input
                                type="text"
                                placeholder="What's this for?"
                                value={sendData.note}
                                onChange={(e) => setSendData({ ...sendData, note: e.target.value })}
                                style={{ ...input, letterSpacing: 'normal', fontFamily: 'inherit' }}
                            />
                        </div>

                        <div style={inputGroup}>
                            <label style={label}>Enter Your Payment PIN *</label>
                            <div style={pinInputWrapper}>
                                <input
                                    type={showTransferPin ? 'text' : 'password'}
                                    placeholder="Enter your PIN"
                                    value={sendData.pin}
                                    onChange={(e) => setSendData({ ...sendData, pin: e.target.value })}
                                    style={input}
                                    maxLength={6}
                                />
                                <button
                                    onClick={() => setShowTransferPin(!showTransferPin)}
                                    style={eyeBtn}
                                >
                                    {showTransferPin ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {sendError && (
                            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                ❌ {sendError}
                            </div>
                        )}

                        {sendSuccess && (
                            <div style={{ padding: '0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                ✅ {sendSuccess}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowSendModal(false)}
                                style={cancelBtn}
                                disabled={sending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMoney}
                                style={{ ...saveBtn, background: '#10b981' }}
                                disabled={sending}
                            >
                                {sending ? 'Sending...' : `Send ₹${sendData.amount || '0'}`}
                            </button>
                        </div>

                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '8px', fontSize: '0.85rem', color: '#0369a1' }}>
                            <strong>💡 Tip:</strong> Double-check the recipient details before sending. Transfers are instant and cannot be reversed.
                        </div>
                    </div>
                </div>
            )}

            {/* PIN Setup Modal */}
            {showPinModal && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                                <Lock size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                {hasPin ? 'Change Payment PIN' : 'Set Payment PIN'}
                            </h2>
                            <button onClick={() => setShowPinModal(false)} style={closeBtn}>✕</button>
                        </div>

                        {hasPin && (
                            <div style={inputGroup}>
                                <label style={label}>Current PIN *</label>
                                <div style={pinInputWrapper}>
                                    <input
                                        type={showPins.current ? 'text' : 'password'}
                                        placeholder="Enter current PIN"
                                        value={pinData.currentPin}
                                        onChange={(e) => setPinData({ ...pinData, currentPin: e.target.value })}
                                        style={input}
                                        maxLength={6}
                                    />
                                    <button
                                        onClick={() => setShowPins({ ...showPins, current: !showPins.current })}
                                        style={eyeBtn}
                                    >
                                        {showPins.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={inputGroup}>
                            <label style={label}>New PIN * (min 4 digits)</label>
                            <div style={pinInputWrapper}>
                                <input
                                    type={showPins.new ? 'text' : 'password'}
                                    placeholder="Enter new PIN"
                                    value={pinData.newPin}
                                    onChange={(e) => setPinData({ ...pinData, newPin: e.target.value })}
                                    style={input}
                                    maxLength={6}
                                />
                                <button
                                    onClick={() => setShowPins({ ...showPins, new: !showPins.new })}
                                    style={eyeBtn}
                                >
                                    {showPins.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={inputGroup}>
                            <label style={label}>Confirm New PIN *</label>
                            <div style={pinInputWrapper}>
                                <input
                                    type={showPins.confirm ? 'text' : 'password'}
                                    placeholder="Re-enter new PIN"
                                    value={pinData.confirmPin}
                                    onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })}
                                    style={input}
                                    maxLength={6}
                                />
                                <button
                                    onClick={() => setShowPins({ ...showPins, confirm: !showPins.confirm })}
                                    style={eyeBtn}
                                >
                                    {showPins.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {pinError && (
                            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {pinError}
                            </div>
                        )}

                        {pinSuccess && (
                            <div style={{ padding: '0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {pinSuccess}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowPinModal(false)}
                                style={cancelBtn}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetPin}
                                style={saveBtn}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (hasPin ? 'Change PIN' : 'Set PIN')}
                            </button>
                        </div>

                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '8px', fontSize: '0.85rem', color: '#0369a1' }}>
                            <strong>🔒 Security Tip:</strong> Your PIN will be required for wallet transfers and settlements. Keep it secure and don't share it with anyone.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' };
const content = { display: 'flex', flexDirection: 'column', gap: '2rem' };
const card = { background: 'var(--glass)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' };
const cardTitle = { fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' };
const balanceBox = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const balanceAmount = { fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' };
const addMoneyBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' };
const rewardCard = { background: 'var(--glass)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' };
const rewardIcon = { width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' };
const rewardLabel = { fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' };
const rewardValue = { fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' };
const transactionList = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const transactionItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' };
const txnName = { fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' };
const txnDate = { fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' };
const txnAmount = { fontSize: '1.25rem', fontWeight: 900 };
const emptyMessage = { textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '1rem' };

// PIN Modal Styles
const securityCard = { background: 'var(--glass)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' };
const setPinBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const modalContent = { background: 'white', borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
const closeBtn = { background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' };
const inputGroup = { marginBottom: '1.25rem' };
const label = { display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' };
const pinInputWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const input = { width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', outline: 'none', fontFamily: 'monospace', letterSpacing: '0.2em' };
const eyeBtn = { position: 'absolute', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' };
const cancelBtn = { flex: 1, padding: '0.875rem', background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' };
const saveBtn = { flex: 1, padding: '0.875rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' };

export default MyWallet;
