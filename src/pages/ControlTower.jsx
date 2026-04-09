import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, Clock, Users, Truck, TrendingUp, Zap, Home } from 'lucide-react';
import api from '../utils/api';

const ControlTower = () => {
    const [activeTab, setActiveTab] = useState('map');
    const [orders, setOrders] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [riders, setRiders] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [slaTimers, setSlaTimers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchControlTowerData();
        const interval = setInterval(fetchControlTowerData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchControlTowerData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [mapData, hubStatus, riderStatus, slaTimersData, alertsData] = await Promise.all([
                api.get('/api/logix/control-tower/map', { headers }).catch(() => ({ data: [] })),
                api.get('/api/logix/control-tower/hub-status', { headers }).catch(() => ({ data: [] })),
                api.get('/api/logix/control-tower/rider-status', { headers }).catch(() => ({ data: [] })),
                api.get('/api/logix/control-tower/sla-timers', { headers }).catch(() => ({ data: [] })),
                api.get('/api/logix/control-tower/alerts', { headers }).catch(() => ({ data: { alerts: [] } }))
            ]);

            setOrders(mapData.data || []);
            setHubs(hubStatus.data || []);
            setRiders(riderStatus.data || []);
            setAlerts(alertsData.data?.alerts || []);
            setSlaTimers(slaTimersData.data || []);
        } catch (error) {
            console.error('Failed to fetch control tower data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Delivered': '#10b981',
            'Shipped': '#f59e0b',
            'Processing': '#3b82f6',
            'Cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getCongestionColor = (level) => {
        const colors = { 'Low': '#10b981', 'Medium': '#f59e0b', 'High': '#ef4444', 'Critical': '#991b1b' };
        return colors[level] || '#6b7280';
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}>🎯 Control Tower</h1>
                <p style={subtitle}>Real-time logistics operations dashboard</p>
            </header>

            {/* Alert Cards */}
            <div style={alertGrid}>
                {alerts.map((alert, i) => (
                    <div key={i} style={{ ...alertCard, borderLeft: `4px solid ${alert.severity === 'high' ? '#ef4444' : '#f59e0b'}` }}>
                        <AlertCircle size={20} color={alert.severity === 'high' ? '#ef4444' : '#f59e0b'} />
                        <div style={{ marginLeft: '1rem', flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{alert.type}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{alert.count} incidents</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div style={tabs}>
                {[
                    { id: 'map', label: '🗺️ Live Map', icon: MapPin },
                    { id: 'hubs', label: '🏢 Hub Status', icon: Home },
                    { id: 'riders', label: '🚴 Riders', icon: Users },
                    { id: 'sla', label: '⏱️ SLA Timers', icon: Clock }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            ...tabBtn,
                            background: activeTab === tab.id ? 'var(--primary)' : 'var(--glass)',
                            color: activeTab === tab.id ? 'white' : 'var(--text-main)'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    Loading live data...
                </div>
            ) : (
                <>
                    {/* Live Map */}
                    {activeTab === 'map' && (
                        <div style={section}>
                            <h2 style={sectionTitle}>Active Deliveries</h2>
                            <div style={grid}>
                                {orders.slice(0, 6).map(order => (
                                    <div key={order.id} style={card}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div>
                                                <div style={cardTitle}>Order #{order.id.slice(0, 8)}</div>
                                                <div style={cardMeta}>{order.productName}</div>
                                            </div>
                                            <div style={{ ...statusBadge, background: getStatusColor(order.status), color: 'white' }}>
                                                {order.status}
                                            </div>
                                        </div>
                                        {order.latitude && (
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                📍 {order.latitude.toFixed(4)}, {order.longitude.toFixed(4)}
                                                {order.speed && <div>Speed: {order.speed} km/h</div>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hub Status */}
                    {activeTab === 'hubs' && (
                        <div style={section}>
                            <h2 style={sectionTitle}>Hub Congestion Status</h2>
                            <div style={grid}>
                                {hubs.map(hub => (
                                    <div key={hub.id} style={card}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={cardTitle}>Hub {hub.hubId.slice(0, 8)}</div>
                                            <div style={{ ...statusBadge, background: getCongestionColor(hub.congestionLevel) }}>
                                                {hub.congestionLevel} Load
                                            </div>
                                        </div>
                                        <div style={metricRow}>
                                            <span>📦 Active Orders:</span>
                                            <span style={metricValue}>{hub.activeOrders}</span>
                                        </div>
                                        <div style={metricRow}>
                                            <span>⏳ Pending Pickup:</span>
                                            <span style={metricValue}>{hub.pendingPickup}</span>
                                        </div>
                                        <div style={metricRow}>
                                            <span>↩️ Pending Return:</span>
                                            <span style={metricValue}>{hub.pendingReturn}</span>
                                        </div>
                                        <div style={{ ...progressBar, marginTop: '1rem' }}>
                                            <div style={{ ...progressFill, width: `${(hub.currentLoad / hub.maxCapacity) * 100}%` }} />
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                            {hub.currentLoad} / {hub.maxCapacity} kg
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Riders */}
                    {activeTab === 'riders' && (
                        <div style={section}>
                            <h2 style={sectionTitle}>Active Riders</h2>
                            <div style={grid}>
                                {riders.map(rider => (
                                    <div key={rider.id} style={card}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={cardTitle}>Rider {rider.id.slice(0, 8)}</div>
                                            <div style={{ ...statusBadge, background: rider.isOnDuty ? '#10b981' : '#9ca3af' }}>
                                                {rider.isOnDuty ? '🟢 On Duty' : '⚪ Off Duty'}
                                            </div>
                                        </div>
                                        <div style={metricRow}>
                                            <span>📦 Orders:</span>
                                            <span style={metricValue}>{rider.activeOrderCount}</span>
                                        </div>
                                        <div style={metricRow}>
                                            <span>⚖️ Load:</span>
                                            <span style={metricValue}>{rider.currentLoad} kg</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '1rem' }}>
                                            Capacity: {rider.currentLoad} / {rider.maxCapacity} kg
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SLA Timers */}
                    {activeTab === 'sla' && (
                        <div style={section}>
                            <h2 style={sectionTitle}>⚠️ SLA Breaches & At-Risk Orders</h2>
                            {slaTimers.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    ✅ All orders on track - no SLA breaches!
                                </div>
                            ) : (
                                <div style={grid}>
                                    {slaTimers.map(order => (
                                        <div key={order.id} style={{ ...card, borderLeft: '4px solid #ef4444' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={cardTitle}>Order #{order.id.slice(0, 8)}</div>
                                                <div style={cardMeta}>{order.productName}</div>
                                            </div>
                                            <div style={{ ...alertBox, background: '#fef2f2' }}>
                                                <AlertCircle size={16} color="#ef4444" />
                                                <div style={{ marginLeft: '0.5rem' }}>
                                                    <div style={{ fontWeight: 700, color: '#991b1b' }}>SLA Breached</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>
                                                        {order.delayMinutes} minutes late
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Styles
const container = { maxWidth: '1400px', margin: '0 auto', padding: '2rem' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, margin: 0 };
const subtitle = { color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' };
const alertGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const alertCard = { display: 'flex', alignItems: 'center', background: 'var(--glass)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' };
const tabs = { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' };
const tabBtn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' };
const section = { background: 'var(--glass)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '2rem' };
const sectionTitle = { fontSize: '1.3rem', fontWeight: 900, marginBottom: '1.5rem', margin: 0 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' };
const card = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const cardTitle = { fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' };
const cardMeta = { fontSize: '0.85rem', color: '#6b7280' };
const statusBadge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 };
const metricRow = { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', margin: '0.5rem 0' };
const metricValue = { fontWeight: 700, color: 'var(--primary)' };
const progressBar = { width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' };
const progressFill = { height: '100%', background: 'var(--primary)', transition: 'width 0.3s' };
const alertBox = { display: 'flex', alignItems: 'center', padding: '1rem', borderRadius: '8px', marginTop: '1rem' };

export default ControlTower;
