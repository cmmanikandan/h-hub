import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    X,
    Check,
    Truck,
    IndianRupee,
    Calendar,
    Phone,
    User,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import api from '../utils/api';
import StatusPopup from '../components/StatusPopup';

const AdminReturns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [approvalForm, setApprovalForm] = useState({ deliveryPartnerId: '', pickupDate: '', adminNotes: '' });
    const [rejectReason, setRejectReason] = useState('');
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, message, title, onAction });
    };

    useEffect(() => {
        fetchReturns();
        fetchDeliveryPartners();
    }, []);

    const fetchReturns = async () => {
        try {
            const res = await api.get('/admin/returns');
            setReturns(res.data);
        } catch (error) {
            console.error('Failed to fetch returns:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveryPartners = async () => {
        try {
            const res = await api.get('/users?role=delivery');
            setDeliveryPartners(res.data || []);
        } catch (error) {
            console.error('Failed to fetch delivery partners:', error);
        }
    };

    const handleApprove = async () => {
        if (!approvalForm.deliveryPartnerId) {
            showStatus('warning', 'Please select a delivery partner', 'Missing Info');
            return;
        }

        try {
            await api.post(`/admin/returns/${selectedReturn.id}/approve`, approvalForm);
            showStatus('success', 'Return approved successfully!', 'Approved');
            setShowApprovalModal(false);
            fetchReturns();
        } catch (error) {
            showStatus('failed', error.response?.data?.error || 'Failed to approve return', 'Error');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            showStatus('warning', 'Please provide a rejection reason', 'Missing Info');
            return;
        }

        try {
            await api.post(`/admin/returns/${selectedReturn.id}/reject`, { reason: rejectReason });
            showStatus('success', 'Return request rejected', 'Rejected');
            setShowRejectModal(false);
            fetchReturns();
        } catch (error) {
            showStatus('failed', error.response?.data?.error || 'Failed to reject return', 'Error');
        }
    };

    const handleProcessRefund = async () => {
        if (selectedReturn.refundStatus !== 'seller_paid') {
            showStatus('warning', 'Seller must confirm return first before processing refund', 'Cannot Process');
            return;
        }

        try {
            const res = await api.post(`/admin/returns/${selectedReturn.id}/process-refund`);
            showStatus('success', `Refund of ₹${res.data.refundAmount.toFixed(2)} processed successfully!`, 'Refunded');
            setShowRefundModal(false);
            fetchReturns();
        } catch (error) {
            showStatus('failed', error.response?.data?.error || 'Failed to process refund', 'Error');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            requested: { color: '#fbbf24', bg: '#fef3c7', icon: Clock, label: 'Requested' },
            approved: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle, label: 'Approved' },
            rejected: { color: '#ef4444', bg: '#fee2e2', icon: XCircle, label: 'Rejected' },
            pickup_scheduled: { color: '#3b82f6', bg: '#dbeafe', icon: Calendar, label: 'Pickup Scheduled' },
            picked_up: { color: '#8b5cf6', bg: '#ede9fe', icon: Truck, label: 'Picked Up' },
            returned: { color: '#06b6d4', bg: '#cffafe', icon: Package, label: 'Returned to Seller' },
            refunded: { color: '#22c55e', bg: '#dcfce7', icon: CheckCircle, label: 'Refunded' }
        };

        const config = statusConfig[status] || statusConfig.requested;
        const Icon = config.icon;

        return (
            <span style={{
                background: config.bg,
                color: config.color,
                padding: '0.5rem 1rem',
                borderRadius: '24px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <Icon size={14} /> {config.label}
            </span>
        );
    };

    if (loading) {
        return <div style={container}><h2>Loading returns...</h2></div>;
    }

    return (
        <div style={container}>
            <header style={header}>
                <div>
                    <h1 style={title}>Return Management</h1>
                    <p style={subtitle}>Manage product returns and refund processing</p>
                </div>
                <div style={stats}>
                    <div style={statCard}>
                        <Clock size={24} color="#fbbf24" />
                        <div>
                            <div style={statValue}>{returns.filter(r => r.status === 'requested').length}</div>
                            <div style={statLabel}>Pending</div>
                        </div>
                    </div>
                    <div style={statCard}>
                        <Truck size={24} color="#3b82f6" />
                        <div>
                            <div style={statValue}>{returns.filter(r => ['approved', 'pickup_scheduled', 'picked_up'].includes(r.status)).length}</div>
                            <div style={statLabel}>In Process</div>
                        </div>
                    </div>
                    <div style={statCard}>
                        <CheckCircle size={24} color="#22c55e" />
                        <div>
                            <div style={statValue}>{returns.filter(r => r.status === 'refunded').length}</div>
                            <div style={statLabel}>Completed</div>
                        </div>
                    </div>
                </div>
            </header>

            <div style={tableContainer}>
                <table style={table}>
                    <thead>
                        <tr>
                            <th style={th}>Order ID</th>
                            <th style={th}>Customer</th>
                            <th style={th}>Product</th>
                            <th style={th}>Reason</th>
                            <th style={th}>Phone</th>
                            <th style={th}>Amount</th>
                            <th style={th}>Status</th>
                            <th style={th}>Refund Status</th>
                            <th style={th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returns.map(returnReq => (
                            <tr key={returnReq.id} style={tr}>
                                <td style={td}>#{returnReq.Order?.id?.slice(0, 8)}</td>
                                <td style={td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <User size={16} />
                                        {returnReq.Order?.User?.name || 'N/A'}
                                    </div>
                                </td>
                                <td style={td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {returnReq.Order?.Product?.image && (
                                            <img
                                                src={returnReq.Order.Product.image}
                                                alt=""
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                        )}
                                        <span style={{ fontSize: '0.9rem' }}>{returnReq.Order?.Product?.name || 'N/A'}</span>
                                    </div>
                                </td>
                                <td style={td}>{returnReq.returnReason || 'N/A'}</td>
                                <td style={td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Phone size={14} />
                                        {returnReq.phoneNumber}
                                    </div>
                                </td>
                                <td style={td}>₹{parseFloat(returnReq.refundAmount || 0).toLocaleString('en-IN')}</td>
                                <td style={td}>{getStatusBadge(returnReq.status)}</td>
                                <td style={td}>
                                    <span style={{
                                        background: returnReq.refundStatus === 'processed' ? '#dcfce7' : returnReq.refundStatus === 'seller_paid' ? '#fef3c7' : '#fee2e2',
                                        color: returnReq.refundStatus === 'processed' ? '#166534' : returnReq.refundStatus === 'seller_paid' ? '#92400e' : '#991b1b',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}>
                                        {returnReq.refundStatus === 'seller_paid' ? 'Seller Paid' : returnReq.refundStatus === 'processed' ? 'Refunded' : 'Pending'}
                                    </span>
                                </td>
                                <td style={td}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {returnReq.status === 'requested' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReturn(returnReq);
                                                        setShowApprovalModal(true);
                                                    }}
                                                    style={{ ...actionBtn, background: '#10b981', color: 'white' }}
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReturn(returnReq);
                                                        setShowRejectModal(true);
                                                    }}
                                                    style={{ ...actionBtn, background: '#ef4444', color: 'white' }}
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                        {returnReq.status === 'returned' && returnReq.refundStatus === 'seller_paid' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedReturn(returnReq);
                                                    setShowRefundModal(true);
                                                }}
                                                style={{ ...actionBtn, background: '#3b82f6', color: 'white' }}
                                            >
                                                <IndianRupee size={14} /> Process Refund
                                            </button>
                                        )}
                                        {returnReq.status === 'refunded' && (
                                            <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.9rem' }}>✓ Complete</span>
                                        )}
                                        {!['requested', 'returned', 'refunded'].includes(returnReq.status) && returnReq.status !== 'rejected' && (
                                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>In Progress...</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {returns.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <Package size={48} style={{ margin: '0 auto 1rem' }} />
                        <p>No return requests yet</p>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            <AnimatePresence>
                {showApprovalModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={modal}
                        >
                            <h2 style={modalTitle}>Approve Return Request</h2>
                            <p style={modalSubtitle}>Assign a delivery partner for pickup</p>

                            <div style={formGroup}>
                                <label style={label}>Delivery Partner *</label>
                                <select
                                    value={approvalForm.deliveryPartnerId}
                                    onChange={e => setApprovalForm({ ...approvalForm, deliveryPartnerId: e.target.value })}
                                    style={input}
                                >
                                    <option value="">Select delivery partner</option>
                                    {deliveryPartners.map(dp => (
                                        <option key={dp.id} value={dp.id}>{dp.name} - {dp.phone}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={formGroup}>
                                <label style={label}>Pickup Date</label>
                                <input
                                    type="date"
                                    value={approvalForm.pickupDate}
                                    onChange={e => setApprovalForm({ ...approvalForm, pickupDate: e.target.value })}
                                    style={input}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div style={formGroup}>
                                <label style={label}>Admin Notes</label>
                                <textarea
                                    value={approvalForm.adminNotes}
                                    onChange={e => setApprovalForm({ ...approvalForm, adminNotes: e.target.value })}
                                    style={{ ...input, minHeight: '80px' }}
                                    placeholder="Any special instructions..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={() => setShowApprovalModal(false)} style={{ ...modalBtn, background: '#f1f5f9', color: '#334155' }}>Cancel</button>
                                <button onClick={handleApprove} style={{ ...modalBtn, background: '#10b981', color: 'white' }}>Approve & Assign</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={modal}
                        >
                            <h2 style={modalTitle}>Reject Return Request</h2>
                            <p style={modalSubtitle}>Provide a reason for rejection</p>

                            <div style={formGroup}>
                                <label style={label}>Rejection Reason *</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    style={{ ...input, minHeight: '100px' }}
                                    placeholder="Explain why this return request is being rejected..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={() => setShowRejectModal(false)} style={{ ...modalBtn, background: '#f1f5f9', color: '#334155' }}>Cancel</button>
                                <button onClick={handleReject} style={{ ...modalBtn, background: '#ef4444', color: 'white' }}>Confirm Rejection</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Refund Modal */}
            <AnimatePresence>
                {showRefundModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={modal}
                        >
                            <h2 style={modalTitle}>Process Refund</h2>
                            <p style={modalSubtitle}>Transfer refund amount to user wallet</p>

                            <div style={{ background: '#e0f2fe', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Customer:</span>
                                    <strong>{selectedReturn?.Order?.User?.name}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Order ID:</span>
                                    <strong>#{selectedReturn?.Order?.id?.slice(0, 8)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px dashed #0284c7' }}>
                                    <span style={{ fontWeight: 700 }}>Refund Amount:</span>
                                    <strong style={{ color: '#0284c7' }}>₹{parseFloat(selectedReturn?.refundAmount || 0).toLocaleString('en-IN')}</strong>
                                </div>
                            </div>

                            <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                This will deduct amount from Admin wallet and credit to user's wallet.
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowRefundModal(false)} style={{ ...modalBtn, background: '#f1f5f9', color: '#334155' }}>Cancel</button>
                                <button onClick={handleProcessRefund} style={{ ...modalBtn, background: '#3b82f6', color: 'white' }}>Process Refund</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
const container = { padding: '2rem', maxWidth: '1600px', margin: '0 auto' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' };
const subtitle = { color: '#64748b', fontSize: '1rem' };
const stats = { display: 'flex', gap: '1.5rem', marginTop: '1.5rem' };
const statCard = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1
};
const statValue = { fontSize: '1.75rem', fontWeight: 900 };
const statLabel = { color: '#64748b', fontSize: '0.9rem' };
const tableContainer = { background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' };
const table = { width: '100%', borderCollapse: 'collapse' };
const th = {
    background: '#f8fafc',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: '0.85rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0'
};
const tr = { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' };
const td = { padding: '1rem', fontSize: '0.9rem' };
const actionBtn = {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'filter 0.2s'
};
const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};
const modal = {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '24px',
    width: '500px',
    maxHeight: '90vh',
    overflowY: 'auto'
};
const modalTitle = { fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' };
const modalSubtitle = { color: '#64748b', marginBottom: '2rem' };
const formGroup = { marginBottom: '1.5rem' };
const label = { display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' };
const input = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontFamily: 'inherit',
    fontSize: '1rem'
};
const modalBtn = {
    flex: 1,
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'filter 0.2s'
};

export default AdminReturns;
