import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, FileText, DollarSign, MessageSquare } from 'lucide-react';
import api from '../utils/api';

const DisputeManager = () => {
    const [disputes, setDisputes] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolution, setResolution] = useState({ status: '', resolution: '', refund: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await api.get('/api/admin/disputes', { headers });
            setDisputes(res.data || []);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveDispute = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.patch(`/api/admin/disputes/${selectedDispute.id}/review`, resolution, { headers });
            fetchDisputes();
            setSelectedDispute(null);
            alert('✅ Dispute resolved');
        } catch (err) {
            console.error('Failed to resolve dispute:', err);
            alert('❌ Failed to resolve dispute');
        }
    };

    const filteredDisputes = disputes.filter(d => {
        if (filter === 'all') return true;
        return d.status === filter;
    });

    const getDisputeIcon = (type) => {
        const icons = {
            'COD_Mismatch': '💰',
            'Damage_Claim': '📦',
            'Fake_Delivery': '🚫',
            'Return_Abuse': '↩️',
            'Other': '❓'
        };
        return icons[type] || '❓';
    };

    const getStatusColor = (status) => {
        const colors = {
            'Raised': '#f59e0b',
            'Under_Review': '#3b82f6',
            'Resolved': '#10b981',
            'Escalated': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}>⚖️ Dispute & Claims Management</h1>
                <p style={subtitle}>Review and resolve customer disputes and claims</p>
            </header>

            {/* Stats */}
            <div style={statsGrid}>
                {[
                    { label: 'Total Disputes', value: disputes.length, color: '#3b82f6' },
                    { label: 'Pending Review', value: disputes.filter(d => d.status === 'Raised').length, color: '#f59e0b' },
                    { label: 'Under Review', value: disputes.filter(d => d.status === 'Under_Review').length, color: '#8b5cf6' },
                    { label: 'Resolved', value: disputes.filter(d => d.status === 'Resolved').length, color: '#10b981' }
                ].map((stat, i) => (
                    <div key={i} style={{ ...statCard, borderLeft: `4px solid ${stat.color}` }}>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{stat.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div style={filterBar}>
                {['all', 'Raised', 'Under_Review', 'Resolved', 'Escalated'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            ...filterBtn,
                            background: filter === f ? 'var(--primary)' : 'var(--glass)',
                            color: filter === f ? 'white' : 'var(--text-main)'
                        }}
                    >
                        {f === 'all' ? 'All Disputes' : f}
                    </button>
                ))}
            </div>

            {/* Disputes List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    Loading disputes...
                </div>
            ) : (
                <div style={grid}>
                    {filteredDisputes.map(dispute => (
                        <div
                            key={dispute.id}
                            style={{ ...card, cursor: 'pointer', transition: 'all 0.3s', borderLeft: `4px solid ${getStatusColor(dispute.status)}` }}
                            onClick={() => setSelectedDispute(dispute)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ fontSize: '2rem' }}>{getDisputeIcon(dispute.disputeType)}</div>
                                    <div>
                                        <div style={cardTitle}>{dispute.disputeType}</div>
                                        <div style={cardMeta}>Order: {dispute.orderId.slice(0, 8)}</div>
                                    </div>
                                </div>
                                <span style={{ ...statusBadge, background: getStatusColor(dispute.status), color: 'white' }}>
                                    {dispute.status}
                                </span>
                            </div>

                            <div style={infoBox}>
                                <div style={infoRow}>
                                    <span>Raised by:</span>
                                    <span style={{ fontWeight: 700 }}>{dispute.raisedByRole}</span>
                                </div>
                                <div style={infoRow}>
                                    <span>Reason:</span>
                                    <span style={{ fontWeight: 700 }}>{dispute.reason?.substring(0, 40)}</span>
                                </div>
                                {dispute.refundIssued > 0 && (
                                    <div style={{ ...infoRow, color: '#10b981' }}>
                                        <span>Refund:</span>
                                        <span style={{ fontWeight: 700 }}>₹{dispute.refundIssued}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedDispute && (
                <div style={modal}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={modalTitle}>Dispute Details</h2>
                            <button
                                onClick={() => setSelectedDispute(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={fieldsGrid}>
                            <div style={field}>
                                <label style={fieldLabel}>Dispute Type</label>
                                <div style={fieldValue}>{selectedDispute.disputeType}</div>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>Status</label>
                                <div style={{ ...statusBadge, background: getStatusColor(selectedDispute.status), color: 'white', display: 'inline-block' }}>
                                    {selectedDispute.status}
                                </div>
                            </div>
                            <div style={{ ...field, gridColumn: '1 / -1' }}>
                                <label style={fieldLabel}>Reason</label>
                                <div style={{ ...fieldValue, whiteSpace: 'pre-wrap' }}>{selectedDispute.reason}</div>
                            </div>
                            
                            {selectedDispute.evidence && (
                                <div style={{ ...field, gridColumn: '1 / -1' }}>
                                    <label style={fieldLabel}>Evidence</label>
                                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                        {Object.keys(selectedDispute.evidence || {}).map(key => (
                                            <div key={key}>📎 {key}: {selectedDispute.evidence[key]}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedDispute.status !== 'Resolved' && (
                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Resolution</h3>

                                <div style={formGrid}>
                                    <div>
                                        <label style={label}>Decision</label>
                                        <select
                                            value={resolution.status}
                                            onChange={e => setResolution({ ...resolution, status: e.target.value })}
                                            style={input}
                                        >
                                            <option value="">Select decision...</option>
                                            <option value="Resolved">Resolved (Accept Claim)</option>
                                            <option value="Rejected">Rejected (Deny Claim)</option>
                                            <option value="Escalated">Escalate to Higher Authority</option>
                                        </select>
                                    </div>

                                    {resolution.status === 'Resolved' && (
                                        <div>
                                            <label style={label}>Refund Amount (₹)</label>
                                            <input
                                                type="number"
                                                value={resolution.refund}
                                                onChange={e => setResolution({ ...resolution, refund: parseInt(e.target.value) })}
                                                style={input}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label style={label}>Resolution Notes</label>
                                    <textarea
                                        value={resolution.resolution}
                                        onChange={e => setResolution({ ...resolution, resolution: e.target.value })}
                                        style={{ ...input, minHeight: '100px' }}
                                        placeholder="Document your decision and reasoning..."
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button onClick={handleResolveDispute} style={{ ...btn, background: '#10b981' }}>
                                        ✓ Apply Resolution
                                    </button>
                                    <button onClick={() => setSelectedDispute(null)} style={{ ...btn, background: '#6b7280' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, margin: 0 };
const subtitle = { color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const statCard = { background: 'var(--glass)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' };
const filterBar = { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' };
const filterBtn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' };
const card = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const cardTitle = { fontWeight: 800, fontSize: '1rem' };
const cardMeta = { fontSize: '0.85rem', color: '#6b7280' };
const statusBadge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 };
const infoBox = { background: '#f9fafb', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' };
const infoRow = { display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' };
const modal = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' };
const modalTitle = { fontSize: '1.5rem', fontWeight: 900, margin: 0 };
const fieldsGrid = { display: 'grid', gap: '1rem', marginBottom: '1.5rem' };
const field = { display: 'grid' };
const fieldLabel = { fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' };
const fieldValue = { padding: '0.75rem', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const label = { display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' };
const input = { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.9rem' };
const btn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer' };

export default DisputeManager;
