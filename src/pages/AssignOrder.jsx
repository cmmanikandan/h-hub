import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, MapPin, Truck, Package,
    Calendar, User, DollarSign, ArrowLeft,
    CheckCircle2, Clock, Smartphone, Navigation, Trash2
} from 'lucide-react';
import api from '../utils/api';
import StatusPopup from '../components/StatusPopup';

const AssignOrder = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [deliveryMen, setDeliveryMen] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Processing');
    const [filterCity, setFilterCity] = useState('All');
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
    const [dispatchNote, setDispatchNote] = useState('');
    const [stats, setStats] = useState({ pending: 0, activeRiders: 0, packed: 0 });
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, message, title, onAction });
    };

    const confirmAction = (msg, action, title = 'Confirm Action', type = 'confirm') => {
        showStatus(type, msg, title, () => {
            action();
            setPopup(prev => ({ ...prev, show: false }));
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, deliveryRes] = await Promise.all([
                api.get('/admin/orders'),
                api.get('/admin/delivery')
            ]);
            setOrders(ordersRes.data);
            setDeliveryMen(deliveryRes.data);

            // Calculate Stats
            setStats({
                pending: ordersRes.data.filter(o => o.status === 'Processing').length,
                packed: ordersRes.data.filter(o => o.status === 'Packed').length,
                activeRiders: deliveryRes.data.length // Mock active count
            });
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrderSelection = (id, e) => {
        e.stopPropagation();
        const newSet = new Set(selectedOrderIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedOrderIds(newSet);
    };

    const handleAssign = async (deliveryManId) => {
        const orderIdsToAssign = selectedOrderIds.size > 0 ? Array.from(selectedOrderIds) : (selectedOrder ? [selectedOrder.id] : []);
        if (orderIdsToAssign.length === 0) return;

        setAssigning(true);
        try {
            await Promise.all(orderIdsToAssign.map(async (oid) => {
                const order = orders.find(o => o.id === oid);
                const nextStatus = order.status === 'Processing' ? 'Packed' : order.status;
                return api.put(`/orders/${order.id}/status`, {
                    status: nextStatus,
                    deliveryManId: deliveryManId,
                    note: dispatchNote
                });
            }));

            // Mock saving note for now or if backend ignores it
            console.log("Dispatch Note:", dispatchNote);
            setDispatchNote('');

            showStatus('success', `Successfully assigned ${orderIdsToAssign.length} orders!`, 'Assigned');

            setOrders(prev => prev.map(o =>
                orderIdsToAssign.includes(o.id)
                    ? { ...o, deliveryManId: deliveryManId, status: o.status === 'Processing' ? 'Packed' : o.status }
                    : o
            ));

            setSelectedOrderIds(new Set());
            setSelectedOrder(null);
        } catch (error) {
            showStatus('failed', "Failed to assign order", 'Error');
        } finally {
            setAssigning(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedOrder) return;
        confirmAction("Are you sure you want to delete this order? This action cannot be undone.", async () => {
            try {
                await api.delete(`/orders/${selectedOrder.id}`);
                showStatus('success', "Order deleted successfully!", 'Deleted');
                setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
                setSelectedOrder(null);

                // Update stats logic or just re-fetch if needed, but local update is faster
                setStats(prev => ({
                    ...prev,
                    pending: selectedOrder.status === 'Processing' ? prev.pending - 1 : prev.pending,
                    packed: selectedOrder.status === 'Packed' ? prev.packed - 1 : prev.packed
                }));

            } catch (error) {
                console.error(error);
                showStatus('failed', "Failed to delete order", 'Error');
            }
        }, 'Delete Order', 'delete');
    };

    const handleAutoAssign = () => {
        if (!selectedOrder && selectedOrderIds.size === 0) return;

        // Simple strategy: Assign to first recommended rider for the 'primary' selected order
        // In real massive bulk, you'd distribute. Here we just pick best for one and assign all.
        const refOrder = selectedOrder || orders.find(o => o.id === Array.from(selectedOrderIds)[0]);
        const recommendations = getRecommendedRiders(refOrder);

        if (recommendations.length > 0) {
            handleAssign(recommendations[0].id);
        } else {
            showStatus('warning', "No available riders found for auto-assignment.", 'No Riders');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        const matchesCity = filterCity === 'All' || (order.address && order.address.includes(filterCity));
        return matchesSearch && matchesStatus && matchesCity;
    });

    // Extract unique cities from orders for filter
    const cities = ['All', ...new Set(orders.map(o => o.address?.split(',').pop()?.trim()).filter(Boolean))];

    const getRecommendedRiders = (order) => {
        if (!order) return [];
        // Simple recommendation logic based on City matching (mock "smart" logic)
        // In a real app, this would use geospatial distance
        const orderCity = order.address?.toLowerCase() || '';

        return deliveryMen.map(rider => {
            let score = 0;
            if (rider.city && orderCity.includes(rider.city.toLowerCase())) score += 50;
            // Random "Availability" score for demo
            score += Math.floor(Math.random() * 30);

            // Calculate Load
            const activeLoad = orders.filter(o => o.deliveryManId === rider.id && o.status !== 'Delivered').length;

            return { ...rider, matchScore: score, activeLoad };
        }).sort((a, b) => b.matchScore - a.matchScore);
    };

    const getTimeElapsed = (dateString) => {
        const diff = new Date() - new Date(dateString);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div style={container}>
            {/* Sidebar / Filter Panel */}
            <div style={sidebar}>
                <div style={header}>
                    <h1 style={title}>Dispatch Center</h1>
                </div>

                <div style={searchBox}>
                    <Search size={18} color="#64748b" />
                    <input
                        style={input}
                        placeholder="Search IDs..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select
                        style={citySelect}
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                    >
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div style={filterTabs}>
                    {['Processing', 'Packed', 'Shipped', 'All'].map(status => (
                        <button
                            key={status}
                            style={status === filterStatus ? activeTab : tab}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '0 1rem 1rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                    <div style={statCard}>
                        <div style={statVal}>{stats.pending}</div>
                        <div style={statLabel}>Pending</div>
                    </div>
                    <div style={statCard}>
                        <div style={statVal}>{stats.packed}</div>
                        <div style={statLabel}>Packed</div>
                    </div>
                    <div style={statCard}>
                        <div style={statVal}>{stats.activeRiders}</div>
                        <div style={statLabel}>Riders</div>
                    </div>
                </div>

                <div style={ordersList}>
                    {loading ? (
                        <div style={centerMsg}>Loading Orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div style={centerMsg}>No orders found.</div>
                    ) : (
                        filteredOrders.map(order => (
                            <div
                                key={order.id}
                                style={selectedOrder?.id === order.id ? activeCard : card}
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div style={cardHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrderIds.has(order.id)}
                                            onChange={(e) => toggleOrderSelection(order.id, e)}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <span style={orderId}>#{order.id.slice(0, 8)}</span>
                                    </div>
                                    <span style={price}>₹{order.totalAmount}</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Clock size={10} /> {getTimeElapsed(order.createdAt)}
                                </div>
                                <div style={cardRow}>
                                    <User size={14} /> <span>{order.user?.name || 'Guest'}</span>
                                </div>
                                <div style={cardRow}>
                                    <MapPin size={14} /> <span style={truncate}>{order.address}</span>
                                </div>
                                <div style={statusBadge(order.status)}>
                                    {order.status}
                                </div>
                                {order.isExpress && (
                                    <div style={expressBadge}>⚡ Express</div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div style={main}>
                {selectedOrder ? (
                    <div style={detailView}>
                        <div style={topBar}>
                            <div>
                                <h2 style={detailTitle}>Order Assignment</h2>
                                <p style={detailSub}>Match best delivery partner for Order #{selectedOrder.id.slice(0, 8)}</p>
                            </div>
                            <div style={orderMeta}>
                                <button onClick={handleDelete} style={{ ...metaItem, background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer' }}>
                                    <Trash2 size={16} /> Delete
                                </button>
                                <div style={metaItem}>
                                    <Calendar size={16} />
                                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                                </div>
                                <div style={metaItem}>
                                    <Package size={16} />
                                    {selectedOrder.quantity} Items
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline (New) */}
                        <div style={timelineBar}>
                            {['Order Placed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((s, i) => {
                                const isCompleted = ['Order Placed', 'Processing', 'Packed', 'Shipped', 'Delivered'].indexOf(selectedOrder.status) >= i;
                                return (
                                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isCompleted ? 1 : 0.4 }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCompleted ? '#10b981' : '#cbd5e1' }}></div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{s}</span>
                                        {i < 4 && <div style={{ width: '20px', height: '1px', background: '#e2e8f0' }}></div>}
                                    </div>
                                )
                            })}
                        </div>

                        <div style={contentGrid}>
                            {/* Order Info */}
                            <div style={infoPanel}>
                                <h3 style={sectionTitle}>Product Details</h3>
                                <div style={productBox}>
                                    <div style={prodImgWrapper}>
                                        <img
                                            src={selectedOrder.productImage || 'https://via.placeholder.com/100'}
                                            alt={selectedOrder.productName}
                                            style={prodImg}
                                        />
                                    </div>
                                    <div style={prodInfo}>
                                        <div style={prodName}>{selectedOrder.productName}</div>
                                        <div style={prodMeta}>Qty: {selectedOrder.quantity} • ₹{selectedOrder.totalAmount}</div>
                                        <div style={prodTag}>{selectedOrder.paymentMethod}</div>
                                    </div>
                                </div>

                                <h3 style={sectionTitle}>Shipping & Destination</h3>
                                <div style={mapContainer}>
                                    <iframe
                                        title="Delivery Location"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0, borderRadius: '16px', opacity: 0.8 }}
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedOrder.address + ', India')}&t=m&z=14&output=embed&iwloc=near`}
                                        allowFullScreen
                                    ></iframe>
                                    <div style={addressOverlay}>
                                        <MapPin size={16} color="#ef4444" style={{ marginRight: '0.5rem' }} />
                                        {selectedOrder.address}
                                    </div>
                                </div>

                                <div style={customerBox}>
                                    <div style={avatar}>{selectedOrder.user?.name?.[0] || 'U'}</div>
                                    <div>
                                        <div style={custName}>{selectedOrder.user?.name}</div>
                                        <div style={custContact}>{selectedOrder.user?.phone}</div>
                                    </div>
                                    <button style={callBtn}><Smartphone size={16} /></button>
                                </div>

                                <div style={{ marginTop: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dispatch Instruction</h4>
                                    <textarea
                                        style={noteInput}
                                        placeholder="Add note for delivery partner (e.g. 'Handle with care')"
                                        value={dispatchNote}
                                        onChange={(e) => setDispatchNote(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div style={riderPanel}>
                                {selectedOrderIds.size > 0 && (
                                    <div style={{ marginBottom: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe', color: '#1e40af', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle2 size={16} />
                                        Assigning {selectedOrderIds.size} selected orders together
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Recommended Partners</h3>
                                    <button onClick={handleAutoAssign} style={autoAssignBtn}>
                                        ⚡ Auto Assign
                                    </button>
                                </div>
                                <div style={ridersList}>
                                    {getRecommendedRiders(selectedOrder).map(rider => (
                                        <div key={rider.id} style={riderCard}>
                                            <div style={riderInfo}>
                                                <div style={riderAvatar}>
                                                    {rider.name[0]}
                                                    <div style={{
                                                        position: 'absolute', bottom: -2, right: -2, width: 10, height: 10,
                                                        borderRadius: '50%', border: '2px solid #fff',
                                                        background: rider.isOnline ? '#22c55e' : '#cbd5e1' // Mock status
                                                    }}></div>
                                                </div>
                                                <div>
                                                    <div style={riderName}>{rider.name}</div>
                                                    <div style={riderDetail}>
                                                        <MapPin size={12} /> {rider.city || 'Unknown City'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: rider.activeLoad > 2 ? '#ef4444' : '#10b981', fontWeight: 600, marginTop: '2px' }}>
                                                        • {rider.activeLoad} Active Runs
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={matchBadge(rider.matchScore)}>
                                                {rider.matchScore}% Match
                                            </div>

                                            <button
                                                onClick={() => handleAssign(rider.id)}
                                                disabled={assigning || selectedOrder.deliveryManId === rider.id}
                                                style={selectedOrder.deliveryManId === rider.id ? assignedBtn : assignBtn}
                                            >
                                                {selectedOrder.deliveryManId === rider.id ? 'Assigned' : 'Assign'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={emptyState}>
                        <div style={emptyIcon}><Navigation size={64} /></div>
                        <h2>Select an Order to Dispatch</h2>
                        <p>Choose a pending order from the list to assign a delivery partner.</p>
                    </div>
                )}
            </div>
            <StatusPopup
                show={popup.show}
                type={popup.type}
                title={popup.title}
                message={popup.message}
                onAction={popup.onAction}
                onClose={() => setPopup(prev => ({ ...prev, show: false }))}
            />
        </div >
    );
};

// Styles
const container = { display: 'flex', height: '100%', background: '#f8fafc', overflow: 'hidden' };
const sidebar = { width: '400px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const main = { flex: 1, overflow: 'auto' };

const header = { padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' };
const backBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', '&:hover': { background: '#f1f5f9' } };
const title = { fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 };

const searchBox = { margin: '1rem', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const input = { border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: '0.9rem' };

const filterTabs = { display: 'flex', gap: '0.5rem', padding: '0 1rem 1rem', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' };
const tab = { padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' };
const activeTab = { ...tab, background: '#0f172a', color: '#fff', borderColor: '#0f172a' };

const ordersList = { flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' };
const card = { padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', transition: 'all 0.2s' };
const activeCard = { ...card, borderColor: '#6366f1', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)' };

const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 };
const orderId = { color: '#0f172a' };
const price = { color: '#10b981' };

const cardRow = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' };
const truncate = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '25ch' };

const statusBadge = (s) => ({
    display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
    background: s === 'Processing' ? '#fff7ed' : s === 'Packed' ? '#eff6ff' : '#f0fdf4',
    color: s === 'Processing' ? '#c2410c' : s === 'Packed' ? '#1d4ed8' : '#15803d',
    marginTop: '0.5rem'
});
const expressBadge = { display: 'inline-block', marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#d97706', background: '#fffbeb', padding: '0.25rem 0.5rem', borderRadius: '6px' };

const centerMsg = { textAlign: 'center', padding: '3rem', color: '#94a3b8' };

// Detail View Styles
const detailView = { height: '100%', display: 'flex', flexDirection: 'column' };
const topBar = { padding: '2rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const detailTitle = { fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' };
const detailSub = { color: '#64748b' };
const orderMeta = { display: 'flex', gap: '1rem' };
const metaItem = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px' };

const contentGrid = { flex: 1, display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '2rem', padding: '2rem', overflowY: 'auto' };

const infoPanel = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const sectionTitle = { fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' };

const mapContainer = { height: '300px', background: '#e2e8f0', borderRadius: '16px', overflow: 'hidden', position: 'relative', marginBottom: '1.5rem', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)' };
const addressOverlay = { position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', background: 'rgba(255,255,255,0.95)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center' };

const customerBox = { background: '#fff', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' };
const avatar = { width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' };
const custName = { fontWeight: 700, color: '#0f172a' };
const custContact = { fontSize: '0.85rem', color: '#64748b' };
const callBtn = { marginLeft: 'auto', width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const noteInput = { width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'none', background: '#f8fafc' };

const productBox = { background: '#fff', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' };
const prodImgWrapper = { width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0' };
const prodImg = { width: '100%', height: '100%', objectFit: 'cover' };
const prodInfo = { display: 'flex', flexDirection: 'column', gap: '0.2rem' };
const prodName = { fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' };
const prodMeta = { fontSize: '0.85rem', color: '#64748b' };
const prodTag = { fontSize: '0.7rem', fontWeight: 700, background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', color: '#475569', marginTop: '0.2rem' };

const riderPanel = { display: 'flex', flexDirection: 'column' };
const ridersList = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const riderCard = { background: '#fff', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' };
const riderInfo = { display: 'flex', alignItems: 'center', gap: '1rem' };
const riderAvatar = { width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 };
const riderName = { fontWeight: 700, fontSize: '0.95rem' };
const riderDetail = { fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' };

const matchBadge = (score) => ({
    padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
    background: score > 60 ? '#f0fdf4' : '#fff7ed',
    color: score > 60 ? '#16a34a' : '#ea580c'
});

const assignBtn = { padding: '0.6rem 1.25rem', borderRadius: '10px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' };
const assignedBtn = { ...assignBtn, background: '#cbd5e1', cursor: 'default' };
const autoAssignBtn = { padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' };

const citySelect = { padding: '0.5rem', borderRadius: '8px', border: 'none', background: '#f1f5f9', fontSize: '0.8rem', fontWeight: 600, color: '#475569', outline: 'none', maxWidth: '100px' };
const timelineBar = { display: 'flex', padding: '0 2rem 1.5rem', borderBottom: '1px solid #f1f5f9', gap: '0.5rem', overflowX: 'auto' };

const statCard = { minWidth: '80px', padding: '0.75rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const statVal = { fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' };
const statLabel = { fontSize: '0.7rem', color: '#64748b', fontWeight: 600 };

const emptyState = { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' };
const emptyIcon = { marginBottom: '1.5rem', color: '#e2e8f0' };

export default AssignOrder;
