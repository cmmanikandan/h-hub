import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Trash2,
    ChevronRight,
    MapPin,
    CreditCard,
    CheckCircle2,
    ArrowLeft,
    Plus,
    Minus
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CartPage = () => {
    const { user, profile, removeFromCart, updateCartQty, clearCart, addOrder } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Cart, 2: Shipping, 3: Payment, 4: Success
    const cart = profile.cart || [];
    const [shippingInfo, setShippingInfo] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        zip: ''
    });

    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax - discount;

    const applyCoupon = () => {
        if (coupon.toUpperCase() === 'FIRSTHUB') {
            setDiscount(500);
            alert("Coupon applied! ₹500 discount added.");
        } else {
            alert("Invalid coupon code.");
        }
    };

    const updateQty = (id, delta) => {
        const item = cart.find(i => i.id === id);
        if (item) {
            updateCartQty(id, item.qty + delta);
        }
    };

    const removeItem = (id) => removeFromCart(id);

    return (
        <div style={container} className="animate-float-up">
            {/* Progress Stepper */}
            <div style={stepper}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={stepItem}>
                        <div style={{ ...stepCircle, background: step >= i ? 'var(--primary)' : 'var(--glass-border)', color: step >= i ? 'white' : 'var(--text-muted)' }}>
                            {step > i ? <CheckCircle2 size={18} /> : i}
                        </div>
                        <span style={{ ...stepLabel, color: step >= i ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            {i === 1 ? 'Bag' : i === 2 ? 'Checkout' : 'Payment'}
                        </span>
                        {i < 3 && <div style={stepLine} />}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {!user ? (
                    <motion.div
                        key="guest"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={guestView}
                    >
                        <ShoppingBag size={80} color="var(--primary)" style={{ marginBottom: '2rem', opacity: 0.5 }} />
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Login Required</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '450px' }}>
                            Please sign in or create an account to view your bag and start shopping.
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Link to="/login" style={mainBtn}>Sign In Now</Link>
                            <Link to="/register" style={{ ...mainBtn, background: 'var(--glass)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>Register</Link>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {step === 1 && (
                            <motion.div
                                key="cart"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={layout}
                            >
                                <div style={leftCol}>
                                    <h2 style={sectionTitle}>Shopping Bag ({cart.length})</h2>
                                    {cart.length === 0 ? (
                                        <div style={empty}>Your bag is empty. <Link to="/shop">Shop now</Link></div>
                                    ) : (
                                        <div style={cartItems}>
                                            {cart.map(item => (
                                                <div key={item.id} style={cartItem} className="card-interactive">
                                                    <img src={item.image || item.img || 'https://via.placeholder.com/100x100?text=No+Image'} alt={item.name} style={iImg} />
                                                    <div style={iInfo}>
                                                        <h3 style={iName}>{item.name}</h3>
                                                        <p style={iPrice}>₹{item.price.toLocaleString('en-IN')}</p>
                                                        <div style={iActions}>
                                                            <div style={qtyBox}>
                                                                <button onClick={() => updateQty(item.id, -1)} style={qBtn}><Minus size={14} /></button>
                                                                <span>{item.qty}</span>
                                                                <button onClick={() => updateQty(item.id, 1)} style={qBtn}><Plus size={14} /></button>
                                                            </div>
                                                            <button onClick={() => removeItem(item.id)} style={delBtn}><Trash2 size={18} /></button>
                                                        </div>
                                                    </div>
                                                    <div style={iTotal}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={rightCol}>
                                    <div style={summaryCard}>
                                        <h3 style={cardTitle}>Order Summary</h3>
                                        <div style={sumRow}><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                                        <div style={sumRow}><span>Shipping</span><span>{shipping === 0 ? 'FREE' : '₹' + shipping.toLocaleString('en-IN')}</span></div>
                                        <div style={sumRow}><span>Tax (18% GST)</span><span>₹{tax.toFixed(0).toLocaleString('en-IN')}</span></div>
                                        {discount > 0 && <div style={{ ...sumRow, color: '#10b981' }}><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
                                        <div style={divider} />
                                        <div style={totalRow}><span>Total</span><span>₹{total.toFixed(0).toLocaleString('en-IN')}</span></div>

                                        <div style={couponBox}>
                                            <input
                                                style={couponInput}
                                                placeholder="Coupon Code"
                                                value={coupon}
                                                onChange={(e) => setCoupon(e.target.value)}
                                            />
                                            <button onClick={applyCoupon} style={couponBtn}>Apply</button>
                                        </div>

                                        <button onClick={() => setStep(2)} style={mainBtn} className="btn-glow">Checkout Now <ChevronRight size={20} /></button>
                                        <div style={secureTag}><CreditCard size={14} /> Secure Payment Guaranteed</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="shipping"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                style={checkoutForm}
                                className="section-shell"
                            >
                                <h2 style={sectionTitle}>Shipping Information</h2>
                                <div style={formGrid}>
                                    <div style={inputGroup}><label>Full Name</label><input placeholder="John Doe" value={shippingInfo.name} onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })} style={input} /></div>
                                    <div style={inputGroup}><label>Email Address</label><input placeholder="john@example.com" value={shippingInfo.email} onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })} style={input} /></div>
                                    <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
                                        <label>Street Address</label>
                                        <div style={iconInput}><MapPin size={18} /><input placeholder="123 Luxury Lane" value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} style={rawInput} /></div>
                                    </div>
                                    <div style={inputGroup}><label>City</label><input placeholder="San Jose" value={shippingInfo.city} onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} style={input} /></div>
                                    <div style={inputGroup}><label>Zip Code</label><input placeholder="95001" value={shippingInfo.zip} onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })} style={input} /></div>
                                </div>
                                <div style={formBtns}>
                                    <button onClick={() => setStep(1)} style={backTextBtn}><ArrowLeft size={18} /> Back to Bag</button>
                                    <button onClick={() => setStep(3)} style={mainBtn}>Continue to Payment</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={paymentView}
                                className="section-shell"
                            >
                                <h2 style={sectionTitle}>Payment Method</h2>

                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        Shipping Address
                                        <button onClick={() => setStep(2)} style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>Edit</button>
                                    </h3>
                                    <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{shippingInfo.name}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.4 }}>
                                        {shippingInfo.address}<br />
                                        {shippingInfo.city}, {shippingInfo.zip}
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem' }}>{shippingInfo.email}</p>
                                </div>

                                <div style={payMethods}>
                                    <button style={payMethodActive}>Credit / Debit Card</button>
                                    <button style={payMethod}>UPI / QR</button>
                                    <button style={payMethod}>Net Banking</button>
                                    <button style={payMethod}>Cash on Delivery</button>
                                </div>
                                <div style={cardPreview}>
                                    <div style={cardChip} />
                                    <div style={cardNumber}>•••• •••• •••• 4242</div>
                                    <div style={cardDetails}>
                                        <div><span>Expiry</span><br />12/26</div>
                                        <div><span>CVC</span><br />•••</div>
                                    </div>
                                </div>
                                <p style={secureNote}>Your transaction is encrypted with military-grade security.</p>
                                <button onClick={() => {
                                    // Process payment and place order
                                    cart.forEach(item => {
                                        addOrder({
                                            name: item.name,
                                            image: item.img || item.image,
                                            price: item.price * item.qty,
                                            quantity: item.qty,
                                            sellerId: item.sellerId || (user.role === 'seller' ? user.id : null),
                                            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                                            status: 'Processing',
                                            address: `${shippingInfo.address}, ${shippingInfo.city} - ${shippingInfo.zip}`,
                                            paymentMethod: 'Credit Card'
                                        }, true); // Sync to backend
                                    });
                                    clearCart();
                                    setStep(4);
                                }} style={{ ...mainBtn, width: '100%', padding: '1.25rem' }}>
                                    Confirm & Pay ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </button>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={successView}
                            >
                                <div style={confBox}>
                                    <CheckCircle2 size={80} color="#10b981" />
                                    <h1 style={title}>Order Placed!</h1>
                                    <p style={subtitle}>Thank you for your purchase. Your order #ORD-9921 is being processed.</p>
                                    <Link to="/user" style={mainBtn} className="btn-glow">View Real-time Tracking</Link>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const container = { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 4rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 6vw, 5rem)' };
