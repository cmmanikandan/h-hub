import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProductRecommendations = ({ currentProduct, allProducts = [] }) => {
    const navigate = useNavigate();
    const { user, addToCart } = useAuth();
    const [selectedItems, setSelectedItems] = useState([currentProduct.id]);

    // Find related products based on category
    const relatedProducts = allProducts
        .filter(p =>
            p.category === currentProduct.category &&
            p.id !== currentProduct.id
        )
        .slice(0, 3);

    const frequentlyBought = [currentProduct, ...relatedProducts.slice(0, 2)];
    const youMayLike = relatedProducts.slice(2, 8);

    const toggleSelection = (productId) => {
        if (productId === currentProduct.id) return; // Can't deselect main product

        setSelectedItems(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const getTotalPrice = () => {
        return frequentlyBought
            .filter(p => selectedItems.includes(p.id))
            .reduce((sum, p) => sum + p.price, 0);
    };

    const getTotalDiscount = () => {
        const total = getTotalPrice();
        const originalTotal = total * 1.15; // Assuming 15% discount
        return Math.floor(originalTotal - total);
    };

    const addAllToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        frequentlyBought
            .filter(p => selectedItems.includes(p.id))
            .forEach(product => {
                addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    img: product.image || product.img
                }, 1);
            });
    };

    if (frequentlyBought.length < 2) return null;

    return (
        <div style={container}>
            {/* Frequently Bought Together */}
            <section style={section}>
                <h2 style={sectionTitle}>
                    🛍️ Frequently Bought Together
                </h2>
                <p style={sectionDesc}>
                    Save ₹{getTotalDiscount()} when you buy these items together
                </p>

                <div style={bundleContainer}>
                    <div style={bundleProducts}>
                        {frequentlyBought.map((product, index) => (
                            <React.Fragment key={product.id}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    style={bundleCard}
                                    onClick={() => toggleSelection(product.id)}
                                >
                                    <div style={checkboxContainer}>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(product.id)}
                                            onChange={() => toggleSelection(product.id)}
                                            disabled={product.id === currentProduct.id}
                                            style={checkbox}
                                        />
                                    </div>

                                    <img
                                        src={product.image || product.img}
                                        alt={product.name}
                                        style={bundleImage}
                                    />

                                    <div style={bundleDetails}>
                                        <div style={bundleName}>{product.name}</div>
                                        <div style={bundlePrice}>₹{product.price.toLocaleString('en-IN')}</div>
                                        {product.id === currentProduct.id && (
                                            <div style={thisItemBadge}>This item</div>
                                        )}
                                    </div>
                                </motion.div>

                                {index < frequentlyBought.length - 1 && (
                                    <div style={plusIcon}>
                                        <Plus size={20} color="#999" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div style={bundleSummary}>
                        <div style={summaryRow}>
                            <span style={summaryLabel}>Total ({selectedItems.length} items):</span>
                            <span style={summaryValue}>₹{getTotalPrice().toLocaleString('en-IN')}</span>
                        </div>
                        <div style={summaryRow}>
                            <span style={summaryLabel}>You save:</span>
                            <span style={discountValue}>₹{getTotalDiscount().toLocaleString('en-IN')}</span>
                        </div>
                        <button
                            onClick={addAllToCart}
                            style={addAllBtn}
                        >
                            <ShoppingCart size={18} />
                            Add {selectedItems.length} items to cart
                        </button>
                    </div>
                </div>
            </section>

            {/* You May Also Like */}
            {youMayLike.length > 0 && (
                <section style={section}>
                    <h2 style={sectionTitle}>
                        💡 You May Also Like
                    </h2>
                    <div style={recommendGrid}>
                        {youMayLike.map((product) => (
                            <motion.div
                                key={product.id}
                                whileHover={{ y: -5 }}
                                style={recommendCard}
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <img
                                    src={product.image || product.img}
                                    alt={product.name}
                                    style={recommendImage}
                                />
                                <div style={recommendDetails}>
                                    <div style={recommendName}>{product.name}</div>
                                    <div style={recommendPriceRow}>
                                        <span style={recommendPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                                        {product.rating && (
                                            <span style={recommendRating}>
                                                ⭐ {product.rating}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

// Styles
const container = {
    marginTop: '3rem'
};

const section = {
    marginBottom: '3rem',
    padding: '2rem',
    background: 'var(--glass)',
    borderRadius: '24px',
    border: '1px solid var(--glass-border)'
};

const sectionTitle = {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: '0 0 0.5rem 0'
};

const sectionDesc = {
    color: '#10b981',
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 2rem 0'
};

const bundleContainer = {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap'
};

const bundleProducts = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    minWidth: '300px'
};

const bundleCard = {
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '16px',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
    maxWidth: '250px'
};

const checkboxContainer = {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem'
};

const checkbox = {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
};

const bundleImage = {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    borderRadius: '8px'
};

const bundleDetails = {
    flex: 1
};

const bundleName = {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#212121',
    marginBottom: '0.25rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
};

const bundlePrice = {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#212121'
};

const thisItemBadge = {
    display: 'inline-block',
    background: '#6366f1',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.65rem',
    fontWeight: 700,
    marginTop: '0.25rem'
};

const plusIcon = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: '#f5f5f5',
    borderRadius: '50%'
};

const bundleSummary = {
    minWidth: '280px',
    background: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '16px',
    height: 'fit-content'
};

const summaryRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
};

const summaryLabel = {
    fontSize: '0.95rem',
    color: '#666',
    fontWeight: 600
};

const summaryValue = {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#212121'
};

const discountValue = {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#10b981'
};

const addAllBtn = {
    width: '100%',
    background: '#ff9f00',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 12px rgba(255, 159, 0, 0.3)',
    transition: 'all 0.2s'
};

const recommendGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem'
};

const recommendCard = {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
};

const recommendImage = {
    width: '100%',
    height: '180px',
    objectFit: 'contain',
    padding: '1rem',
    background: '#fafafa'
};

const recommendDetails = {
    padding: '1rem'
};

const recommendName = {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#212121',
    marginBottom: '0.5rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '2.7rem'
};

const recommendPriceRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const recommendPrice = {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#212121'
};

const recommendRating = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#666'
};

export default ProductRecommendations;
