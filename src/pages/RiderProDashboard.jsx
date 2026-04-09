import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Award, Clock, DollarSign, Zap, Target } from 'lucide-react';
import api from '../utils/api';
import StatusPopup from '../components/StatusPopup';

const RiderProDashboard = () => {
    const [profile, setProfile] = useState({
        totalEarnings: 35420,
        thisWeekEarnings: 4200,
        thisMonthEarnings: 15600,
        activeShifts: 3,
        totalDeliveries: 847,
        avgRating: 4.8,
        completionRate: 98.5,
        cancellationRate: 1.5
    });
    const [shifts] = useState([
        { id: 1, date: '2025-02-07', start: '08:00', end: '16:00', earnings: 1200, deliveries: 28, status: 'completed' },
        { id: 2, date: '2025-02-06', start: '10:00', end: '18:00', earnings: 1100, deliveries: 25, status: 'completed' },
        { id: 3, date: '2025-02-05', start: '08:00', end: '16:00', earnings: 1050, deliveries: 26, status: 'completed' }
    ]);
    const [badges] = useState([
        { id: 1, name: 'Speed Demon', description: '50 deliveries in a day', unlocked: true, icon: '⚡' },
        { id: 2, name: 'Perfect Score', description: '30-day 5-star rating', unlocked: true, icon: '⭐' },
        { id: 3, name: 'Consistent Pro', description: '25 days without cancellation', unlocked: true, icon: '🎯' },
        { id: 4, name: 'Night Rider', description: '100 night deliveries', unlocked: false, icon: '🌙' },
        { id: 5, name: 'Service Champion', description: '1000 total deliveries', unlocked: false, icon: '🏆' },
        { id: 6, name: 'Revenue King', description: '₹50,000 monthly earnings', unlocked: false, icon: '👑' }
    ]);
    const [activeTab, setActiveTab] = useState('overview');
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, message, title, onAction });
    };

    const fetchProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await api.get('/api/rider/pro/dashboard', { headers });
            if (res.data) {
                setProfile((prev) => ({ ...prev, ...res.data }));
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProfile();
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [fetchProfile]);

    const startShift = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.post('/api/rider/shift/start', {}, { headers });
            showStatus('success', 'Shift started successfully', 'Shift Started');
            fetchProfile();
        } catch (err) {
            console.error('Failed to start shift:', err);
            showStatus('failed', 'Failed to start shift', 'Error');
        }
    };

    const endShift = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.post('/api/rider/shift/end', {}, { headers });
            showStatus('success', 'Shift ended successfully', 'Shift Ended');
            fetchProfile();
        } catch (err) {
            console.error('Failed to end shift:', err);
            showStatus('failed', 'Failed to end shift', 'Error');
        }
    };

    return (
        <div style={container}>
            <header style={header}>
                <div>
                    <h1 style={title}>🚴 Rider Pro+ Dashboard</h1>
                    <p style={subtitle}>Track your earnings, shifts, and achievements</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={startShift} style={{ ...actionBtn, background: '#10b981' }}>
                        ▶ Start Shift
                    </button>
                    <button onClick={endShift} style={{ ...actionBtn, background: '#ef4444' }}>
                        ⏹ End Shift
                    </button>
                </div>
            </header>

            {/* Earnings Cards */}
            <div style={earningsGrid}>
                <div style={{ ...earningCard, borderLeft: '4px solid #10b981' }}>
                    <div style={earningLabel}>This Week</div>
                    <div style={earningAmount}>₹{profile.thisWeekEarnings.toLocaleString()}</div>
                    <div style={earningMeta}>+12% from last week</div>
                </div>
                <div style={{ ...earningCard, borderLeft: '4px solid #3b82f6' }}>
                    <div style={earningLabel}>This Month</div>
                    <div style={earningAmount}>₹{profile.thisMonthEarnings.toLocaleString()}</div>
                    <div style={earningMeta}>+8% from last month</div>
                </div>
                <div style={{ ...earningCard, borderLeft: '4px solid #f59e0b' }}>
                    <div style={earningLabel}>Total Earnings</div>
                    <div style={earningAmount}>₹{profile.totalEarnings.toLocaleString()}</div>
                    <div style={earningMeta}>Lifetime</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={tabsBar}>
                {['overview', 'shifts', 'badges'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            ...tabBtn,
                            borderBottom: activeTab === tab ? '3px solid var(--primary)' : 'none',
                            color: activeTab === tab ? 'var(--primary)' : '#6b7280'
                        }}
                    >
                        {tab === 'overview' && '📊 Overview'}
                        {tab === 'shifts' && '🕐 Shift History'}
                        {tab === 'badges' && '🏅 Gamification Badges'}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div>
                    {/* KPIs */}
                    <div style={kpiGrid}>
                        <div style={{ ...kpiCard, borderLeft: '4px solid #8b5cf6' }}>
                            <div style={kpiLabel}>Total Deliveries</div>
                            <div style={kpiValue}>{profile.totalDeliveries}</div>
                            <div style={kpiMeta}>✓ All-time</div>
                        </div>
                        <div style={{ ...kpiCard, borderLeft: '4px solid #10b981' }}>
                            <div style={kpiLabel}>Completion Rate</div>
                            <div style={kpiValue}>{profile.completionRate}%</div>
                            <div style={kpiMeta}>⬆ +0.5% this month</div>
                        </div>
                        <div style={{ ...kpiCard, borderLeft: '4px solid #f59e0b' }}>
                            <div style={kpiLabel}>Avg Rating</div>
                            <div style={kpiValue}>{profile.avgRating}★</div>
                            <div style={kpiMeta}>↗ Last 30 days</div>
                        </div>
                        <div style={{ ...kpiCard, borderLeft: '4px solid #ef4444' }}>
                            <div style={kpiLabel}>Cancellation Rate</div>
                            <div style={kpiValue}>{profile.cancellationRate}%</div>
                            <div style={kpiMeta}>↓ -0.2% this month</div>
                        </div>
                    </div>

                    {/* Earnings Chart */}
                    <div style={chartCard}>
                        <h3 style={chartTitle}>Weekly Earnings Trend</h3>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', justifyContent: 'space-around' }}>
                            {[3500, 4100, 3800, 4200, 4500, 3900, 4200].map((val, i) => (
                                <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                                    <div
                                        style={{
                                            height: (val / 5000 * 100) + '%',
                                            background: 'linear-gradient(to top, var(--primary), var(--secondary))',
                                            borderRadius: '4px',
                                            marginBottom: '0.5rem',
                                            minHeight: '10px'
                                        }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                        Day {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Incentive Cards */}
                    <div style={incentiveGrid}>
                        <div style={incentiveCard}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#10b981', fontWeight: 800 }}>✓ Bonus Earned</h4>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>₹2,500</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>Speed bonus (50 deliveries)</div>
                        </div>
                        <div style={incentiveCard}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontWeight: 800 }}>⭐ Rating Bonus</h4>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6' }}>₹1,200</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>30-day 4.8+ rating</div>
                        </div>
                        <div style={incentiveCard}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b', fontWeight: 800 }}>🎯 Performance Incentive</h4>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>₹800</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>Zero cancellation bonus</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shifts Tab */}
            {activeTab === 'shifts' && (
                <div>
                    <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Recent Shifts</h3>
                    <div style={shiftsGrid}>
                        {shifts.map(shift => (
                            <div key={shift.id} style={shiftCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{new Date(shift.date).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                            {shift.start} - {shift.end}
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            ...statusBadge,
                                            background: shift.status === 'completed' ? '#10b981' : '#3b82f6',
                                            color: 'white'
                                        }}
                                    >
                                        {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                                    </span>
                                </div>

                                <div style={shiftStats}>
                                    <div style={shiftStat}>
                                        <div style={shiftStatLabel}>Earnings</div>
                                        <div style={shiftStatValue}>₹{shift.earnings}</div>
                                    </div>
                                    <div style={shiftStat}>
                                        <div style={shiftStatLabel}>Deliveries</div>
                                        <div style={shiftStatValue}>{shift.deliveries}</div>
                                    </div>
                                    <div style={shiftStat}>
                                        <div style={shiftStatLabel}>Avg/Hour</div>
                                        <div style={shiftStatValue}>₹{Math.round(shift.earnings / 8)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
                <div>
                    <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Gamification Badges</h3>
                    <div style={badgesGrid}>
                        {badges.map(badge => (
                            <div
                                key={badge.id}
                                style={{
                                    ...badgeCard,
                                    opacity: badge.unlocked ? 1 : 0.5,
                                    border: badge.unlocked ? '2px solid var(--primary)' : '2px solid #e5e7eb'
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                                <h4 style={{ fontWeight: 800, margin: '0.5rem 0', fontSize: '0.95rem' }}>{badge.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{badge.description}</p>
                                {badge.unlocked && (
                                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                                        ✓ ACHIEVED
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <StatusPopup
                show={popup.show}
                type={popup.type}
                title={popup.title}
                message={popup.message}
                onAction={popup.onAction}
                onClose={() => setPopup(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem', gap: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, margin: 0 };
const subtitle = { color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' };
const actionBtn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer' };
const earningsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' };
const earningCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const earningLabel = { fontSize: '0.85rem', color: '#6b7280', fontWeight: 700 };
const earningAmount = { fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0' };
const earningMeta = { fontSize: '0.85rem', color: '#10b981', fontWeight: 600 };
const tabsBar = { display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb' };
const tabBtn = { padding: '1rem 0', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', background: 'none', border: 'none' };
const kpiGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const kpiCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const kpiLabel = { fontSize: '0.85rem', color: '#6b7280', fontWeight: 700 };
const kpiValue = { fontSize: '1.8rem', fontWeight: 900, margin: '0.5rem 0' };
const kpiMeta = { fontSize: '0.8rem', color: '#6b7280' };
const chartCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '2rem' };
const chartTitle = { fontWeight: 800, margin: '0 0 1rem 0' };
const incentiveGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' };
const incentiveCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const shiftsGrid = { display: 'grid', gap: '1rem' };
const shiftCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const statusBadge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 };
const shiftStats = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' };
const shiftStat = { background: '#f9fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' };
const shiftStatLabel = { fontSize: '0.8rem', color: '#6b7280', fontWeight: 700 };
const shiftStatValue = { fontSize: '1.3rem', fontWeight: 900, marginTop: '0.25rem' };
const badgesGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.5rem' };
const badgeCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', transition: 'all 0.3s' };

export default RiderProDashboard;