const stepper = { display: 'flex', justifyContent: 'center', gap: 'clamp(1rem, 4vw, 4rem)', marginBottom: 'clamp(2rem, 6vw, 5rem)', position: 'relative', flexWrap: 'wrap' };
const stepItem = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', position: 'relative', minWidth: '80px' };
const stepCircle = { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', zIndex: 2 };
const stepLabel = { fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' };
const stepLine = { position: 'absolute', top: '20px', left: '70px', width: '140px', height: '2px', background: 'var(--glass-border)', zIndex: 1 };
const layout = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2rem' };
const sectionTitle = { fontSize: '1.75rem', fontWeight: 900, marginBottom: '2rem' };
const leftCol = { display: 'flex', flexDirection: 'column' };
const empty = { padding: '4rem', textAlign: 'center', background: 'linear-gradient(180deg, #ffffff, #f3fbfd)', borderRadius: '24px', border: '1px solid rgba(8,145,178,0.14)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' };
const cartItems = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const cartItem = { display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', background: 'linear-gradient(180deg, #ffffff, #f6fcff)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(8,145,178,0.14)' };
const iImg = { width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover' };
const iInfo = { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const iName = { fontWeight: 800, margin: 0 };
const iPrice = { color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' };
const iActions = { display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' };
const qtyBox = { display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(180deg, #ffffff, #f2fbfd)', padding: '0.4rem', borderRadius: '10px', border: '1px solid rgba(8,145,178,0.14)' };
const qBtn = { background: 'white', border: '1px solid rgba(8,145,178,0.14)', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const delBtn = { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' };
const iTotal = { fontSize: '1.25rem', fontWeight: 900 };
const rightCol = { position: 'sticky', top: '100px', height: 'fit-content' };
const summaryCard = { background: 'linear-gradient(140deg, #052128, #0f4f59 58%, #0b7285)', color: '#f8fafc', padding: '2.5rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 34px 52px -38px rgba(15,23,42,0.9)' };
const cardTitle = { fontSize: '1.5rem', fontWeight: 800, margin: 0 };
const sumRow = { display: 'flex', justifyContent: 'space-between', fontWeight: 600, opacity: 0.8 };
const divider = { height: '1px', background: 'rgba(255,255,255,0.1)' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 900 };
const mainBtn = { background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', border: 'none', padding: '1.1rem 2rem', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' };
const secureTag = { fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', opacity: 0.6 };
const checkoutForm = { maxWidth: '700px', margin: '0 auto', background: 'linear-gradient(180deg, #ffffff, #f5fcff)', padding: 'clamp(1.25rem, 4vw, 3rem)', borderRadius: '32px', border: '1px solid rgba(8,145,178,0.14)' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const input = { padding: '0.9rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(8,145,178,0.16)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' };
const iconInput = { display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-main)', border: '1px solid rgba(8,145,178,0.16)', padding: '0 1.25rem', borderRadius: '12px' };
const rawInput = { border: 'none', background: 'none', padding: '0.9rem 0', outline: 'none', color: 'var(--text-main)', width: '100%' };
const formBtns = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem' };
const backTextBtn = { background: 'none', border: 'none', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' };
const paymentView = { maxWidth: '450px', margin: '0 auto', background: 'linear-gradient(180deg, #ffffff, #f5fcff)', padding: 'clamp(1.25rem, 4vw, 3rem)', borderRadius: '32px', border: '1px solid rgba(8,145,178,0.14)', textAlign: 'center' };
const cardPreview = { background: 'linear-gradient(45deg, #1e293b, #0f172a)', color: 'white', padding: '2.5rem', borderRadius: '24px', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', overflow: 'hidden' };
const cardChip = { width: '40px', height: '30px', background: 'linear-gradient(45deg, #fbbf24, #d97706)', borderRadius: '6px' };
const cardNumber = { fontSize: '1.5rem', letterSpacing: '2px', fontWeight: 600 };
const cardDetails = { display: 'flex', gap: '3rem', fontSize: '0.8rem', opacity: 0.8 };
const secureNote = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' };
const successView = { padding: '6rem 0', textAlign: 'center' };
const confBox = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' };
const guestView = { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10rem 2rem' };
const couponBox = { display: 'flex', gap: '0.5rem', marginTop: '1rem' };
const couponInput = { flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)', padding: '0.8rem', borderRadius: '12px', color: 'white', outline: 'none' };
const couponBtn = { background: 'white', color: '#0f172a', border: 'none', padding: '0 1rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' };
const payMethods = { display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' };
const payMethod = { background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' };
const payMethodActive = { ...payMethod, background: 'var(--primary)', color: 'white', border: '1px solid var(--primary)' };
const title = { fontSize: 'clamp(2rem, 7vw, 3rem)', fontWeight: 900 };
const subtitle = { fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: 1.6 };

export default CartPage;
