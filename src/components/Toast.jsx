import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, ShoppingCart, Heart, AlertCircle, Info } from 'lucide-react';

const Toast = ({ show, onClose, type = 'success', message, duration = 3000 }) => {
    React.useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    const icons = {
        success: <CheckCircle2 size={24} />,
        error: <AlertCircle size={24} />,
        info: <Info size={24} />,
        cart: <ShoppingCart size={24} />,
        wishlist: <Heart size={24} />
    };

    const colors = {
        success: { bg: '#10b981', border: 'rgba(255,255,255,0.1)' },
        error: { bg: '#ef4444', border: 'rgba(255,255,255,0.1)' },
        info: { bg: '#3b82f6', border: 'rgba(255,255,255,0.1)' },
        cart: { bg: '#6366f1', border: 'rgba(255,255,255,0.1)' },
        wishlist: { bg: '#ec4899', border: 'rgba(255,255,255,0.1)' }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                        ...toastContainer,
                        background: colors[type].bg,
                        border: `1px solid ${colors[type].border}`
                    }}
                >
                    <div style={iconWrapper}>
                        {icons[type]}
                    </div>
                    <span style={toastMessage}>{message}</span>
                    <button onClick={onClose} style={closeBtn}>
                        <X size={20} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Styles
const toastContainer = {
    position: 'fixed',
    bottom: '40px',
    left: '50%',
    marginLeft: '-150px', // Center workaround
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '0.75rem 0.75rem 0.75rem 1.5rem',
    borderRadius: '24px',
    color: 'white',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    width: '300px',
    backdropFilter: 'blur(10px)'
};

const iconWrapper = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '10px',
    borderRadius: '16px'
};

const toastMessage = {
    flex: 1,
    fontSize: '1.1rem',
    fontWeight: 800,
    letterSpacing: '-0.02em'
};

const closeBtn = {
    background: 'rgba(255, 255, 255, 0.25)',
    border: 'none',
    borderRadius: '16px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    transition: 'all 0.2s',
    backdropFilter: 'blur(5px)'
};

export default Toast;
