import React, { useState, useEffect } from 'react';
import { Lock, Play, Pause, AlertTriangle, Settings, DollarSign, Zap, Users, Eye } from 'lucide-react';
import api from '../utils/api';
import StatusPopup from '../components/StatusPopup';

const AdminControlPanel = () => {
    const [activeTab, setActiveTab] = useState('system');
    const [systemPaused, setSystemPaused] = useState(false);
    const [slaRules, setSlaRules] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [showNewRule, setShowNewRule] = useState(false);
    const [newRule, setNewRule] = useState({ name: '', hoursFromPickup: 24, penaltyPerHour: 100 });
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, message, title, onAction });
    };

    async function fetchData() {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [slaRes, auditRes] = await Promise.all([
                api.get('/api/admin/sla-rules', { headers }).catch(() => ({ data: [] })),
                api.get('/api/admin/audit-log', { headers }).catch(() => ({ data: [] }))
            ]);

            setSlaRules(slaRes.data || []);
            setAuditLogs(auditRes.data || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 0);
        return () => clearTimeout(timeoutId);
    }, []);

    const handlePauseSystem = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            await api.post('/api/admin/system/pause-delivery',
                { reason: 'Admin initiated system pause' },
                { headers }
            );
            setSystemPaused(true);
            showStatus('success', 'System paused - no new deliveries accepted', 'System Paused');
        } catch (err) {
            console.error('Failed to pause system:', err);
            showStatus('failed', 'Failed to pause system', 'Error');
        }
    };

    const handleResumeSystem = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            await api.post('/api/admin/system/resume-delivery', {}, { headers });
            setSystemPaused(false);
            showStatus('success', 'System resumed', 'System Resumed');
        } catch (err) {
            console.error('Failed to resume system:', err);
            showStatus('failed', 'Failed to resume system', 'Error');
        }
    };

    const handleCreateSLARule = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            await api.post('/api/admin/sla-rules', newRule, { headers });
            setShowNewRule(false);
            setNewRule({ name: '', hoursFromPickup: 24, penaltyPerHour: 100 });
            fetchData();
            showStatus('success', 'SLA Rule created successfully', 'Rule Created');
        } catch (err) {
            console.error('Failed to create SLA rule:', err);
            showStatus('failed', 'Failed to create rule', 'Error');
        }
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}>🎛️ Admin Control Panel</h1>
                <p style={subtitle}>Enterprise-level system controls & administrative oversight</p>
            </header>

            {/* Tab Navigation */}
            <div style={tabs}>
                {[
                    { id: 'system', label: '⚡ System Controls', icon: Zap },
                    { id: 'sla', label: '⏱️ SLA Management', icon: Lock },
                    { id: 'audit', label: '📋 Audit Log', icon: Eye }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            ...tabBtn,
                            background: activeTab === tab.id ? 'var(--primary)' : 'var(--glass)',
                            color: activeTab === tab.id ? 'white' : 'var(--text-main)'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* System Controls */}
            {activeTab === 'system' && (
                <div style={section}>
                    <h2 style={sectionTitle}>🚨 Global System Controls</h2>

                    {/* System Status */}
                    <div style={controlCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Delivery System</h3>
                                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                                    {systemPaused ? '🔴 PAUSED - No new orders accepted' : '🟢 ACTIVE - All systems operational'}
                                </p>
                            </div>
                            {systemPaused ? (
                                <button onClick={handleResumeSystem} style={{ ...actionBtn, background: '#10b981' }}>
                                    <Play size={18} /> Resume
                                </button>
                            ) : (
                                <button onClick={handlePauseSystem} style={{ ...actionBtn, background: '#ef4444' }}>
                                    <Pause size={18} /> Pause
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Force Actions */}
                    <h3 style={{ marginTop: '2rem', fontWeight: 800 }}>Emergency Actions</h3>
                    <div style={grid}>
                        <div style={actionCard}>
                            <DollarSign size={24} color="#ef4444" />
                            <h4 style={actionTitle}>Force Refund</h4>
                            <p style={actionDesc}>Manually issue refund to specific order</p>
                            <button style={miniBtn}>Configure</button>
                        </div>
                        <div style={actionCard}>
                            <AlertTriangle size={24} color="#f59e0b" />
                            <h4 style={actionTitle}>Force Return</h4>
                            <p style={actionDesc}>Override return workflow for critical issues</p>
                            <button style={miniBtn}>Configure</button>
                        </div>
                        <div style={actionCard}>
                            <Lock size={24} color="#3b82f6" />
                            <h4 style={actionTitle}>Lock Order</h4>
                            <p style={actionDesc}>Prevent any changes to order status</p>
                            <button style={miniBtn}>Configure</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SLA Management */}
            {activeTab === 'sla' && (
                <div style={section}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={sectionTitle}>⏱️ SLA Rules</h2>
                        <button onClick={() => setShowNewRule(!showNewRule)} style={{ ...actionBtn, background: 'var(--primary)' }}>
                            + New Rule
                        </button>
                    </div>

                    {/* Create New Rule */}
                    {showNewRule && (
                        <div style={{ ...card, marginBottom: '1.5rem', background: '#f9fafb' }}>
                            <h3 style={{ margin: '0 0 1rem 0' }}>Create SLA Rule</h3>
                            <div style={formGrid}>
                                <div>
                                    <label style={label}>Rule Name</label>
                                    <input
                                        type="text"
                                        value={newRule.name}
                                        onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                        style={input}
                                        placeholder="e.g., Same-Day Delivery"
                                    />
                                </div>
                                <div>
                                    <label style={label}>Hours from Pickup</label>
                                    <input
                                        type="number"
                                        value={newRule.hoursFromPickup}
                                        onChange={e => setNewRule({ ...newRule, hoursFromPickup: parseInt(e.target.value) })}
                                        style={input}
                                    />
                                </div>
                                <div>
                                    <label style={label}>Penalty per Hour (₹)</label>
                                    <input
                                        type="number"
                                        value={newRule.penaltyPerHour}
                                        onChange={e => setNewRule({ ...newRule, penaltyPerHour: parseInt(e.target.value) })}
                                        style={input}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={handleCreateSLARule} style={{ ...actionBtn, background: '10b981' }}>
                                    Create
                                </button>
                                <button onClick={() => setShowNewRule(false)} style={{ ...actionBtn, background: '#6b7280' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Rules List */}
                    <div style={table}>
                        <div style={tableHeader}>
                            <div style={tableCell}>Rule Name</div>
                            <div style={tableCell}>Hours</div>
                            <div style={tableCell}>Penalty/Hour</div>
                            <div style={tableCell}>Actions</div>
                        </div>
                        {slaRules.map(rule => (
                            <div key={rule.id} style={tableRow}>
                                <div style={tableCell}>{rule.name}</div>
                                <div style={tableCell}>{rule.hoursFromPickup}h</div>
                                <div style={tableCell}>₹{rule.penaltyPerHour}</div>
                                <div style={tableCell}>
                                    <button style={{ ...miniBtn, marginRight: '0.5rem' }}>Edit</button>
                                    <button style={{ ...miniBtn, background: '#ef4444', color: 'white' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Audit Log */}
            {activeTab === 'audit' && (
                <div style={section}>
                    <h2 style={sectionTitle}>📋 Admin Action Audit Log</h2>
                    <div style={table}>
                        <div style={tableHeader}>
                            <div style={tableCell}>Action</div>
                            <div style={tableCell}>Admin</div>
                            <div style={tableCell}>Order ID</div>
                            <div style={tableCell}>Timestamp</div>
                            <div style={tableCell}>Details</div>
                        </div>
                        {auditLogs.slice(0, 20).map(log => (
                            <div key={log.id} style={tableRow}>
                                <div style={tableCell}>
                                    <span style={{ ...badge, background: getActionColor(log.action) }}>
                                        {log.action}
                                    </span>
                                </div>
                                <div style={tableCell}>{log.userId?.slice(0, 8)}</div>
                                <div style={tableCell}>{log.resourceId?.slice(0, 8) || '-'}</div>
                                <div style={{ ...tableCell, fontSize: '0.85rem' }}>
                                    {new Date(log.createdAt).toLocaleString('en-IN')}
                                </div>
                                <div style={tableCell}>
                                    <button style={miniBtn}>View</button>
                                </div>
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

const getActionColor = (action) => {
    const colors = {
        'pause_system': '#ef4444',
        'resume_system': '#10b981',
        'force_refund': '#f59e0b',
        'force_return': '#f59e0b',
        'lock_order': '#3b82f6'
    };
    return colors[action] || '#6b7280';
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, margin: 0 };
const subtitle = { color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' };
const tabs = { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' };
const tabBtn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' };
const section = { background: 'var(--glass)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--glass-border)' };
const sectionTitle = { fontSize: '1.3rem', fontWeight: 900, margin: 0 };
const controlCard = { background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '1.5rem' };
const card = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' };
const actionCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' };
const actionTitle = { fontWeight: 800, margin: '0.75rem 0' };
const actionDesc = { fontSize: '0.85rem', color: '#6b7280', margin: '0.5rem 0' };
const actionBtn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const miniBtn = { padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' };
const label = { display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' };
const input = { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.9rem' };
const table = { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' };
const tableHeader = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', background: '#f3f4f6', padding: '1rem', borderRadius: '8px 8px 0 0', fontWeight: 700 };
const tableRow = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '1rem', borderBottom: '1px solid #e5e7eb', alignItems: 'center' };
const tableCell = { fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' };
const badge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', color: 'white', fontSize: '0.75rem', fontWeight: 700 };

export default AdminControlPanel;
