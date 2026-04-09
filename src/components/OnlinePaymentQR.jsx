import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import StatusPopup from './StatusPopup';
import { API_BASE_URL } from '../utils/api';

const OnlinePaymentQR = ({ order, onSuccess, onClose }) => {
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentPhone, setPaymentPhone] = useState('');
    const [qrValue, setQrValue] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
    const [isRazorpayProcessing, setIsRazorpayProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
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

    const loadRazorpayScript = () => {
        if (window.Razorpay) {
            return Promise.resolve(true);
        }

        return new Promise((resolve) => {
            const existingScript = document.querySelector('script[data-razorpay="true"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(true));
                existingScript.addEventListener('error', () => resolve(false));
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.dataset.razorpay = 'true';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        // Generate UPI payment string for QR code
        // Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&tr=<REFERENCE>&tn=<DESC>
        const upiId = 'hhub-admin@upi'; // H-HUB admin UPI ID
        const adminName = 'H-HUB Admin';
        const amount = order.totalAmount || 0;
        const reference = `ORD${order.id.slice(0, 8)}`;
        const description = `Order #${order.id.slice(0, 8)}`;

        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(adminName)}&am=${amount}&tr=${reference}&tn=${encodeURIComponent(description)}`;
        setQrValue(upiString);
        setPaymentRef(reference);
    }, [order]);

    const handleConfirmPayment = async () => {
        setError('');

        if (!paymentPhone) {
            setError('Please enter customer phone number');
            return;
        }

        // Ask for confirmation before proceeding
        const confirmMessage = `Has the customer completed the UPI payment of ₹${order.totalAmount}?\n\nReference: ${paymentRef}\nPhone: ${paymentPhone}\n\nClick OK only if you have received confirmation that the payment was successful.`;

        confirmAction(confirmMessage, async () => {
            setIsConfirming(true);

            try {
                const response = await fetch(`${API_BASE_URL}/delivery/payment/online-collect`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        orderId: order.id,
                        amount: order.totalAmount,
                        paymentRef: paymentRef,
                        phone: paymentPhone
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Payment confirmation failed');
                }

                setShowSuccess(true);
                setTimeout(() => {
                    if (onSuccess) onSuccess(data);
                }, 2000);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsConfirming(false);
            }
        }, 'Confirm Payment', 'confirm');
    };

    const handleRazorpayPayment = async () => {
        setError('');

        if (!paymentPhone) {
            setError('Please enter customer phone number');
            return;
        }

        setIsRazorpayLoading(true);
        try {
            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded || !window.Razorpay) {
                throw new Error('Unable to load Razorpay checkout');
            }

            const amount = Number(order.totalAmount || 0);
            const createResponse = await fetch(`${API_BASE_URL}/payments/razorpay/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    currency: 'INR',
                    receipt: `delivery_${order.id.slice(0, 8)}`,
                    notes: {
                        orderId: order.id,
                        source: 'delivery-panel',
                        phone: paymentPhone
                    }
                })
            });

            const createData = await createResponse.json();
            if (!createResponse.ok) {
                throw new Error(createData.error || 'Failed to create Razorpay order');
            }

            const razorpay = new window.Razorpay({
                key: createData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: createData.amount,
                currency: createData.currency,
                name: 'H-HUB',
                description: `Delivery payment for Order #${order.id.slice(0, 8)}`,
                order_id: createData.orderId,
                prefill: {
                    contact: paymentPhone
                },
                theme: { color: '#0f766e' },
                modal: {
                    ondismiss: () => {
                        setIsRazorpayLoading(false);
                        setIsRazorpayProcessing(false);
                    }
                },
                handler: async (response) => {
                    setIsRazorpayProcessing(true);
                    try {
                        const verifyResponse = await fetch(`${API_BASE_URL}/payments/razorpay/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(response)
                        });

                        const verifyData = await verifyResponse.json();
                        if (!verifyResponse.ok || !verifyData.verified) {
                            throw new Error(verifyData.error || 'Payment verification failed');
                        }

                        const collectResponse = await fetch(`${API_BASE_URL}/delivery/payment/online-collect`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                                orderId: order.id,
                                amount,
                                paymentRef: response.razorpay_payment_id,
                                phone: paymentPhone
                            })
                        });

                        const collectData = await collectResponse.json();
                        if (!collectResponse.ok) {
                            throw new Error(collectData.error || 'Payment collection failed');
                        }

                        setPaymentRef(response.razorpay_payment_id);
                        setShowSuccess(true);
                        setTimeout(() => {
                            if (onSuccess) onSuccess(collectData);
                        }, 1800);
                    } catch (err) {
                        setError(err.message);
                    } finally {
                        setIsRazorpayProcessing(false);
                        setIsRazorpayLoading(false);
                    }
                }
            });

            razorpay.on('payment.failed', (response) => {
                setError(response?.error?.description || 'Razorpay payment failed');
                setIsRazorpayLoading(false);
                setIsRazorpayProcessing(false);
            });

            razorpay.open();
        } catch (err) {
            setError(err.message);
            setIsRazorpayLoading(false);
            setIsRazorpayProcessing(false);
        }
    };

    const copyUPIString = () => {
        navigator.clipboard.writeText(qrValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 500,
        backdropFilter: 'blur(4px)',
        padding: '1rem',
        overflowY: 'auto'
    };

    const contentStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '450px',
        width: '90%',
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto',
        color: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.3s ease-out'
    };

    const sectionStyle = {
        marginBottom: '1.5rem',
        textAlign: 'center'
    };

    const labelStyle = {
        fontSize: '0.9rem',
        opacity: 0.9,
        marginBottom: '0.5rem',
        fontWeight: 500
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        padding: '0.75rem',
        color: '#fff',
        fontSize: '0.95rem',
        marginBottom: '0.75rem'
    };

    const qrContainerStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '1rem',
        margay: '1rem 0'
    };

    const buttonStyle = {
        background: 'rgba(255, 255, 255, 0.2)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 600,
        transition: 'all 0.2s',
        marginRight: '0.75rem'
    };

    const confirmButtonStyle = {
        ...buttonStyle,
        background: '#10b981',
        border: 'none',
        color: '#fff'
    };

    if (showSuccess) {
        return (
            <div style={modalStyle}>
                <div style={contentStyle}>
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 900 }}>Payment Successful!</h2>
                        <p style={{ margin: 0, opacity: 0.9 }}>₹{order.totalAmount} transferred to H-HUB Admin wallet</p>
                        <p style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', opacity: 0.7 }}>Reference: {paymentRef}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Online Payment</h2>
                    <button onClick={onClose} style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: '#fff',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        ✕
                    </button>
                </div>

                {/* Order Amount */}
                <div style={sectionStyle}>
                    <p style={labelStyle}>Amount to Collect</p>
                    <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: '#fbbf24' }}>
                        ₹{order.totalAmount}
                    </h3>
                </div>

                {/* QR Code */}
                {qrValue && (
                    <div style={sectionStyle}>
                        <p style={labelStyle}>Scan QR Code or Use UPI</p>
                        <div style={qrContainerStyle}>
                            <QRCodeSVG
                                value={qrValue}
                                size={200}
                                level="H"
                                includeMargin={true}
                                style={{ width: '100%', height: 'auto' }}
                            />
                        </div>
                        <button
                            onClick={copyUPIString}
                            style={{
                                ...buttonStyle,
                                fontSize: '0.85rem',
                                width: '100%',
                                marginTop: '0.75rem'
                            }}
                        >
                            <Copy size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            {copied ? 'Copied!' : 'Copy UPI String'}
                        </button>
                    </div>
                )}

                <div style={{ ...sectionStyle, marginTop: '-0.5rem' }}>
                    <p style={labelStyle}>Live Razorpay Collection</p>
                    <button
                        onClick={handleRazorpayPayment}
                        disabled={!paymentPhone || isRazorpayLoading || isRazorpayProcessing}
                        style={{
                            ...confirmButtonStyle,
                            width: '100%',
                            background: 'linear-gradient(130deg, #0f766e, #0891b2)',
                            opacity: !paymentPhone || isRazorpayLoading || isRazorpayProcessing ? 0.65 : 1,
                            cursor: !paymentPhone || isRazorpayLoading || isRazorpayProcessing ? 'not-allowed' : 'pointer',
                            marginBottom: '0.75rem'
                        }}
                    >
                        {isRazorpayLoading || isRazorpayProcessing ? (
                            <>
                                <RefreshCw size={14} style={{ display: 'inline', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                Opening Razorpay...
                            </>
                        ) : 'Pay with Razorpay'}
                    </button>
                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.85 }}>
                        Opens UPI, card, and net banking inside Razorpay.
                    </p>
                </div>

                {/* Customer Phone */}
                <div style={sectionStyle}>
                    <p style={labelStyle}>Customer Phone Number</p>
                    <input
                        type="tel"
                        placeholder="Enter customer phone"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.25)'}
                        onBlur={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                    />
                </div>

                {/* Reference ID */}
                <div style={sectionStyle}>
                    <p style={labelStyle}>Payment Reference</p>
                    <p style={{ margin: 0, padding: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {paymentRef}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <AlertCircle size={18} color="#fca5a5" />
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
                    </div>
                )}

                {/* Info Box */}
                <div style={{
                    background: 'rgba(96, 165, 250, 0.2)',
                    border: '1px solid rgba(96, 165, 250, 0.5)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    fontSize: '0.85rem'
                }}>
                    <p style={{ margin: 0, marginBottom: '0.25rem', fontWeight: 600 }}>💡 Instructions:</p>
                    <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.8rem' }}>
                        <li>Customer scans the QR code or enters the UPI string</li>
                        <li>Money is sent directly to H-HUB Admin wallet</li>
                        <li>Confirm payment after customer completes transaction</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                        onClick={onClose}
                        style={buttonStyle}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmPayment}
                        disabled={!paymentPhone || isConfirming}
                        style={{
                            ...confirmButtonStyle,
                            opacity: !paymentPhone || isConfirming ? 0.6 : 1,
                            cursor: !paymentPhone || isConfirming ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isConfirming ? (
                            <>
                                <RefreshCw size={14} style={{ display: 'inline', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                Confirming...
                            </>
                        ) : (
                            'Confirm Payment'
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(40px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
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

export default OnlinePaymentQR;
