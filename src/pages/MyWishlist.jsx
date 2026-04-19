import React from 'react';
import api from '../utils/api';
import { useAuth } from '../context/authContext';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MyWishlist = () => {
    const { profile, toggleWishlist } = useAuth();
    const [wishlistItems, setWishlistItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchWishlistItems = async () => {
            if (!profile?.wishlist || profile.wishlist.length === 0) {
                setWishlistItems([]);
                return;
            }
            setLoading(true);
            try {
                const items = [];
                for (const productId of profile.wishlist) {
                    try {
                        const cleanId = String(productId).trim();
                        const res = await api.get(`/products/${cleanId}`);
                        if (res.data && res.data.id) {
                            items.push(res.data);
                        }
                    } catch (err) {
                        console.error(`Failed to fetch product ${productId}:`, err);
                    }
                }
                setWishlistItems(items);
            } catch (error) {
                console.error('Failed to fetch wishlist items:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlistItems();
    }, [profile?.wishlist]);

    const removeFromWishlist = async (id) => {
        await toggleWishlist(id);
    };

    const moveToCart = (id) => {
        // Simple mock for now, but UI will show it worked
        console.log('Moved to cart:', id);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Wishlist...</div>;

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}><Heart size={28} /> My Wishlist</h1>
                <div style={count}>{profile?.wishlist?.length || 0} Items</div>
            </header>

            {(!profile?.wishlist || profile.wishlist.length === 0) ? (
                <div style={emptyState}>
                    <Heart size={64} color="var(--text-muted)" />
                    <h2 style={emptyTitle}>Your wishlist is empty</h2>
                    <p style={emptyText}>Add items you love to your wishlist</p>
                    <Link to="/shop" style={shopBtn}>Continue Shopping</Link>
                </div>
            ) : wishlistItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass)', borderRadius: '24px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Found {profile.wishlist.length} item(s) in your profile: <strong>[{profile.wishlist.join(', ')}]</strong>, but the shop database couldn't find them.</p>
                    <p style={{ marginTop: '0.5rem' }}>This usually happens if the database was recently reset.</p>
                    <Link to="/shop" style={{ ...shopBtn, marginTop: '1.5rem', background: 'var(--text-main)' }}>Go to Shop to re-add items</Link>
                </div>
            ) : (
                <div style={wishlistGrid}>
                    {wishlistItems.map((item) => (
                        <motion.div key={item.id} whileHover={{ y: -5 }} style={wishlistCard}>
                            <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                                <div style={itemImgWrap}>
                                    <img src={item.img} alt={item.name} style={itemImg} />
                                </div>
                            </Link>
                            <div style={itemInfo}>
                                <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={itemName}>{item.name}</div>
                                </Link>
                                <div style={itemPrice}>₹{item.price?.toLocaleString('en-IN')}</div>
                                <div style={{ ...stockBadge, background: item.stock > 0 ? '#dcfce7' : '#fee2e2', color: item.stock > 0 ? '#166534' : '#991b1b' }}>
                                    {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </div>
                            </div>
                            <div style={itemActions}>
                                {item.stock > 0 && (
                                    <button onClick={() => moveToCart(item.id)} style={cartBtn}>
                                        <ShoppingCart size={16} /> Move to Cart
                                    </button>
                                )}
                                <button onClick={() => removeFromWishlist(item.id)} style={removeBtn}>
                                    <Trash2 size={16} /> Remove
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' };
const count = { fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--glass)', padding: '0.5rem 1rem', borderRadius: '50px' };
const emptyState = { textAlign: 'center', padding: '4rem 2rem', background: 'var(--glass)', borderRadius: '24px', border: '1px solid var(--glass-border)' };
const emptyTitle = { fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '1rem' };
const emptyText = { fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' };
const shopBtn = { display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' };
const wishlistGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' };
const wishlistCard = { background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };
const itemImgWrap = { width: '100%', height: '300px', overflow: 'hidden', position: 'relative', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' };
const itemImg = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };
const itemInfo = { padding: '1.25rem' };
const itemName = { fontSize: '1rem', fontWeight: 600, color: '#212121', marginBottom: '0.5rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.8rem' };
const itemPrice = { fontSize: '1.5rem', fontWeight: 700, color: '#212121', marginBottom: '0.75rem' };
const stockBadge = { display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700 };
const itemActions = { display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1.5rem 1.5rem' };
const cartBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' };
const removeBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' };

export default MyWishlist;
