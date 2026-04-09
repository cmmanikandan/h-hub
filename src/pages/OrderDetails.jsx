import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Truck,
    Box,
    FileText,
    CreditCard,
    MapPin,
    ChevronLeft,
    Clock,
    UserCheck,
    Navigation,
    PackageCheck,
    Smartphone,
    Download,
    XCircle,
    X
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import StatusPopup from '../components/StatusPopup';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { cancelOrder } = useAuth();
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [loading, setLoading] = useState(true);
    const [showFeedback, setShowFeedback] = useState(false);
    const [ratings, setRatings] = useState({ product: 0, delivery: 0, comment: '' });
    const [showReturn, setShowReturn] = useState(false);
    const [returnForm, setReturnForm] = useState({ reason: '', condition: '', comment: '', phoneNumber: '' });
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

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    useEffect(() => {
        if (searchParams.get('return') === 'true') {
            setShowReturn(true);
        }
    }, [searchParams]);

    const fetchOrderDetails = async () => {
        try {
            const response = await api.get(`/orders/${id}`);
            console.log('Order details:', response.data);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ ...container, textAlign: 'center', padding: '4rem' }}>
                <h2>Loading order details...</h2>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ ...container, textAlign: 'center', padding: '4rem' }}>
                <h2>Order not found</h2>
                <Link to="/user/orders" style={{ ...backBtn, justifyContent: 'center', marginTop: '2rem' }}>
                    <ChevronLeft size={20} /> Back to Orders
                </Link>
            </div>
        );
    }

    const getOrderSteps = (status) => {
        const steps = [
            { status: 'Order Placed', icon: <FileText size={20} />, active: true },
            { status: 'Payment Confirmed', icon: <CreditCard size={20} />, active: status !== 'Pending' },
            { status: 'Processing', icon: <Box size={20} />, active: status === 'Processing' || status === 'Shipped' || status === 'Delivered' },
            { status: 'Shipped', icon: <Truck size={20} />, active: status === 'Shipped' || status === 'Delivered' },
            { status: 'Out for Delivery', icon: <Navigation size={20} />, active: status === 'Delivered' },
            { status: 'Delivered', icon: <CheckCircle2 size={20} />, active: status === 'Delivered' },
        ];
        return steps;
    };

    const orderSteps = getOrderSteps(order.status);

    const handleInvoice = () => {
        if (order.status !== 'Delivered') return showStatus('warning', "Invoice available after delivery.", "Not Ready");
        if (!order.ratingProduct) {
            setShowFeedback(true);
        } else {
            // Generate and download invoice
            generateInvoice();
        }
    };

    const generateInvoice = () => {
        // Calculate values
        const totalAmount = Number(order.totalAmount) || 0;
        const subtotal = totalAmount / 1.18;
        const gst = totalAmount - subtotal;

        // Format currency for Indian format
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        };

        const formattedSubtotal = formatCurrency(subtotal);
        const formattedGST = formatCurrency(gst);
        const formattedTotal = formatCurrency(totalAmount);
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // Create invoice HTML content
        const invoiceHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - Order ${order.id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
            background: #f8f9fa;
        }
        .invoice-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { font-size: 36px; margin-bottom: 5px; letter-spacing: 2px; }
        .header p { font-size: 14px; opacity: 0.9; }
        .date-section {
            text-align: right;
            margin-bottom: 20px;
            color: #6c757d;
            font-size: 13px;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 30px; 
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .info-box h3 { 
            color: #667eea; 
            font-size: 14px; 
            margin-bottom: 12px; 
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
        }
        .info-box p { 
            color: #495057; 
            line-height: 1.8; 
            font-size: 14px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
        }
        th { 
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        th.text-center { text-align: center; }
        th.text-right { text-align: right; }
        td { 
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
            color: #495057;
            font-size: 14px;
        }
        td.text-center { text-align: center; }
        td.text-right { text-align: right; font-weight: 600; }
        tr:last-child td { border-bottom: none; }
        .totals-section { 
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .total-row { 
            display: flex; 
            justify-content: space-between;
            padding: 12px 20px;
            font-size: 15px;
        }
        .total-row .label { 
            color: #6c757d;
            font-weight: 500;
        }
        .total-row .value { 
            color: #212529;
            font-weight: 600;
        }
        .grand-total { 
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            margin-top: 10px;
            font-size: 18px;
        }
        .grand-total .label,
        .grand-total .value {
            color: #667eea;
            font-weight: 700;
        }
        .payment-details {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .payment-details h3 {
            color: #667eea;
            font-size: 14px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .payment-details p {
            margin: 8px 0;
            color: #495057;
            font-size: 14px;
            line-height: 1.6;
        }
        .footer { 
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #dee2e6;
            text-align: center;
        }
        .footer p { 
            color: #6c757d;
            font-size: 13px;
            line-height: 1.8;
            margin: 8px 0;
        }
        .footer strong { color: #667eea; }
        @media print {
            body { background: white; padding: 0; }
            .invoice-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <h1>INVOICE</h1>
            <p>H-Hub - Your Trusted Shopping Partner</p>
        </div>
        
        <div class="date-section">
            Date: ${orderDate}
        </div>

        <div class="info-grid">
            <div class="info-box">
                <h3>Bill To:</h3>
                <p>
                    <strong>${order.User?.name || 'Customer'}</strong><br>
                    Phone: ${order.User?.phone || order.Address?.phone || 'N/A'}
                </p>
            </div>
            <div class="info-box">
                <h3>Shipped To:</h3>
                <p>
                    ${order.Address?.fullAddress || order.Address?.street || 'N/A'}<br>
                    ${order.Address?.city || ''} ${order.Address?.state || ''} - ${order.Address?.pincode || ''}<br>
                    Order Status: <strong style="color: #10b981;">${order.status || 'Delivered'}</strong>
                </p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 50%;">Product</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Total/Final Price</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        ${order.Product?.name || 'Product'}
                        ${order.Product?.sku ? '<br><small style="color: #6c757d;">SKU: ' + order.Product.sku + '</small>' : ''}
                    </td>
                    <td class="text-center">1</td>
                    <td class="text-right">&#8377;${formattedSubtotal}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals-section">
            <div class="total-row">
                <span class="label">Subtotal:</span>
                <span class="value">&#8377;${formattedSubtotal}</span>
            </div>
            <div class="total-row">
                <span class="label">GST (18%):</span>
                <span class="value">&#8377;${formattedGST}</span>
            </div>
            <div class="total-row">
                <span class="label">Discount:</span>
                <span class="value">&#8377;0</span>
            </div>
            <div class="total-row grand-total">
                <span class="label">Total Amount:</span>
                <span class="value">&#8377;${formattedTotal}</span>
            </div>
        </div>

        <div class="payment-details">
            <h3>Payment Details</h3>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Online / COD'}</p>
            <p><strong>Payment Status:</strong> Completed</p>
            <p><strong>Order ID:</strong> ${order.id}</p>
        </div>

        <div class="footer">
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
            <p><strong>Thank you for your purchase!</strong></p>
            <p>For support, contact us at <strong>support@h-hub.com</strong> or call <strong>1800-LOGIX-HUB</strong></p>
            <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} Logix Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

        // Create a Blob from the HTML
        const blob = new Blob([invoiceHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Invoice-' + order.id + '.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('Invoice downloaded successfully! Open the HTML file to view and print.');
    };

    const submitFeedback = async () => {
        if (!ratings.product) return alert("Please rate the product.");
        try {
            await api.post(`/orders/${order.id}/feedback`, {
                ratingProduct: ratings.product,
                ratingDelivery: ratings.delivery,
                comment: ratings.comment
            });

            // Update local order state immediately
            setOrder(prev => ({
                ...prev,
                ratingProduct: ratings.product,
                ratingDelivery: ratings.delivery,
                comment: ratings.comment
            }));

            setShowFeedback(false);
            showStatus('success', "Feedback Submitted! You can now download your invoice.", "Thank You");

            // Fetch latest order details
            await fetchOrderDetails();
        } catch (error) {
            console.error('Feedback error:', error);
            showStatus('failed', "Failed to submit feedback", "Error");
        }
    };

    const handleCancelOrder = async () => {
        confirmAction('Are you sure you want to cancel this order?', async () => {
            setIsCancelling(true);
            try {
                const res = await cancelOrder(order.id);
                if (res.success) {
                    setToast({ show: true, type: 'success', message: 'Order cancelled successfully' });
                    fetchOrderDetails();
                } else {
                    setToast({ show: true, type: 'error', message: res.message });
                }
            } catch (error) {
                setToast({ show: true, type: 'error', message: 'Failed to cancel order' });
            } finally {
                setIsCancelling(false);
            }
        }, 'Cancel Order', 'delete');
    };

    const submitReturn = async () => {
        console.log('🔄 Submit return clicked', returnForm);
        if (!returnForm.reason) return alert("Please select a return reason.");
        if (!returnForm.condition) return alert("Please select product condition.");
        if (!returnForm.phoneNumber) return alert("Please provide phone number for pickup.");
        if (returnForm.phoneNumber.length < 10) return alert("Please provide a valid 10-digit phone number.");

        try {
            console.log('📤 Sending return request for order:', order.id);
            const response = await api.post(`/orders/${order.id}/return-request`, {
                reason: returnForm.reason,
                condition: returnForm.condition,
                comment: returnForm.comment,
                phoneNumber: returnForm.phoneNumber
            });
            console.log('✅ Return request successful:', response.data);
            setShowReturn(false);
            fetchOrderDetails();
            showStatus('success', response.data.message || "Return request submitted successfully! Logix Admin will assign a delivery partner for pickup.", "Return Requested");
        } catch (error) {
            console.error('❌ Return request failed:', error);
            showStatus('failed', error.response?.data?.error || "Failed to submit return request", "Request Failed");
        }
    };

    return (
        <div style={container}>
            <style>{`
                .delivery-glow {
                    position: absolute;
                    inset: -2px;
                    border-radius: 32px;
                    padding: 2px;
                    background: linear-gradient(140deg, #22c55e 0 48%, #86efac 48% 52%, #16a34a 52% 100%);
                    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                    mask-composite: exclude;
                    -webkit-mask-composite: xor;
                    overflow: hidden;
                }
                .delivery-glow::after {
                    content: '';
                    position: absolute;
                    inset: -100%;
                    background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.8) 50%, transparent 60%);
                    animation: sweepGlow 2.5s linear infinite;
                }
                @keyframes sweepGlow {
                    0% { transform: translateX(-100%) translateY(-50%) rotate(0deg); }
                    100% { transform: translateX(200%) translateY(50%) rotate(0deg); }
                }
            `}</style>
            <Link to="/user/orders" style={backBtn}><ChevronLeft size={20} /> Back to Orders</Link>

            <header style={header}>
                <div>
                    <h1 style={title}>Order Tracking <span style={oId}>#{order.id}</span></h1>
                    <p style={subtitle}>Real-time delivery updates for your purchase.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleInvoice} style={{ ...invoiceBtn, opacity: order.status === 'Delivered' ? 1 : 0.5, cursor: order.status === 'Delivered' ? 'pointer' : 'not-allowed' }}>
                        <Download size={18} /> {order.ratingProduct ? 'Download Invoice' : 'Rate & Download'}
                    </button>
                    {order.status === 'Delivered' && !order.returnStatus && (
                        <button onClick={() => setShowReturn(true)} style={{ ...invoiceBtn, background: '#f97316', color: 'white', borderColor: '#f97316' }}>
                            Return Product
                        </button>
                    )}
                    {order.returnStatus && (
                        <button disabled style={{ ...invoiceBtn, opacity: 0.6, cursor: 'not-allowed', background: '#e5e7eb' }}>
                            Return: {order.returnStatus}
                        </button>
                    )}
                    {['Pending', 'Processing'].includes(order.status) && (
                        <button
                            onClick={handleCancelOrder}
                            disabled={isCancelling}
                            style={{ ...invoiceBtn, background: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' }}
                        >
                            <X size={18} /> {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                    )}
                </div>
            </header>

            <div style={layout}>
                {/* Vertical Timeline */}
                <div style={trackerBox}>
                    <h3 style={sectionTitle}>Delivery Timeline</h3>
                    <div style={timeline}>
                        {orderSteps.map((step, i) => (
                            <div key={i} style={stepRow}>
                                <div style={dotCol}>
                                    <div style={{ ...dot, background: step.active ? 'var(--primary)' : 'var(--glass-border)', boxShadow: step.active ? '0 0 15px var(--primary)' : 'none' }}>
                                        {step.active ? <CheckCircle2 size={12} color="white" /> : null}
                                    </div>
                                    {i < orderSteps.length - 1 && <div style={{ ...line, background: step.active && orderSteps[i + 1]?.active ? 'var(--primary)' : 'var(--glass-border)' }} />}
                                </div>
                                <div style={{ ...textContent, opacity: step.active ? 1 : 0.5 }}>
                                    <div style={iconWrap}>{step.icon}</div>
                                    <div>
                                        <div style={sName}>{step.status}</div>
                                        <div style={sTime}>{step.active ? new Date(order.createdAt).toLocaleString('en-IN') : 'Pending'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div style={sideCol}>
                    {order.deliveryMan && (
                        <div style={deliveryCard}>
                            <div className="delivery-glow" />
                            <div style={deliveryCardInner}>
                                <h3 style={cardTitle}>Delivery Partner</h3>
                                <div style={shippingBox}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>
                                        {order.deliveryMan.name[0]}
                                    </div>
                                    <div>
                                        <div style={shName}>{order.deliveryMan.name}</div>
                                        <div style={shAddr}>Assigned Rider</div>
                                        <div style={{ ...shPhone, fontSize: '0.9rem' }}>📞 {order.deliveryMan.phone}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={infoCard}>
                        <h3 style={cardTitle}>Shipping Details</h3>
                        <div style={shippingBox}>
                            <MapPin size={24} color="var(--primary)" />
                            <div>
                                <div style={shName}>{order.user?.name || 'Customer'}</div>
                                <div style={shAddr}>{order.address || 'Address not available'}</div>
                                <div style={shPhone}>{order.user?.phone || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div style={infoCard}>
                        <h3 style={cardTitle}>Order Summary</h3>
                        <div style={summaryStack}>
                            <div style={sumRow}>
                                <span>{order.quantity || 1}x {order.productName}</span>
                                <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={sumRow}><span>Shipping</span><span style={{ color: '#10b981', fontWeight: 700 }}>FREE</span></div>
                            {order.discount > 0 && (
                                <div style={sumRow}>
                                    <span>Discount ({order.coupon})</span>
                                    <span style={{ color: '#10b981', fontWeight: 700 }}>-₹{order.discount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div style={divider} />
                            <div style={totalRow}><span>Total</span><span>₹{order.totalAmount?.toLocaleString('en-IN')}</span></div>
                        </div>
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>Payment Method</div>
                            <div style={{ fontWeight: 800, textTransform: 'capitalize' }}>{order.paymentMethod || 'Not specified'}</div>
                        </div>
                    </div>

                    <div style={supportCard}>
                        <Clock size={24} color="#fff" />
                        <div>
                            <div style={shName}>Need Help?</div>
                            <div style={{ ...shAddr, color: 'rgba(255,255,255,0.8)' }}>Our support team is available 24/7 for delivery concerns.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', width: '400px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Rate Your Experience</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your feedback helps us improve.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Rate Product</label>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s} onClick={() => setRatings({ ...ratings, product: s })} style={{ fontSize: '2rem', cursor: 'pointer', color: s <= ratings.product ? '#fbbf24' : '#e2e8f0' }}>★</span>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Rate Delivery</label>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s} onClick={() => setRatings({ ...ratings, delivery: s })} style={{ fontSize: '2rem', cursor: 'pointer', color: s <= ratings.delivery ? '#fbbf24' : '#e2e8f0' }}>★</span>
                                ))}
                            </div>
                        </div>

                        <textarea
                            placeholder="Detailed feedback..."
                            value={ratings.comment}
                            onChange={e => setRatings({ ...ratings, comment: e.target.value })}
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontFamily: 'inherit' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowFeedback(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={submitFeedback} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {showReturn && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Return Product</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Please provide details for your return request.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>Reason for Return</label>
                            <select
                                value={returnForm.reason}
                                onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'inherit', fontSize: '1rem' }}
                            >
                                <option value="">Select a reason</option>
                                <option value="defective">Defective/Not Working</option>
                                <option value="wrong-item">Wrong Item Received</option>
                                <option value="different">Different From Description</option>
                                <option value="damaged">Damaged During Delivery</option>
                                <option value="not-needed">No Longer Needed</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>Product Condition</label>
                            <select
                                value={returnForm.condition}
                                onChange={e => setReturnForm({ ...returnForm, condition: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'inherit', fontSize: '1rem' }}
                            >
                                <option value="">Select condition</option>
                                <option value="unused">Unopened/Unused</option>
                                <option value="used-good">Used but in Good Condition</option>
                                <option value="used-fair">Used - Fair Condition</option>
                                <option value="damaged">Damaged</option>
                                <option value="missing-parts">Missing Parts</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>Phone Number for Pickup *</label>
                            <input
                                type="tel"
                                placeholder="Enter 10-digit phone number"
                                value={returnForm.phoneNumber}
                                onChange={e => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setReturnForm({ ...returnForm, phoneNumber: value });
                                }}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'inherit', fontSize: '1rem' }}
                            />
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>Delivery partner will contact you on this number for pickup</p>
                        </div>

                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>Additional Comments</label>
                        <textarea
                            placeholder="Provide any additional details about the return..."
                            value={returnForm.comment}
                            onChange={e => setReturnForm({ ...returnForm, comment: e.target.value })}
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontFamily: 'inherit', minHeight: '100px' }}
                        />

                        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#92400e', lineHeight: 1.5 }}>
                            <strong>⚠️ Return Policy:</strong> Returns are accepted within 30 days of delivery. Original packaging required. Refund will be processed within 5-7 business days after approval.
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowReturn(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={submitReturn} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: '#f97316', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Submit Return</button>
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

const container = { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 4rem) clamp(1rem, 4vw, 2rem)' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '3rem' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '3.5rem' };
const title = { fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', fontWeight: 900, color: 'var(--text-main)', margin: 0 };
const oId = { color: 'var(--primary)', fontWeight: 800 };
const subtitle = { color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' };
const invoiceBtn = { background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' };
const layout = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2rem' };
const trackerBox = { background: 'var(--glass)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--glass-border)' };
const sectionTitle = { fontSize: '1.25rem', fontWeight: 900, marginBottom: '3rem' };
const timeline = { display: 'flex', flexDirection: 'column' };
const stepRow = { display: 'flex', gap: '2.5rem', minHeight: '80px' };
const dotCol = { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' };
const dot = { width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 };
const line = { width: '2px', flex: 1, margin: '5px 0' };
const textContent = { display: 'flex', gap: '1.5rem', flex: 1, paddingBottom: '2.5rem' };
const iconWrap = { width: '44px', height: '44px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' };
const sName = { fontWeight: 800, fontSize: '1.1rem' };
const sTime = { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' };
const sideCol = { display: 'flex', flexDirection: 'column', gap: '2rem' };
const infoCard = { background: 'var(--glass)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--glass-border)' };
const deliveryCard = { ...infoCard, position: 'relative' };
const deliveryCardInner = { position: 'relative', zIndex: 1, background: 'var(--glass)', borderRadius: '32px' };
const cardTitle = { fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem' };
const shippingBox = { display: 'flex', gap: '1rem', flexWrap: 'wrap' };
const shName = { fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' };
const shAddr = { lineHeight: 1.6, color: 'var(--text-muted)', fontSize: '0.95rem' };
const shPhone = { fontWeight: 700, marginTop: '1rem', color: 'var(--text-main)' };
const summaryStack = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const sumRow = { display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-muted)' };
const divider = { height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900 };
const supportCard = { background: 'var(--text-main)', color: 'var(--bg-main)', padding: '2rem', borderRadius: '24px', display: 'flex', gap: '1.5rem', alignItems: 'center' };

export default OrderDetails;
