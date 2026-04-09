import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, DollarSign, PieChart, Target, Zap } from 'lucide-react';
import api from '../utils/api';

const FinanceIntelligence = () => {
    const [finance] = useState({
        totalGrossSales: 4250000,
        totalCOGS: 2125000,
        totalCharges: 425000,
        netProfit: 1700000,
        profitMargin: 40,
        avgOrderValue: 5200,
        settlementDue: 890000,
        lastSettlement: '2025-02-06'
    });

    const [settlements, setSettlements] = useState([
        { id: 'STL001', cycle: 'Feb 1-7, 2025', status: 'completed', totalAmount: 1250000, processedDate: '2025-02-08', vendors: 45, orders: 235 },
        { id: 'STL002', cycle: 'Jan 25-31, 2025', status: 'completed', totalAmount: 1180000, processedDate: '2025-02-01', vendors: 43, orders: 220 },
        { id: 'STL003', cycle: 'Jan 18-24, 2025', status: 'completed', totalAmount: 1320000, processedDate: '2025-01-25', vendors: 48, orders: 245 },
        { id: 'STL004', cycle: 'Current (Feb 8+)', status: 'pending', totalAmount: 890000, processedDate: null, vendors: 42, orders: 167 }
    ]);

    const [profitAnalysis] = useState([
        { category: 'Electronics', grossSales: 1200000, cogs: 600000, charges: 120000, profit: 480000, margin: 40 },
        { category: 'Fashion', grossSales: 950000, cogs: 475000, charges: 95000, profit: 380000, margin: 40 },
        { category: 'Home & Kitchen', grossSales: 750000, cogs: 315000, charges: 75000, profit: 360000, margin: 48 },
        { category: 'Books & Media', grossSales: 350000, cogs: 140000, charges: 35000, profit: 175000, margin: 50 }
    ]);

    const [incentives] = useState([
        { id: 'INC001', type: 'Speed Incentive', amount: 45000, period: 'Feb 2025', description: 'Deliveries > 100/day' },
        { id: 'INC002', type: 'Rating Bonus', amount: 28000, period: 'Feb 2025', description: '4.5+ star ratings' },
        { id: 'INC003', type: 'Performance', amount: 35000, period: 'Feb 2025', description: 'Zero cancellation bonus' }
    ]);

    const [penalties] = useState([
        { id: 'PEN001', type: 'SLA Breach', amount: -12000, period: 'Feb 2025', description: 'Late deliveries penalty' },
        { id: 'PEN002', type: 'COD Variance', amount: -8500, period: 'Feb 2025', description: 'High absence rate' },
        { id: 'PEN003', type: 'Dispute Loss', amount: -5200, period: 'Feb 2025', description: 'Customer compensation' }
    ]);

    const [selectedTab, setSelectedTab] = useState('overview');
    const [showSettlementForm, setShowSettlementForm] = useState(false);
    const [newSettlement, setNewSettlement] = useState({ cycleName: '', startDate: '', endDate: '' });

    const fetchFinanceData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await api.get('/api/admin/finance/settlement/list', { headers });
            if (res.data) {
                setSettlements(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch finance data:', err);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchFinanceData();
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [fetchFinanceData]);

    const handleCreateSettlement = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.post('/api/admin/finance/settlement/create', newSettlement, { headers });
            alert('✅ Settlement created');
            setShowSettlementForm(false);
            fetchFinanceData();
        } catch (err) {
            console.error('Failed to create settlement:', err);
            alert('❌ Failed to create settlement');
        }
    };

    const getStatusColor = (status) => {
        return status === 'completed' ? '#10b981' : '#f59e0b';
    };

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}>💰 Finance Intelligence</h1>
                <p style={subtitle}>Manage settlements, analyze profits, and track financials</p>
            </header>

            {/* Key Metrics */}
            <div style={metricsGrid}>
                <div style={{ ...metricCard, borderLeft: '4px solid #10b981' }}>
                    <div style={metricLabel}>Gross Sales</div>
                    <div style={metricValue}>₹{(finance.totalGrossSales / 100000).toFixed(1)}L</div>
                    <div style={metricMeta}>↑ +12% vs last month</div>
                </div>
                <div style={{ ...metricCard, borderLeft: '4px solid #f59e0b' }}>
                    <div style={metricLabel}>Total Charges</div>
                    <div style={metricValue}>₹{(finance.totalCharges / 10000).toFixed(1)}K</div>
                    <div style={metricMeta}>Logistics + Fees</div>
                </div>
                <div style={{ ...metricCard, borderLeft: '4px solid #3b82f6' }}>
                    <div style={metricLabel}>Net Profit</div>
                    <div style={metricValue}>₹{(finance.netProfit / 100000).toFixed(1)}L</div>
                    <div style={metricMeta}>{finance.profitMargin}% margin</div>
                </div>
                <div style={{ ...metricCard, borderLeft: '4px solid #8b5cf6' }}>
                    <div style={metricLabel}>Settlement Due</div>
                    <div style={metricValue}>₹{(finance.settlementDue / 10000).toFixed(1)}K</div>
                    <div style={metricMeta}>Next cycle</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={tabsBar}>
                {['overview', 'settlements', 'profit', 'incentives'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        style={{
                            ...tabBtn,
                            borderBottom: selectedTab === tab ? '3px solid var(--primary)' : 'none',
                            color: selectedTab === tab ? 'var(--primary)' : '#6b7280'
                        }}
                    >
                        {tab === 'overview' && '📊 Overview'}
                        {tab === 'settlements' && '🏦 Settlements'}
                        {tab === 'profit' && '📈 Profit Analysis'}
                        {tab === 'incentives' && '🎁 Incentives & Penalties'}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {selectedTab === 'overview' && (
                <div>
                    {/* Profit Breakdown */}
                    <h2 style={sectionTitle}>Profit Distribution</h2>
                    <div style={breakdownGrid}>
                        <div style={{ ...breakdownCard, borderLeft: '4px solid #10b981' }}>
                            <div style={breakdownLabel}>COGS (Cost of Goods)</div>
                            <div style={breakdownValue}>₹{(finance.totalCOGS / 100000).toFixed(1)}L</div>
                            <div style={breakdownPercent}>{((finance.totalCOGS / finance.totalGrossSales) * 100).toFixed(1)}%</div>
                        </div>
                        <div style={{ ...breakdownCard, borderLeft: '4px solid #f59e0b' }}>
                            <div style={breakdownLabel}>Operational Charges</div>
                            <div style={breakdownValue}>₹{(finance.totalCharges / 10000).toFixed(1)}K</div>
                            <div style={breakdownPercent}>{((finance.totalCharges / finance.totalGrossSales) * 100).toFixed(1)}%</div>
                        </div>
                        <div style={{ ...breakdownCard, borderLeft: '4px solid #3b82f6' }}>
                            <div style={breakdownLabel}>Net Profit</div>
                            <div style={breakdownValue}>₹{(finance.netProfit / 100000).toFixed(1)}L</div>
                            <div style={{ ...breakdownPercent, color: '#10b981' }}>{((finance.netProfit / finance.totalGrossSales) * 100).toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* Monthly Revenue Chart */}
                    <h2 style={sectionTitle}>Monthly Revenue Trend</h2>
                    <div style={chartCard}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '250px', justifyContent: 'space-around' }}>
                            {[
                                { month: 'Jul', sales: 3200 },
                                { month: 'Aug', sales: 3500 },
                                { month: 'Sep', sales: 3800 },
                                { month: 'Oct', sales: 4100 },
                                { month: 'Nov', sales: 4050 },
                                { month: 'Dec', sales: 4400 },
                                { month: 'Jan', sales: 4250 }
                            ].map((data, i) => (
                                <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                                    <div
                                        style={{
                                            height: (data.sales / 5000 * 200) + 'px',
                                            background: 'linear-gradient(to top, #3b82f6, #93c5fd)',
                                            borderRadius: '4px',
                                            marginBottom: '0.5rem'
                                        }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{data.month}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3b82f6', marginTop: '0.25rem' }}>₹{data.sales}K</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Settlements Tab */}
            {selectedTab === 'settlements' && (
                <div>
                    <button onClick={() => setShowSettlementForm(!showSettlementForm)} style={{ ...addBtn, marginBottom: '1.5rem' }}>
                        + Create New Settlement Cycle
                    </button>

                    {showSettlementForm && (
                        <div style={{ ...settlementFormCard, marginBottom: '2rem' }}>
                            <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>New Settlement Cycle</h3>
                            <div style={formGrid}>
                                <div>
                                    <label style={label}>Cycle Name</label>
                                    <input
                                        type="text"
                                        value={newSettlement.cycleName}
                                        onChange={e => setNewSettlement({ ...newSettlement, cycleName: e.target.value })}
                                        style={input}
                                        placeholder="e.g., Feb 8-14, 2025"
                                    />
                                </div>
                                <div>
                                    <label style={label}>Start Date</label>
                                    <input
                                        type="date"
                                        value={newSettlement.startDate}
                                        onChange={e => setNewSettlement({ ...newSettlement, startDate: e.target.value })}
                                        style={input}
                                    />
                                </div>
                                <div>
                                    <label style={label}>End Date</label>
                                    <input
                                        type="date"
                                        value={newSettlement.endDate}
                                        onChange={e => setNewSettlement({ ...newSettlement, endDate: e.target.value })}
                                        style={input}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={handleCreateSettlement} style={{ ...actionBtn, background: '#10b981' }}>
                                    ✓ Create
                                </button>
                                <button onClick={() => setShowSettlementForm(false)} style={{ ...actionBtn, background: '#6b7280' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <h2 style={sectionTitle}>Settlement Cycles</h2>
                    <div style={settlementGrid}>
                        {settlements.map(settlement => (
                            <div
                                key={settlement.id}
                                style={{
                                    ...settlementCard,
                                    borderLeft: `4px solid ${getStatusColor(settlement.status)}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 800 }}>{settlement.cycle}</h4>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                            {settlement.vendors} vendors • {settlement.orders} orders
                                        </div>
                                    </div>
                                    <span style={{ ...statusBadge, background: getStatusColor(settlement.status), color: 'white' }}>
                                        {settlement.status.toUpperCase()}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <div style={settlementAmount}>₹{(settlement.totalAmount / 100000).toFixed(2)}L</div>
                                    <div style={settlementMeta}>Total settlement amount</div>
                                </div>

                                {settlement.processedDate && (
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        Processed: {new Date(settlement.processedDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Profit Analysis Tab */}
            {selectedTab === 'profit' && (
                <div>
                    <h2 style={sectionTitle}>Category-wise Profit Analysis</h2>
                    <div style={profitTableContainer}>
                        <div style={profitTableHeader}>
                            <div style={profitHeaderCell}>Category</div>
                            <div style={profitHeaderCell}>Gross Sales</div>
                            <div style={profitHeaderCell}>COGS</div>
                            <div style={profitHeaderCell}>Charges</div>
                            <div style={profitHeaderCell}>Profit</div>
                            <div style={profitHeaderCell}>Margin</div>
                        </div>

                        {profitAnalysis.map((cat, i) => (
                            <div key={i} style={profitTableRow}>
                                <div style={profitCell}>{cat.category}</div>
                                <div style={profitCell}>₹{(cat.grossSales / 10000).toFixed(0)}K</div>
                                <div style={profitCell}>₹{(cat.cogs / 10000).toFixed(0)}K</div>
                                <div style={profitCell}>₹{(cat.charges / 10000).toFixed(0)}K</div>
                                <div style={{ ...profitCell, fontWeight: 700, color: '#10b981' }}>₹{(cat.profit / 10000).toFixed(0)}K</div>
                                <div style={profitCell}>
                                    <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.25rem' }}>
                                        <div style={{ background: '#10b981', height: '100%', width: cat.margin + '%' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{cat.margin}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Incentives Tab */}
            {selectedTab === 'incentives' && (
                <div style={twoColumnLayout}>
                    {/* Incentives */}
                    <div>
                        <h2 style={sectionTitle}>Incentives Given</h2>
                        <div style={incentivesList}>
                            {incentives.map(inc => (
                                <div key={inc.id} style={{ ...incentiveItem, borderLeft: '4px solid #10b981' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 800 }}>{inc.type}</span>
                                        <span style={{ fontWeight: 900, color: '#10b981' }}>+ ₹{(inc.amount / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                        {inc.description}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{inc.period}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ ...totalBox, background: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
                            <div style={{ fontWeight: 700 }}>Total Incentives</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>
                                ₹{(incentives.reduce((sum, i) => sum + i.amount, 0) / 1000).toFixed(0)}K
                            </div>
                        </div>
                    </div>

                    {/* Penalties */}
                    <div>
                        <h2 style={sectionTitle}>Penalties Applied</h2>
                        <div style={penaltiesList}>
                            {penalties.map(pen => (
                                <div key={pen.id} style={{ ...penaltyItem, borderLeft: '4px solid #ef4444' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 800 }}>{pen.type}</span>
                                        <span style={{ fontWeight: 900, color: '#ef4444' }}>- ₹{Math.abs(pen.amount / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                        {pen.description}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{pen.period}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ ...totalBox, background: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
                            <div style={{ fontWeight: 700 }}>Total Penalties</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>
                                - ₹{Math.abs(penalties.reduce((sum, p) => sum + p.amount, 0) / 1000).toFixed(0)}K
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, margin: 0 };
const subtitle = { color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' };
const metricsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' };
const metricCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const metricLabel = { fontSize: '0.85rem', color: '#6b7280', fontWeight: 700 };
const metricValue = { fontSize: '2.2rem', fontWeight: 900, margin: '0.5rem 0' };
const metricMeta = { fontSize: '0.85rem', color: '#6b7280' };
const tabsBar = { display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb' };
const tabBtn = { padding: '1rem 0', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', background: 'none', border: 'none', transition: 'all 0.3s' };
const sectionTitle = { fontWeight: 800, fontSize: '1.3rem', margin: '2rem 0 1.5rem 0' };
const breakdownGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' };
const breakdownCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const breakdownLabel = { fontSize: '0.85rem', color: '#6b7280', fontWeight: 700 };
const breakdownValue = { fontSize: '1.8rem', fontWeight: 900, margin: '0.5rem 0' };
const breakdownPercent = { fontSize: '1.2rem', fontWeight: 900, color: '#10b981' };
const chartCard = { background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '2rem' };
const addBtn = { padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' };
const settlementFormCard = { background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #dcfce7' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' };
const label = { display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' };
const input = { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.9rem', boxSizing: 'border-box' };
const actionBtn = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer' };
const settlementGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' };
const settlementCard = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' };
const statusBadge = { display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 };
const settlementAmount = { fontSize: '1.8rem', fontWeight: 900, color: '#1f2937' };
const settlementMeta = { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' };
const profitTableContainer = { background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' };
const profitTableHeader = { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: '1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '0.85rem' };
const profitHeaderCell = { color: '#6b7280' };
const profitTableRow = { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: '1rem', borderBottom: '1px solid #e5e7eb', alignItems: 'center', fontSize: '0.9rem' };
const profitCell = { display: 'flex', alignItems: 'center' };
const twoColumnLayout = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' };
const incentivesList = { display: 'grid', gap: '1rem', marginBottom: '1.5rem' };
const incentiveItem = { background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' };
const penaltiesList = { display: 'grid', gap: '1rem', marginBottom: '1.5rem' };
const penaltyItem = { background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' };
const totalBox = { padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' };

export default FinanceIntelligence;
