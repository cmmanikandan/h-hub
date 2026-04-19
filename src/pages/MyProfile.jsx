import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import {
    User, Edit3, LogOut, X, Save, Lock, Eye, EyeOff,
    Gift, Wallet, ShoppingBag, Shield, Bell, ChevronRight,
    MapPin, CreditCard, Heart, History, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
import ReferralSystem from '../components/ReferralSystem';

const MyProfile = () => {
    const { user, logout, profile, updateProfile, fetchProfile } = useAuth();
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [activeTab, setActiveTab] = useState('personal');

    const [editData, setEditData] = useState({
        name: '',
        email: '',
        mobile: '',
        gender: 'Male',
        dob: '',
        altPhone: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    // Sync form with profile when modal opens
    useEffect(() => {
        if (showEditModal) {
            setEditData({
                name: profile?.name || user?.name || '',
                email: user?.email || '',
                mobile: profile?.phone || profile?.altPhone || '',
                gender: profile?.gender || 'Male',
                dob: profile?.dob || '',
                altPhone: profile?.altPhone || ''
            });
        }
    }, [showEditModal, profile, user]);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const handleEditProfile = async () => {
        if (!editData.name.trim()) {
            showToast('error', 'Name is required!');
            return;
        }

        const res = await updateProfile({
            name: editData.name,
            phone: editData.mobile,
            gender: editData.gender,
            dob: editData.dob,
            altPhone: editData.altPhone
        });

        if (res.success) {
            showToast('success', 'Profile updated successfully!');
            setShowEditModal(false);
        } else {
            showToast('error', 'Failed to update profile!');
        }
    };

    const tierColors = {
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
        platinum: '#E5E4E2'
    };

    const currentTier = profile?.loyaltyTier?.tier || 'bronze';

    return (
        <div style={container}>
            <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />

            {/* Hero Section */}
            <header style={heroSection}>
                <div style={heroOverlay}>
                    <div style={heroContent}>
                        <div style={profileTop}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={avatarContainer}
                            >
                                <div style={avatarLarge}>
                                    {(profile?.name || user?.name || 'U')[0].toUpperCase()}
                                </div>
                                <div style={tierBadge}>
                                    <Star size={12} fill="white" /> {currentTier.toUpperCase()}
                                </div>
                            </motion.div>
                            <div style={profileMeta}>
                                <motion.h1
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    style={heroName}
                                >
                                    {profile?.name || user?.name || 'User'}
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    style={heroEmail}
                                >
                                    {user?.email}
                                </motion.p>
                            </div>
                        </div>

                        <div style={heroStats}>
                            <div style={statItem}>
                                <Gift size={24} color="#fcd34d" />
                                <div style={statDetails}>
                                    <span style={statValue}>{profile?.supercoins || 0}</span>
                                    <span style={statLabel}>SuperCoins</span>
                                </div>
                            </div>
                            <div style={statDivider} />
                            <div style={statItem}>
                                <Wallet size={24} color="#34d399" />
                                <div style={statDetails}>
                                    <span style={statValue}>₹{profile?.wallet?.toLocaleString() || '0'}</span>
                                    <span style={statLabel}>Wallet Balance</span>
                                </div>
                            </div>
                            <div style={statDivider} />
                            <div style={statItem}>
                                <ShoppingBag size={24} color="#60a5fa" />
                                <div style={statDetails}>
                                    <span style={statValue}>{profile?.orders?.length || 0}</span>
                                    <span style={statLabel}>Total Orders</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main style={mainContent}>
                {/* Left Column: Navigation */}
                <aside style={sideNav}>
                    <h3 style={sectionLabel}>Account Settings</h3>
                    <nav style={navList}>
                        <NavButton
                            icon={<User size={18} />}
                            label="Personal Information"
                            active={activeTab === 'personal'}
                            onClick={() => setActiveTab('personal')}
                        />
                        <NavButton
                            icon={<MapPin size={18} />}
                            label="Manage Addresses"
                            onClick={() => navigate('/user/addresses')}
                        />
                        <NavButton
                            icon={<Shield size={18} />}
                            label="Security & Privacy"
                            active={activeTab === 'security'}
                            onClick={() => setActiveTab('security')}
                        />
                        <NavButton
                            icon={<CreditCard size={18} />}
                            label="Payment Methods"
                            onClick={() => navigate('/user/wallet')}
                        />
                        <NavButton
                            icon={<Heart size={18} />}
                            label="My Wishlist"
                            onClick={() => navigate('/wishlist')}
                        />
                    </nav>

                    <div style={logoutSection}>
                        <button onClick={logout} style={logoutBtn}>
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* Right Column: Tab Content */}
                <section style={detailsSection}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'personal' && (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={tabCard}
                            >
                                <div style={tabHeader}>
                                    <h2 style={tabTitle}>Personal Information</h2>
                                    <button onClick={() => setShowEditModal(true)} style={actionBtn}>
                                        <Edit3 size={16} /> Edit
                                    </button>
                                </div>

                                <div style={infoGrid}>
                                    <div style={infoItem}>
                                        <label style={infoLabel}>Full Name</label>
                                        <div style={infoValue}>{profile?.name || user?.name || 'Not Set'}</div>
                                    </div>
                                    <div style={infoItem}>
                                        <label style={infoLabel}>Phone Number</label>
                                        <div style={infoValue}>{profile?.phone || 'Not Set'}</div>
                                    </div>
                                    <div style={infoItem}>
                                        <label style={infoLabel}>Gender</label>
                                        <div style={infoValue}>{profile?.gender || 'Not Set'}</div>
                                    </div>
                                    <div style={infoItem}>
                                        <label style={infoLabel}>Date of Birth</label>
                                        <div style={infoValue}>{profile?.dob || 'Not Set'}</div>
                                    </div>
                                    <div style={infoItem}>
                                        <label style={infoLabel}>Alternate Phone</label>
                                        <div style={infoValue}>{profile?.altPhone || 'Not Set'}</div>
                                    </div>
                                    <div style={infoItem}>
                                        <label style={infoLabel}>Location</label>
                                        <div style={infoValue}>{profile?.city || profile?.state ? `${profile.city}, ${profile.state}` : 'Not Set'}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={tabCard}
                            >
                                <div style={tabHeader}>
                                    <h2 style={tabTitle}>Security & Password</h2>
                                </div>
                                <div style={securityRow}>
                                    <div style={securityInfo}>
                                        <h4 style={securityHeader}>Password</h4>
                                        <p style={securityDesc}>Last changed 3 months ago</p>
                                    </div>
                                    <button onClick={() => setShowPasswordModal(true)} style={outlineBtn}>Change Password</button>
                                </div>
                                <div style={securityRow}>
                                    <div style={securityInfo}>
                                        <h4 style={securityHeader}>Two-Factor Authentication</h4>
                                        <p style={securityDesc}>Secure your account with 2FA</p>
                                    </div>
                                    <button style={outlineBtn}>Enable</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Referral System - Always showing below for consistency */}
                    <div style={{ marginTop: '2rem' }}>
                        {user && <ReferralSystem userId={user.id} />}
                    </div>
                </section>
            </main>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay} onClick={() => setShowEditModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={modal} onClick={(e) => e.stopPropagation()}>
                            <div style={modalHeader}>
                                <h2 style={modalTitle}>Edit Personal Details</h2>
                                <button onClick={() => setShowEditModal(false)} style={closeBtn}><X size={20} /></button>
                            </div>
                            <div style={modalBody}>
                                <div style={formGrid}>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Full Name</label>
                                        <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={formInput} />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Gender</label>
                                        <select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} style={formInput}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Mobile Number</label>
                                        <input type="tel" value={editData.mobile} onChange={(e) => setEditData({ ...editData, mobile: e.target.value })} style={formInput} />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Alternate Phone</label>
                                        <input type="tel" value={editData.altPhone} onChange={(e) => setEditData({ ...editData, altPhone: e.target.value })} style={formInput} />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Date of Birth</label>
                                        <input type="date" value={editData.dob} onChange={(e) => setEditData({ ...editData, dob: e.target.value })} style={formInput} />
                                    </div>
                                </div>
                            </div>
                            <div style={modalFooter}>
                                <button onClick={() => setShowEditModal(false)} style={cancelBtn}>Discard</button>
                                <button onClick={handleEditProfile} style={saveBtn}><Save size={16} /> Save Changes</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Components
const NavButton = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            ...navBtn,
            background: active ? 'var(--primary)' : 'transparent',
            color: active ? 'white' : 'var(--text-main)',
            boxShadow: active ? '0 10px 20px rgba(236, 72, 153, 0.2)' : 'none'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {icon}
            <span>{label}</span>
        </div>
        <ChevronRight size={16} opacity={active ? 1 : 0.3} />
    </button>
);

// Styles
const container = { minHeight: '100vh', background: '#f8fafc', paddingBottom: '5rem' };
const heroSection = { height: '320px', background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)', position: 'relative' };
const heroOverlay = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'flex-end', paddingBottom: '3rem' };
const heroContent = { maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 clamp(1rem, 4vw, 2rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' };
const profileTop = { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' };
const avatarContainer = { position: 'relative' };
const avatarLarge = { width: '120px', height: '120px', borderRadius: '40px', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '4px solid rgba(255,255,255,0.8)' };
const tierBadge = { position: 'absolute', bottom: '-10px', right: '-10px', background: '#1e293b', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', border: '2px solid white' };
const profileMeta = { color: 'white' };
const heroName = { fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', fontWeight: 900, margin: 0, letterSpacing: '-1px' };
const heroEmail = { fontSize: '1.1rem', opacity: 0.9, marginTop: '0.25rem' };
const heroStats = { display: 'flex', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(15px)', borderRadius: '24px', padding: '1rem 1.25rem', gap: '1rem', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '1rem', flexWrap: 'wrap' };
const statItem = { display: 'flex', alignItems: 'center', gap: '1rem' };
const statDetails = { display: 'flex', flexDirection: 'column' };
const statValue = { color: 'white', fontSize: '1.25rem', fontWeight: 800 };
const statLabel = { color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' };
const statDivider = { width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' };

const mainContent = { maxWidth: '1200px', margin: '-2rem auto 0', padding: '0 clamp(1rem, 4vw, 2rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' };
const sideNav = { background: 'white', padding: '2rem', borderRadius: '32px', height: 'fit-content', boxShadow: '0 4px 30px rgba(0,0,0,0.03)', position: 'sticky', top: '2rem' };
const sectionLabel = { fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' };
const navList = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const navBtn = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '1rem 1.25rem', borderRadius: '16px', border: 'none', cursor: 'pointer', transition: '0.3s', fontWeight: 700, fontSize: '0.95rem' };
const logoutSection = { marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' };
const logoutBtn = { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: '#fef2f2', color: '#ef4444', border: 'none', padding: '1rem', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' };

const detailsSection = { display: 'flex', flexDirection: 'column' };
const tabCard = { background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 4px 30px rgba(0,0,0,0.03)' };
const tabHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' };
const tabTitle = { fontSize: '1.75rem', fontWeight: 900, color: '#1e293b' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem' };
const infoItem = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const infoLabel = { fontSize: '0.85rem', color: '#64748b', fontWeight: 700 };
const infoValue = { fontSize: '1.1rem', color: '#1e293b', fontWeight: 800 };
const actionBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fdf2f8', color: 'var(--primary)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' };

const securityRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid #f1f5f9' };
const securityInfo = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const securityHeader = { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' };
const securityDesc = { margin: 0, fontSize: '0.9rem', color: '#64748b' };
const outlineBtn = { background: 'none', border: '2px solid #e2e8f0', color: '#1e293b', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' };

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' };
const modal = { background: 'white', padding: '3rem', borderRadius: '32px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' };
const modalTitle = { fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' };
const modalBody = { marginBottom: '2.5rem' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' };
const formGroup = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const formLabel = { fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' };
const formInput = { padding: '1rem', borderRadius: '16px', border: '2px solid #e2e8f0', fontSize: '1rem', fontWeight: 600, transition: '0.2s', outline: 'none' };
const modalFooter = { display: 'flex', gap: '1rem' };
const cancelBtn = { flex: 1, padding: '1rem', borderRadius: '16px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 800, cursor: 'pointer' };
const saveBtn = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(236, 72, 153, 0.2)' };

export default MyProfile;



