import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { Download, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallBanner = () => {
    const { isInstallable, installPWA } = useAuth();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show banner after 5 seconds if installable
        if (isInstallable) {
            const timer = setTimeout(() => {
                const dismissed = localStorage.getItem('pwa_banner_dismissed');
                if (!dismissed) {
                    setIsVisible(true);
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isInstallable]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa_banner_dismissed', 'true');
    };

    if (!isInstallable || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                style={bannerContainer}
            >
                <div style={bannerContent}>
                    <div style={iconBox}>
                        <ShoppingBag size={24} color="white" />
                    </div>
                    <div style={textBox}>
                        <h4 style={title}>Install H-HUB App</h4>
                        <p style={subtitle}>Shop faster and get exclusive mobile offers.</p>
                    </div>
                    <div style={actionBox}>
                        <button onClick={installPWA} style={installBtn}>
                            <Download size={16} /> Install
                        </button>
                        <button onClick={handleDismiss} style={closeBtn}>
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const bannerContainer = {
    position: 'fixed',
    bottom: '1.5rem',
    left: '1.5rem',
    right: '1.5rem',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center'
};

const bannerContent = {
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    padding: '1rem',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
};

const iconBox = {
    background: 'var(--primary)',
    padding: '0.75rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
};

const textBox = {
    flex: 1
};

const title = {
    fontSize: '0.95rem',
    fontWeight: 800,
    margin: 0
};

const subtitle = {
    fontSize: '0.75rem',
    opacity: 0.7,
    margin: '0.2rem 0 0'
};

const actionBox = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
};

const installBtn = {
    background: 'white',
    color: 'var(--text-main)',
    padding: '0.6rem 1.2rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    border: 'none',
    cursor: 'pointer'
};

const closeBtn = {
    color: 'gray',
    padding: '0.5rem',
    border: 'none',
    cursor: 'pointer'
};

export default PWAInstallBanner;
