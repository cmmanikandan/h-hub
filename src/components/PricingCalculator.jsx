import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Package, Truck, Coins, RefreshCw, FileText, GitCompare } from 'lucide-react';
import api from '../utils/api';
import InfoTooltip from './InfoTooltip';

const PricingCalculator = () => {
    const [mode, setMode] = useState('seller'); // 'seller' or 'final'
    const [inputs, setInputs] = useState({
        sellerPrice: '',
        finalPrice: '',
        distance: '10',
        paymentType: 'COD',
        quantity: '1'
    });

    const [appliedRules, setAppliedRules] = useState({
        profitRule: null,
        roundingStrategy: 'nearest_10',
        deliveryRule: null,
        fuelRate: 5,
        superCoinReward: 2
    });

    const [breakdown, setBreakdown] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSystemRules();
    }, []);

    const fetchSystemRules = async () => {
        try {
            const [settingsRes, profitRulesRes, coinRulesRes] = await Promise.all([
                api.get('/admin/settings'),
                api.get('/admin/profit-rules'),
                api.get('/admin/supercoin-rules')
            ]);

            const settings = settingsRes.data;
            setAppliedRules({
                profitRule: profitRulesRes.data[0] || null,
                roundingStrategy: settings.rounding_strategy || 'nearest_10',
                fuelRate: parseFloat(settings.fuel_rate || 5),
                superCoinReward: coinRulesRes.data[0]?.rewardPercentage || 2,
                packingCost: parseFloat(settings.packing_cost || 30),
                shippingCost: parseFloat(settings.shipping_cost || 50),
                adsCost: parseFloat(settings.ads_cost || 70),
                gstPercentage: parseFloat(settings.gst_percentage || 18)
            });
        } catch (error) {
            console.error('Failed to fetch rules:', error);
        }
    };

    const calculatePricing = async () => {
        setLoading(true);
        try {
            const qty = parseInt(inputs.quantity) || 1;
            const distance = parseFloat(inputs.distance) || 0;

            if (mode === 'seller') {
                // Forward calculation: Seller Price → Final Price
                const sellerPrice = parseFloat(inputs.sellerPrice) || 0;

                const res = await api.post('/utils/calculate-pricing', {
                    sellerPrice,
                    distance,
                    quantity: qty,
                    paymentType: inputs.paymentType
                });

                setBreakdown(res.data);
            } else {
                // Reverse calculation: Final Price → Seller Price
                const finalPrice = parseFloat(inputs.finalPrice) || 0;

                const res = await api.post('/utils/reverse-calculate-pricing', {
                    finalPrice,
                    distance,
                    quantity: qty,
                    paymentType: inputs.paymentType
                });

                setBreakdown(res.data);
            }
        } catch (error) {
            console.error('Calculation error:', error);
            alert('Failed to calculate pricing: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setInputs({
            sellerPrice: '',
            finalPrice: '',
            distance: '10',
            paymentType: 'COD',
            quantity: '1'
        });
        setBreakdown(null);
    };

    const handleExportPDF = () => {
        alert('PDF Export feature coming soon!');
    };

    return (
        <div style={container}>
            {/* Header */}
            <div style={header}>
                <div style={headerLeft}>
                    <div style={iconBox}>
                        <Calculator size={24} color="#fff" />
                    </div>
                    <div>
                        <h2 style={title}>🧮 Advanced Pricing Calculator</h2>
                        <p style={subtitle}>Simulate pricing, profit & settlement (Preview Only - No DB Writes)</p>
                    </div>
                </div>
            </div>

            <div style={grid}>
                {/* Left Column - Inputs */}
                <div style={leftColumn}>
                    {/* Mode Selector */}
                    <div style={card}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ ...cardTitle, marginBottom: 0 }}>Input Mode</h3>
                            <InfoTooltip
                                title="Input Mode"
                                content={
                                    <div>
                                        <p><strong>Mode A (Forward):</strong> Enter seller price to calculate final customer price.</p>
                                        <p style={{ marginTop: '8px' }}><strong>Mode B (Reverse):</strong> Enter target market price to find required seller price.</p>
                                        <p style={{ marginTop: '8px', color: '#f59e0b' }}>💡 Tip: Use Mode A for normal pricing, Mode B for competitive pricing strategy.</p>
                                    </div>
                                }
                            />
                        </div>
                        <div style={modeSelector}>
                            <label style={mode === 'seller' ? activeModeLabel : modeLabel}>
                                <input
                                    type="radio"
                                    checked={mode === 'seller'}
                                    onChange={() => setMode('seller')}
                                    style={radioInput}
                                />
                                <span>Seller Price → Calculate Total</span>
                            </label>
                            <label style={mode === 'final' ? activeModeLabel : modeLabel}>
                                <input
                                    type="radio"
                                    checked={mode === 'final'}
                                    onChange={() => setMode('final')}
                                    style={radioInput}
                                />
                                <span>Final Price → Reverse Calculate</span>
                            </label>
                        </div>
                    </div>

                    {/* Input Fields */}
                    <div style={card}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ ...cardTitle, marginBottom: 0 }}>
                                {mode === 'seller' ? '🟢 Mode A: Seller Price Input' : '🔵 Mode B: Final Price Input'}
                            </h3>
                            <InfoTooltip
                                title={mode === 'seller' ? 'Seller Price Input' : 'Final Price Input'}
                                content={
                                    mode === 'seller' ? (
                                        <div>
                                            <p><strong>Seller Price:</strong> The base price set by the seller.</p>
                                            <p style={{ marginTop: '8px' }}><strong>Distance:</strong> Delivery distance in kilometers (affects delivery charge).</p>
                                            <p style={{ marginTop: '8px' }}><strong>Payment Type:</strong> COD or Online (may affect charges).</p>
                                            <p style={{ marginTop: '8px' }}><strong>Quantity:</strong> Number of units (multiplies costs).</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p><strong>Final Website Price:</strong> Target price you want customers to see.</p>
                                            <p style={{ marginTop: '8px' }}>System will reverse-calculate the required seller price.</p>
                                            <p style={{ marginTop: '8px', color: '#f59e0b' }}>⚠️ Note: Reverse calculation is approximate.</p>
                                        </div>
                                    )
                                }
                            />
                        </div>

                        {mode === 'seller' ? (
                            <div style={inputGroup}>
                                <label style={label}>Seller Price (₹)</label>
                                <input
                                    type="number"
                                    value={inputs.sellerPrice}
                                    onChange={(e) => setInputs({ ...inputs, sellerPrice: e.target.value })}
                                    placeholder="500.00"
                                    style={input}
                                />
                            </div>
                        ) : (
                            <div style={inputGroup}>
                                <label style={label}>Final Website Price (₹)</label>
                                <input
                                    type="number"
                                    value={inputs.finalPrice}
                                    onChange={(e) => setInputs({ ...inputs, finalPrice: e.target.value })}
                                    placeholder="899.00"
                                    style={input}
                                />
                            </div>
                        )}

                        <div style={inputGroup}>
                            <label style={label}>Distance (km)</label>
                            <input
                                type="number"
                                value={inputs.distance}
                                onChange={(e) => setInputs({ ...inputs, distance: e.target.value })}
                                style={input}
                            />
                        </div>

                        <div style={inputGroup}>
                            <label style={label}>Payment Type</label>
                            <select
                                value={inputs.paymentType}
                                onChange={(e) => setInputs({ ...inputs, paymentType: e.target.value })}
                                style={input}
                            >
                                <option value="COD">COD</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>

                        <div style={inputGroup}>
                            <label style={label}>Quantity</label>
                            <input
                                type="number"
                                value={inputs.quantity}
                                onChange={(e) => setInputs({ ...inputs, quantity: e.target.value })}
                                min="1"
                                style={input}
                            />
                        </div>
                    </div>

                    {/* Applied Rules Snapshot */}
                    <div style={card}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ ...cardTitle, marginBottom: 0 }}>Applied System Rules</h3>
                            <InfoTooltip
                                title="System Rules"
                                content={
                                    <div>
                                        <p><strong>Profit Rule:</strong> Percentage profit based on seller price range.</p>
                                        <p style={{ marginTop: '8px' }}><strong>Rounding Strategy:</strong> How final price is rounded (Nearest ₹10 or Psychological ₹99).</p>
                                        <p style={{ marginTop: '8px' }}><strong>Fuel Rate:</strong> Cost per kilometer for delivery.</p>
                                        <p style={{ marginTop: '8px' }}><strong>SuperCoin Reward:</strong> Percentage of order value given as loyalty coins.</p>
                                        <p style={{ marginTop: '8px', color: '#10b981' }}>✅ These are live rules from your settings.</p>
                                    </div>
                                }
                            />
                        </div>
                        <div style={rulesList}>
                            <div style={ruleItem}>
                                <span style={ruleDot}>•</span>
                                <span>Profit Rule: {appliedRules.profitRule?.profitPercentage || 20}% (₹{appliedRules.profitRule?.minSellerPrice || 0}–₹{appliedRules.profitRule?.maxSellerPrice || 10000})</span>
                            </div>
                            <div style={ruleItem}>
                                <span style={ruleDot}>•</span>
                                <span>Rounding Strategy: {appliedRules.roundingStrategy === 'nearest_10' ? 'Nearest ₹10' : 'Psychological (₹99, ₹999)'}</span>
                            </div>
                            <div style={ruleItem}>
                                <span style={ruleDot}>•</span>
                                <span>Delivery Rule: Price-based</span>
                            </div>
                            <div style={ruleItem}>
                                <span style={ruleDot}>•</span>
                                <span>Fuel Rate: ₹{appliedRules.fuelRate} / km</span>
                            </div>
                            <div style={ruleItem}>
                                <span style={ruleDot}>•</span>
                                <span>SuperCoin Reward: {appliedRules.superCoinReward}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={buttonGroup}>
                        <button type="button" onClick={(e) => { e.preventDefault(); calculatePricing(); }} disabled={loading} style={primaryBtn}>
                            <Calculator size={18} />
                            {loading ? 'Calculating...' : 'Calculate'}
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); handleReset(); }} style={secondaryBtn}>
                            <RefreshCw size={18} />
                            Reset
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); handleExportPDF(); }} style={secondaryBtn} disabled={!breakdown}>
                            <FileText size={18} />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Right Column - Results */}
                <div style={rightColumn}>
                    {breakdown ? (
                        <>
                            {/* Price Breakdown */}
                            <div style={card}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ ...cardTitle, marginBottom: 0 }}>💰 PRICE BREAKDOWN</h3>
                                    <InfoTooltip
                                        title="Price Breakdown"
                                        content={
                                            <div>
                                                <p><strong>Sub Total:</strong> Seller Price + Packing + Shipping</p>
                                                <p style={{ marginTop: '8px' }}><strong>Admin Profit:</strong> Calculated using profit rules (% of seller price)</p>
                                                <p style={{ marginTop: '8px' }}><strong>GST:</strong> 18% on (Sub Total + Profit + Ads)</p>
                                                <p style={{ marginTop: '8px' }}><strong>Delivery Charge:</strong> Based on distance and order value</p>
                                                <p style={{ marginTop: '8px' }}><strong>Raw Price:</strong> Total before rounding</p>
                                                <p style={{ marginTop: '8px' }}><strong>Final Price:</strong> Rounded price shown to customers</p>
                                            </div>
                                        }
                                        position="left"
                                    />
                                </div>
                                <div style={breakdownList}>
                                    <div style={breakdownRow}>
                                        <span>Seller Price</span>
                                        <span style={amount}>₹{breakdown.sellerPrice?.toFixed(2)}</span>
                                    </div>
                                    <div style={breakdownRow}>
                                        <span>Packing Cost</span>
                                        <span style={amount}>₹{breakdown.packingCost?.toFixed(2)}</span>
                                    </div>
                                    <div style={breakdownRow}>
                                        <span>Shipping Cost</span>
                                        <span style={amount}>₹{breakdown.shippingCost?.toFixed(2)}</span>
                                    </div>
                                    <div style={divider}></div>
                                    <div style={breakdownRow}>
                                        <span style={boldText}>Sub Total</span>
                                        <span style={{ ...amount, ...boldText }}>₹{breakdown.subTotal?.toFixed(2)}</span>
                                    </div>
                                    <div style={divider}></div>
                                    <div style={breakdownRow}>
                                        <span>Auto Profit ({breakdown.profitPercentage}%)</span>
                                        <span style={amount}>₹{breakdown.adminProfit?.toFixed(2)}</span>
                                    </div>
                                    <div style={breakdownRow}>
                                        <span>Ads Cost</span>
                                        <span style={amount}>₹{breakdown.adsCost?.toFixed(2)}</span>
                                    </div>
                                    <div style={breakdownRow}>
                                        <span>GST ({breakdown.gstPercentage}%)</span>
                                        <span style={amount}>₹{breakdown.gstAmount?.toFixed(2)}</span>
                                    </div>
                                    <div style={breakdownRow}>
                                        <span>Delivery Charge</span>
                                        <span style={amount}>₹{breakdown.deliveryCharge?.toFixed(2)}</span>
                                    </div>
                                    <div style={breakdownRow}>
                                        <span>Fuel Deduction</span>
                                        <span style={{ ...amount, color: '#ef4444' }}>-₹{breakdown.fuelCharge?.toFixed(2)}</span>
                                    </div>
                                    <div style={divider}></div>
                                    <div style={breakdownRow}>
                                        <span style={boldText}>Raw Total Price</span>
                                        <span style={{ ...amount, ...boldText }}>₹{breakdown.rawPrice?.toFixed(2)}</span>
                                    </div>
                                    <div style={divider}></div>
                                    <div style={breakdownRow}>
                                        <span>Rounding Strategy</span>
                                        <span style={badge}>{breakdown.roundingStrategy}</span>
                                    </div>
                                    <div style={finalPriceRow}>
                                        <span style={finalPriceLabel}>Final Website Price</span>
                                        <span style={finalPriceAmount}>₹{breakdown.roundedPrice?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Settlement Split */}
                            <div style={card}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ ...cardTitle, marginBottom: 0 }}>💸 SETTLEMENT PREVIEW</h3>
                                    <InfoTooltip
                                        title="Settlement Distribution"
                                        content={
                                            <div>
                                                <p><strong>Seller Gets:</strong> Seller Price + Packing + Shipping</p>
                                                <p style={{ marginTop: '8px' }}><strong>Delivery Man Gets:</strong> Delivery Charge - Fuel Cost</p>
                                                <p style={{ marginTop: '8px' }}><strong>Admin Gets:</strong> Profit + Ads + GST + Fuel + Rounding</p>
                                                <p style={{ marginTop: '8px', color: '#ef4444' }}>⚠️ If delivery earnings are negative, increase delivery base charge or reduce fuel rate.</p>
                                            </div>
                                        }
                                        position="left"
                                    />
                                </div>
                                <div style={settlementGrid}>
                                    <div style={settlementCard}>
                                        <div style={settlementIcon('#10b981')}>
                                            <Package size={20} />
                                        </div>
                                        <div style={settlementLabel}>Seller Gets</div>
                                        <div style={settlementAmount}>₹{(breakdown.sellerPayout || 0).toFixed(2)}</div>
                                    </div>
                                    <div style={settlementCard}>
                                        <div style={settlementIcon('#3b82f6')}>
                                            <Truck size={20} />
                                        </div>
                                        <div style={settlementLabel}>Delivery Man Gets</div>
                                        <div style={settlementAmount}>₹{(breakdown.deliveryPayout || 0).toFixed(2)}</div>
                                    </div>
                                    <div style={settlementCard}>
                                        <div style={settlementIcon('#f59e0b')}>
                                            <TrendingUp size={20} />
                                        </div>
                                        <div style={settlementLabel}>Admin Gets</div>
                                        <div style={settlementAmount}>₹{(breakdown.adminRevenue || 0).toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* SuperCoin Preview */}
                            <div style={card}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ ...cardTitle, marginBottom: 0 }}>🪙 SUPERCOINS EARNED</h3>
                                    <InfoTooltip
                                        title="SuperCoins"
                                        content={
                                            <div>
                                                <p><strong>From Rounding:</strong> Difference when final price {'>'} raw price</p>
                                                <p style={{ marginTop: '8px' }}><strong>From Order Value:</strong> Percentage based on SuperCoin rules (1-3%)</p>
                                                <p style={{ marginTop: '8px' }}><strong>Value:</strong> 1 SuperCoin = ₹1 for future purchases</p>
                                                <p style={{ marginTop: '8px', color: '#10b981' }}>✅ Credited after delivery completion</p>
                                            </div>
                                        }
                                        position="left"
                                    />
                                </div>
                                <div style={coinBreakdown}>
                                    <div style={coinRow}>
                                        <span>From Rounding</span>
                                        <span style={coinAmount}>+{breakdown.coinsFromRounding || 0}</span>
                                    </div>
                                    <div style={coinRow}>
                                        <span>From Order Value</span>
                                        <span style={coinAmount}>+{breakdown.coinsFromOrder || 0}</span>
                                    </div>
                                    <div style={divider}></div>
                                    <div style={coinTotalRow}>
                                        <span>Total SuperCoins</span>
                                        <span style={coinTotalAmount}>+{breakdown.totalCoins || 0}</span>
                                    </div>
                                    <p style={coinNote}>* Credited only after delivery. Virtual currency, does not affect settlement.</p>
                                </div>
                            </div>

                            {/* Payment Flow */}
                            <div style={card}>
                                <h3 style={cardTitle}>💳 PAYMENT FLOW</h3>
                                <div style={flowBox}>
                                    {inputs.paymentType === 'COD' ? (
                                        <div style={flowText}>
                                            <strong>COD:</strong> Customer → Delivery Man → Admin → Settlement Split
                                        </div>
                                    ) : (
                                        <div style={flowText}>
                                            <strong>Online:</strong> Customer → Payment Gateway → Admin → Settlement Split
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={emptyState}>
                            <Calculator size={64} color="#cbd5e1" />
                            <h3 style={emptyTitle}>No Calculation Yet</h3>
                            <p style={emptyText}>Enter values and click "Calculate" to see the pricing breakdown</p>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

// Styles
const container = {
    padding: '2rem',
    maxWidth: '1600px',
    margin: '0 auto'
};

const header = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
};

const headerLeft = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const iconBox = {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
};

const title = {
    fontSize: '1.75rem',
    fontWeight: 900,
    color: '#1e293b',
    margin: 0
};

const subtitle = {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0.25rem 0 0 0'
};

const grid = {
    display: 'grid',
    gridTemplateColumns: '450px 1fr',
    gap: '2rem'
};

const leftColumn = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
};

