import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, TrendingUp, ShoppingBag, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const FlashDeals = ({ products = [] }) => {
    const navigate = useNavigate();
    const { user, addToCart, toggleWishlist, profile } = useAuth();
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    // Countdown timer
    useEffect(() => {
        const endTime = new Date();
        endTime.setHours(23, 59, 59, 999); // End of day

        const timer = setInterval(() => {
            const now = new Date();
            const diff = endTime - now;

            if (diff > 0) {
                setTimeLeft({
                    hours: Math.floor(diff / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Select flash deal products (first 6 with high ratings)
    const flashProducts = products
        .filter(p => p.rating >= 4.5)
        .slice(0, 6)
        .map(p => ({
            ...p,
            flashPrice: Math.floor(p.price * 0.7), // 30% off
            originalPrice: p.price,
            stockLeft: Math.floor(Math.random() * 20) + 5,
            soldCount: Math.floor(Math.random() * 200) + 50
        }));

    if (flashProducts.length === 0) return null;

    return (
        <div style={container}>
            <div style={header}>
                <div style={headerLeft}>
                    <Flame size={28} color="#ff5722" style={{ animation: 'pulse 2s infinite' }} />
                    <h2 style={title}>⚡ Flash Deals</h2>
                    <div style={badge}>Today Only</div>
                </div>
                <div style={timer}>
                    <Clock size={18} color="#ff5722" />
                    <span style={timerText}>Ends in:</span>
                    <div style={timeBox}>
                        <div style={timeUnit}>
                            <div style={timeValue}>{String(timeLeft.hours).padStart(2, '0')}</div>
                            <div style={timeLabel}>HRS</div>
                        </div>
                        <div style={timeSeparator}>:</div>
                        <div style={timeUnit}>
                            <div style={timeValue}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                            <div style={timeLabel}>MIN</div>
                        </div>
                        <div style={timeSeparator}>:</div>
                        <div style={timeUnit}>
                            <div style={timeValue}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                            <div style={timeLabel}>SEC</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={grid}>
                {flashProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        style={card}
                        onClick={() => navigate(`/product/${product.id}`)}
                    >
                        <div style={dealBadge}>
                            <Flame size={14} />
                            {Math.round((1 - product.flashPrice / product.originalPrice) * 100)}% OFF
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (user) {
                                    toggleWishlist(product.id);
                                }
                            }}
                            style={wishlistBtn}
                        >
                            <Heart
                                size={16}
                                fill={(profile?.wishlist || []).includes(String(product.id)) ? "#ef4444" : "none"}
                                color={(profile?.wishlist || []).includes(String(product.id)) ? "#ef4444" : "#666"}
                            />
                        </button>

                        <div style={imageSection}>
                            <img
                                src={product.image || product.img}
                                alt={product.name}
                                style={productImage}
                            />
                        </div>

                        <div style={details}>
                            <h3 style={productName}>{product.name}</h3>

                            <div style={priceRow}>
                                <span style={flashPrice}>₹{product.flashPrice.toLocaleString('en-IN')}</span>
                                <span style={originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            </div>

                            <div style={stockSection}>
                                <div style={stockBar}>
                                    <div style={{
                                        ...stockFill,
                                        width: `${(product.soldCount / (product.soldCount + product.stockLeft)) * 100}%`
                                    }} />
                                </div>
                                <div style={stockText}>
                                    <TrendingUp size={12} color="#ff5722" />
                                    <span>{product.soldCount} sold</span>
                                    <span style={stockLeft}>Only {product.stockLeft} left!</span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (user) {
                                        addToCart({
                                            id: product.id,
                                            name: product.name,
                                            price: product.flashPrice,
                                            img: product.image || product.img
                                        }, 1);
                                    } else {
                                        navigate('/login');
                                    }
                                }}
                                style={addBtn}
                            >
                                <ShoppingBag size={16} />
                                Grab Deal Now
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// Styles
const container = {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '3rem 2rem',
    background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
    borderRadius: '24px',
    border: '2px solid #ffcccc'
};

const header = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
};

const headerLeft = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const title = {
    fontSize: '2rem',
    fontWeight: 900,
    margin: 0,
    background: 'linear-gradient(135deg, #ff5722 0%, #ff9800 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
};

const badge = {
    background: '#ff5722',
    color: 'white',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase'
};

const timer = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(255, 87, 34, 0.2)'
};

const timerText = {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#666'
};

const timeBox = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
};

const timeUnit = {
    textAlign: 'center'
};

const timeValue = {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#ff5722',
    background: '#fff5f5',
    padding: '0.35rem 0.75rem',
    borderRadius: '8px',
    minWidth: '50px'
};

const timeLabel = {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: '#999',
    marginTop: '0.25rem'
};

const timeSeparator = {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#ff5722'
};

const grid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
};

const card = {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '2px solid #ffebee'
};

const dealBadge = {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    background: '#ff5722',
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    zIndex: 2,
    boxShadow: '0 4px 12px rgba(255, 87, 34, 0.4)'
};

const wishlistBtn = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
};

const imageSection = {
    height: '250px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafafa',
    padding: '1.5rem'
};

const productImage = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
};

const details = {
    padding: '1.25rem'
};

const productName = {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#212121',
    margin: '0 0 0.75rem 0',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '2.8rem'
};

const priceRow = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem',
    marginBottom: '0.75rem'
};

const flashPrice = {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#ff5722'
};

const originalPrice = {
    fontSize: '1rem',
    color: '#999',
    textDecoration: 'line-through'
};

const stockSection = {
    marginBottom: '1rem'
};

const stockBar = {
    height: '6px',
    background: '#f0f0f0',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '0.5rem'
};

const stockFill = {
    height: '100%',
    background: 'linear-gradient(90deg, #ff5722 0%, #ff9800 100%)',
    borderRadius: '10px',
    transition: 'width 0.3s'
};

const stockText = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#666'
};

const stockLeft = {
    color: '#ff5722',
    marginLeft: 'auto'
};

const addBtn = {
    width: '100%',
    background: '#ff5722',
    color: 'white',
    border: 'none',
    padding: '0.875rem',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)'
};

export default FlashDeals;
