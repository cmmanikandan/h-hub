/**
 * Real-time Analytics Dashboard Component
 * Displays live metrics with auto-refresh
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package } from 'lucide-react';

const RealTimeAnalytics = ({ refreshInterval = 30000 }) => {
    const [metrics, setMetrics] = useState({
        activeUsers: 0,
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        trend: {
            users: 0,
            orders: 0,
            revenue: 0
        }
    });
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(() => {
            fetchMetrics();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refreshInterval]);

    const fetchMetrics = async () => {
        try {
            // Simulate API call - replace with actual endpoint
            const response = await fetch('/api/admin/realtime-metrics');
            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch real-time metrics:', error);
        }
    };

    const metricCards = [
        {
            title: 'Active Users',
            value: metrics.activeUsers,
            icon: Users,
            color: '#6366f1',
            trend: metrics.trend.users,
            suffix: 'online'
        },
        {
            title: 'Today\'s Orders',
            value: metrics.todayOrders,
            icon: ShoppingCart,
            color: '#10b981',
            trend: metrics.trend.orders,
            suffix: 'orders'
        },
        {
            title: 'Today\'s Revenue',
            value: `₹${metrics.todayRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: '#f59e0b',
            trend: metrics.trend.revenue,
            suffix: ''
        },
        {
            title: 'Pending Orders',
            value: metrics.pendingOrders,
            icon: Package,
            color: '#ec4899',
            trend: 0,
            suffix: 'pending'
        }
    ];

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Real-Time Analytics</h3>
                    <p style={subtitleStyle}>
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
                <div style={pulseContainerStyle}>
                    <div style={pulseStyle} />
                    <span style={liveTextStyle}>LIVE</span>
                </div>
            </div>

            <div style={gridStyle}>
                {metricCards.map((metric, index) => (
                    <div key={index} style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <div style={{ ...iconBoxStyle, background: `${metric.color}15` }}>
                                <metric.icon size={24} color={metric.color} />
                            </div>
                            {metric.trend !== 0 && (
                                <div style={trendBadgeStyle(metric.trend)}>
                                    {metric.trend > 0 ? (
                                        <TrendingUp size={14} />
                                    ) : (
                                        <TrendingDown size={14} />
                                    )}
                                    <span>{Math.abs(metric.trend)}%</span>
                                </div>
                            )}
                        </div>
                        <div style={cardBodyStyle}>
                            <h2 style={valueStyle}>{metric.value}</h2>
                            <p style={labelStyle}>{metric.title}</p>
                            {metric.suffix && (
                                <span style={suffixStyle}>{metric.suffix}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Styles
const containerStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
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

const subtitleStyle = {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0.25rem 0 0 0'
};

const pulseContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
};

const pulseStyle = {
    width: '8px',
    height: '8px',
    background: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
};

const liveTextStyle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: '1px'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
};

const cardStyle = {
    background: 'linear-gradient(135deg, #f8fafc 0%, #fff 100%)',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.3s'
};

const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
};

const iconBoxStyle = {
    padding: '0.75rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const trendBadgeStyle = (trend) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: trend > 0 ? '#dcfce7' : '#fee2e2',
    color: trend > 0 ? '#16a34a' : '#dc2626'
});

const cardBodyStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
};

const valueStyle = {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0
};

const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#64748b',
    margin: 0
};

const suffixStyle = {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '500'
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.5;
            transform: scale(1.2);
        }
    }
`;
document.head.appendChild(styleSheet);

export default RealTimeAnalytics;