const rightColumn = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
};

const card = {
    background: '#fff',
    borderRadius: '20px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};

const cardTitle = {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: '1rem'
};

const modeSelector = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
};

const modeLabel = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#64748b'
};

const activeModeLabel = {
    ...modeLabel,
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.05)',
    color: '#6366f1'
};

const radioInput = {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
};

const inputGroup = {
    marginBottom: '1rem'
};

const label = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '0.5rem'
};

const input = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 600,
    outline: 'none',
    transition: 'border-color 0.2s'
};

const rulesList = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
};

const ruleItem = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#475569',
    lineHeight: 1.6
};

const ruleDot = {
    color: '#6366f1',
    fontWeight: 900,
    fontSize: '1.2rem'
};

const buttonGroup = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem'
};

const primaryBtn = {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'transform 0.2s'
};

const secondaryBtn = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.85rem',
    background: '#f8fafc',
    color: '#475569',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const breakdownList = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
};

const breakdownRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#475569'
};

const amount = {
    fontWeight: 700,
    color: '#1e293b'
};

const boldText = {
    fontWeight: 800
};

const divider = {
    height: '1px',
    background: '#e2e8f0',
    margin: '0.5rem 0'
};

const badge = {
    padding: '0.25rem 0.75rem',
    background: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b'
};

const finalPriceRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '12px',
    marginTop: '0.5rem'
};

const finalPriceLabel = {
    fontSize: '0.95rem',
    fontWeight: 800,
    color: '#fff'
};

const finalPriceAmount = {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#fff'
};

const settlementGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem'
};

const settlementCard = {
    textAlign: 'center',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
};

const settlementIcon = (color) => ({
    width: '48px',
    height: '48px',
    background: color,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 0.75rem',
    color: '#fff'
});

const settlementLabel = {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    marginBottom: '0.5rem'
};

const settlementAmount = {
    fontSize: '1.25rem',
    fontWeight: 900,
    color: '#1e293b'
};

const coinBreakdown = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
};

const coinRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#475569'
};

const coinAmount = {
    fontWeight: 800,
    color: '#f59e0b'
};

const coinTotalRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1rem',
    fontWeight: 800,
    color: '#1e293b'
};

const coinTotalAmount = {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#f59e0b'
};

const coinNote = {
    fontSize: '0.7rem',
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: '0.5rem'
};

const flowBox = {
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1'
};

const flowText = {
    fontSize: '0.9rem',
    color: '#475569',
    lineHeight: 1.6
};

const emptyState = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
    background: '#fff',
    borderRadius: '20px',
    border: '2px dashed #e2e8f0'
};

const emptyTitle = {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#1e293b',
    marginTop: '1rem'
};

const emptyText = {
    fontSize: '0.9rem',
    color: '#64748b',
    marginTop: '0.5rem'
};

export default PricingCalculator;
