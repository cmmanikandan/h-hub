import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ShieldCheck,
    CheckCircle,
    ArrowRight,
    DollarSign,
    Wallet,
    Zap,
    Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import OnlinePaymentQR from '../components/OnlinePaymentQR';
import StatusPopup from '../components/StatusPopup';

const DeliveryVerificationPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const order = location.state?.order || null;

    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '' });
    const [otpInput, setOtpInput] = useState('');
    const [otpError, setOtpError] = useState('');
    const [deliveryStep, setDeliveryStep] = useState(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(order?.paymentMethod || '');
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [codReceivedAmount, setCodReceivedAmount] = useState('');
    const [codChangeAmount, setCodChangeAmount] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const [resendingOtp, setResendingOtp] = useState(false);
    const [, setOtpVerified] = useState(false);
    const [verifiedOtpValue, setVerifiedOtpValue] = useState('');
    const [displayOtp, setDisplayOtp] = useState('');
    const [showOnlinePaymentQR, setShowOnlinePaymentQR] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [deliveryPhoto, setDeliveryPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const showStatus = (type, message, title = '') => {
        setPopup({ show: true, type, title, message });
    };

    useEffect(() => {
        if (!order) {
            navigate('/delivery');
            return;
        }

        const sendOtp = async () => {
            try {
                const response = await api.post(`/orders/${order.id}/send-delivery-otp`);
                setOtpSent(true);
                if (response.data.devOtp) {
                    setDisplayOtp(response.data.devOtp);
                }
                showStatus('success', 'OTP sent to customer\'s email', 'OTP Sent');
            } catch (error) {
                showStatus('failed', 'Failed to send OTP: ' + (error.response?.data?.error || error.message), 'Failed');
            }
        };

        sendOtp();
    }, [order, navigate]);

    const handleResendOtp = async () => {
        if (!order) return;
        setResendingOtp(true);
        try {
            const response = await api.post(`/orders/${order.id}/send-delivery-otp`);
            showStatus('success', 'OTP resent to customer\'s email', 'OTP Sent');
            setOtpInput('');
            setOtpError('');
            if (response.data.devOtp) {
                setDisplayOtp(response.data.devOtp);
            }
        } catch (error) {
            showStatus('failed', 'Failed to resend OTP: ' + (error.response?.data?.error || error.message), 'Failed');
        } finally {
            setResendingOtp(false);
        }
    };

    const handleNextStep = async () => {
        if (!order) return;
        if (deliveryStep === 1 && !otpInput) {
            setOtpError('Please enter the 4-digit OTP');
            return;
        }
        if (deliveryStep === 1) {
            try {
                const trimmedOtp = otpInput.trim();
                const verifyRes = await api.post(`/orders/${order.id}/verify-otp`, { otp: trimmedOtp });
                if (verifyRes.data.success) {
                    setOtpVerified(true);
                    setVerifiedOtpValue(trimmedOtp);
                    setOtpError('');
                    setDeliveryStep(2);
                    showStatus('success', 'OTP verified successfully', 'Verified');
                } else {
                    setOtpError('Invalid OTP. Please try again.');
                }
            } catch (error) {
                setOtpError(error.response?.data?.error || 'Invalid OTP. Please try again.');
            }
            return;
        }

        if (deliveryStep === 2 && !paymentCompleted) {
            setOtpError('Please complete the payment before proceeding');
            return;
        }

        if (deliveryStep === 2) {
            setOtpError('');
            setDeliveryStep(3);
        }
    };

    const handlePaymentAtDelivery = async (method) => {
        if (!order) return;
        setPaymentProcessing(true);
        try {
            if (method === 'COD') {
                const totalDue = parseFloat(order.totalAmount || 0);
                const received = parseFloat(codReceivedAmount || 0);
                if (!received || received < totalDue) {
                    setOtpError('Received amount is less than order total');
                    setPaymentProcessing(false);
                    return;
                }

                await api.post(`/orders/${order.id}/payment-at-delivery`, {
                    method: 'COD',
                    amount: totalDue,
                    collectedBy: user.id
                });

                await api.post('/wallet/cod/convert', {
                    orderId: order.id,
                    amount: totalDue,
                    method: 'UPI',
                    reference: `COD-${order.id.slice(0, 8)}`,
                    userId: user.id
                });

                setSelectedPaymentMethod('COD');
                setPaymentCompleted(true);
                setDeliveryStep(3);
                showStatus('success', `Cash Rs.${totalDue} collected and converted to online money`, 'Payment Success');
            } else {
                setShowPaymentOptions(false);
                setShowOnlinePaymentQR(true);
                return;
            }
            setShowPaymentOptions(false);
        } catch (error) {
            setOtpError(error.response?.data?.error || 'Payment processing failed');
        } finally {
            setPaymentProcessing(false);
        }
    };

    const handleOnlinePaymentSuccess = () => {
        setShowOnlinePaymentQR(false);
        setSelectedPaymentMethod('UPI');
        setPaymentCompleted(true);
        setDeliveryStep(3);
        showStatus('success', `Rs.${order.totalAmount} received online and sent to H-HUB Admin wallet`, 'Payment Success');
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setOtpError('Photo size must be less than 5MB');
            return;
        }

        setDeliveryPhoto(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const verifyAndComplete = async () => {
        if (!order) return;
        if (!deliveryPhoto) {
            setOtpError('Please upload delivery photo');
            return;
        }

        setOtpError('');
        setUploadingPhoto(true);

        try {
            const formData = new FormData();
            formData.append('file', deliveryPhoto);
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await api.put(`/orders/${order.id}/deliver`, {
                otp: verifiedOtpValue,
                deliveryPhoto: uploadRes.data.url,
                finalPaymentMethod: selectedPaymentMethod
            });

            showStatus('success', 'Order delivered successfully!', 'Delivery Complete');
            setTimeout(() => navigate('/delivery'), 800);
        } catch (error) {
            setOtpError(error.response?.data?.error || 'Delivery completion failed');
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (!order) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/delivery')}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 700, marginBottom: '1rem' }}
                >
                    <ArrowLeft size={18} /> Back to Assignments
                </button>

                <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 45px rgba(15,23,42,0.12)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1.6rem 2rem', color: '#fff' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem', fontWeight: 900 }}><ShieldCheck size={24} /> Delivery Verification</h3>
                        <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>Complete 3 steps to deliver order</p>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
                            {[1, 2, 3].map((s) => (
                                <div key={s} style={{ flex: 1, height: '4px', borderRadius: '4px', background: deliveryStep >= s ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem 2rem 2rem' }}>
                        <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '14px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e' }}>ORDER AMOUNT</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309' }}>Rs.{(order.totalAmount || 0).toFixed(2)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e' }}>PAYMENT</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#b45309', background: '#fff', borderRadius: 8, padding: '6px 12px' }}>{selectedPaymentMethod || order.paymentMethod}</div>
                            </div>
                        </div>

                        {otpError && (
                            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', borderRadius: 10, padding: '10px 12px', fontWeight: 700, marginBottom: '1rem' }}>
                                {otpError}
                            </div>
                        )}

                        {deliveryStep === 1 && (
                            <div style={{ border: '2px solid #667eea', borderRadius: '16px', padding: '1rem', marginBottom: '1rem' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#1e293b' }}>Verify Customer OTP</h4>
                                {otpSent && <div style={{ color: '#1e40af', background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: 10, padding: '10px', marginBottom: '10px', fontWeight: 700 }}>OTP sent to customer email</div>}
                                {displayOtp && (
                                    <div style={{ background: '#fef3c7', border: '2px dashed #f59e0b', borderRadius: 10, padding: 12, textAlign: 'center', marginBottom: '10px' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e' }}>TEST OTP (Backend)</div>
                                        <div style={{ fontSize: '2rem', letterSpacing: '8px', fontWeight: 900, color: '#d97706' }}>{displayOtp}</div>
                                    </div>
                                )}
                                <input
                                    type="text"
                                    maxLength="4"
                                    value={otpInput}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setOtpInput(val);
                                        setOtpError('');
                                    }}
                                    placeholder="0 0 0 0"
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '1.35rem', letterSpacing: '12px', fontWeight: 900, textAlign: 'center', marginBottom: '10px' }}
                                />
                                <button onClick={handleNextStep} disabled={!otpInput || otpInput.length !== 4} style={{ width: '100%', border: 'none', borderRadius: 12, background: '#0ea5e9', color: '#fff', padding: '12px', fontWeight: 800, cursor: 'pointer', opacity: (!otpInput || otpInput.length !== 4) ? 0.6 : 1 }}>
                                    Verify OTP <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />
                                </button>
                                <button onClick={handleResendOtp} disabled={resendingOtp} style={{ width: '100%', marginTop: '10px', borderRadius: 12, border: '1px solid #f59e0b', background: '#fff7ed', color: '#92400e', padding: '10px', fontWeight: 800, cursor: 'pointer', opacity: resendingOtp ? 0.6 : 1 }}>
                                    {resendingOtp ? 'Sending...' : 'Resend OTP'}
                                </button>
                            </div>
                        )}

                        {deliveryStep === 2 && (
                            <div style={{ border: '2px solid #667eea', borderRadius: '16px', padding: '1rem', marginBottom: '1rem' }}>
                                <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#1e293b' }}>Collect Payment</h4>
                                {!showPaymentOptions && (
                                    <div>
                                        <button
                                            onClick={() => {
                                                setShowPaymentOptions(true);
                                                setPaymentCompleted(false);
                                            }}
                                            style={{ width: '100%', border: 'none', borderRadius: 12, background: '#fbbf24', color: '#111827', padding: '12px', fontWeight: 800, marginBottom: 10, cursor: 'pointer' }}
                                        >
                                            <DollarSign size={16} /> Change Payment Method
                                        </button>

                                        {selectedPaymentMethod !== 'COD' && !paymentCompleted && (
                                            <div style={{ padding: '10px', borderRadius: 10, border: '1px solid #fbbf24', background: '#fef3c7', color: '#92400e', textAlign: 'center', fontWeight: 700 }}>
                                                Waiting for online payment...
                                            </div>
                                        )}

                                        {paymentCompleted && (
                                            <button
                                                onClick={handleNextStep}
                                                style={{ width: '100%', marginTop: 10, border: 'none', borderRadius: 12, background: '#16a34a', color: '#fff', padding: '12px', fontWeight: 800, cursor: 'pointer' }}
                                            >
                                                Continue <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {showPaymentOptions && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                        <button
                                            onClick={() => {
                                                setSelectedPaymentMethod('COD');
                                                setShowPaymentOptions(false);
                                                const totalDue = parseFloat(order.totalAmount || 0);
                                                setCodReceivedAmount(totalDue ? String(totalDue) : '');
                                                setCodChangeAmount(0);
                                                setOtpError('');
                                            }}
                                            style={{ border: '2px solid #10b981', borderRadius: 12, background: '#fff', padding: '1rem', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            <Wallet size={20} /> COD
                                        </button>
                                        <button
                                            onClick={() => handlePaymentAtDelivery('UPI')}
                                            style={{ border: '2px solid #667eea', borderRadius: 12, background: '#fff', padding: '1rem', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            <Zap size={20} /> UPI / Online
                                        </button>
                                    </div>
                                )}

                                {selectedPaymentMethod === 'COD' && !showPaymentOptions && (
                                    <div style={{ marginTop: '10px', border: '1px solid #fecaca', borderRadius: 12, background: '#fff5f5', padding: '12px' }}>
                                        <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: 8 }}>COD Calculator</div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={codReceivedAmount}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCodReceivedAmount(val);
                                                const received = parseFloat(val || 0);
                                                const totalDue = parseFloat(order.totalAmount || 0);
                                                setCodChangeAmount(Math.max(0, received - totalDue));
                                            }}
                                            placeholder="Enter received amount"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #fecaca', fontWeight: 700, marginBottom: 8 }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ color: '#64748b', fontWeight: 700 }}>Change to return</span>
                                            <span style={{ color: '#16a34a', fontWeight: 900 }}>Rs.{codChangeAmount.toFixed(2)}</span>
                                        </div>
                                        <button onClick={() => handlePaymentAtDelivery('COD')} disabled={paymentProcessing} style={{ width: '100%', border: 'none', borderRadius: 10, background: '#ef4444', color: '#fff', padding: '10px', fontWeight: 800, cursor: 'pointer', opacity: paymentProcessing ? 0.6 : 1 }}>
                                            {paymentProcessing ? 'Processing...' : 'Mark COD Paid'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {deliveryStep === 3 && (
                            <div style={{ border: '2px solid #667eea', borderRadius: '16px', padding: '1rem' }}>
                                <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#1e293b' }}>Upload Delivery Proof</h4>
                                <div style={{ border: '2px dashed #cbd5e1', borderRadius: 12, padding: 16, textAlign: 'center', position: 'relative', background: '#f8fafc', marginBottom: '10px' }}>
                                    {photoPreview ? (
                                        <div>
                                            <img src={photoPreview} alt="Preview" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />
                                            <button onClick={() => { setDeliveryPhoto(null); setPhotoPreview(null); }} style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: 800, cursor: 'pointer' }}>
                                                Remove & Retake
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Package size={40} style={{ color: '#94a3b8', marginBottom: 8 }} />
                                            <div style={{ fontWeight: 700, color: '#475569' }}>Take photo of opened package</div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={handlePhotoUpload}
                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={verifyAndComplete}
                                    disabled={!deliveryPhoto || uploadingPhoto}
                                    style={{ width: '100%', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '12px', fontWeight: 900, cursor: 'pointer', opacity: (!deliveryPhoto || uploadingPhoto) ? 0.6 : 1 }}
                                >
                                    {uploadingPhoto ? 'Processing...' : 'Complete Delivery'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <StatusPopup
                show={popup.show}
                type={popup.type}
                title={popup.title}
                message={popup.message}
                onClose={() => setPopup((prev) => ({ ...prev, show: false }))}
            />

            {showOnlinePaymentQR && order && (
                <OnlinePaymentQR
                    order={order}
                    deliveryPersonId={user.id}
                    onSuccess={handleOnlinePaymentSuccess}
                    onClose={() => setShowOnlinePaymentQR(false)}
                />
            )}
        </div>
    );
};

export default DeliveryVerificationPage;
