// Notifications Center Component
import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import api from '../utils/api';

const NotificationCenter = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get(`/users/${userId}/notifications`);
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.isRead).length);
            } catch (__) {
                console.error('Failed to fetch notifications:', __);
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [userId]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            const res = await api.get(`/users/${userId}/notifications`);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (__) {
            console.error('Failed to mark as read:', __);
        }
    };

    const getIcon = (type) => {
        const icons = {
            'order_status': <CheckCircle size={18} />,
            'delivery_update': <AlertCircle size={18} />,
            'promotional': <Info size={18} />,
            'cart_reminder': <Bell size={18} />,
            'back_in_stock': <CheckCircle size={18} />
        };
        return icons[type] || <Info size={18} />;
    };

    return (
        <div style={container}>
            <button onClick={() => setIsOpen(!isOpen)} style={bellButton}>
                <Bell size={20} />
                {unreadCount > 0 && <span style={badge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div style={panel}>
                    <div style={header}>
                        <h3>Notifications</h3>
                        <button onClick={() => setIsOpen(false)} style={closeBtn}><X size={18} /></button>
                    </div>

                    {notifications.length === 0 ? (
                        <div style={empty}>No notifications</div>
                    ) : (
                        <div style={list}>
                            {notifications.map(n => (
                                <div
                                    key={n.id}
                                    style={{ ...notificationItem, background: n.isRead ? 'white' : '#F0F9FF' }}
                                    onClick={() => !n.isRead && markAsRead(n.id)}
                                >
                                    <div style={iconBox}>{getIcon(n.type)}</div>
                                    <div style={content}>
                                        <h4 style={notifTitle}>{n.title}</h4>
                                        <p style={notifMessage}>{n.message}</p>
                                        <small style={notifTime}>{new Date(n.createdAt).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const container = { position: 'relative', display: 'inline-block' };
const bellButton = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', position: 'relative' };
const badge = { position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' };
const panel = { position: 'absolute', top: '50px', right: '0', width: '350px', maxHeight: '500px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const header = { padding: '1rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' };
const empty = { padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' };
const list = { flex: 1, overflowY: 'auto', maxHeight: '400px' };
const notificationItem = { padding: '1rem', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '1rem', cursor: 'pointer', transition: 'background 0.2s' };
const iconBox = { flexShrink: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', borderRadius: '8px' };
const content = { flex: 1, minWidth: 0 };
const notifTitle = { margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700 };
const notifMessage = { margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 };
const notifTime = { color: '#9CA3AF', fontSize: '0.75rem' };

export default NotificationCenter;
