import React, { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
    ArrowRight,
    ShoppingBag,
    ShieldCheck,
    Zap,
    Heart,
    Package,
    Wallet,
    Gift,
    Star,
    Sparkles,
    TrendingUp,
    Clock,
    User,
    Truck,
    Users,
    MapPin,
    Activity,
    BarChart3,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { products } from '../data/products';
import api from '../utils/api';

const Home = () => {
    const { user, profile, fetchProfile } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [adminWalletBalance, setAdminWalletBalance] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && fetchProfile) {
            fetchProfile();
            if (user.role === 'admin') {
                api.get(`/wallet/admin/balance?userId=${user.id}`)
                    .then(res => setAdminWalletBalance(res.data.balance || 0))
                    .catch(() => console.warn('Admin wallet fetch failed'));
            }
            api.get(`/user/coupons/${user.id}`)
                .then(res => setCoupons(res.data || []))
                .catch(() => setCoupons([]));
        }

        api.get('/products')
            .then(res => {
                setSellerProducts(res.data || []);
                setLoadingProducts(false);
            })
            .catch(() => {
                setSellerProducts([]);
                setLoadingProducts(false);
            });
    }, [user, fetchProfile]);

    if (user) {
        const totalOrders = profile.orders?.length || 0;
        const wishlistCount = profile.wishlist?.length || 0;
        const walletBalance = user.role === 'admin' ? adminWalletBalance : (profile.wallet || 0);
        const activeCoupons = coupons.filter(c => c.isActive !== false).length || 0;
        const recentOrders = profile.orders?.slice(0, 3) || [];
        const allProducts = sellerProducts.length > 0 ? sellerProducts : products;
        const recommendedProducts = allProducts.slice(0, 4);

        return (
            <div style={loggedInWrapper} className="animate-float-up">
                <header style={welcomeHeader}>
                    <div>
                        <h1 style={welcomeTitle} className="welcome-title">Hello, {user.name?.split(' ')[0]}</h1>
                        <p style={welcomeSubtitle}>Exclusive deals and your recent activity at a glance.</p>
                    </div>
                    <div style={headerActions}>
                        <button style={searchIconButton} onClick={() => navigate('/shop')}><Search size={20} /></button>
                        <Link to="/user/profile" style={profileBtn}>Account Settings</Link>
                    </div>
                </header>

                <div style={statsGrid} className="grid-1-2-4">
                    <StatCard
                        to="/user/orders"
                        icon={<Package size={24} color="var(--primary)" />}
                        label="Your Orders"
                        value={totalOrders}
                    />
                    <StatCard
                        to="/user/wishlist"
                        icon={<Heart size={24} color="#ec4899" />}
                        label="Wishlist"
                        value={wishlistCount}
                    />
                    <StatCard
                        to="/user/wallet"
                        icon={<Wallet size={24} color="#10b981" />}
                        label="Available Balance"
                        value={`₹${walletBalance.toLocaleString('en-IN')}`}
                    />
                    <StatCard
                        to="/user/coupons"
                        icon={<Gift size={24} color="#f59e0b" />}
                        label="Offers & Coupons"
                        value={activeCoupons}
                    />
                </div>

                <div style={dashboardGrid} className="flex-responsive">
                    <section style={mainContentCol}>
                        <div style={sectionHeader}>
                            <h2 style={sectionTitle}>Explore New Arrivals</h2>
                            <Link to="/shop" style={textLink}>View Collections <ArrowUpRight size={16} /></Link>
                        </div>
                        {loadingProducts ? (
                            <div style={loadingPlaceholder}>Fetching latest catalog...</div>
                        ) : (
                            <div style={pGrid} className="grid-1-2-4 grid-responsive">
                                {recommendedProducts.map(p => (
                                    <ProductThumbnail key={p.id} product={p} />
                                ))}
                            </div>
                        )}

                        <div style={{ ...sectionHeader, marginTop: '3rem' }}>
                            <h2 style={sectionTitle}>Quick Access</h2>
                        </div>
                        <div style={quickActions} className="grid-responsive">
                            <ActionLink to="/user/addresses" label="Saved Addresses" />
                            <ActionLink to="/user/notifications" label="Notifications" />
                            <ActionLink to="/user/supercoin" label="SuperCoins" />
                            <ActionLink to="/user/orders" label="Track Delivery" />
                            <ActionLink to="/innovations?feature=group-buy" label="Start Group Buy" />
                            <ActionLink to="/innovations?feature=reverse-loyalty" label="Earn Reverse Loyalty" />
                        </div>

                        <div style={{ ...sectionHeader, marginTop: '3rem' }}>
                            <h2 style={sectionTitle}>Innovation Workflows</h2>
                            <Link to="/innovations" style={textLink}>Open Innovation Hub <ArrowUpRight size={16} /></Link>
                        </div>
                        <div style={innovationGrid} className="grid-responsive">
                            <InnovationLinkCard
                                to="/innovations?feature=group-buy"
                                icon={<Users size={18} color="#2563eb" />}
                                title="Hyperlocal Group Buy"
                                desc="Create or join a pincode room and reduce prices as members join."
                            />
                            <InnovationLinkCard
                                to="/innovations?feature=verification-payment"
                                icon={<ShieldCheck size={18} color="#7c3aed" />}
                                title="Pay After Verification"
                                desc="Place protected payment holds and release after delivery proof checks."
                            />
                            <InnovationLinkCard
                                to="/innovations?feature=family-wallet"
                                icon={<Wallet size={18} color="#dc2626" />}
                                title="Family Wallet"
                                desc="Set household budgets, shared balances, and spending controls."
                            />
                        </div>
                    </section>

                    <aside style={sidebarCol}>
                        <div style={sideCard}>
                            <h3 style={sideTitle}>Recent Orders</h3>
                            {recentOrders.length > 0 ? (
                                <div style={orderList} className="grid-responsive">
                                    {recentOrders.map(o => (
                                        <div key={o.id} style={miniOrder}>
                                            <div style={orderInfo}>
                                                <span style={orderName}>{o.name || `Order #${o.id}`}</span>
                                                <span style={orderDate}>{o.date || 'Today'}</span>
                                            </div>
                                            <div style={{ ...statusTag, color: o.status === 'Delivered' ? 'var(--success)' : 'var(--warning)' }}>
                                                {o.status}
                                            </div>
                                        </div>
                                    ))}
                                    <Link to="/user/orders" style={allOrdersBtn}>All Orders</Link>
                                </div>
                            ) : (
                                <p style={emptyText}>No recent orders found.</p>
                            )}
                        </div>

                        <div style={{ ...sideCard, background: 'var(--primary)', color: 'white', marginTop: '1.5rem' }}>
                            <h3 style={{ ...sideTitle, color: 'white' }}>Partner with H-HUB</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1rem' }}>Open your store and reach millions of customers instantly.</p>
                            <Link to="/seller/apply" style={sideActionBtn}>Get Started</Link>
                        </div>

                        <div style={{ ...sideCard, marginTop: '1.5rem' }}>
                            <h3 style={sideTitle}><Sparkles size={16} style={{ marginRight: '0.35rem', verticalAlign: 'text-bottom' }} /> Innovation Studio</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Run real workflows for return risk, resell, loyalty, and more.</p>
                            <Link to="/innovations" style={allOrdersBtn}>Launch Workflows</Link>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <div style={guestWrapper}>
            <section style={heroSection} className="flex-responsive animate-float-up">
                <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={heroContent}
                >
                    <div style={heroLabel}>PREMIUM COMMERCE ECOSYSTEM</div>
                    <h1 style={heroTitle} className="hero-title">Elegance in Every <span style={blueText} className="gradient-text">Transaction.</span></h1>
                    <p style={heroSub}>Discover a curated selection of world-class products and a seamless shopping experience.</p>
                    <div style={heroBtns}>
                        <Link to="/shop" style={primeBtn}>Explore <ArrowRight size={18} /></Link>
                        <Link to="/register" style={ghostBtn}>Join Hub</Link>
                    </div>
                </Motion.div>
                <div style={heroImageArea} className="mobile-hide">
                    <img src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=1000" alt="Hero" style={hImage} />
                </div>
            </section>

            <section style={valueSection} className="grid-1-2-4">
                <ValueBlock
                    icon={<ShieldCheck size={32} color="var(--primary)" />}
                    title="Verified Quality"
                    desc="Every product undergoes a rigorous 24-point check before listing."
                />
                <ValueBlock
                    icon={<Zap size={32} color="var(--primary)" />}
                    title="Instant Delivery"
                    desc="Digital assets and vouchers delivered to your inbox in seconds."
                />
                <ValueBlock
                    icon={<Truck size={32} color="var(--primary)" />}
                    title="Global Logistics"
                    desc="Powered by H-LOGIX for secure, nationwide express shipping."
                />
            </section>

            <section style={ctaSection} className="mobile-hide">
                <div style={ctaCard} className="section-shell">
                    <h2 style={ctaTitle}>The H-LOGIX Network</h2>
                    <p style={ctaSub}>Track your shipments in real-time with our advanced GPS-enabled logistics engine.</p>
                    <Link to="/shop" style={ctaWhiteBtn}>Track Your Order</Link>
                </div>
            </section>

            <footer style={guestFooter}>
                <h2 style={footerTitle}>Shop by Category</h2>
                <div style={cGrid}>
                    {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'].map(c => (
                        <Link key={c} to={`/shop?category=${c}`} style={cCard}>{c}</Link>
                    ))}
                </div>
            </footer>
        </div>
    );
};

