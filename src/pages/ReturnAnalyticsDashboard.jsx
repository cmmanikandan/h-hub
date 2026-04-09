import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, AlertTriangle, BarChart3, Users, Package } from 'lucide-react';
import api from '../utils/api';

const ReturnAnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState({
        totalReturns: 1240,
        returnRate: 3.2,
        refundsProcessed: 987,
        pendingRefunds: 45,
        totalRefundAmount: 1560000
    });
    const [sellerData] = useState([
        { id: 'SEL001', name: 'TechStore India', returnRate: 2.1, totalReturns: 89, reasons: { defective: 45, quality: 30, mismatch: 14 }, quality: 'good' },
        { id: 'SEL002', name: 'Fashion Hub', returnRate: 5.8, totalReturns: 234, reasons: { defective: 89, quality: 105, mismatch: 40 }, quality: 'poor' },
        { id: 'SEL003', name: 'HomeGoods', returnRate: 1.9, totalReturns: 62, reasons: { defective: 25, quality: 25, mismatch: 12 }, quality: 'excellent' },
        { id: 'SEL004', name: 'Electronics Pro', returnRate: 4.2, totalReturns: 156, reasons: { defective: 78, quality: 56, mismatch: 22 }, quality: 'average' }
    ]);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchAnalytics = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await api.get('/api/admin/returns/analytics', { headers });
            if (res.data) {
                setAnalytics((prev) => ({ ...prev, ...res.data }));
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchAnalytics();
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [fetchAnalytics]);

    const getQualityColor = (quality) => {
        const colors = {
            'excellent': '#10b981',
            'good': '#3b82f6',
            'average': '#f59e0b',
            'poor': '#ef4444'
        };
        return colors[quality] || '#6b7280';
    };

    const getReturnRateTrend = (rate) => {
        if (rate > 5) return { text: '⬆ Critical', color: '#ef4444' };
        if (rate > 3) return { text: '↗ High', color: '#f59e0b' };
        if (rate > 1) return { text: '→ Normal', color: '#10b981' };
        return { text: '↘ Low', color: '#10b981' };
    };

    const filteredSellers = sellerData.filter(seller => {
        if (filter === 'all') return true;
        if (filter === 'high') return seller.returnRate > 3;
        if (filter === 'excellent') return seller.quality === 'excellent';
        return true;
    });

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}>📊 Return Analytics Dashboard</h1>
                <p style={subtitle}>Monitor returns by seller, analyze quality issues, and identify trends</p>
            </header>

            {/* Summary Cards */}
            <div style={summaryGrid}>
                <div style={{ ...summaryCard, borderLeft: '4px solid #f59e0b' }}>
                    <div style={summaryLabel}>Total Returns</div>
                    <div style={summaryValue}>{analytics.totalReturns}</div>
                    <div style={summaryMeta}>Last 30 days</div>
                </div>
                <div style={{ ...summaryCard, borderLeft: '4px solid #ef4444' }}>
                    <div style={summaryLabel}>Return Rate</div>
                    <div style={summaryValue}>{analytics.returnRate}%</div>
                    <div style={summaryMeta}>Of all orders</div>
                </div>
                <div style={{ ...summaryCard, borderLeft: '4px solid #10b981' }}>
                    <div style={summaryLabel}>Refunds Processed</div>
                    <div style={summaryValue}>{analytics.refundsProcessed}</div>
                    <div style={summaryMeta}>✓ Completed</div>
                </div>
                <div style={{ ...summaryCard, borderLeft: '4px solid #3b82f6' }}>
                    <div style={summaryLabel}>Refund Amount</div>
                    <div style={summaryValue}>₹{(analytics.totalRefundAmount / 100000).toFixed(1)}L</div>
                    <div style={summaryMeta}>Total issued</div>
                </div>
            </div>

            {/* Filter */}
            <div style={filterBar}>
                {[
                    { label: 'All Sellers', value: 'all' },
                    { label: 'High Return Rate', value: 'high' },
                    { label: 'Excellent Quality', value: 'excellent' }
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        style={{
                            ...filterBtn,
                            background: filter === f.value ? 'var(--primary)' : 'var(--glass)',
                            color: filter === f.value ? 'white' : 'var(--text-main)'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Main Content - Two Columns */}
            <div style={twoColumnLayout}>
                {/* Left: Seller Heatmap */}
                <div>
                    <h2 style={sectionTitle}>Seller Performance Heatmap</h2>
                    <div style={heatmapContainer}>
                        <div style={heatmapHeader}>
                            <div style={heatmapHeaderCell}>Seller</div>
                            <div style={heatmapHeaderCell}>Return Rate</div>
                            <div style={heatmapHeaderCell}>Quality</div>
                            <div style={heatmapHeaderCell}>Total Returns</div>
                            <div style={heatmapHeaderCell}>Action</div>
                        </div>

                        {filteredSellers.map(seller => (
                            <div
                                key={seller.id}
                                style={{
                                    ...heatmapRow,
                                    background: seller.returnRate > 5 ? '#fee2e2' : seller.returnRate > 3 ? '#fef3c7' : '#f0fdf4',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setSelectedSeller(seller)}
                            >
                                <div style={heatmapCell}>
                                    <div style={{ fontWeight: 700 }}>{seller.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{seller.id}</div>
                                </div>
                                <div style={heatmapCell}>
                                    <div style={{ fontWeight: 700, ...getReturnRateTrend(seller.returnRate) }}>
                                        {seller.returnRate}%
                                    </div>
                                </div>
                                <div style={heatmapCell}>
                                    <span
                                        style={{
                                            ...qualityBadge,
                                            background: getQualityColor(seller.quality),
                                            color: 'white'
                                        }}
                                    >
                                        {seller.quality.charAt(0).toUpperCase() + seller.quality.slice(1)}
                                    </span>
                                </div>
                                <div style={heatmapCell}>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{seller.totalReturns}</span>
                                </div>
                                <div style={heatmapCell}>
                                    <button style={{ ...actionBtn, background: '#3b82f6' }}>
                                        Review
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Return Reasons Breakdown */}
                <div>
                    <h2 style={sectionTitle}>Return Reasons Analysis</h2>
                    <div style={reasonsContainer}>
                        {[
                            { label: 'Defective Goods', value: 45, color: '#ef4444' },
                            { label: 'Quality Issues', value: 32, color: '#f59e0b' },
                            { label: 'Wrong Item', value: 15, color: '#3b82f6' },
                            { label: 'Damaged in Transit', value: 5, color: '#8b5cf6' },
                            { label: 'Other', value: 3, color: '#6b7280' }
                        ].map((reason, i) => (
                            <div key={i} style={reasonCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 700 }}>{reason.label}</span>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: reason.color }}>{reason.value}%</span>
                                </div>
                                <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            background: reason.color,
                                            height: '100%',
                                            width: reason.value + '%'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quality Scoring */}
                    <h3 style={{ fontWeight: 800, marginBottom: '1rem', marginTop: '2rem' }}>Quality Scoring</h3>
                    <div style={scoringContainer}>
                        <div style={scoreItem}>
                            <div style={scoreLabel}>Excellent (5★)</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>980</div>
                        </div>
                        <div style={scoreItem}>
                            <div style={scoreLabel}>Good (4-3★)</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3b82f6' }}>1240</div>
                        </div>
                        <div style={scoreItem}>
                            <div style={scoreLabel}>Poor (2-1★)</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444' }}>320</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller Detail Modal */}
            {selectedSeller && (
                <div style={modal}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={modalTitle}>{selectedSeller.name}</h2>
                            <button
                                onClick={() => setSelectedSeller(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Seller Stats */}
                        <div style={modalStatsGrid}>
                            <div style={modalStatCard}>
                                <div style={statLabel}>Return Rate</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: getQualityColor(selectedSeller.quality) }}>
                                    {selectedSeller.returnRate}%
                                </div>
                            </div>
                            <div style={modalStatCard}>
                                <div style={statLabel}>Total Returns</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>{selectedSeller.totalReturns}</div>
                            </div>
                            <div style={modalStatCard}>
                                <div style={statLabel}>Quality Rating</div>
                                <span style={{ ...qualityBadge, background: getQualityColor(selectedSeller.quality), color: 'white' }}>
                                    {selectedSeller.quality.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Reason Breakdown */}
                        <h3 style={{ fontWeight: 800, marginTop: '2rem', marginBottom: '1rem' }}>Return Reasons Breakdown</h3>
                        <div style={reasonsBreakdown}>
                            {Object.entries(selectedSeller.reasons).map(([reason, count]) => (
                                <div key={reason} style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{reason}</span>
                                        <span style={{ fontWeight: 900 }}>{count} returns</span>
                                    </div>
                                    <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                background: reason === 'defective' ? '#ef4444' : reason === 'quality' ? '#f59e0b' : '#3b82f6',
                                                height: '100%',
                                                width: (count / selectedSeller.totalReturns * 100) + '%'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recommendations */}
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                            <h4 style={{ fontWeight: 800, margin: '0 0 0.75rem 0', color: '#166534' }}>Recommendations</h4>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#166534' }}>
                                <li>Improve product quality control process</li>
                                <li>Review product descriptions for accuracy</li>
                                <li>Implement seller training program</li>
                                <li>Monitor next 30 days closely</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
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
const filterBar = { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' };
const filterBtn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' };
const twoColumnLayout = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' };
const sectionTitle = { fontWeight: 800, fontSize: '1.3rem', margin: '0 0 1.5rem 0' };
const heatmapContainer = { background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' };
const heatmapHeader = { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '0.85rem' };
const heatmapHeaderCell = { color: '#6b7280' };
const heatmapRow = { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '1rem', borderBottom: '1px solid #e5e7eb', alignItems: 'center' };
const heatmapCell = { display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const qualityBadge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 };
const actionBtn = { padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' };
const reasonsContainer = { display: 'grid', gap: '1.5rem' };
const reasonCard = { background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' };
const scoringContainer = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' };
const scoreItem = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' };
const scoreLabel = { fontSize: '0.85rem', color: '#6b7280', fontWeight: 700, marginBottom: '0.5rem' };
const modal = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' };
const modalTitle = { fontSize: '1.5rem', fontWeight: 900, margin: 0 };
const modalStatsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' };
const modalStatCard = { background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' };
const statLabel = { fontSize: '0.75rem', color: '#6b7280', fontWeight: 700, marginBottom: '0.5rem' };
const reasonsBreakdown = { background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' };

export default ReturnAnalyticsDashboard;
