import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, X, ShoppingBag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GuestPrompt = () => {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // If logged in, don't do anything
        if (user) return;

        // Timer for showing the login suggestion (e.g., 40 seconds)
        const timer = setTimeout(() => {
            if (!dismissed) {
                setIsVisible(true);
            }
        }, 40000);

        return () => clearTimeout(timer);
    }, [user, dismissed]);

    if (user || dismissed) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div style={overlay}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        style={modal}
                    >
                        <button style={closeBtn} onClick={() => setDismissed(true)}><X size={18} /></button>

                        <div style={iconBox}>
                            <Sparkles size={32} color="var(--primary)" />
                        </div>

                        <h2 style={title}>Unlock Full Experience</h2>
                        <p style={subtitle}>
                            You've been browsing for a while! Join H-Hub today for personalized recommendations, order tracking, and exclusive discounts.
                        </p>

                        <div style={btnStack}>
                            <button
                                style={primaryBtn}
                                onClick={() => {
                                    setIsVisible(false);
                                    navigate('/register');
                                }}
                            >
                                <UserPlus size={20} /> Create Free Account
                            </button>
                            <button
                                style={secondaryBtn}
                                onClick={() => {
                                    setIsVisible(false);
                                    navigate('/login');
                                }}
                            >
                                <LogIn size={20} /> Already a member? Sign In
                            </button>
                        </div>

                        <div style={trustRow}>
                            <ShoppingBag size={14} /> Join 10k+ active shoppers
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const overlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
};

const modal = {
    background: 'white',
    padding: '4rem 3rem',
    borderRadius: '40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.1)'
};

const closeBtn = {
    position: 'absolute',
    top: '2rem',
    right: '2rem',
    background: '#f1f5f9',
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
};

const iconBox = {
    width: '80px',
    height: '80px',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2.5rem'
};

const title = {
    fontSize: '2rem',
    fontWeight: 900,
    color: '#1e293b',
    margin: '0 0 1rem'
};

const subtitle = {
    color: '#64748b',
    fontSize: '1.05rem',
    lineHeight: 1.6,
    marginBottom: '3rem'
};

const btnStack = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
};

const primaryBtn = {
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    padding: '1.25rem',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
};

const secondaryBtn = {
    background: '#f1f5f9',
    color: '#1e293b',
    border: 'none',
    padding: '1.25rem',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem'
};

const trustRow = {
    marginTop: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: 700
};

export default GuestPrompt;
