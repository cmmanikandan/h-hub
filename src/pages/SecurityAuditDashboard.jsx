import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Check, Smartphone, Lock, Activity, Eye } from 'lucide-react';
import api from '../utils/api';
import StatusPopup from '../components/StatusPopup';

const SecurityAuditDashboard = () => {
    const [devices, setDevices] = useState([
        { id: 'DEV001', rider: 'Rajesh Kumar', phone: 'Samsung Galaxy A12', imei: '***2345', status: 'pending', addedDate: '2025-02-06' },
        { id: 'DEV002', rider: 'Priya Singh', phone: 'iPhone 12', imei: '***6789', status: 'approved', addedDate: '2025-01-20' },
        { id: 'DEV003', rider: 'Ahmed Hassan', phone: 'Redmi Note 10', imei: '***1234', status: 'rejected', addedDate: '2025-02-05', reason: 'Device jailbroken' }
    ]);

    const [suspiciousActivities] = useState([
        { id: 'ACT001', rider: 'Deepak Patel', event: 'Multiple location jumps (5km in 30s)', severity: 'critical', timestamp: '2025-02-07 14:23', status: 'reviewed' },
        { id: 'ACT002', rider: 'Vijay Kumar', event: 'App crash during delivery', severity: 'medium', timestamp: '2025-02-07 13:45', status: 'investigated' },
        { id: 'ACT003', rider: 'Suresh Das', event: 'Suspicious logout/login pattern', severity: 'high', timestamp: '2025-02-07 12:00', status: 'pending' },
        { id: 'ACT004', rider: 'Ravi Sharma', event: 'Location data tampering detected', severity: 'critical', timestamp: '2025-02-07 10:15', status: 'escalated' }
    ]);

    const [auditLogs] = useState([
        { id: 1, admin: 'Admin1', action: 'Force logout all riders', timestamp: '2025-02-07 09:00', type: 'security' },
        { id: 2, admin: 'Admin2', action: 'Approved device DEV002', timestamp: '2025-02-06 15:30', type: 'device' },
        { id: 3, admin: 'Admin3', action: 'Reviewed suspicious activity ACT001', timestamp: '2025-02-06 14:00', type: 'investigation' },
        { id: 4, admin: 'Admin1', action: 'Rejected device DEV003', timestamp: '2025-02-05 11:20', type: 'device' },
        { id: 5, admin: 'Admin4', action: 'Investigated rider offline alert', timestamp: '2025-02-05 10:45', type: 'security' }
    ]);

    const [selectedDevice, setSelectedDevice] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [approvalNote, setApprovalNote] = useState('');

    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, message, title, onAction });
    };

    const confirmAction = (msg, action, title = 'Confirm Action', type = 'confirm') => {
        showStatus(type, msg, title, () => {
            action();
            setPopup(prev => ({ ...prev, show: false }));
        });
    };

    const fetchSecurityData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.get('/api/admin/audit', { headers });
        } catch (err) {
            console.error('Failed to fetch security data:', err);
        }
    }, []);

    useEffect(() => {
        fetchSecurityData();
    }, [fetchSecurityData]);

    const handleApproveDevice = async (deviceId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.post(`/api/admin/device-binding/approve`, { deviceId, note: approvalNote }, { headers });
            setDevices(devices.map(d => d.id === deviceId ? { ...d, status: 'approved' } : d));
            setSelectedDevice(null);
            showStatus('success', 'Device approved', 'Approved');
        } catch (err) {
            console.error('Failed to approve device:', err);
            showStatus('failed', 'Failed to approve device', 'Error');
        }
    };

    const handleRejectDevice = async (deviceId, reason) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.post(`/api/admin/device-binding/reject`, { deviceId, reason }, { headers });
            setDevices(devices.map(d => d.id === deviceId ? { ...d, status: 'rejected', reason } : d));
            showStatus('success', 'Device rejected', 'Rejected');
        } catch (err) {
            console.error('Failed to reject device:', err);
            showStatus('failed', 'Failed to reject device', 'Error');
        }
    };

    const handleForceLogout = async () => {
        confirmAction('Are you sure? This will logout ALL riders immediately.', async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };
                await api.post(`/api/admin/force-logout-all`, {}, { headers });
                showStatus('success', 'All riders logged out', 'Success');
            } catch (err) {
                console.error('Failed to force logout:', err);
                showStatus('failed', 'Failed to force logout', 'Error');
            }
        }, 'Force Logout', 'delete');
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'low': '#10b981',
            'medium': '#f59e0b',
            'high': '#ef4444',
            'critical': '#991b1b'
        };
        return colors[severity] || '#6b7280';
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#f59e0b',
            'approved': '#10b981',
            'rejected': '#ef4444',
            'reviewed': '#3b82f6',
            'investigated': '#10b981',
            'escalated': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getActionStyle = (type) => {
        const colors = {
            'security': '#ef4444',
            'device': '#3b82f6',
            'investigation': '#f59e0b'
        };
        return colors[type] || '#6b7280';
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}>🔒 Security & Audit Dashboard</h1>
                <p style={subtitle}>Manage device binding, monitor suspicious activity, and audit security events</p>
                <button onClick={handleForceLogout} style={{ ...actionBtn, background: '#ef4444' }}>
                    ⚠️ Force Logout All Riders
                </button>
            </header>

            {/* Security Stats */}
            <div style={statsGrid}>
                <div style={{ ...statCard, borderLeft: '4px solid #f59e0b' }}>
                    <div style={statLabel}>Pending Device Approvals</div>
                    <div style={statValue}>{devices.filter(d => d.status === 'pending').length}</div>
                    <div style={statMeta}>Awaiting review</div>
                </div>
                <div style={{ ...statCard, borderLeft: '4px solid #ef4444' }}>
                    <div style={statLabel}>Suspicious Activities</div>
                    <div style={statValue}>{suspiciousActivities.length}</div>
                    <div style={statMeta}>{suspiciousActivities.filter(a => a.severity === 'critical').length} critical</div>
                </div>
                <div style={{ ...statCard, borderLeft: '4px solid #3b82f6' }}>
                    <div style={statLabel}>Approved Devices</div>
                    <div style={statValue}>{devices.filter(d => d.status === 'approved').length}</div>
                    <div style={statMeta}>Active devices</div>
                </div>
                <div style={{ ...statCard, borderLeft: '4px solid #10b981' }}>
                    <div style={statLabel}>Last Audit</div>
                    <div style={statValue}>Today</div>
                    <div style={statMeta}>✓ All systems normal</div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={twoColumnLayout}>
                {/* Left: Device Management */}
                <div>
                    <h2 style={sectionTitle}>Device Binding Approvals</h2>
                    <div style={deviceCardsContainer}>
                        {devices.map(device => (
                            <div
                                key={device.id}
                                style={{
                                    ...deviceCard,
                                    borderLeft: `4px solid ${getStatusColor(device.status)}`,
                                    cursor: 'pointer'
                                }}
                                onClick={() => setSelectedDevice(device)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 800 }}>{device.rider}</h4>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                            {device.phone}
                                        </div>
                                    </div>
                                    <span style={{ ...statusBadge, background: getStatusColor(device.status), color: 'white' }}>
                                        {device.status.toUpperCase()}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#6b7280', margin: '1rem 0' }}>
                                    IMEI: {device.imei}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    Added: {new Date(device.addedDate).toLocaleDateString()}
                                </div>

                                {device.reason && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', fontSize: '0.85rem', color: '#991b1b' }}>
                                        Reason: {device.reason}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Suspicious Activities */}
                <div>
                    <h2 style={sectionTitle}>Suspicious Activity Log</h2>
                    <div style={activitiesContainer}>
                        {suspiciousActivities.map(activity => (
                            <div
                                key={activity.id}
                                style={{
                                    ...activityCard,
                                    borderLeft: `4px solid ${getSeverityColor(activity.severity)}`,
                                    cursor: 'pointer',
                                    background: activity.severity === 'critical' ? '#fef2f2' : 'white'
                                }}
                                onClick={() => setSelectedActivity(activity)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                    <div style={{ fontWeight: 800 }}>{activity.rider}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ ...badge, background: getSeverityColor(activity.severity), color: 'white' }}>
                                            {activity.severity.toUpperCase()}
                                        </span>
                                        <span style={{ ...badge, background: getStatusColor(activity.status), color: 'white' }}>
                                            {activity.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                    {activity.event}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                    {activity.timestamp}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Audit Log Table */}
            <div style={{ marginTop: '3rem' }}>
                <h2 style={sectionTitle}>Audit Log</h2>
                <div style={auditTable}>
                    <div style={auditTableHeader}>
                        <div style={auditHeaderCell}>Admin</div>
                        <div style={auditHeaderCell}>Action</div>
                        <div style={auditHeaderCell}>Type</div>
                        <div style={auditHeaderCell}>Timestamp</div>
                    </div>

                    {auditLogs.map(log => (
                        <div key={log.id} style={auditTableRow}>
                            <div style={auditCell}>
                                <div style={{ fontWeight: 700 }}>{log.admin}</div>
                            </div>
                            <div style={auditCell}>
                                {log.action}
                            </div>
                            <div style={auditCell}>
                                <span style={{ ...badge, background: getActionStyle(log.type), color: 'white', fontSize: '0.75rem' }}>
                                    {log.type.toUpperCase()}
                                </span>
                            </div>
                            <div style={auditCell}>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    {log.timestamp}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Device Detail Modal */}
            {selectedDevice && (
                <div style={modal}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={modalTitle}>Device Approval</h2>
                            <button
                                onClick={() => setSelectedDevice(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={fieldsGrid}>
                            <div style={field}>
                                <label style={fieldLabel}>Rider</label>
                                <div style={fieldValue}>{selectedDevice.rider}</div>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>Phone Model</label>
                                <div style={fieldValue}>{selectedDevice.phone}</div>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>IMEI</label>
                                <div style={fieldValue}>{selectedDevice.imei}</div>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>Current Status</label>
                                <span style={{ ...statusBadge, background: getStatusColor(selectedDevice.status), color: 'white' }}>
                                    {selectedDevice.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {selectedDevice.status === 'pending' && (
                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                                <label style={label}>Approval Notes</label>
                                <textarea
                                    value={approvalNote}
                                    onChange={e => setApprovalNote(e.target.value)}
                                    style={{ ...input, minHeight: '80px' }}
                                    placeholder="Enter approval notes..."
                                />

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button onClick={() => handleApproveDevice(selectedDevice.id)} style={{ ...btn, background: '#10b981' }}>
                                        ✓ Approve Device
                                    </button>
                                    <button onClick={() => handleRejectDevice(selectedDevice.id, 'Manual rejection by admin')} style={{ ...btn, background: '#ef4444' }}>
                                        ✕ Reject Device
                                    </button>
                                    <button onClick={() => setSelectedDevice(null)} style={{ ...btn, background: '#6b7280' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Activity Detail Modal */}
            {selectedActivity && (
                <div style={modal}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={modalTitle}>Suspicious Activity Details</h2>
                            <button
                                onClick={() => setSelectedActivity(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={fieldsGrid}>
                            <div style={field}>
                                <label style={fieldLabel}>Rider</label>
                                <div style={fieldValue}>{selectedActivity.rider}</div>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>Severity</label>
                                <span style={{ ...statusBadge, background: getSeverityColor(selectedActivity.severity), color: 'white' }}>
                                    {selectedActivity.severity.toUpperCase()}
                                </span>
                            </div>
                            <div style={{ ...field, gridColumn: '1 / -1' }}>
                                <label style={fieldLabel}>Event</label>
                                <div style={fieldValue}>{selectedActivity.event}</div>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>Detected At</label>
                                <div style={fieldValue}>{selectedActivity.timestamp}</div>
                            </div>
                            <div style={field}>
                                <label style={fieldLabel}>Status</label>
                                <span style={{ ...statusBadge, background: getStatusColor(selectedActivity.status), color: 'white' }}>
                                    {selectedActivity.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                            <button onClick={() => setSelectedActivity(null)} style={{ ...btn, background: '#3b82f6', width: '100%' }}>
                                Close
                            </button>
                        </div>
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
const container = { maxWidth: '1400px', margin: '0 auto', padding: '2rem' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, margin: 0 };
const subtitle = { color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem', marginBottom: '1rem' };
const actionBtn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const statCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const statLabel = { fontSize: '0.85rem', color: '#6b7280', fontWeight: 700 };
const statValue = { fontSize: '2rem', fontWeight: 900, margin: '0.5rem 0' };
const statMeta = { fontSize: '0.85rem', color: '#6b7280' };
const twoColumnLayout = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' };
const sectionTitle = { fontWeight: 800, fontSize: '1.3rem', margin: '0 0 1.5rem 0' };
const deviceCardsContainer = { display: 'grid', gap: '1rem' };
const deviceCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const activitiesContainer = { display: 'grid', gap: '1rem' };
const activityCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const statusBadge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 };
const badge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 };
const auditTable = { background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' };
const auditTableHeader = { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '0.85rem' };
const auditHeaderCell = { color: '#6b7280' };
const auditTableRow = { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '1rem', borderBottom: '1px solid #e5e7eb', alignItems: 'center', fontSize: '0.9rem' };
const auditCell = { display: 'flex', alignItems: 'center' };
const modal = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' };
const modalTitle = { fontSize: '1.5rem', fontWeight: 900, margin: 0 };
const fieldsGrid = { display: 'grid', gap: '1rem', marginBottom: '1.5rem' };
const field = { display: 'grid' };
const fieldLabel = { fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' };
const fieldValue = { padding: '0.75rem', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' };
const label = { display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' };
const input = { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.9rem', boxSizing: 'border-box' };
const btn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer' };

export default SecurityAuditDashboard;
