import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import {
    ShoppingBag,
    User,
    Moon,
    Sun,
    LogOut,
    Globe,
    Menu,
    X,
    Bell,
    Search,
    Mic,
    ChevronDown,
    ShoppingCart
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
    const { user, logout, theme, toggleTheme, lang, toggleLang, profile, isInstallable, installPWA } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const startVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            setIsListening(true);
            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setSearchQuery(text);
                navigate(`/shop?search=${encodeURIComponent(text)}`);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognition.start();
        } else {
            alert('Voice search not supported');
        }
    };

    const t = translations[lang];

    return (
        <nav style={navStyle}>
            <div style={containerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/" style={logoStyle}>
                        <div style={logoIcon}><ShoppingBag size={22} color="white" /></div>
                        <span style={logoText}>H-HUB</span>
                    </Link>

                    <div className="desktop-only" style={desktopNav}>
                        <Link to="/" style={linkStyle} className="link-animated">Home</Link>
                        <Link to="/shop" style={linkStyle} className="link-animated">Shop All</Link>
                    </div>
                </div>

                <div className="mobile-hide" style={searchWrap}>
                    <form onSubmit={handleSearch} style={searchForm}>
                        <Search size={16} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search premium products..."
                            style={searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="button" onClick={startVoiceSearch} style={voiceBtn}>
                            <Mic size={14} color={isListening ? 'var(--danger)' : 'var(--text-muted)'} />
                        </button>
                    </form>
                </div>

                <div style={rightActions}>
                    <div className="desktop-only" style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={toggleLang} style={subtleBtn}>
                            <Globe size={18} />
                            <span style={langBadge}>{lang.toUpperCase()}</span>
                        </button>

                        <button onClick={toggleTheme} style={subtleBtn}>
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                    </div>

                    <Link to="/cart" style={subtleBtn} className="card-interactive">
                        <ShoppingCart size={18} />
                    </Link>

                    {user && <NotificationCenter userId={user.id} />}

                    {user ? (
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                style={userProfileBtn}
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <div style={avatar}>
                                    {user.name?.charAt(0) || <User size={14} />}
                                </div>
                                <div className="desktop-only" style={userDetails}>
                                    <span style={userName}>{user.name?.split(' ')[0]}</span>
                                    <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={dropdownMenu}
                                    >
                                        <div style={dropdownHeader}>
                                            <p style={dropEmail}>{user.email}</p>
                                            {profile?.supercoins > 0 && (
                                                <div style={superCoinBadge}>
                                                    🪙 {profile.supercoins} Supercoins
                                                </div>
                                            )}
                                        </div>

                                        <div style={dropdownGrid}>
                                            <Link to="/user/profile" style={dropItem} onClick={() => setIsOpen(false)}><User size={16} /> Profile</Link>
                                            <Link to="/user/orders" style={dropItem} onClick={() => setIsOpen(false)}><ShoppingBag size={16} /> Orders</Link>
                                            <Link to="/user/wishlist" style={dropItem} onClick={() => setIsOpen(false)}>❤️ Wishlist</Link>
                                            <Link to="/user/wallet" style={dropItem} onClick={() => setIsOpen(false)}>💳 Wallet</Link>

                                            {user.role !== 'user' && <div style={dropDivider} />}
                                            {user.role === 'admin' && <Link to="/admin" style={dropItemDash} onClick={() => setIsOpen(false)}>Admin Panel</Link>}
                                            {user.role === 'seller' && <Link to="/seller" style={dropItemDash} onClick={() => setIsOpen(false)}>Seller Hub</Link>}
                                            {user.role === 'delivery' && <Link to="/delivery" style={dropItemDash} onClick={() => setIsOpen(false)}>Rider Panel</Link>}
                                        </div>

                                        <div style={dropDivider} />
                                        <button style={logoutBtn} onClick={() => { logout(); setIsOpen(false); }}>
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link to="/login" style={loginBtnLink} className="link-animated">Sign In</Link>
                            <Link to="/register" style={registerBtn} className="btn-glow">Join Now</Link>
                        </div>
                    )}

                    {isInstallable && (
                        <button
                            className="desktop-only btn-glow"
                            onClick={installPWA}
                            style={{
                                padding: '0.55rem 1rem',
                                background: 'linear-gradient(130deg, var(--primary), var(--accent))',
                                color: 'white',
                                borderRadius: '13px',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 14px 28px -20px rgba(15, 118, 110, 0.95)'
                            }}
                        >
                            <ShoppingBag size={14} /> Install Hub
                        </button>
                    )}

                    <button className="mobile-only" style={mobileMenuBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        style={mobileSidebar}
                    >
                        <div style={mobileHeader}>
                            <Link to="/" style={logoStyle} onClick={() => setIsMobileMenuOpen(false)}>
                                <div style={logoIcon}><ShoppingBag size={20} color="white" /></div>
                                <span style={logoText}>H-HUB</span>
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                        </div>

                        <div style={mobileLinks}>
                            <Link to="/" style={mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                            <Link to="/shop" style={mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
                            <div style={dropDivider} />
                            {!user ? (
                                <>
                                    <Link to="/login" style={mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                                    <Link to="/register" style={mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Join Now</Link>
                                </>
                            ) : (
                                <>
                                    <p style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
                                    <Link to="/user/profile" style={mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                                    <Link to="/user/orders" style={mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Orders</Link>
                                    <button style={mobileLink} onClick={() => { logout(); setIsMobileMenuOpen(false); }}>Sign Out</button>
                                </>
                            )}
                            <div style={dropDivider} />
                            <button onClick={toggleTheme} style={mobileLink}>
                                {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            </button>
                            <button onClick={toggleLang} style={mobileLink}>
                                Change Language ({lang.toUpperCase()})
                            </button>
                            {isInstallable && (
                                <button
                                    onClick={installPWA}
                                    style={{
                                        ...mobileLink,
                                        background: 'rgba(37, 99, 235, 0.1)',
                                        color: '#2563eb',
                                        fontWeight: 800,
                                        marginTop: '1rem',
                                        borderRadius: '12px'
                                    }}
                                >
                                    💾 Install H-HUB Web App
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const navStyle = {
    position: 'sticky',
    top: 0,
    background: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(8, 145, 178, 0.14)',
    zIndex: 1000,
    height: '76px',
    display: 'flex',
    alignItems: 'center'
};

const containerStyle = {
    maxWidth: '1440px',
    width: '100%',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const logoStyle = { display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' };
const logoIcon = { background: 'linear-gradient(130deg, var(--primary), var(--accent))', padding: '0.48rem', borderRadius: '10px', display: 'flex', boxShadow: '0 12px 22px -18px rgba(15, 118, 110, 0.95)' };
const logoText = { fontSize: '1.28rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' };

const desktopNav = { display: 'flex', alignItems: 'center', gap: '2rem' };
const linkStyle = { fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' };

const searchWrap = { flex: 1, maxWidth: '500px', margin: '0 2rem' };
const searchForm = { display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(180deg, #ffffff, #f3fbfd)', padding: '0.6rem 1rem', borderRadius: '13px', border: '1px solid rgba(8, 145, 178, 0.16)', boxShadow: 'var(--shadow-sm)' };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)', padding: 0 };
const voiceBtn = { padding: '6px', display: 'flex', borderRadius: '8px', background: 'rgba(236, 254, 255, 0.9)' };

const rightActions = { display: 'flex', alignItems: 'center', gap: '0.75rem' };
const subtleBtn = { padding: '0.5rem', borderRadius: '10px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', position: 'relative', border: '1px solid rgba(8,145,178,0.12)', background: 'linear-gradient(180deg, #ffffff, #f3fbfd)' };
const langBadge = { fontSize: '0.6rem', fontWeight: 800, background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', padding: '1px 4px', borderRadius: '4px', position: 'absolute', top: '2px', right: '0px' };

const userProfileBtn = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.45rem 0.75rem', borderRadius: '13px', background: 'linear-gradient(180deg, #ffffff, #f3fbfd)', border: '1px solid rgba(8, 145, 178, 0.18)', boxShadow: 'var(--shadow-sm)' };
const avatar = { width: '30px', height: '30px', background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' };
const userDetails = { display: 'flex', alignItems: 'center', gap: '0.5rem' };
const userName = { fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' };

const dropdownMenu = { position: 'absolute', top: '54px', right: 0, width: '288px', background: 'linear-gradient(180deg, #ffffff, #f5fcff)', borderRadius: '18px', border: '1px solid rgba(8, 145, 178, 0.16)', boxShadow: '0 30px 50px -36px rgba(15,23,42,0.85)', overflow: 'hidden' };
const dropdownHeader = { padding: '1.25rem', background: 'rgba(240, 253, 250, 0.86)', borderBottom: '1px solid var(--border)' };
const dropEmail = { fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 };
const superCoinBadge = { marginTop: '0.55rem', fontSize: '0.82rem', fontWeight: 800, color: '#92400e', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '999px', padding: '0.3rem 0.55rem', display: 'inline-flex' };

const dropdownGrid = { padding: '0.75rem' };
const dropItem = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' };
const dropItemDash = { ...dropItem, background: 'rgba(236, 254, 255, 0.95)', color: 'var(--primary)', fontWeight: 800, border: '1px solid rgba(8,145,178,0.15)' };
const dropDivider = { height: '1px', background: 'var(--border)', margin: '0.5rem' };
const logoutBtn = { width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.75rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.9rem', textAlign: 'left' };

const loginBtnLink = { fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' };
const registerBtn = { background: 'linear-gradient(130deg, var(--primary), var(--accent))', color: 'white', padding: '0.62rem 1.3rem', borderRadius: '11px', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 14px 28px -20px rgba(15, 118, 110, 0.95)' };

const mobileMenuBtn = { display: 'none', padding: '0.5rem', color: 'var(--text-main)' };
const mobileSidebar = { position: 'fixed', top: 0, right: 0, width: '82%', height: '100vh', maxHeight: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'linear-gradient(180deg, #ffffff, #f3fbfd)', zIndex: 2000, boxShadow: '-18px 0 42px -26px rgba(15,23,42,0.8)', padding: '2rem', borderLeft: '1px solid rgba(8,145,178,0.16)' };
const mobileHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' };
const mobileLinks = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const mobileLink = { fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', textAlign: 'left', background: 'none', border: 'none', padding: '1rem' };

export default Navbar;
