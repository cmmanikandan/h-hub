import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { MapPin, Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllStates, getDistrictsByState } from '../utils/indianStates';
import Toast from '../components/Toast';

const MyAddresses = () => {
    const { profile, setProfile, addAddress, updateAddress, deleteAddress } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [selectedForShipping, setSelectedForShipping] = useState(null);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [formData, setFormData] = useState({
        type: 'HOME',
        name: '',
        phone: '',
        address: '',
        state: '',
        district: '',
        pincode: '',
        default: false
    });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const openModal = (address = null) => {
        if (address) {
            setEditingAddress(address);
            setFormData(address);
        } else {
            setEditingAddress(null);
            setFormData({ type: 'HOME', name: '', phone: '', address: '', state: '', district: '', pincode: '', default: false });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (editingAddress) {
            const res = await updateAddress(editingAddress.id, formData);
            if (res.success) {
                showToast('success', 'Address updated successfully!');
            } else {
                showToast('error', 'Failed to update address');
            }
        } else {
            const res = await addAddress(formData);
            if (res.success) {
                showToast('success', 'Address added successfully!');
            } else {
                showToast('error', 'Failed to add address');
            }
        }
        setShowModal(false);
    };

    const handleDelete = async (id) => {
        const res = await deleteAddress(id);
        if (res.success) {
            if (selectedForShipping === id) {
                setSelectedForShipping(null);
            }
            showToast('success', 'Address deleted!');
        } else {
            showToast('error', 'Failed to delete address');
        }
    };

    const setDefault = async (id) => {
        const res = await updateAddress(id, { default: true });
        if (res.success) {
            showToast('success', 'Default address updated!');
        } else {
            showToast('error', 'Failed to set default address');
        }
    };

    const selectForShipping = (id) => {
        setSelectedForShipping(id);
        showToast('success', '✓ Address selected for shipping!');
    };

    return (
        <div style={container}>
            <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />

            <header style={header}>
                <h1 style={title}><MapPin size={28} /> My Addresses</h1>
                <button onClick={() => openModal()} style={addBtn}>
                    <Plus size={18} /> Add New Address
                </button>
            </header>

            <div style={addressGrid}>
                {(profile?.addresses || []).map((addr) => (
                    <div
                        key={addr.id}
                        style={{
                            ...addressCard,
                            border: selectedForShipping === addr.id ? '2px solid #10b981' : '1px solid var(--glass-border)',
                            background: selectedForShipping === addr.id ? 'rgba(16, 185, 129, 0.05)' : 'var(--glass)'
                        }}
                    >
                        <div style={addressHeader}>
                            <span style={addressType}>{addr.type}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {addr.default && <span style={defaultBadge}>Default</span>}
                                {selectedForShipping === addr.id && <span style={shippingBadge}>✓ Selected for Shipping</span>}
                            </div>
                        </div>
                        <div style={addressName}>{addr.name}</div>
                        <div style={addressText}>{addr.address}</div>
                        <div style={addressText}>{addr.district}, {addr.state} - {addr.pincode}</div>
                        <div style={addressPhone}>Phone: {addr.phone}</div>
                        <div style={addressActions}>
                            <button onClick={() => selectForShipping(addr.id)} style={selectedForShipping === addr.id ? selectedShippingBtn : shippingBtn}>
                                {selectedForShipping === addr.id ? '✓ Selected' : 'Select for Shipping'}
                            </button>
                        </div>
                        <div style={addressActions}>
                            <button onClick={() => openModal(addr)} style={editBtnSmall}><Edit3 size={14} /> Edit</button>
                            <button onClick={() => handleDelete(addr.id)} style={deleteBtnSmall}><Trash2 size={14} /> Delete</button>
                            {!addr.default && <button onClick={() => setDefault(addr.id)} style={defaultBtnSmall}>Set Default</button>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay} onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={modal} onClick={(e) => e.stopPropagation()}>
                            <div style={modalHeader}>
                                <h2 style={modalTitle}>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                                <button onClick={() => setShowModal(false)} style={closeBtn}><X size={20} /></button>
                            </div>
                            <div style={modalBody}>
                                <div style={formGrid}>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Address Type</label>
                                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={formInput}>
                                            <option value="HOME">Home</option>
                                            <option value="OFFICE">Office</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Full Name</label>
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={formInput} />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Phone Number</label>
                                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={formInput} />
                                    </div>
                                    <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
                                        <label style={formLabel}>Address</label>
                                        <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ ...formInput, minHeight: '80px' }} />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>State</label>
                                        <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value, district: '' })} style={formInput}>
                                            <option value="">Select State</option>
                                            {getAllStates().map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>District</label>
                                        <select value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} style={formInput} disabled={!formData.state}>
                                            <option value="">Select District</option>
                                            {formData.state && getDistrictsByState(formData.state).map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Pincode</label>
                                        <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} style={formInput} maxLength={6} />
                                    </div>
                                </div>
                                <div style={checkboxGroup}>
                                    <input type="checkbox" checked={formData.default} onChange={(e) => setFormData({ ...formData, default: e.target.checked })} id="default" />
                                    <label htmlFor="default" style={checkboxLabel}>Set as default address</label>
                                </div>
                            </div>
                            <div style={modalFooter}>
                                <button onClick={() => setShowModal(false)} style={cancelBtn}>Cancel</button>
                                <button onClick={handleSave} style={saveBtn}><Save size={16} /> Save Address</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem)' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' };
const title = { fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' };
const addBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' };
const addressGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' };
const addressCard = { background: 'var(--glass)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)' };
const addressHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' };
const addressType = { background: 'var(--primary)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 };
const defaultBadge = { background: '#dcfce7', color: '#166534', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 };
const shippingBadge = { background: '#d1fae5', color: '#065f46', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 };
const addressName = { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' };
const addressText = { fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.25rem' };
const addressPhone = { fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.75rem' };
const addressActions = { display: 'flex', gap: '0.5rem', marginTop: '1rem' };
const shippingBtn = { width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' };
const selectedShippingBtn = { width: '100%', background: '#059669', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' };
const editBtnSmall = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' };
const deleteBtnSmall = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' };
const defaultBtnSmall = { flex: 1, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' };
const modal = { background: 'var(--bg-main)', borderRadius: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' };
const modalTitle = { fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };
const modalBody = { padding: '1.5rem' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' };
const formGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const formLabel = { fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' };
const formInput = { padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass)', fontSize: '0.95rem', fontFamily: 'inherit' };
const checkboxGroup = { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' };
const checkboxLabel = { fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' };
const modalFooter = { display: 'flex', gap: '1rem', padding: '1.5rem', borderTop: '1px solid var(--glass-border)' };
const cancelBtn = { flex: 1, background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' };
const saveBtn = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' };

export default MyAddresses;
