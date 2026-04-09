import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ChevronDown,
    Star,
    ArrowRight,
    Zap,
    Grid,
    List,
    Smartphone,
    Laptop,
    Watch,
    Headphones,
    SlidersHorizontal,
    Heart,
    X,
    Eye,
    ShoppingBag,
    Plus,
    Minus,
    Bell,
    Clock,
    Flame,
    Check
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import Toast from '../components/Toast';

const ShopPage = () => {
    const { user, profile, toggleWishlist, addToCart, lang } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const t = translations[lang];

    const [apiProducts, setApiProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(['All']);
    const [selectedCat, setSelectedCat] = useState('All');
    const [priceRange, setPriceRange] = useState(150000);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Featured');
    const [viewMode, setViewMode] = useState('grid');
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [selectedFilters, setSelectedFilters] = useState({ brands: [], colors: [] });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const urlSearch = queryParams.get('search');
        const urlCat = queryParams.get('category');
        if (urlSearch) setSearchQuery(urlSearch);
        if (urlCat) setSelectedCat(urlCat);
    }, [location.search]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);
                setApiProducts(productsRes.data || []);
                setCategories(['All', ...categoriesRes.data.map(cat => cat.name)]);
            } catch (error) {
                setApiProducts([]);
                setCategories(['All']);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const showToast = (type, message) => setToast({ show: true, type, message });

    const filtered = apiProducts.filter(p => {
        const catMatch = selectedCat === 'All' || p.category === selectedCat || p.cat === selectedCat;
        const brandMatch = selectedFilters.brands.length === 0 || selectedFilters.brands.includes(p.brand);
        const priceMatch = p.price <= priceRange;
        const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return catMatch && brandMatch && priceMatch && searchMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'Price: Low to High') return a.price - b.price;
        if (sortBy === 'Price: High to Low') return b.price - a.price;
        if (sortBy === 'Best Rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
    });

    return (
        <div style={shopWrapper} className="animate-float-up">
            <Toast show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} message={toast.message} />

            <header style={shopHeader} className="section-shell">
                <div style={headerText}>
                    <h1 style={shopTitle}>{selectedCat === 'All' ? 'Premium Store' : selectedCat}</h1>
                    <p style={shopSubtitle}>{sorted.length} Products Found</p>
                </div>
                <div style={shopActions}>
                    <div style={searchBar}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Find specific items..."
                            style={sInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={sorter}>
                        <select style={sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option>Featured</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Best Rating</option>
                        </select>
                    </div>
                </div>
            </header>

            <div style={shopContent}>
                <aside style={filterSidebar}>
                    <div style={fGroup} className="section-shell">
                        <h3 style={fLabel}>Categories</h3>
                        <div style={fTags}>
                            {categories.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedCat(c)}
                                    style={{
                                        ...fTag,
                                        background: selectedCat === c ? 'var(--primary)' : 'white',
                                        color: selectedCat === c ? 'white' : 'var(--text-main)',
                                        borderColor: selectedCat === c ? 'var(--primary)' : 'var(--border)'
                                    }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={fGroup} className="section-shell">
                        <h3 style={fLabel}>Price Constraint</h3>
                        <input
                            type="range"
                            min="0"
                            max="200000"
                            step="5000"
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            style={pRange}
                        />
                        <div style={pLabels}>
                            <span>₹0</span>
                            <span style={{ fontWeight: 800 }}>₹{priceRange.toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={fGroup} className="section-shell">
                        <h3 style={fLabel}>Brand Selection</h3>
                        <div style={checkboxCol}>
                            {['Apple', 'Samsung', 'Sony', 'HP', 'Google'].map(b => (
                                <label key={b} style={checkRow}>
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.brands.includes(b)}
                                        onChange={(e) => {
                                            const active = e.target.checked
                                                ? [...selectedFilters.brands, b]
                                                : selectedFilters.brands.filter(x => x !== b);
                                            setSelectedFilters({ ...selectedFilters, brands: active });
                                        }}
                                    />
                                    <span>{b}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={promoBox} className="card-interactive">
                        <Flame size={20} color="var(--primary)" />
                        <h4 style={pTitle}>Limited Offer</h4>
                        <p style={pDesc}>Get an extra 10% off on all premium electronics this weekend.</p>
                        <button style={pBtn}>View Offer</button>
                    </div>
                </aside>

                <main style={productArea}>
                    {loading ? (
                        <div style={loaderArea}>Loading collection...</div>
                    ) : sorted.length > 0 ? (
                        <div style={productGrid}>
                            {sorted.map(p => (
                                <ProductCard key={p.id} p={p} user={user} profile={profile} toggleWishlist={toggleWishlist} addToCart={addToCart} showToast={showToast} navigate={navigate} />
                            ))}
                        </div>
                    ) : (
                        <div style={emptyState} className="section-shell">
                            <Search size={48} color="var(--border)" />
                            <h3>No results found</h3>
                            <p>Try adjusting your filters or search terms.</p>
                            <button style={clearBtn} onClick={() => { setSearchQuery(''); setSelectedCat('All'); setPriceRange(200000); }}>Reset Filters</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const ProductCard = ({ p, user, profile, toggleWishlist, addToCart, showToast, navigate }) => {
    const isWishlisted = (profile?.wishlist || []).map(String).includes(String(p.id));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={pCard}
            className="card-interactive"
        >
            <div style={pImgSection} onClick={() => navigate(`/product/${p.id}`)}>
                <img src={p.image || p.img} alt={p.name} style={pImage} />
                <button
                    style={wishBtn}
                    onClick={async (e) => {
                        e.stopPropagation();
                        if (!user) return navigate('/login');
                        await toggleWishlist(p.id);
                    }}
                >
                    <Heart size={18} fill={isWishlisted ? 'var(--danger)' : 'none'} color={isWishlisted ? 'var(--danger)' : 'var(--text-muted)'} />
                </button>
            </div>
            <div style={pInfo} onClick={() => navigate(`/product/${p.id}`)}>
                <div style={pTopRow}>
                    <span style={pTag}>{p.category || p.cat}</span>
                    <div style={pRating}><Star size={12} fill="currentColor" /> {p.rating || '4.5'}</div>
                </div>
                <h3 style={pName}>{p.name}</h3>
                <div style={pPrice}>₹{p.price.toLocaleString('en-IN')}</div>
            </div>
            <div style={pActions}>
                <button
                    style={addBagBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!user) return navigate('/login');
                        const res = addToCart({ ...p, img: p.image || p.img }, 1);
                        if (res.success) showToast('cart', 'Added for you');
                    }}
                >
                    <ShoppingBag size={16} /> Add to Bag
                </button>
            </div>
        </motion.div>
    );
};

// Styles
const shopWrapper = { maxWidth: '1440px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 6vw, 4rem)' };
const shopHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem', border: '1px solid rgba(8,145,178,0.14)', borderRadius: '24px', padding: '1.6rem 1.8rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,252,255,0.9))' };
const headerText = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const shopTitle = { fontSize: '2.5rem', fontWeight: 900, margin: 0 };
const shopSubtitle = { color: 'var(--text-muted)', fontWeight: 600 };

const shopActions = { display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' };
const searchBar = { display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(180deg, #ffffff, #f2fbfd)', padding: '0.75rem 1.25rem', borderRadius: '13px', width: 'min(300px, 100%)', border: '1px solid rgba(8,145,178,0.16)' };
const sInput = { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' };
const sorter = { position: 'relative' };
const sortSelect = { padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(8,145,178,0.16)', background: 'linear-gradient(180deg, #ffffff, #f2fbfd)', fontWeight: 700, fontSize: '0.9rem', outline: 'none', cursor: 'pointer' };

const shopContent = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' };
const filterSidebar = { display: 'flex', flexDirection: 'column', gap: '2.5rem' };
const fGroup = { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', borderRadius: '18px', border: '1px solid rgba(8,145,178,0.14)', background: 'linear-gradient(180deg, #ffffff, #f6fcff)' };
const fLabel = { fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' };
const fTags = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };
const fTag = { padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 700 };

const pRange = { width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' };
const pLabels = { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' };
const checkboxCol = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const checkRow = { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer' };

const promoBox = { background: 'linear-gradient(135deg, rgba(236,254,255,0.96), rgba(209,250,229,0.85))', padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(15,118,110,0.26)' };
const pTitle = { fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0' };
const pDesc = { fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.8, marginBottom: '1rem' };
const pBtn = { background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', width: '100%', padding: '0.75rem', borderRadius: '10px', fontWeight: 800 };

const productArea = { flex: 1 };
const productGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' };
const pCard = { background: 'linear-gradient(180deg, #ffffff, #f6fcff)', borderRadius: '20px', border: '1px solid rgba(8,145,178,0.14)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s' };
const pImgSection = { position: 'relative', height: '240px', background: 'linear-gradient(145deg, #f0f9ff, #ecfeff)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const pImage = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };
const wishBtn = { position: 'absolute', top: '1rem', right: '1rem', background: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 10px 18px -14px rgba(15,23,42,0.8)', border: '1px solid rgba(8,145,178,0.12)' };

const pInfo = { padding: '1.5rem', flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const pTopRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const pTag = { fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' };
const pRating = { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' };
const pName = { fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const pPrice = { fontSize: '1.25rem', fontWeight: 900, color: '#0c4a6e' };

const pActions = { padding: '0 1.5rem 1.5rem' };
const addBagBtn = { width: '100%', background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 16px 26px -22px rgba(13,148,136,0.95)' };

const loaderArea = { textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: 'var(--text-muted)' };
const emptyState = { textAlign: 'center', padding: '5rem', background: 'linear-gradient(180deg, #ffffff, #f3fbfd)', borderRadius: '24px', border: '1px solid rgba(8,145,178,0.14)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' };
const clearBtn = { marginTop: '1rem', color: 'var(--primary)', fontWeight: 800 };

export default ShopPage;
