/**
 * User Activity Timeline Component
 * Displays chronological user actions and system events
 */

import React, { useState, useEffect } from 'react';
import {
    Clock, User, ShoppingCart, Package, DollarSign,
    Settings, Shield, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

const ActivityTimeline = ({ userId = null, limit = 50 }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchActivities();
    }, [userId, filter]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const url = userId
                ? `/api/admin/activity/${userId}?filter=${filter}&limit=${limit}`
                : `/api/admin/activity?filter=${filter}&limit=${limit}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        const icons = {
            'user_login': User,
            'user_register': User,
            'order_placed': ShoppingCart,
            'order_delivered': Package,
            'payment_success': DollarSign,
            'payment_failed': XCircle,
            'profile_updated': Settings,
            'verification': Shield,
            'status_change': AlertCircle,
            'default': Clock
        };
        return icons[type] || icons.default;
    };

    const getActivityColor = (type) => {
        const colors = {
            'user_login': '#6366f1',
            'user_register': '#10b981',
            'order_placed': '#f59e0b',
            'order_delivered': '#10b981',
            'payment_success': '#10b981',
            'payment_failed': '#ef4444',
            'profile_updated': '#6366f1',
            'verification': '#8b5cf6',
            'status_change': '#f59e0b',
            'default': '#64748b'
        };
        return colors[type] || colors.default;
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return new Date(date).toLocaleDateString();
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h3 style={titleStyle}>Activity Timeline</h3>
                <div style={filterContainerStyle}>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={filterSelectStyle}
                    >
                        <option value="all">All Activities</option>
                        <option value="user">User Actions</option>
                        <option value="order">Orders</option>
                        <option value="payment">Payments</option>
                        <option value="system">System</option>
                    </select>
                </div>
            </div>

            <div style={timelineContainerStyle}>
                {loading ? (
                    <div style={loadingStyle}>Loading activities...</div>
                ) : activities.length === 0 ? (
                    <div style={emptyStyle}>No activities found</div>
                ) : (
                    <div style={timelineStyle}>
                        {activities.map((activity, index) => {
                            const Icon = getActivityIcon(activity.type);
                            const color = getActivityColor(activity.type);

                            return (
                                <div key={activity.id || index} style={activityItemStyle}>
                                    <div style={timelineLineStyle(index === activities.length - 1)} />
                                    <div style={{ ...iconContainerStyle, background: `${color}15` }}>
                                        <Icon size={18} color={color} />
                                    </div>
                                    <div style={contentStyle}>
                                        <div style={activityHeaderStyle}>
                                            <span style={actionTextStyle}>{activity.action}</span>
                                            <span style={timeTextStyle}>
                                                {formatTimeAgo(activity.createdAt)}
                                            </span>
                                        </div>
                                        {activity.details && (
                                            <p style={detailsTextStyle}>{activity.details}</p>
                                        )}
                                        {activity.metadata && (
                                            <div style={metadataStyle}>
                                                {Object.entries(activity.metadata).map(([key, value]) => (
                                                    <span key={key} style={metadataItemStyle}>
                                                        {key}: <strong>{value}</strong>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// Styles
const containerStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
};

const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
};

const filterContainerStyle = {
    display: 'flex',
    gap: '0.5rem'
};

const filterSelectStyle = {
    padding: '0.5rem 1rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#475569',
    cursor: 'pointer',
    outline: 'none'
};

const timelineContainerStyle = {
    maxHeight: '600px',
    overflowY: 'auto'
};

const timelineStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
};

const activityItemStyle = {
    display: 'grid',
    gridTemplateColumns: '2px 40px 1fr',
    gap: '1rem',
    position: 'relative'
};

const timelineLineStyle = (isLast) => ({
    width: '2px',
    background: isLast ? 'transparent' : '#e2e8f0',
    position: 'relative',
    left: '19px'
});

const iconContainerStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
};

const contentStyle = {
    paddingTop: '0.25rem'
};

const activityHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem'
};

const actionTextStyle = {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#1e293b'
};

const timeTextStyle = {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '500'
};

const detailsTextStyle = {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0 0 0.5rem 0',
    lineHeight: '1.5'
};

const metadataStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '0.5rem'
};

const metadataItemStyle = {
    fontSize: '0.75rem',
    color: '#64748b',
    background: '#f8fafc',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px'
};

const loadingStyle = {
    textAlign: 'center',
    padding: '3rem',
    color: '#94a3b8',
    fontSize: '0.875rem'
};

const emptyStyle = {
    textAlign: 'center',
    padding: '3rem',
    color: '#94a3b8',
    fontSize: '0.875rem'
};

export default ActivityTimeline;
