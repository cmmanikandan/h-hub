import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, Wallet, Building2, ChevronRight, Edit3, Plus, Check, ArrowLeft, ShieldCheck, Truck, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { statesAndDistricts } from '../utils/indianStates';
import api from '../utils/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile, addOrder, addAddress, updateAddress, deleteAddress } = useAuth();
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);

    const product = location.state?.product || null;
    const quantity = location.state?.quantity || 1;

    const [step, setStep] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showAddAddress, setShowAddAddress] = useState(false);

    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [deliveryCharge, setDeliveryCharge] = useState(40);
    const [roundingInfo, setRoundingInfo] = useState({ totalCoins: 0, roundedPrice: 0 });
    const [useSuperCoins, setUseSuperCoins] = useState(false);
    const [coinsToRedeem, setCoinsToRedeem] = useState(0);

    const subtotal = (product?.price || 0) * quantity;
    const total = subtotal + deliveryCharge - discountAmount;

    const payableAmount = Math.max(0, (roundingInfo.roundedPrice || total) - (useSuperCoins ? coinsToRedeem : 0));

    const userCoins = profile?.supercoins || 0;
    const canRedeem = userCoins > 0;

    useEffect(() => {
        if (!product) navigate('/shop');
    }, [product, navigate]);

    useEffect(() => {
        const fetchCheckoutMeta = async () => {
            if (selectedAddress) {
                try {
                    const res = await api.post('/utils/calculate-checkout-coins', { orderAmount: total });
                    setRoundingInfo({ totalCoins: res.data.totalCoins, roundedPrice: res.data.roundedPrice });
                } catch {
                    setRoundingInfo({ totalCoins: 0, roundedPrice: total });
                }
            }
        };
        fetchCheckoutMeta();
    }, [selectedAddress, total]);

    const loadRazorpayScript = () => {
        if (window.Razorpay) return Promise.resolve(true);

        return new Promise((resolve) => {
            const existing = document.querySelector('script[data-razorpay="true"]');
            if (existing) {
                existing.addEventListener('load', () => resolve(true));
                existing.addEventListener('error', () => resolve(false));
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

    const createPlatformOrder = async ({ paymentMethod, paymentReference }) => {
        const addr = profile.addresses.find(a => a.id === selectedAddress);
        const orderData = {
            userId: user.id,
            productId: product.id,
            productName: product.name,
            productImage: product.img || product.image,
            quantity,
            totalAmount: payableAmount,
            paymentMethod,
            paymentReference,
            address: `${addr.address}, ${addr.district}, ${addr.state} - ${addr.pincode}`,
            status: 'Processing',
            discount: discountAmount + (useSuperCoins ? coinsToRedeem : 0),
            useSuperCoins,
            superCoinsToRedeem: useSuperCoins ? coinsToRedeem : 0
        };

        await api.post('/orders', orderData);
        setStep(4);
    };

    const openRazorpayForOnlinePayment = async () => {
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded || !window.Razorpay) {
            throw new Error('Unable to load Razorpay SDK');
        }

        const orderRes = await api.post('/payments/razorpay/create-order', {
            amount: payableAmount,
            currency: 'INR',
            receipt: `hhub_${Date.now()}`,
            notes: {
                userId: user.id,
                productId: product.id,
                selectedPayment,
                quantity: String(quantity)
            }
        });

        const { keyId, orderId, amount, currency } = orderRes.data;

        await new Promise((resolve, reject) => {
            const razorpay = new window.Razorpay({
                key: keyId,
                amount,
                currency,
                name: 'H-HUB',
                description: `${product.name} x ${quantity}`,
                order_id: orderId,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                theme: {
                    color: '#0f766e'
                },
                handler: async (response) => {
                    try {
                        const verify = await api.post('/payments/razorpay/verify', response);
                        if (!verify.data?.verified) {
                            return reject(new Error('Payment verification failed'));
                        }

                        const paymentMethod = selectedPayment === 'upi' ? 'UPI' : 'CARD';
                        await createPlatformOrder({
                            paymentMethod,
                            paymentReference: response.razorpay_payment_id
                        });
                        resolve(true);
                    } catch (verifyError) {
                        reject(verifyError);
                    }
                },
                modal: {
                    ondismiss: () => reject(new Error('Payment was cancelled'))
                }
            });

            razorpay.on('payment.failed', () => reject(new Error('Payment failed. Please try again.')));
            razorpay.open();
        });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress || !selectedPayment) return;
        setIsProcessing(true);
        try {
            if (selectedPayment === 'cod') {
                await createPlatformOrder({ paymentMethod: 'COD', paymentReference: null });
            } else {
                await openRazorpayForOnlinePayment();
            }

            setIsProcessing(false);
        } catch (e) {
            setToast({ show: true, type: 'error', message: e?.response?.data?.error || e?.message || 'Failed to place order' });
            setIsProcessing(false);
        }
    };

    if (!product) return null;

    return (
        <div style={pageWrapper} className="animate-float-up">
            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

            <header style={checkHeader} className="checkout-header-shell">
                <div style={headerMain}>
                    <button style={backLink} className="link-animated" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
                    <h1 style={hTitle}>Secure Checkout</h1>
                </div>
                <div style={trustBadges}>
                    <div style={trustItem}><ShieldCheck size={16} /> SSL Encrypted</div>
                    <div style={trustItem}><Truck size={16} /> Certified Logistics</div>
                </div>
            </header>

            <div className="flex-responsive checkout-main-cols" style={mainCols}>
                <div style={stepsArea} className="checkout-steps-area">
                    <div style={stepper} className="checkout-stepper">
                        <StepItem num={1} label="Shipping" active={step >= 1} current={step === 1} />
                        <div style={sLine} className="checkout-step-line" />
                        <StepItem num={2} label="Payment" active={step >= 2} current={step === 2} />
                        <div style={sLine} className="checkout-step-line" />
                        <StepItem num={3} label="Review" active={step >= 3} current={step === 3} />
                    </div>

                    <div style={contentBox} className="section-shell checkout-content-box">
                        {step === 1 && (
                            <div style={addrSection}>
                                <div style={subHead}>
                                    <h2 style={subTitle}>Delivery Address</h2>
                                    <button style={textBtn} onClick={() => navigate('/user/addresses')}>Manage Addresses</button>
                                </div>
                                <div style={addrList} className="checkout-address-list">
                                    {profile.addresses?.map(a => (
                                        <div
                                            key={a.id}
                                            style={{ ...addrCard, borderColor: selectedAddress === a.id ? 'var(--primary)' : 'var(--border)' }}
                                            onClick={() => setSelectedAddress(a.id)}
                                            className="card-interactive"
                                        >
                                            <div style={radioBtn}>{selectedAddress === a.id && <div style={radioIn} />}</div>
                                            <div style={addrMeta}>
                                                <div style={addrLabel}>{a.name}</div>
                                                <p style={addrDetail}>{a.address}, {a.district}, {a.state} - {a.pincode}</p>
                                                <div style={addrPhone}>+91 {a.phone}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <button style={addAddrBtn} onClick={() => navigate('/user/addresses')}><Plus size={18} /> New Address</button>
                                </div>
                                <button
                                    style={{ ...primeBtn, marginTop: '2rem' }}
                                    className="btn-glow"
                                    disabled={!selectedAddress}
                                    onClick={() => setStep(2)}
                                >
                                    Proceed to Payment <ChevronRight size={18} />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={paySection}>
                                <h2 style={subTitle}>Select Payment Method</h2>
                                <div style={payList}>
                                    <PaymentRow
                                        id="upi"
                                        icon={<Smartphone size={24} />}
                                        title="UPI"
                                        sub="Pay via Apps (PhonePe, GPay, Paytm)"
                                        selected={selectedPayment === 'upi'}
                                        onClick={() => setSelectedPayment('upi')}
                                    />
                                    <PaymentRow
                                        id="card"
                                        icon={<CreditCard size={24} />}
                                        title="Cards"
                                        sub="Credit / Debit / ATM Cards"
                                        selected={selectedPayment === 'card'}
                                        onClick={() => setSelectedPayment('card')}
                                    />
                                    <PaymentRow
                                        id="cod"
                                        icon={<Building2 size={24} />}
                                        title="COD"
                                        sub="Cash on Delivery"
                                        selected={selectedPayment === 'cod'}
                                        onClick={() => setSelectedPayment('cod')}
                                    />
                                </div>
                                <div style={actionRow} className="checkout-action-row">
                                    <button style={secBtn} onClick={() => setStep(1)}>Back</button>
                                    <button style={primeBtn} disabled={!selectedPayment} onClick={() => setStep(3)}>Continue to Review</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div style={reviewSection}>
                                <h2 style={subTitle}>Final Confirmation</h2>
                                <div style={sumGrid}>
                                    <div style={sumItem}>
                                        <div style={sumLabel}>Delivery To</div>
                                        <div style={sumVal}>{profile.addresses?.find(a => a.id === selectedAddress)?.name}</div>
                                    </div>
                                    <div style={sumItem}>
                                        <div style={sumLabel}>Payment VIA</div>
                                        <div style={sumVal}>{selectedPayment === 'cod' ? 'COD' : selectedPayment === 'upi' ? 'Razorpay UPI' : 'Razorpay Card'}</div>
                                    </div>
                                </div>
                                <div style={actionRow} className="checkout-action-row">
                                    <button style={secBtn} onClick={() => setStep(2)}>Modify</button>
                                    <button style={primeBtn} onClick={handlePlaceOrder} disabled={isProcessing}>
                                        {isProcessing ? 'Processing...' : selectedPayment === 'cod' ? 'Place COD Order' : `Pay ₹${payableAmount.toLocaleString()}`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div style={successState} className="checkout-success-wrap">
                                <motion.div
                                    className="checkout-success-fireworks"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {[...Array(12)].map((_, idx) => (
                                        <span key={idx} className={`checkout-spark checkout-spark-${idx + 1}`} />
                                    ))}
                                </motion.div>

                                <motion.div
                                    style={checkCircle}
                                    className="checkout-success-check"
                                    initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                                >
                                    <Check size={48} color="white" />
                                </motion.div>

                                <h2 style={successTitle}>Order Placed Successfully</h2>
                                <p style={successDesc}>Your order is confirmed and has started processing. You can track each update live from your orders page.</p>

                                <div className="checkout-success-actions">
                                    <button style={primeBtn} className="btn-glow" onClick={() => navigate('/user/orders')}>Track Order</button>
                                    <button style={secBtn} onClick={() => navigate('/shop')}>Continue Shopping</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <aside style={summaryCol} className="checkout-summary-col">
                    <div style={summaryPanel} className="checkout-summary-panel">
                        <h3 style={sumTitle}>Listing Details</h3>
                        <div style={itemRow}>
                            <img src={product.img || product.image} alt="" style={itemImg} />
                            <div style={itemMeta}>
                                <div style={itemName}>{product.name}</div>
                                <div style={itemQty}>Quantity: {quantity}</div>
                            </div>
                        </div>
                        <div style={priceBreakdown}>
                            <div style={pRow}><span>Subtotal</span> <span>₹{subtotal.toLocaleString()}</span></div>
                            <div style={pRow}><span>Shipping</span> <span>₹{deliveryCharge}</span></div>
                            {discountAmount > 0 && <div style={pRow}><span style={{ color: 'var(--success)' }}>Coupon Discount</span> <span style={{ color: 'var(--success)' }}>-₹{discountAmount}</span></div>}
                            {useSuperCoins && coinsToRedeem > 0 && (
                                <div style={pRow}>
                                    <span style={{ color: '#b45309' }}>SuperCoins Discount</span>
                                    <span style={{ color: '#b45309' }}>-₹{coinsToRedeem}</span>
                                </div>
                            )}
                            <div style={totalDiv} />
                            <div style={totalRow}>
                                <span>Grand Total</span>
                                <span>₹{payableAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {canRedeem && (
                            <div style={redemptionBox}>
                                <div style={redemptionHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Star size={18} color="#b45309" fill="#fbbf24" />
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Use SuperCoins</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={useSuperCoins}
                                        onChange={(e) => {
                                            const active = e.target.checked;
                                            setUseSuperCoins(active);
                                            if (active) {
                                                const maxRedeemable = Math.floor(Math.min(userCoins, (roundingInfo.roundedPrice || total)));
                                                setCoinsToRedeem(maxRedeemable);
                                            } else {
                                                setCoinsToRedeem(0);
                                            }
                                        }}
                                        style={toggleInput}
                                    />
                                </div>
                                <div style={redemptionMeta}>
                                    Available: {userCoins} Coins
                                </div>
                            </div>
                        )}
                        {roundingInfo.totalCoins > 0 && (
                            <div style={coinBadge}>
                                <Star size={14} fill="currentColor" /> Earn {roundingInfo.totalCoins} SuperCoins
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const StepItem = ({ num, label, active, current }) => (
    <div style={{ ...stepItem, opacity: active ? 1 : 0.4 }}>
        <div style={{ ...stepNum, background: current ? 'var(--primary)' : active ? 'var(--text-main)' : 'var(--border)' }}>{num}</div>
        <div style={stepLabel}>{label}</div>
    </div>
);

const PaymentRow = ({ icon, title, sub, selected, onClick }) => (
    <div style={{ ...payRow, borderColor: selected ? 'var(--primary)' : 'var(--border)' }} onClick={onClick} className="card-interactive">
        <div style={radioBtn}>{selected && <div style={radioIn} />}</div>
        <div style={payIcon}>{icon}</div>
        <div style={payMeta}>
            <div style={payTitle}>{title}</div>
            <div style={paySub}>{sub}</div>
        </div>
    </div>
);

const pageWrapper = { maxWidth: '1240px', margin: '0 auto', padding: '2.4rem 1rem 4rem' };
const checkHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' };
const headerMain = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const backLink = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-muted)' };
const hTitle = { fontSize: '2.5rem', fontWeight: 900, margin: 0 };
const trustBadges = { display: 'flex', gap: '1.5rem' };
const trustItem = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(8,145,178,0.16)', borderRadius: '999px', padding: '0.4rem 0.75rem' };

const mainCols = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '3rem', alignItems: 'start' };
const stepsArea = { display: 'flex', flexDirection: 'column' };
const addrSection = { display: 'flex', flexDirection: 'column' };
const paySection = { display: 'flex', flexDirection: 'column' };
const reviewSection = { display: 'flex', flexDirection: 'column' };
const stepper = { display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' };
const stepItem = { display: 'flex', alignItems: 'center', gap: '0.75rem' };
const stepNum = { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 900 };
const stepLabel = { fontWeight: 700, fontSize: '0.9rem' };
const sLine = { width: '40px', height: '2px', background: 'var(--border)' };

const contentBox = { background: 'linear-gradient(180deg, #ffffff, #f6fcff)', border: '1px solid rgba(8,145,178,0.14)', borderRadius: '24px', padding: '1.5rem' };
const subHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' };
const subTitle = { fontSize: '1.5rem', fontWeight: 800 };
const textBtn = { color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' };

const addrList = { display: 'flex', flexDirection: 'column', gap: '1.25rem' };
const addrCard = { border: '2px solid', borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '1rem', cursor: 'pointer', transition: '0.2s', background: 'rgba(255,255,255,0.8)' };
const radioBtn = { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' };
const radioIn = { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' };
const addrMeta = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const addrLabel = { fontWeight: 800, fontSize: '1rem' };
const addrDetail = { fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 };
const addrPhone = { fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' };
const addAddrBtn = { background: 'linear-gradient(180deg, #ffffff, #f2fbfd)', border: '1px dashed rgba(8,145,178,0.25)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' };

const payList = { display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' };
const payRow = { border: '2px solid', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', background: 'rgba(255,255,255,0.8)' };
const payIcon = { color: 'var(--text-muted)' };
const payMeta = { flex: 1 };
const payTitle = { fontWeight: 800, fontSize: '1.1rem' };
const paySub = { fontSize: '0.85rem', color: 'var(--text-muted)' };

const actionRow = { display: 'flex', gap: '1rem', marginTop: '2.25rem' };
const primeBtn = { flex: 1, background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', padding: '1.25rem', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 16px 28px -22px rgba(13,148,136,0.95)' };
const secBtn = { padding: '1.25rem 2rem', border: '1px solid rgba(8,145,178,0.2)', background: 'linear-gradient(180deg, #ffffff, #f2fbfd)', borderRadius: '12px', fontWeight: 700 };

const sumGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '2rem' };
const sumItem = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const sumLabel = { fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' };
const sumVal = { fontWeight: 700, fontSize: '1rem' };

const successState = { textAlign: 'center', padding: '2rem 0', position: 'relative', overflow: 'hidden' };
const checkCircle = { width: '88px', height: '88px', background: 'linear-gradient(130deg, #22c55e, #0d9488)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 24px 38px -24px rgba(34,197,94,0.95)' };
const successTitle = { fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' };
const successDesc = { color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '52ch', marginInline: 'auto' };

const summaryCol = { display: 'flex', flexDirection: 'column' };
const summaryPanel = { background: 'linear-gradient(180deg, #ffffff, #f4fbfd)', border: '1px solid rgba(8,145,178,0.16)', borderRadius: '24px', padding: '2rem', position: 'sticky', top: '2rem', boxShadow: '0 24px 44px -34px rgba(15,23,42,0.8)' };
const sumTitle = { fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' };
const itemRow = { display: 'flex', gap: '1.25rem', marginBottom: '2rem' };
const itemImg = { width: '70px', height: '70px', borderRadius: '12px', objectFit: 'contain', background: 'linear-gradient(145deg, #f0f9ff, #ecfeff)', padding: '0.5rem', border: '1px solid rgba(8,145,178,0.14)' };
const itemMeta = { display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const itemName = { fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' };
const itemQty = { fontSize: '0.8rem', color: 'var(--text-muted)' };

const priceBreakdown = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const pRow = { display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 500 };
const totalDiv = { height: '1px', background: 'var(--border)', margin: '0.5rem 0' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 900 };
const redemptionBox = { marginTop: '1.5rem', padding: '1rem', background: 'linear-gradient(180deg, #fffbeb, #fff7ed)', border: '1px solid #fde68a', borderRadius: '16px' };
const redemptionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const redemptionMeta = { fontSize: '0.8rem', color: '#b45309', fontWeight: 600, marginTop: '0.25rem' };
const toggleInput = { width: '18px', height: '18px', cursor: 'pointer' };
const coinBadge = { marginTop: '2rem', background: 'linear-gradient(180deg, #fffbeb, #fff7ed)', border: '1px solid #fde68a', color: '#b45309', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 700 };

const Smartphone = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
);

export default CheckoutPage;