// Sub-components
const StatCard = ({ to, icon, label, value }) => (
    <Link to={to} style={sCard} className="card-interactive">
        <div style={sIcon}>{icon}</div>
        <div style={sContent}>
            <span style={sValue}>{value}</span>
            <span style={sLabel}>{label}</span>
        </div>
    </Link>
);

const ValueBlock = ({ icon, title, desc }) => (
    <div style={vBlock} className="card-interactive section-shell">
        {icon}
        <h3 style={vTitle}>{title}</h3>
        <p style={vDesc}>{desc}</p>
    </div>
);

const ProductThumbnail = ({ product }) => (
    <Link to={`/product/${product.id}`} style={pCard} className="card-interactive">
        <div style={pImgArea}>
            <img src={product.img || product.image || product.productImage} alt={product.name} style={pImg} />
        </div>
        <div style={pMeta}>
            <h4 style={pName}>{product.name || product.productName}</h4>
            <div style={pPrice}>₹{(product.price || 0).toLocaleString('en-IN')}</div>
        </div>
    </Link>
);

const ActionLink = ({ to, label }) => (
    <Link to={to} style={aBtn} className="card-interactive">{label}</Link>
);

const InnovationLinkCard = ({ to, icon, title, desc }) => (
    <Link to={to} style={innovationCard} className="card-interactive">
        <div style={innovationIcon}>{icon}</div>
        <div>
            <div style={innovationTitle}>{title}</div>
            <div style={innovationDesc}>{desc}</div>
        </div>
    </Link>
);

