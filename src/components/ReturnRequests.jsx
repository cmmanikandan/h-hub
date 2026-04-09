// Return Request Component
import React, { useState, useEffect } from 'react';
import { RotateCcw, Upload } from 'lucide-react';
import api from '../utils/api';
import StatusPopup from './StatusPopup';

const ReturnRequests = ({ userId, orderId }) => {
    const [returns, setReturns] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, message, title, onAction });
    };

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const res = await api.get(`/returns/${userId}`);
                setReturns(res.data);
            } catch (__) {
                console.error('Failed to fetch returns:', __);
            }
        };
        fetchReturns();
    }, [userId]);

    const handleImageUpload = (e) => {
        setImages([...images, ...Array.from(e.target.files)]);
    };

    const submitReturn = async () => {
        if (!reason || !description) {
            showStatus('warning', 'Please fill all fields', 'Missing Info');
            return;
        }

        try {
            const payload = {
                orderId,
                userId,
                returnReason: reason,
                description,
                images: images.map(f => f.name)
            };

            console.log('📤 Submitting return:', payload);
            await api.post('/returns', payload);

            setShowForm(false);
            setReason('');
            setDescription('');
            setImages([]);

            // Refetch returns
            const res = await api.get(`/returns/${userId}`);
            setReturns(Array.isArray(res.data) ? res.data : []);
            showStatus('success', 'Return request submitted successfully!', 'Submitted');
        } catch (err) {
            console.error('❌ Return Submission Failed:', err);
            showStatus('failed', err.response?.data?.error || 'Failed to submit return request. Please try again.', 'Error');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'requested': '#3B82F6',
            'approved': '#10B981',
            'rejected': '#EF4444',
            'pickup_scheduled': '#F59E0B',
            'returned': '#8B5CF6',
            'refunded': '#10B981'
        };
        return colors[status] || '#6B7280';
    };

    return (
        <div style={container}>
            <div style={header}>
                <RotateCcw size={28} color="#F59E0B" />
                <h2 style={title}>Return Requests</h2>
            </div>

            <button onClick={() => setShowForm(!showForm)} style={initiateBtn}>
                Request Return
            </button>

            {showForm && (
                <div style={formBox}>
                    <h3 style={formTitle}>Initiate Return</h3>

                    <div style={formGroup}>
                        <label style={label}>Return Reason</label>
                        <select value={reason} onChange={(e) => setReason(e.target.value)} style={select}>
                            <option value="">Select reason</option>
                            <option value="damaged">Damaged/Defective</option>
                            <option value="wrong_item">Wrong Item Received</option>
                            <option value="not_as_described">Not As Described</option>
                            <option value="size_issue">Size/Fit Issue</option>
                            <option value="changed_mind">Changed Mind</option>
                        </select>
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the issue..."
                            style={textarea}
                        />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Upload Photos</label>
                        <label style={fileInput}>
                            <Upload size={20} /> Click to upload
                            <input type="file" multiple onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                        </label>
                        {images.length > 0 && <p style={fileCount}>{images.length} files selected</p>}
                    </div>

                    <div style={buttonGroup}>
                        <button onClick={submitReturn} style={submitBtn}>Submit Return Request</button>
                        <button onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={returnsList}>
                {returns.length === 0 ? (
                    <p style={empty}>No return requests yet</p>
                ) : (
                    returns.map(r => (
                        <div key={r.id} style={returnCard}>
                            <div style={returnHeader}>
                                <div>
                                    <h4 style={returnTitle}>{r.returnReason}</h4>
                                    <small style={returnDate}>{new Date(r.createdAt).toLocaleDateString()}</small>
                                </div>
                                <div style={{ ...returnStatus, borderColor: getStatusColor(r.status) }}>
                                    <span style={{ color: getStatusColor(r.status), fontWeight: 700, textTransform: 'capitalize' }}>
                                        {r.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <p style={returnDesc}>{r.description}</p>
                            {r.refundAmount && (
                                <p style={refundAmount}>Refund Amount: ₹{r.refundAmount}</p>
                            )}
                        </div>
                    ))
                )}
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

const container = { padding: '2.5rem', background: 'var(--glass)', borderRadius: '32px', border: '1px solid var(--glass-border)', marginTop: '2.5rem', boxShadow: 'var(--shadow-lg)' };
const header = { display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' };
const title = { fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.025em' };
const initiateBtn = { padding: '0.875rem 1.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)', transition: 'all 0.3s ease' };
const formBox = { background: 'white', padding: '2rem', borderRadius: '24px', marginBottom: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const formTitle = { margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' };
const formGroup = { marginBottom: '1.5rem' };
const label = { display: 'block', marginBottom: '0.625rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' };
const select = { width: '100%', padding: '0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '14px', fontSize: '1rem', background: '#f8fafc', transition: 'border-color 0.2s' };
const textarea = { width: '100%', minHeight: '120px', padding: '0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '14px', fontSize: '1rem', background: '#f8fafc', fontFamily: 'inherit' };
const fileInput = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.5rem', border: '2px dashed #cbd5e1', borderRadius: '16px', cursor: 'pointer', fontWeight: 700, color: '#64748b', background: '#f8fafc', transition: 'all 0.2s' };
const fileCount = { fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, margin: '0.75rem 0 0 0', textAlign: 'center' };
const buttonGroup = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' };
const submitBtn = { padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' };
const cancelBtn = { padding: '1rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' };
const returnsList = { display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' };
const empty = { textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '1.1rem', fontWeight: 500 };
const returnCard = { background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s' };
const returnHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' };
const returnTitle = { margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' };
const returnDate = { color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 };
const returnStatus = { padding: '0.5rem 1.25rem', borderRadius: '12px', border: '2px solid', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.02em' };
const returnDesc = { margin: '1rem 0', fontSize: '1rem', color: '#475569', lineHeight: 1.5 };
const refundAmount = { margin: '1rem 0 0 0', padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: '12px', fontSize: '1rem', fontWeight: 800, color: '#10b981', display: 'inline-block' };

export default ReturnRequests;
