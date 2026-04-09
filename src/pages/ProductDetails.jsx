import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Star,
    ShoppingBag,
    Heart,
    Truck,
    ShieldCheck,
    RotateCcw,
    ChevronLeft,
    Minus,
    Plus,
    Check,
    Send,
    User,
    ArrowLeft,
    Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile, toggleWishlist, addToCart } = useAuth();
    const [qty, setQty] = useState(1);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const showToast = (type, message) => setToast({ show: true, type, message });

    if (loading) return <div style={fullLoader}>Refining details...</div>;
    if (!product) return <div style={fullLoader}>Product unavailable.</div>;

    const isWishlisted = (profile?.wishlist || []).map(String).includes(String(id));

    return (
        <div style={pdWrapper} className="animate-float-up">
            <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />

            <Link to="/shop" style={backLink} className="link-animated"><ArrowLeft size={18} /> Back to Catalog</Link>

            <div style={pdGrid}>
                <div style={gallerySection}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={mainImgBox} className="section-shell">
                        <img src={product.image || product.img} alt={product.name} style={mainImg} />
                    </motion.div>
                    <div style={vBadge}><ShieldCheck size={14} /> Certified Authentic</div>
                </div>

                <div style={infoSection}>
                    <div style={categoryTag}>{product.category || product.cat}</div>
                    <h1 style={pdTitle}>{product.name}</h1>

                    <div style={ratingStrip}>
                        <div style={pdStars}>
                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                            <Star size={16} fill="#e5e7eb" color="#e5e7eb" />
                        </div>
                        <span style={revCount}>4.2 (120+ Reviews)</span>
                    </div>

                    <div style={pdPrice}>₹{product.price.toLocaleString('en-IN')}</div>
                    <p style={pdDesc}>{product.desc || 'Experience the pinnacle of engineering and design with this premium offering. Built for those who demand excellence in every detail.'}</p>

                    <div style={divider} />

                    <div style={actionBlock}>
                        <div style={qtyInput}>
                            <button style={qBtn} onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
                            <span style={qVal}>{qty}</span>
                            <button style={qBtn} onClick={() => setQty(qty + 1)}><Plus size={16} /></button>
                        </div>
                        <button
                            style={primaryAddBtn}
                            className="btn-glow"
                            onClick={() => {
                                if (!user) return navigate('/login');
                                const res = addToCart({ ...product, img: product.image || product.img }, qty);
                                if (res.success) showToast('cart', 'Added to Bag');
                            }}
                        >
                            <ShoppingBag size={20} /> Add to Cart
                        </button>
                    </div>

                    <div style={buyGrid}>
                        <button
                            style={primeBuyBtn}
                            className="btn-glow"
                            onClick={() => {
                                if (!user) return navigate('/login');
                                navigate('/checkout', { state: { product: { ...product, img: product.image || product.img }, quantity: qty } });
                            }}
                        >
                            Express Checkout
                        </button>
                        <button
                            style={{ ...wishToggle, color: isWishlisted ? 'var(--danger)' : 'var(--text-main)' }}
                            onClick={() => {
                                if (!user) return navigate('/login');
                                toggleWishlist(id);
                            }}
                        >
                            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                    </div>

                    <div style={featureGrid}>
                        <FeatureItem icon={<Truck size={18} />} label="H-LOGIX Delivery" sub="Arriving in 2-3 Days" />
                        <FeatureItem icon={<RotateCcw size={18} />} label="7-Day Return" sub="No questions asked" />
                        <FeatureItem icon={<ShieldCheck size={18} />} label="Warranty" sub="1 Year Coverage" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, label, sub }) => (
    <div style={fItem} className="card-interactive section-shell">
        <div style={fIcon}>{icon}</div>
        <div style={fText}>
            <div style={fLabel}>{label}</div>
            <div style={fSub}>{sub}</div>
        </div>
    </div>
);

// Styles
const pdWrapper = { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 4rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 6vw, 5rem)' };
const backLink = { display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3rem' };
const fullLoader = { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)' };

const pdGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(1.5rem, 5vw, 5rem)', alignItems: 'start' };
const gallerySection = { position: 'sticky', top: '2rem' };
const mainImgBox = { background: 'linear-gradient(145deg, #f0f9ff, #ecfeff)', padding: 'clamp(1.25rem, 5vw, 4rem)', borderRadius: '32px', border: '1px solid rgba(8,145,178,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const mainImg = { maxWidth: '100%', maxHeight: '450px', objectFit: 'contain' };
const vBadge = { marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', background: 'rgba(220,252,231,0.85)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '999px', padding: '0.4rem 0.75rem' };

const infoSection = { display: 'flex', flexDirection: 'column' };
const categoryTag = { color: 'var(--primary)', fontWeight: 800, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', background: 'rgba(236,254,255,0.9)', border: '1px solid rgba(8,145,178,0.18)', borderRadius: '999px', padding: '0.3rem 0.65rem', width: 'fit-content' };
const pdTitle = { fontSize: 'clamp(2rem, 7vw, 3rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 1.5rem' };
const ratingStrip = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' };
const pdStars = { display: 'flex', gap: '2px' };
const revCount = { fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 };
const pdPrice = { fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: '#0c4a6e' };
const pdDesc = { fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.5rem' };
const divider = { height: '1px', background: 'var(--border)', marginBottom: '2.5rem' };

const actionBlock = { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' };
const qtyInput = { display: 'flex', alignItems: 'center', background: 'linear-gradient(180deg, #ffffff, #f3fbfd)', borderRadius: '12px', padding: '0.5rem', border: '1px solid rgba(8,145,178,0.18)' };
const qBtn = { padding: '0.5rem', display: 'flex', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(8,145,178,0.14)' };
const qVal = { width: '40px', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' };
const primaryAddBtn = { flex: 1, background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderRadius: '12px', fontWeight: 800, boxShadow: '0 16px 30px -24px rgba(13,148,136,0.95)' };

const buyGrid = { display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' };
const primeBuyBtn = { flex: 1, background: 'linear-gradient(130deg, #0c4a6e, #0891b2)', color: 'white', padding: '1.25rem', borderRadius: '12px', fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 16px 30px -24px rgba(8,145,178,0.95)' };
const wishToggle = { width: '60px', borderRadius: '12px', border: '1px solid rgba(8,145,178,0.2)', background: 'linear-gradient(180deg, #ffffff, #f3fbfd)', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const featureGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' };
const fItem = { display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(8,145,178,0.14)' };
const fIcon = { width: '40px', height: '40px', background: 'linear-gradient(145deg, #f0f9ff, #ecfeff)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(8,145,178,0.16)' };
const fText = { display: 'flex', flexDirection: 'column' };
const fLabel = { fontWeight: 700, fontSize: '0.85rem' };
const fSub = { fontSize: '0.75rem', color: 'var(--text-muted)' };

export default ProductDetails;