// Styles
const loggedInWrapper = { maxWidth: '1440px', margin: '0 auto', padding: '3rem 2rem 4rem' };
const welcomeHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' };
const welcomeTitle = { fontSize: '2.5rem', fontWeight: 900, margin: 0 };
const welcomeSubtitle = { color: 'var(--text-muted)', marginTop: '0.5rem' };
const headerActions = { display: 'flex', gap: '1rem' };
const profileBtn = { background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 800, boxShadow: '0 14px 28px -22px rgba(13, 148, 136, 0.9)' };
const searchIconButton = { background: '#ffffff', padding: '0.75rem', borderRadius: '12px', display: 'flex', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' };

const statsGrid = { display: 'grid', gap: '1.5rem', marginBottom: '3rem' };
const sCard = { background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,253,255,0.96))', padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(8, 145, 178, 0.16)', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)' };
const sIcon = { background: 'linear-gradient(145deg, rgba(236,254,255,1), rgba(224,242,254,0.9))', padding: '1rem', borderRadius: '14px' };
const sContent = { display: 'flex', flexDirection: 'column' };
const sValue = { fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' };
const sLabel = { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 };

const dashboardGrid = { display: 'flex', gap: '3rem' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' };
const sectionTitle = { fontSize: '1.5rem', fontWeight: 800 };
const textLink = { color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' };
const loadingPlaceholder = { padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', background: 'linear-gradient(180deg, #ffffff, #f1f8fb)', borderRadius: '18px', border: '1px solid var(--border)' };

const pGrid = { display: 'grid', gap: '1.5rem' };
const mainContentCol = { minWidth: 0 };
const pCard = { display: 'flex', gap: '1.5rem', padding: '1.25rem', background: 'linear-gradient(180deg, #ffffff, #f6fcff)', borderRadius: '18px', border: '1px solid rgba(8, 145, 178, 0.14)', boxShadow: 'var(--shadow-sm)' };
const pImgArea = { width: '100px', height: '100px', flexShrink: 0, background: 'linear-gradient(145deg, #f0f9ff, #ecfeff)', borderRadius: '14px', overflow: 'hidden', padding: '0.5rem' };
const pImg = { width: '100%', height: '100%', objectFit: 'contain' };
const pMeta = { display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const pName = { fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-main)' };
const pPrice = { fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' };

const quickActions = { display: 'flex', flexWrap: 'wrap', gap: '1rem' };
const aBtn = { background: 'linear-gradient(180deg, #ffffff, #f3fbfd)', border: '1px solid rgba(8, 145, 178, 0.18)', padding: '0.8rem 1.3rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, color: '#0f4f59' };
const innovationGrid = { display: 'grid', gap: '1rem' };
const innovationCard = { background: '#ffffff', border: '1px solid rgba(8, 145, 178, 0.18)', borderRadius: '16px', padding: '1rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' };
const innovationIcon = { width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(236, 254, 255, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const innovationTitle = { fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' };
const innovationDesc = { fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 };

const sidebarCol = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const sideCard = { padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(8, 145, 178, 0.16)', background: 'linear-gradient(180deg, #ffffff, #f7fdff)', boxShadow: 'var(--shadow-sm)' };
const sideTitle = { fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' };
const orderList = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const miniOrder = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const orderInfo = { display: 'flex', flexDirection: 'column' };
const orderName = { fontSize: '0.9rem', fontWeight: 700 };
const orderDate = { fontSize: '0.75rem', color: 'var(--text-muted)' };
const statusTag = { fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' };
const allOrdersBtn = { marginTop: '1rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem' };
const sideActionBtn = { display: 'block', background: 'white', color: 'var(--primary)', padding: '0.8rem', borderRadius: '12px', textAlign: 'center', fontWeight: 800, textDecoration: 'none', boxShadow: '0 12px 28px -20px rgba(15, 23, 42, 0.8)' };
const emptyText = { fontSize: '0.85rem', color: 'var(--text-muted)' };

// Guest Styles
const guestWrapper = { maxWidth: '1440px', margin: '0 auto', padding: '0 2rem' };
const heroSection = { display: 'flex', alignItems: 'center', gap: '4rem', padding: '7rem 0 6rem', minHeight: '80vh' };
const heroContent = { flex: 1 };
const heroLabel = { color: 'var(--primary)', fontWeight: 900, letterSpacing: '2px', fontSize: '0.78rem', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.8rem', borderRadius: '999px', border: '1px solid rgba(8,145,178,0.22)', background: 'rgba(236,254,255,0.85)' };
const heroTitle = { fontSize: '5rem', fontWeight: 900, lineHeight: 1, margin: '0 0 2rem' };
const blueText = { color: 'var(--primary)' };
const heroSub = { fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '500px', marginBottom: '3rem' };
const heroBtns = { display: 'flex', gap: '1.5rem' };
const primeBtn = { background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', padding: '1.05rem 2.3rem', borderRadius: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 18px 34px -22px rgba(13, 148, 136, 0.95)' };
const ghostBtn = { border: '1px solid rgba(8,145,178,0.25)', background: 'rgba(255,255,255,0.84)', padding: '1.05rem 2.3rem', borderRadius: '13px', fontWeight: 800 };
const heroImageArea = { flex: 1, height: '600px', borderRadius: '34px', overflow: 'hidden', boxShadow: '0 30px 60px -36px rgba(15, 23, 42, 0.72)' };
const hImage = { width: '100%', height: '100%', objectFit: 'cover' };

const valueSection = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem', padding: '6rem 0' };
const vBlock = { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.4rem', borderRadius: '18px' };
const vTitle = { fontSize: '1.5rem', fontWeight: 800 };
const vDesc = { color: 'var(--text-muted)', lineHeight: 1.6 };

const ctaSection = { padding: '4rem 0' };
const ctaCard = { background: 'linear-gradient(135deg, #06222b, #0f4f59 55%, #0b7285)', color: 'white', padding: '4.5rem', borderRadius: '32px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.14)' };
const ctaTitle = { fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' };
const ctaSub = { fontSize: '1.2rem', opacity: 0.8, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' };
const ctaWhiteBtn = { background: 'white', color: '#0f4f59', padding: '1.05rem 2.6rem', borderRadius: '13px', fontWeight: 800 };

const guestFooter = { padding: '6rem 0' };
const footerTitle = { textAlign: 'center', fontSize: '2rem', fontWeight: 900, marginBottom: '3rem' };
const cGrid = { display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' };
const cCard = { background: 'linear-gradient(180deg, #ffffff, #f4fbff)', border: '1px solid rgba(8, 145, 178, 0.15)', padding: '1.5rem 2.5rem', borderRadius: '16px', fontWeight: 800, fontSize: '1.05rem', color: '#0d4c57', boxShadow: 'var(--shadow-sm)' };

export default Home;
