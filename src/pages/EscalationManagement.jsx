import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, User, Clock, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const EscalationManagement = () => {
    const [escalations, setEscalations] = useState([]);
    const [filter, setFilter] = useState('open');
    const [selectedEscalation, setSelectedEscalation] = useState(null);
    const [resolution, setResolution] = useState({ resolution: '', assignedTo: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEscalations();
    }, []);

    const fetchEscalations = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await api.get('/api/admin/escalations/open', { headers });
            setEscalations(res.data || []);
        } catch (error) {
            console.error('Failed to fetch escalations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveEscalation = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.patch(`/api/admin/escalations/${selectedEscalation.id}/resolve`, resolution, { headers });
            fetchEscalations();
            setSelectedEscalation(null);
            alert('✅ Escalation resolved');
        } catch (err) {
            console.error('Failed to resolve escalation:', err);
            alert('❌ Failed to resolve escalation');
        }
    };

    const getEscalationColor = (level) => {
        const colors = {
            'Level1_Ops': '#3b82f6',
            'Level2_Admin': '#f59e0b',
            'Level3_Director': '#ef4444',
            'Level4_CEO': '#991b1b'
        };
        return colors[level] || '#6b7280';
    };

    const getUrgencyColor = (urgency) => {
        const colors = {
            'low': '#10b981',
            'medium': '#f59e0b',
            'high': '#ef4444',
            'critical': '#991b1b'
        };
        return colors[urgency] || '#6b7280';
    };

    const calculateTimeInEscalation = (createdAt) => {
        const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
        return hours > 0 ? `${hours}h ago` : 'Just now';
    };

    const filteredEscalations = escalations.filter(e => {
        if (filter === 'open') return e.status === 'Open';
        if (filter === 'high') return e.urgency === 'high' || e.urgency === 'critical';
        return true;
    });

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}>⛔ Escalation Management</h1>
                <p style={subtitle}>Monitor and resolve high-priority escalations</p>
            </header>

            {/* Stats */}
            <div style={statsGrid}>
                {[
                    { label: 'Open Escalations', value: escalations.filter(e => e.status === 'Open').length, color: '#ef4444' },
                    { label: 'Critical Issues', value: escalations.filter(e => e.urgency === 'critical').length, color: '#991b1b' },
                    { label: 'Level 3+ Issues', value: escalations.filter(e => e.escalationLevel >= 3).length, color: '#f59e0b' },
                    { label: 'Avg Resolv. Time', value: '4h', color: '#3b82f6' }
                ].map((stat, i) => (
                    <div key={i} style={{ ...statCard, borderLeft: `4px solid ${stat.color}` }}>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{stat.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div style={filterBar}>
                {[
                    { label: 'Open Issues', value: 'open' },
                    { label: 'High Priority', value: 'high' },
                    { label: 'All', value: 'all' }
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

            {/* Escalation Timeline */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    Loading escalations...
                </div>
            ) : (
                <div style={timelineContainer}>
                    {filteredEscalations.length === 0 ? (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#6b7280' }}>
                            No escalations found
                        </div>
                    ) : (
                        filteredEscalations.map((esc) => (
                            <div key={esc.id} style={{ ...escalationItem, cursor: 'pointer' }} onClick={() => setSelectedEscalation(esc)}>
                                {/* Timeline Dot */}
                                <div style={{ ...timelineDot, background: getEscalationColor(esc.escalationLevel) }}></div>

                                {/* Content */}
                                <div style={escalationContent}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>
                                                {esc.reason}
                                            </h3>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                Order: #{esc.orderId?.slice(0, 8)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ ...badge, background: getUrgencyColor(esc.urgency) }}>
                                                {esc.urgency.toUpperCase()}
                                            </span>
                                            <span style={{ ...badge, background: getEscalationColor(esc.escalationLevel) }}>
                                                {esc.escalationLevel ? `L${esc.escalationLevel}` : 'L1'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={infoGrid}>
                                        <div>
                                            <span style={infoLabel}>Current Owner:</span>
                                            <span style={infoValue}>{esc.currentOwner || 'Unassigned'}</span>
                                        </div>
                                        <div>
                                            <span style={infoLabel}>In Queue:</span>
                                            <span style={infoValue}>{calculateTimeInEscalation(esc.createdAt)}</span>
                                        </div>
                                        <div>
                                            <span style={infoLabel}>Source:</span>
                                            <span style={infoValue}>{esc.source || 'System'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedEscalation && (
                <div style={modal}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={modalTitle}>Escalation Details</h2>
                            <button
                                onClick={() => setSelectedEscalation(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Escalation Ladder */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Escalation Ladder</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {['Level1_Ops', 'Level2_Admin', 'Level3_Director', 'Level4_CEO'].map((level, idx) => (
                                    <div
                                        key={level}
                                        style={{
                                            ...ladderStep,
                                            background: idx < parseInt(selectedEscalation.escalationLevel || 1) ? getEscalationColor(level) : '#e5e7eb',
                                            color: idx < parseInt(selectedEscalation.escalationLevel || 1) ? 'white' : '#6b7280'
                                        }}
                                    >
                                        <div>{level.split('_')[0]}</div>
                                        <div style={{ fontSize: '0.75rem' }}>{level.split('_')[1]}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div style={fieldsGrid}>
                            <div style={field}>
                                <label style={fieldLabel}>Reason</label>
                                <div style={fieldValue}>{selectedEscalation.reason}</div>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>Urgency</label>
                                <span style={{ ...badge, background: getUrgencyColor(selectedEscalation.urgency) }}>
                                    {selectedEscalation.urgency.toUpperCase()}
                                </span>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>Current Owner</label>
                                <div style={fieldValue}>{selectedEscalation.currentOwner || 'Unassigned'}</div>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>Source</label>
                                <div style={fieldValue}>{selectedEscalation.source || 'System Auto-Escalation'}</div>
                            </div>
                        </div>

                        {selectedEscalation.status === 'Open' && (
                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Resolution</h3>

                                <div>
                                    <label style={label}>Assign To</label>
                                    <input
                                        type="text"
                                        value={resolution.assignedTo}
                                        onChange={e => setResolution({ ...resolution, assignedTo: e.target.value })}
                                        style={input}
                                        placeholder="Enter team member or department"
                                    />
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label style={label}>Resolution Notes</label>
                                    <textarea
                                        value={resolution.resolution}
                                        onChange={e => setResolution({ ...resolution, resolution: e.target.value })}
                                        style={{ ...input, minHeight: '100px' }}
                                        placeholder="Document your action plan..."
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button onClick={handleResolveEscalation} style={{ ...btn, background: '#10b981' }}>
                                        ✓ Resolve
                                    </button>
                                    <button onClick={() => setSelectedEscalation(null)} style={{ ...btn, background: '#6b7280' }}>
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
const timelineContainer = { display: 'grid', gap: '1rem' };
const escalationItem = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '40px 1fr', gap: '1.5rem', alignItems: 'start', position: 'relative' };
const timelineDot = { width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto' };
const escalationContent = { padding: '0.5rem 0' };
const badge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'white', margin: '0 0.25rem' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' };
const infoLabel = { display: 'block', color: '#6b7280', fontWeight: 700 };
const infoValue = { display: 'block', fontWeight: 600, color: '#111827', marginTop: '0.25rem' };
const modal = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' };
const modalTitle = { fontSize: '1.5rem', fontWeight: 900, margin: 0 };
const ladderStep = { padding: '1rem', borderRadius: '8px', textAlign: 'center', minWidth: '100px', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s' };
const fieldsGrid = { display: 'grid', gap: '1rem', marginBottom: '1.5rem' };
const field = { display: 'grid' };
const fieldLabel = { fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' };
const fieldValue = { padding: '0.75rem', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' };
const label = { display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' };
const input = { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.9rem', boxSizing: 'border-box' };
const btn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer' };

export default EscalationManagement;
