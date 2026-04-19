import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/authContext';
import { Package, Clock, CheckCircle2, ShoppingBag, Star, X, Sparkles, ShieldCheck, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReturnRequests from '../components/ReturnRequests';
import Toast from '../components/Toast';
import api from '../utils/api';
import { jsPDF } from 'jspdf';
import StatusPopup from '../components/StatusPopup';

const MyOrders = () => {
    const { profile, cancelOrder, fetchProfile, user } = useAuth();
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [showFeedbackSuggestion, setShowFeedbackSuggestion] = useState(false);
    const [suggestedOrder, setSuggestedOrder] = useState(null);
    const [feedbackData, setFeedbackData] = useState({ product: 0, delivery: 0, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [downloadingOrderId, setDownloadingOrderId] = useState(null);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
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

    // Memoize orders to prevent unnecessary useEffect triggers
    const orders = useMemo(() => profile?.orders || [], [profile?.orders]);

    // Helper function to show toast notification
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    // Check for delivered orders without feedback on mount
    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    // Check for delivered orders without feedback on mount
    useEffect(() => {
        const deliveredWithoutFeedback = orders.find(
            order => order.status === 'Delivered' && !order.ratingProduct
        );
        if (deliveredWithoutFeedback) {
            setSuggestedOrder(deliveredWithoutFeedback);
            setShowFeedbackSuggestion(true);
        }
    }, [orders]);

    const handleCancelOrder = async (e, orderId) => {
        e.stopPropagation();
        confirmAction('Are you sure you want to cancel this order?', async () => {
            setCancellingOrderId(orderId);
            try {
                const res = await cancelOrder(orderId);
                if (res.success) {
                    showToast('success', 'Order cancelled successfully');
                } else {
                    showToast('error', res.message);
                }
            } catch (err) {
                showToast('error', 'Failed to cancel order');
            } finally {
                setCancellingOrderId(null);
            }
        }, 'Cancel Order', 'delete');
    };

    const submitFeedback = async () => {
        if (!feedbackData.product) {
            showToast('error', 'Please rate the product');
            return;
        }
        setSubmitting(true);
        try {
            await api.post(`/orders/${suggestedOrder.id}/feedback`, {
                ratingProduct: feedbackData.product,
                ratingDelivery: feedbackData.delivery,
                comment: feedbackData.comment
            });

            // Show success message
            showToast('success', 'Thank you for your feedback! Your rating has been saved.');

            // Close feedback popup
            setShowFeedbackSuggestion(false);
            setSuggestedOrder(null);
            setFeedbackData({ product: 0, delivery: 0, comment: '' });

            await fetchProfile();
            setSuggestedOrder(null);
        } catch (err) {
            console.error('Feedback error:', err);
            showToast('error', 'Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const downloadInvoice = async (orderId, orderName) => {
        setDownloadingOrderId(orderId);
        try {
            // Generate PDF using jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Set colors
            const primaryColor = [76, 29, 149]; // Purple
            const textColor = [51, 51, 51];
            const lightGray = [243, 244, 246];

            // Page width and margins
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            let yPosition = margin;

            // Header with company name
            pdf.setFillColor(...primaryColor);
            pdf.rect(0, 0, pageWidth, 40, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(24);
            pdf.setFont(undefined, 'bold');
            pdf.text('INVOICE', margin, yPosition + 15);

            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.text('Logix Hub', margin, yPosition + 24);

            // Invoice date and number
            pdf.setTextColor(...textColor);
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Invoice #${orderId.substring(0, 8).toUpperCase()}`, pageWidth - margin - 50, yPosition + 15);

            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 50, yPosition + 23);

            yPosition += 50;

            // Customer and Order Details Section
            pdf.setFillColor(...lightGray);
            pdf.rect(margin, yPosition, (pageWidth - 2 * margin) / 2 - 5, 30, 'F');
            pdf.rect(margin + (pageWidth - 2 * margin) / 2 + 5, yPosition, (pageWidth - 2 * margin) / 2 - 5, 30, 'F');

            // Bill To
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(10);
            pdf.text('BILL TO:', margin + 5, yPosition + 8);

            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            const userAddress = profile?.addresses?.[0]?.address || 'Address not provided';
            pdf.text(userAddress.substring(0, 40), margin + 5, yPosition + 15);
            pdf.text(`Phone: ${profile?.phone || 'N/A'}`, margin + 5, yPosition + 22);

            // Shipped To
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(10);
            pdf.text('SHIPPED TO:', margin + (pageWidth - 2 * margin) / 2 + 10, yPosition + 8);

            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            pdf.text(userAddress.substring(0, 40), margin + (pageWidth - 2 * margin) / 2 + 10, yPosition + 15);
            pdf.text(`Order Status: Delivered`, margin + (pageWidth - 2 * margin) / 2 + 10, yPosition + 22);

            yPosition += 40;

            // Order Items Table
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);
            pdf.setFillColor(...primaryColor);

            const tableTop = yPosition;
            const col1 = margin;
            const col2 = margin + 80;
            const col3 = margin + 120;
            const col4 = pageWidth - margin - 30;

            pdf.rect(col1, tableTop, pageWidth - 2 * margin, 8, 'F');
            pdf.text('Product', col1 + 2, tableTop + 6);
            pdf.text('Qty', col2 + 2, tableTop + 6);
            pdf.text('Unit Price', col3 + 2, tableTop + 6);
            pdf.text('Total', col4 - 25, tableTop + 6);

            // Product details
            yPosition = tableTop + 12;
            pdf.setTextColor(...textColor);
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);

            const productLines = pdf.splitTextToSize(orderName, 35);
            pdf.text(productLines, col1 + 2, yPosition);
            pdf.text('1', col2 + 2, yPosition);
            pdf.text('₹57,180', col3 + 2, yPosition);
            pdf.text('₹57,180', col4 - 25, yPosition);

            yPosition += 15;

            // Summary Section
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            const summaryX = pageWidth - margin - 60;

            pdf.text('Subtotal:', summaryX, yPosition);
            pdf.text('₹57,180', pageWidth - margin - 15, yPosition);

            yPosition += 8;
            pdf.text('GST (18%):', summaryX, yPosition);
            pdf.text('₹10,292', pageWidth - margin - 15, yPosition);

            yPosition += 8;
            pdf.text('Discount:', summaryX, yPosition);
            pdf.text('₹0', pageWidth - margin - 15, yPosition);

            yPosition += 10;
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(11);
            pdf.setFillColor(...primaryColor);
            pdf.rect(summaryX - 5, yPosition - 3, 65, 10, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Total Amount:', summaryX, yPosition + 3);
            pdf.text('₹67,472', pageWidth - margin - 15, yPosition + 3);

            yPosition += 20;

            // Payment Details
            pdf.setTextColor(...textColor);
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(9);
            pdf.text('PAYMENT DETAILS', margin, yPosition);

            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(8);
            yPosition += 8;
            pdf.text('Payment Method: Online / COD', margin, yPosition);
            pdf.text(`Payment Status: Completed`, margin, yPosition + 6);
            pdf.text(`Order ID: ${orderId}`, margin, yPosition + 12);

            yPosition = pageHeight - 40;

            // Footer
            pdf.setDrawColor(...primaryColor);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);

            pdf.setTextColor(...primaryColor);
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(9);
            pdf.text('Thank you for your purchase!', pageWidth / 2, yPosition + 8, { align: 'center' });

            pdf.setTextColor(155, 155, 155);
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(7);
            pdf.text('For support, contact us at support@logixhub.com or call 1800-LOGIX-HUB', pageWidth / 2, yPosition + 15, { align: 'center' });
            pdf.text('© 2024 Logix Hub. All rights reserved.', pageWidth / 2, yPosition + 20, { align: 'center' });

            // Save PDF
            pdf.save(`invoice_${orderId}.pdf`);
            showToast('success', 'Invoice downloaded successfully!');
        } catch (err) {
            console.error('PDF generation error:', err);
            showToast('error', 'Failed to generate invoice. Please try again.');
        } finally {
            setDownloadingOrderId(null);
        }
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}><Package size={28} /> My Orders</h1>
            </header>

            <section style={innovationStrip}>
                <div style={innovationHeader}>
                    <h2 style={innovationTitle}><Sparkles size={18} /> Post-Delivery Innovations</h2>
                    <Link to="/innovations" style={innovationHubLink}>Open Hub</Link>
                </div>
                <div style={innovationGrid}>
                    <Link to="/innovations?feature=verification-payment" style={innovationCard}>
                        <ShieldCheck size={18} color="#7c3aed" />
                        <div>
                            <strong>Pay After Verification</strong>
                            <p style={innovationDesc}>Run OTP, proof, and release workflow for your orders.</p>
                        </div>
                    </Link>
                    <Link to="/innovations?feature=resell" style={innovationCard}>
                        <Repeat size={18} color="#0f766e" />
                        <div>
                            <strong>Neighborhood Resell</strong>
                            <p style={innovationDesc}>Create local resell listings for delivered items.</p>
                        </div>
                    </Link>
                    <Link to="/innovations?feature=reverse-loyalty" style={innovationCard}>
                        <Star size={18} color="#16a34a" />
                        <div>
                            <strong>Reverse Loyalty</strong>
                            <p style={innovationDesc}>Award sustainable shopping actions from this order cycle.</p>
                        </div>
                    </Link>
                </div>
            </section>

            <div style={orderList}>
                {orders.length === 0 ? (
                    <div style={emptyState}>
                        <Package size={80} color="var(--text-muted)" style={{ opacity: 0.3 }} />
                        <h2 style={emptyTitle}>No Orders Yet</h2>
                        <p style={emptyText}>Start shopping to see your orders here!</p>
                        <Link to="/shop" style={shopBtn}>
                            <ShoppingBag size={18} /> Start Shopping
                        </Link>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id}>
                            <motion.div
                                whileHover={{ x: 5 }}
                                style={{ ...orderCard, cursor: 'pointer' }}
                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            >
                                <img src={order.image} alt={order.name} style={orderImg} />
                                <div style={orderInfo}>
                                    <div style={orderName}>{order.name}</div>
                                    <div style={orderMeta}>Order ID: {order.id} • {order.date}</div>
                                    <div style={{ ...statusBadge, background: order.badgeColor, color: order.textColor }}>
                                        {order.status === 'Delivered' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                        {order.status}
                                    </div>
                                </div>
                                <div style={orderPrice}>{order.price}</div>
                                <div style={orderActions}>
                                    <Link to={`/order/${order.id}`} style={trackBtn}>Track Order</Link>
                                    {order.canCancel && (
                                        <button
                                            style={{ ...cancelBtn, opacity: cancellingOrderId === order.id ? 0.6 : 1, cursor: cancellingOrderId === order.id ? 'not-allowed' : 'pointer' }}
                                            onClick={(e) => handleCancelOrder(e, order.id)}
                                            disabled={cancellingOrderId === order.id}
                                        >
                                            {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                                        </button>
                                    )}
                                    {order.status === 'Delivered' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {!order.ratingProduct && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSuggestedOrder(order);
                                                        setShowFeedbackSuggestion(true);
                                                    }}
                                                    style={feedbackBtn}
                                                >
                                                    <Star size={14} style={{ marginRight: '4px' }} /> Rate
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadInvoice(order.id, order.name);
                                                }}
                                                disabled={downloadingOrderId === order.id}
                                                style={{ ...invoiceBtn, opacity: downloadingOrderId === order.id ? 0.6 : 1, cursor: downloadingOrderId === order.id ? 'not-allowed' : 'pointer' }}
                                            >
                                                {downloadingOrderId === order.id ? '⏳ Downloading...' : '⬇️ Download Invoice'}
                                            </button>
                                            {order.canReturn && !order.returnStatus && (
                                                <Link to={`/order/${order.id}?return=true`} style={returnBtn}>
                                                    📦 Return
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Expanded order details */}
                            {expandedOrderId === order.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={expandedDetails}
                                >
                                    <div style={detailsGrid}>
                                        <div style={detailBox}>
                                            <h4 style={detailLabel}>Order Details</h4>
                                            <p style={detailValue}>Order ID: {order.id}</p>
                                            <p style={detailValue}>Date: {order.date}</p>
                                            <p style={detailValue}>Status: {order.status}</p>
                                        </div>
                                        <div style={detailBox}>
                                            <h4 style={detailLabel}>Delivery Info</h4>
                                            <p style={detailValue}>Estimated: 2-3 business days</p>
                                            <p style={detailValue}>Address: {profile?.addresses?.[0]?.address || 'Not provided'}</p>
                                        </div>
                                        <div style={detailBox}>
                                            <h4 style={detailLabel}>Payment</h4>
                                            <p style={detailValue}>Amount: {order.price}</p>
                                            <p style={detailValue}>Method: Online Payment</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Feedback Suggestion Popup */}
            {showFeedbackSuggestion && suggestedOrder && (
                <div style={feedbackOverlay} onClick={() => setShowFeedbackSuggestion(false)}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={feedbackModal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowFeedbackSuggestion(false)}
                            style={closeBtn}
                        >
                            <X size={20} />
                        </button>

                        <div style={feedbackHeader}>
                            <div style={headerGradient}>
                                <Star size={32} color="#fff" fill="#fff" />
                            </div>
                            <h2 style={feedbackTitle}>How was your experience?</h2>
                            <p style={feedbackSubtitle}>Help us serve you better by sharing your feedback on {suggestedOrder.name}</p>
                        </div>

                        <div style={feedbackContent}>
                            {/* Product Rating */}
                            <div style={ratingSection}>
                                <label style={ratingLabel}>How would you rate this product? *</label>
                                <div style={starsContainer}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setFeedbackData({ ...feedbackData, product: star })}
                                            style={{
                                                ...starBtn,
                                                color: star <= feedbackData.product ? '#fbbf24' : '#e5e7eb',
                                                transform: star <= feedbackData.product ? 'scale(1.2)' : 'scale(1)'
                                            }}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                {feedbackData.product > 0 && (
                                    <div style={ratingText}>
                                        {feedbackData.product === 5 && "Excellent! 🎉"}
                                        {feedbackData.product === 4 && "Very Good! 😊"}
                                        {feedbackData.product === 3 && "Good 👍"}
                                        {feedbackData.product === 2 && "Could be better 🤔"}
                                        {feedbackData.product === 1 && "Needs improvement 😢"}
                                    </div>
                                )}
                            </div>

                            {/* Delivery Rating */}
                            <div style={ratingSection}>
                                <label style={ratingLabel}>How was the delivery experience?</label>
                                <div style={starsContainer}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setFeedbackData({ ...feedbackData, delivery: star })}
                                            style={{
                                                ...starBtn,
                                                color: star <= feedbackData.delivery ? '#fbbf24' : '#e5e7eb',
                                                transform: star <= feedbackData.delivery ? 'scale(1.2)' : 'scale(1)'
                                            }}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div style={ratingSection}>
                                <label style={ratingLabel}>Any additional comments? (Optional)</label>
                                <textarea
                                    value={feedbackData.comment}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                                    placeholder="Tell us what you think... product quality, packaging, delivery experience, etc."
                                    style={commentBox}
                                    rows={4}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div style={feedbackActions}>
                                <button
                                    onClick={() => setShowFeedbackSuggestion(false)}
                                    style={cancelFbBtn}
                                >
                                    Skip for now
                                </button>
                                <button
                                    onClick={submitFeedback}
                                    disabled={submitting || !feedbackData.product}
                                    style={{
                                        ...submitFbBtn,
                                        opacity: submitting || !feedbackData.product ? 0.6 : 1,
                                        cursor: submitting || !feedbackData.product ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>

                            <p style={feedbackHint}>✨ Your feedback helps us improve! Thank you for taking time to help us serve you better.</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Return Requests Section */}
            {profile?.id && <ReturnRequests userId={profile.id} />}

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
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' };
const innovationStrip = { background: 'linear-gradient(180deg, #ffffff, #f8fafc)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem' };
const innovationHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', gap: '1rem' };
const innovationTitle = { fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' };
const innovationHubLink = { fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' };
const innovationGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' };
const innovationCard = { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.8rem', color: 'inherit', textDecoration: 'none' };
const innovationDesc = { margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 };
const orderList = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const orderCard = { background: 'var(--glass)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1.5rem' };
const orderImg = { width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' };
const orderInfo = { flex: 1 };
const orderName = { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' };
const orderMeta = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' };
const statusBadge = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700 };
const orderPrice = { fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' };
const orderActions = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const trackBtn = { background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem' };
const cancelBtn = { background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' };
const invoiceBtn = { background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' };
const returnBtn = { background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' };
const emptyState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' };
const emptyTitle = { fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '1rem', marginBottom: '0.5rem' };
const emptyText = { color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' };
const shopBtn = { background: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' };

// Expanded order details styles
const expandedDetails = { background: 'var(--glass)', padding: '1.5rem', borderRadius: '0 0 20px 20px', borderTop: 'none', marginTop: '-0.5rem' };
const detailsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' };
const detailBox = { background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' };
const detailLabel = { fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', margin: 0 };
const detailValue = { fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.4rem 0' };

// Feedback Popup Styles
const feedbackBtn = { background: '#ec4899', color: 'white', padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' };
const feedbackOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const feedbackModal = { background: 'white', borderRadius: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)', overflow: 'hidden', position: 'relative' };
const closeBtn = { position: 'absolute', top: '16px', right: '16px', background: 'rgba(0, 0, 0, 0.1)', border: 'none', color: '#64748b', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 };
const feedbackHeader = { background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', color: 'white', padding: '32px 24px', textAlign: 'center' };
const headerGradient = { width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' };
const feedbackTitle = { fontSize: '1.5rem', fontWeight: 900, margin: '0 0 8px' };
const feedbackSubtitle = { fontSize: '0.9rem', opacity: 0.9, margin: 0 };
const feedbackContent = { padding: '32px 24px' };
const ratingSection = { marginBottom: '24px' };
const ratingLabel = { display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#1f2937', marginBottom: '12px' };
const starsContainer = { display: 'flex', gap: '12px', marginBottom: '8px' };
const starBtn = { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', transition: 'all 0.2s', padding: 0 };
const ratingText = { fontSize: '0.85rem', color: '#ec4899', fontWeight: 600, marginTop: '8px' };
const commentBox = { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', color: '#1f2937' };
const feedbackActions = { display: 'flex', gap: '12px', marginTop: '24px', marginBottom: '16px' };
const cancelFbBtn = { flex: 1, padding: '12px 16px', background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' };
const submitFbBtn = { flex: 1, padding: '12px 16px', background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' };
const feedbackHint = { fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', margin: 0 };

export default MyOrders;
