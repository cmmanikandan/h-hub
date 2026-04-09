import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, TrendingDown, Users, Lock, DollarSign, BarChart3 } from 'lucide-react';
import api from '../utils/api';
import StatusPopup from '../components/StatusPopup';

const CODRiskDashboard = () => {
    const [variance, setVariance] = useState({
        totalOrders: 5200,
        totalValue: 1240000,
        moneyRecovered: 1198000,
        variance: 42000,
        variancePercent: 3.4,
        blockedRiders: 12,
        suspiciousTransactions: 45,
        trend: 'up'
    });
    const [riderLimits, setRiderLimits] = useState([
        { id: 'RID001', name: 'Rajesh Kumar', phoneEnding: '****5432', dailyLimit: 50000, monthlyLimit: 500000, status: 'active', utilizationPercent: 45 },
        { id: 'RID002', name: 'Priya Singh', phoneEnding: '****8901', dailyLimit: 30000, monthlyLimit: 300000, status: 'blocked', utilizationPercent: 100 },
        { id: 'RID003', name: 'Ahmed Hassan', phoneEnding: '****2345', dailyLimit: 50000, monthlyLimit: 500000, status: 'active', utilizationPercent: 78 },
        { id: 'RID004', name: 'Deepak Patel', phoneEnding: '****6789', dailyLimit: 25000, monthlyLimit: 250000, status: 'watched', utilizationPercent: 85 }
    ]);
    const [riskScores] = useState([
        { id: 'RID001', name: 'Rajesh Kumar', score: 25, level: 'low', reasons: ['High completion rate', 'No complaints'] },
        { id: 'RID003', name: 'Ahmed Hassan', score: 62, level: 'high', reasons: ['High variance', '3 disputes in 7 days'] },
        { id: 'RID002', name: 'Priya Singh', score: 95, level: 'critical', reasons: ['Critical variance', 'Multiple blocks'] }
    ]);
    const [edits, setEdits] = useState({});
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, message, title, onAction });
    };

    const fetchVarianceReport = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await api.get('/api/logix/cod/variance-report', { headers });
            if (res.data) {
                setVariance((prev) => ({ ...prev, ...res.data }));
            }
        } catch (err) {
            console.error('Failed to fetch variance:', err);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchVarianceReport();
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [fetchVarianceReport]);

    const handleUpdateLimit = async (riderId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.put(`/api/admin/cod/set-rider-limit`, {
                riderId,
                dailyLimit: edits[riderId].dailyLimit,
                monthlyLimit: edits[riderId].monthlyLimit
            }, { headers });
            setRiderLimits(riderLimits.map(r => r.id === riderId ? { ...r, ...edits[riderId] } : r));
            setEdits({ ...edits, [riderId]: null });
            setEdits({ ...edits, [riderId]: null });
            showStatus('success', 'Limit updated successfully', 'Updated');
        } catch (err) {
            console.error('Failed to update COD limit:', err);
            showStatus('failed', 'Failed to update limit', 'Error');
        }
    };

    const handleBlockRider = async (riderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.put(`/api/admin/cod/block-rider`, { riderId, status: newStatus }, { headers });
            setRiderLimits(riderLimits.map(r => r.id === riderId ? { ...r, status: newStatus } : r));
            setRiderLimits(riderLimits.map(r => r.id === riderId ? { ...r, status: newStatus } : r));
            showStatus('success', `Rider ${newStatus} successfully`, 'Status Updated');
        } catch (err) {
            console.error('Failed to update rider status:', err);
            showStatus('failed', 'Action failed', 'Error');
        }
    };

    const getRiskColor = (level) => {
        const colors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#991b1b' };
        return colors[level] || '#6b7280';
    };

    const getStatusColor = (status) => {
        const colors = { active: '#10b981', blocked: '#ef4444', watched: '#f59e0b' };
        return colors[status] || '#6b7280';
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}>COD Risk and Fraud Control</h1>
                <p style={subtitle}>Monitor variance, manage rider limits, and control fraud risks</p>
            </header>

            {/* Variance Summary */}
            <div style={summaryGrid}>
                <div style={{ ...summaryCard, borderLeft: '4px solid #3b82f6' }}>
                    <div style={summaryLabel}>Total COD Value</div>
                    <div style={summaryValue}>₹{variance.totalValue.toLocaleString()}</div>
                    <div style={summaryMeta}>{variance.totalOrders} orders</div>
                </div>
                <div style={{ ...summaryCard, borderLeft: '4px solid #10b981' }}>
                    <div style={summaryLabel}>Money Recovered</div>
                    <div style={summaryValue}>₹{variance.moneyRecovered.toLocaleString()}</div>
                    <div style={summaryMeta}>{((variance.moneyRecovered / variance.totalValue) * 100).toFixed(1)}% recovery rate</div>
                </div>
                <div style={{ ...summaryCard, borderLeft: '4px solid #ef4444' }}>
                    <div style={summaryLabel}>VARIANCE (Lost)</div>
                    <div style={{ ...summaryValue, color: '#ef4444' }}>₹{variance.variance.toLocaleString()}</div>
                    <div style={summaryMeta}>{variance.variancePercent}% of total ({variance.trend === 'up' ? 'up' : 'down'})</div>
                </div>
                <div style={{ ...summaryCard, borderLeft: '4px solid #f59e0b' }}>
                    <div style={summaryLabel}>Alerts</div>
                    <div style={summaryValue}>{variance.blockedRiders + variance.suspiciousTransactions}</div>
                    <div style={summaryMeta}>{variance.blockedRiders} blocked riders</div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={twoColumnLayout}>
                {/* Left: Rider Limits Management */}
                <div>
                    <h2 style={sectionTitle}>Rider COD Limits</h2>
                    <div style={riderLimitsTable}>
                        <div style={tableHeader}>
                            <div style={tableHeaderCell}>Rider</div>
                            <div style={tableHeaderCell}>Daily Limit</div>
                            <div style={tableHeaderCell}>Monthly Limit</div>
                            <div style={tableHeaderCell}>Utilization</div>
                            <div style={tableHeaderCell}>Status</div>
                            <div style={tableHeaderCell}>Actions</div>
                        </div>

                        {riderLimits.map(rider => (
                            <div key={rider.id} style={tableRow}>
                                <div style={tableCell}>
                                    <div style={{ fontWeight: 700 }}>{rider.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{rider.phoneEnding}</div>
                                </div>
                                <div style={tableCell}>
                                    {edits[rider.id] ? (
                                        <input
                                            type="number"
                                            value={edits[rider.id].dailyLimit}
                                            onChange={e => setEdits({ ...edits, [rider.id]: { ...edits[rider.id], dailyLimit: parseInt(e.target.value) } })}
                                            style={editInput}
                                        />
                                    ) : (
                                        <span>₹{rider.dailyLimit}</span>
                                    )}
                                </div>
                                <div style={tableCell}>
                                    {edits[rider.id] ? (
                                        <input
                                            type="number"
                                            value={edits[rider.id].monthlyLimit}
                                            onChange={e => setEdits({ ...edits, [rider.id]: { ...edits[rider.id], monthlyLimit: parseInt(e.target.value) } })}
                                            style={editInput}
                                        />
                                    ) : (
                                        <span>₹{rider.monthlyLimit}</span>
                                    )}
                                </div>
                                <div style={tableCell}>
                                    <div style={{
                                        background: '#e5e7eb',
                                        height: '8px',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <div style={{
                                            background: rider.utilizationPercent > 80 ? '#ef4444' : '#10b981',
                                            height: '100%',
                                            width: rider.utilizationPercent + '%'
                                        }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem' }}>{rider.utilizationPercent}%</span>
                                </div>
                                <div style={tableCell}>
                                    <span style={{ ...statusBadge, background: getStatusColor(rider.status), color: 'white' }}>
                                        {rider.status}
                                    </span>
                                </div>
                                <div style={tableCell}>
                                    {edits[rider.id] ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleUpdateLimit(rider.id)} style={{ ...miniBtn, background: '#10b981' }}>✓</button>
                                            <button onClick={() => setEdits({ ...edits, [rider.id]: null })} style={{ ...miniBtn, background: '#6b7280' }}>✕</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setEdits({ ...edits, [rider.id]: { dailyLimit: rider.dailyLimit, monthlyLimit: rider.monthlyLimit } })} style={{ ...miniBtn, background: '#3b82f6' }}>Edit</button>
                                    )}
                                    {rider.status === 'active' ? (
                                        <button onClick={() => handleBlockRider(rider.id, 'blocked')} style={{ ...miniBtn, background: '#ef4444', marginLeft: '0.25rem' }}>Block</button>
                                    ) : (
                                        <button onClick={() => handleBlockRider(rider.id, 'active')} style={{ ...miniBtn, background: '#10b981', marginLeft: '0.25rem' }}>Unblock</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Risk Scoring */}
                <div>
                    <h2 style={sectionTitle}>Risk Analysis</h2>
                    <div style={riskCardsContainer}>
                        {riskScores.map(record => (
                            <div
                                key={record.id}
                                style={{
                                    ...riskCard,
                                    borderLeft: `4px solid ${getRiskColor(record.level)}`,
                                    background: record.level === 'critical' ? '#fef2f2' : 'white'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 800 }}>{record.name}</h4>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{record.id}</div>
                                    </div>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: getRiskColor(record.level),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 900,
                                        fontSize: '1.5rem'
                                    }}>
                                        {record.score}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <span style={{ ...riskBadge, background: getRiskColor(record.level), color: 'white' }}>
                                        {record.level.toUpperCase()} RISK
                                    </span>
                                </div>

                                <div>
                                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0.5rem 0' }}>Risk Factors:</h5>
                                    {record.reasons.map((reason, i) => (
                                        <div key={i} style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0' }}>
                                            • {reason}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Variance History */}
            <div style={{ marginTop: '3rem' }}>
                <h2 style={sectionTitle}>Variance Trend (Last 7 Days)</h2>
                <div style={chartContainer}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', justifyContent: 'space-around' }}>
                        {[
                            { label: 'Day 1', variance: 5200 },
                            { label: 'Day 2', variance: 5800 },
                            { label: 'Day 3', variance: 5400 },
                            { label: 'Day 4', variance: 6100 },
                            { label: 'Day 5', variance: 6400 },
                            { label: 'Day 6', variance: 6200 },
                            { label: 'Day 7', variance: 6800 }
                        ].map((day, i) => (
                            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                                <div
                                    style={{
                                        height: (day.variance / 7000 * 150) + 'px',
                                        background: 'linear-gradient(to top, #ef4444, #fca5a5)',
                                        borderRadius: '4px',
                                        marginBottom: '0.5rem'
                                    }}
                                />
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{day.label}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', marginTop: '0.25rem' }}>₹{day.variance}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


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
const container = { maxWidth: '1400px', margin: '0 auto', padding: '2rem' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, margin: 0 };
const subtitle = { color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' };
const summaryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const summaryCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const summaryLabel = { fontSize: '0.85rem', color: '#6b7280', fontWeight: 700 };
const summaryValue = { fontSize: '2rem', fontWeight: 900, margin: '0.5rem 0' };
const summaryMeta = { fontSize: '0.85rem', color: '#6b7280' };
const twoColumnLayout = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' };
const sectionTitle = { fontWeight: 800, fontSize: '1.3rem', marginBottom: '1.5rem', margin: '0 0 1.5rem 0' };
const riderLimitsTable = { background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' };
const tableHeader = { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', padding: '1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '0.85rem' };
const tableHeaderCell = { color: '#6b7280', fontWeight: 700 };
const tableRow = { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', padding: '1rem', borderBottom: '1px solid #e5e7eb', alignItems: 'center', fontSize: '0.9rem' };
const tableCell = { display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const editInput = { padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%' };
const statusBadge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 };
const miniBtn = { padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer', fontSize: '0.75rem' };
const riskCardsContainer = { display: 'grid', gap: '1rem' };
const riskCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const riskBadge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 };
const chartContainer = { background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb' };

            export default CODRiskDashboard;
