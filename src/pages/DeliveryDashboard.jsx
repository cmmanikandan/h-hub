import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Truck,
    Navigation,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Phone,
    MapPin,
    Package,
    ArrowRight,
    Search,
    ShieldCheck,
    TrendingUp,
    Star,
    LayoutDashboard,
    Power,
    ArrowLeft,
    Globe,
    Zap,
    Map,
    History,
    Wallet,
    DollarSign,
    Bell,
    BellDot,
    Calendar, // Added Calendar icon
    Menu,
    X
} from 'lucide-react';
import SmartCalendar from '../components/SmartCalendar';
import OnlinePaymentQR from '../components/OnlinePaymentQR';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusPopup from '../components/StatusPopup';

const DeliveryDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [availableOrders, setAvailableOrders] = useState([]);
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [financeData, setFinanceData] = useState({
        wallet: 0,
        lifetimeEarnings: 0,
        totalKm: 0,
        adminBonus: 0,
        transactions: []
    });
    const [otp, setOtp] = useState('');
    const [stats, setStats] = useState({ todayEarnings: 0, yesterdayEarnings: 0, monthEarnings: 0, currentBalance: 0 });

    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '' });
    const showStatus = (type, message, title = '') => {
        setPopup({ show: true, type, title, message });
    };
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Online');
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const [otpModal, setOtpModal] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [currentOrder, setCurrentOrder] = useState(null);
    const [otpError, setOtpError] = useState('');
    const [deliveryPhoto, setDeliveryPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [deliveryStep, setDeliveryStep] = useState(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [codReceivedAmount, setCodReceivedAmount] = useState('');
    const [codChangeAmount, setCodChangeAmount] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const [resendingOtp, setResendingOtp] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [verifiedOtpValue, setVerifiedOtpValue] = useState(''); // Store verified OTP
    const [displayOtp, setDisplayOtp] = useState(''); // Store OTP for display
    const [showOnlinePaymentQR, setShowOnlinePaymentQR] = useState(false); // Show QR code for online payment
    const [paymentCompleted, setPaymentCompleted] = useState(false); // Track if payment was actually completed

    const resetDeliveryFlow = () => {
        setCurrentOrder(null);
        setOtpError('');
        setOtpInput('');
        setDeliveryStep(1);
        setDeliveryPhoto(null);
        setPhotoPreview(null);
        setCodReceivedAmount('');
        setCodChangeAmount(0);
        setOtpSent(false);
        setOtpVerified(false);
        setVerifiedOtpValue('');
        setDisplayOtp('');
        setSelectedPaymentMethod('');
        setShowPaymentOptions(false);
        setPaymentCompleted(false);
    };

    // Mobile Responsiveness
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setShowSidebar(true);
            else setShowSidebar(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchDeliveryData();
            fetchNotifications();
        }
    }, [user?.id]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/notifications?role=delivery&userId=${user.id}`);
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const fetchDeliveryData = async () => {
        try {
            const [assignedRes, availableRes, earningsRes, financeRes] = await Promise.all([
                api.get(`/delivery/orders/${user.id}`),
                api.get('/delivery/available'),
                api.get(`/delivery/earnings/${user.id}`).catch(() => ({ data: { totalEarnings: 0 } })),
                api.get(`/delivery/finance/${user.id}`).catch(() => ({ data: null }))
            ]);

            setAssignedOrders(assignedRes.data);
            setAvailableOrders(availableRes.data);
            setTotalEarnings(earningsRes.data.totalEarnings || 0);
            if (financeRes && financeRes.data) setFinanceData(financeRes.data);
        } catch (error) {
            console.error('Failed to fetch delivery data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deliveredOrders = assignedOrders.filter(order => order.status === 'Delivered');
    const ratedOrders = deliveredOrders.filter(order => typeof order.ratingDelivery === 'number' && order.ratingDelivery > 0);
    const avgRating = ratedOrders.length
        ? (ratedOrders.reduce((sum, order) => sum + order.ratingDelivery, 0) / ratedOrders.length).toFixed(1)
        : '0.0';
    const feedbackOrders = deliveredOrders
        .filter(order => (order.comment && String(order.comment).trim()) || (order.ratingDelivery && order.ratingDelivery > 0))
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || b.date || 0) - new Date(a.updatedAt || a.createdAt || a.date || 0));
    const recentFeedback = feedbackOrders.slice(0, 4);

    const handleMap = (address) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    const handleCall = (phone) => {
        // window.location.href = `tel:${phone}`;
        alert(`Calling Customer: ${phone || 'Unknown'} (Simulated)`);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setOtpError('Photo size must be less than 5MB');
                return;
            }
            setDeliveryPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const initiateDelivery = async (order) => {
        setCurrentOrder(order);
        setDeliveryPhoto(null);
        setPhotoPreview(null);
        setDeliveryStep(1);
        setSelectedPaymentMethod(order.paymentMethod);
        setShowPaymentOptions(false);
        setCodReceivedAmount('');
        setCodChangeAmount(0);
        setOtpVerified(false);
        setOtpSent(false);
        setPaymentCompleted(false); // Reset payment completion status
        try {
            const response = await api.post(`/orders/${order.id}/send-delivery-otp`);
            console.log('📩 OTP Response:', response.data);
            setOtpInput('');
            setOtpError('');
            setOtpSent(true);
            // Store OTP for display (for testing purposes)
            if (response.data.devOtp) {
                console.log('✅ Setting displayOtp to:', response.data.devOtp);
                setDisplayOtp(response.data.devOtp);
            } else {
                console.log('❌ No devOtp in response, response keys:', Object.keys(response.data));
            }
            showStatus('success', 'OTP sent to customer\'s email', '✓ OTP Sent');
        } catch (error) {
            showStatus('failed', 'Failed to send OTP: ' + (error.response?.data?.error || error.message), 'Failed');
        }
    };

    const handleResendOtp = async () => {
        setResendingOtp(true);
        try {
            const response = await api.post(`/orders/${currentOrder.id}/send-delivery-otp`);
            console.log('📩 Resend OTP Response:', response.data);
            showStatus('success', 'OTP resent to customer\'s email', '✓ OTP Sent');
            setOtpInput('');
            setOtpError('');
            // Store OTP for display (for testing purposes)
            if (response.data.devOtp) {
                console.log('✅ Setting displayOtp to:', response.data.devOtp);
                setDisplayOtp(response.data.devOtp);
            }
        } catch (error) {
            showStatus('failed', 'Failed to resend OTP: ' + (error.response?.data?.error || error.message), 'Failed');
        } finally {
            setResendingOtp(false);
        }
    };

    const handleNextStep = async () => {
        if (deliveryStep === 1 && !otpInput) {
            setOtpError('Please enter the 4-digit OTP');
            return;
        }
        if (deliveryStep === 1) {
            // Verify OTP before proceeding
            try {
                const trimmedOtp = otpInput.trim(); // Remove any whitespace
                console.log('Verifying OTP:', trimmedOtp); // Debug log
                const verifyRes = await api.post(`/orders/${currentOrder.id}/verify-otp`, { otp: trimmedOtp });
                if (verifyRes.data.success) {
                    setOtpVerified(true);
                    setVerifiedOtpValue(trimmedOtp); // Store the verified OTP value
                    setOtpError('');
                    setDeliveryStep(deliveryStep + 1);
                    showStatus('success', 'OTP verified successfully', '✓ Verified');
                    console.log('OTP verified and stored:', trimmedOtp); // Debug log
                } else {
                    setOtpError('Invalid OTP. Please try again.');
                }
            } catch (error) {
                console.error('OTP Verification Error:', error.response?.data);
                setOtpError(error.response?.data?.error || 'Invalid OTP. Please try again.');
            }
            return;
        }
        if (deliveryStep === 2 && !selectedPaymentMethod) {
            setOtpError('Please select a payment method');
            return;
        }
        if (deliveryStep === 2 && !paymentCompleted) {
            setOtpError('Please complete the payment before proceeding');
            return;
        }
        if (deliveryStep === 3 && !deliveryPhoto) {
            setOtpError('Please upload delivery photo');
            return;
        }
        setOtpError('');
        setDeliveryStep(deliveryStep + 1);
    };

    const handlePaymentAtDelivery = async (method) => {
        setPaymentProcessing(true);
        try {
            if (method === 'COD') {
                const totalDue = parseFloat(currentOrder.totalAmount || 0);
                const received = parseFloat(codReceivedAmount || 0);
                if (!received || received < totalDue) {
                    setOtpError('Received amount is less than order total');
                    setPaymentProcessing(false);
                    return;
                }

                // COD payment - mark as received
                await api.post(`/orders/${currentOrder.id}/payment-at-delivery`, {
                    method: 'COD',
                    amount: totalDue,
                    collectedBy: user.id
                });

                // Auto-convert COD to H-LOGIX wallet (UPI-style)
                await api.post('/wallet/cod/convert', {
                    orderId: currentOrder.id,
                    amount: totalDue,
                    method: 'UPI',
                    reference: `COD-${currentOrder.id.slice(0, 8)}`,
                    userId: user.id
                });

                setSelectedPaymentMethod('COD');
                setPaymentCompleted(true); // Mark payment as completed
                showStatus('success', `Cash ₹${totalDue} collected and converted to online money`, 'Payment Success');
                setDeliveryStep(3); // Move to photo upload
            } else {
                // Online payment at delivery - Show QR code modal
                setShowPaymentOptions(false);
                setShowOnlinePaymentQR(true);
                return;
            }
            setShowPaymentOptions(false);
            if (method !== 'COD') {
                setDeliveryStep(3); // Move to photo upload
            }
        } catch (error) {
            setOtpError(error.response?.data?.error || 'Payment processing failed');
        } finally {
            setPaymentProcessing(false);
        }
    };

    const handleOnlinePaymentSuccess = (paymentData) => {
        // Payment successful - update UI and proceed to photo upload
        setShowOnlinePaymentQR(false);
        setSelectedPaymentMethod('UPI');
        setPaymentCompleted(true); // Mark payment as completed
        showStatus('success', `₹${currentOrder.totalAmount} received online and sent to H-HUB Admin wallet`, 'Payment Success');
        setDeliveryStep(3); // Move to photo upload
    };

    const verifyAndComplete = async () => {
        setOtpError('');
        setUploadingPhoto(true);

        try {
            // Upload photo first
            let photoUrl = '';
            if (deliveryPhoto) {
                const formData = new FormData();
                formData.append('file', deliveryPhoto);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                photoUrl = uploadRes.data.url;
            }

            // Complete delivery with verified OTP, photo, and payment info
            console.log('Completing delivery with OTP:', verifiedOtpValue); // Debug log
            await api.put(`/orders/${currentOrder.id}/deliver`, {
                otp: verifiedOtpValue, // Use the verified OTP value stored earlier
                deliveryPhoto: photoUrl,
                finalPaymentMethod: selectedPaymentMethod
            });

            resetDeliveryFlow();
            setStatus('Online');
            showStatus('success', 'Order delivered successfully! Earnings updated.', 'Delivery Complete');
            fetchDeliveryData();
        } catch (error) {
            setOtpError(error.response?.data?.error || 'Delivery completion failed');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/logix/orders/${orderId}/status`, { status: newStatus });
            showStatus('success', `Order marked as ${newStatus}`, 'Status Updated');
            fetchDeliveryData();
        } catch (error) {
            showStatus('failed', `Failed to update status: ` + (error.response?.data?.error || error.message), 'Error');
        }
    };

    const handleSubmitCOD = async (orderId) => {
        try {
            await api.post(`/logix/cod/submit/${orderId}`);
            showStatus('success', 'COD submitted to H-LOGIX for verification', 'Submission Success');
            fetchDeliveryData();
        } catch (error) {
            showStatus('failed', 'Failed to submit COD: ' + (error.response?.data?.error || error.message), 'Error');
        }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '4px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%' }} />
        </div>
    );

    return (
        <div style={dashboardContainer}>
            {/* Sidebar - Responsive */}
            <aside style={{
                ...sidebar,
                position: isMobile ? 'fixed' : 'relative',
                transform: isMobile && !showSidebar ? 'translateX(-100%)' : 'none',
                zIndex: 200,
                width: isMobile ? '280px' : '280px',
                boxShadow: isMobile && showSidebar ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={logoWrapper}>
                    <div style={logoIcon}><Truck size={24} color="#fff" /></div>
                    <span style={logoText}>Rider Pro</span>
                    {isMobile && (
                        <button onClick={() => setShowSidebar(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div style={navSection}>
                    <span style={navLabel}>DISPATCH CONTROL</span>
                    <div style={navGroup}>
                        <button onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? activeNav : navBtn}><LayoutDashboard size={18} /> Dashboard</button>
                        <button onClick={() => setActiveTab('assignments')} style={activeTab === 'assignments' ? activeNav : navBtn}><Zap size={18} /> Active Trips</button>
                        <button onClick={() => setActiveTab('roster')} style={activeTab === 'roster' ? activeNav : navBtn}><Calendar size={18} /> Duty Roster</button>
                    </div>
                </div>

                <div style={navSection}>
                    <span style={navLabel}>FLEET LOGS</span>
                    <div style={navGroup}>
                        <button onClick={() => setActiveTab('history')} style={activeTab === 'history' ? activeNav : navBtn}><History size={18} /> Delivery History</button>
                        <button onClick={() => setActiveTab('earnings')} style={activeTab === 'earnings' ? activeNav : navBtn}><Wallet size={18} /> Payouts</button>
                        <button onClick={() => setActiveTab('feedback')} style={activeTab === 'feedback' ? activeNav : navBtn}><Star size={18} /> Feedback</button>
                    </div>
                </div>

                <div style={sidebarFooter}>
                    <div style={profileInSidebar}>
                        <div style={userAvatarMini}>{user?.name?.charAt(0) || 'R'}</div>
                        <div style={profileInfo}>
                            <span style={{ ...profName, color: '#fff' }}>{user?.name || 'Rider'}</span>
                            <span style={{ ...profRole, color: '#94a3b8' }}>Fleet Partner</span>
                        </div>
                    </div>
                    <button style={logoutBtnSidebar} onClick={logout}>
                        <Power size={16} /> Logout
                    </button>
                    <button onClick={() => navigate('/')} style={backToHubBtn}><ArrowLeft size={16} /> Return to Hub</button>
                </div>
            </aside>

            {/* Main Content Area */}
            {isMobile && showSidebar && (
                <div onClick={() => setShowSidebar(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(2px)' }} />
            )}

            <main style={content}>
                <header style={{ ...topBar, padding: isMobile ? '0 1rem' : '0 3rem' }}>
                    <div style={topBarLeft}>
                        {isMobile && (
                            <button onClick={() => setShowSidebar(true)} style={{ background: 'none', border: 'none', color: '#1e293b' }}>
                                <Menu size={24} />
                            </button>
                        )}
                        <div style={statusBadgeContainer}>
                            <div style={{ ...statusDot, background: status === 'Online' ? '#10b981' : '#64748b' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Status: {status}</span>
                        </div>
                    </div>
                    <div style={topBarRight}>
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowNotifications(!showNotifications)} style={topNavBtn}>
                                {notifications.some(n => !n.isRead) ? <BellDot size={18} color="#ef4444" /> : <Bell size={18} />}
                            </button>
                            {showNotifications && (
                                <div style={notificationPanel}>
                                    <div style={notifHeader}>Rider Alerts</div>
                                    <div style={notifList}>
                                        {notifications.length === 0 ? <div style={pNoNotif}>No new alerts.</div> : notifications.map(n => (
                                            <div key={n.id} style={{ ...notifItem, opacity: n.isRead ? 0.6 : 1 }}>
                                                <div style={notifTitle}>{n.title}</div>
                                                <div style={notifMsg}>{n.message}</div>
                                                <div style={notifTime}>{new Date(n.createdAt).toLocaleTimeString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={vDivider} />
                        <button style={shiftBtn} onClick={() => setStatus(status === 'Online' ? 'Offline' : 'Online')}>
                            {status === 'Online' ? 'End Shift' : 'Go Online'}
                        </button>
                        <div style={vDivider} />
                        <button onClick={() => navigate('/')} style={topNavBtn}>
                            <Globe size={18} />
                            <span>Return to Site</span>
                        </button>
                        <div style={vDivider} />
                        <div style={deliveryBadge}>RIDER</div>
                    </div>
                </header>

                <div style={scrollArea}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h1 style={contentTitle}>Shipment Intelligence</h1>
                                        <p style={contentSubtitle}>Track your metrics and recent delivery performance.</p>
                                    </div>
                                    <div style={ratingBox}>
                                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                        <span>{avgRating} Rider Rating • {ratedOrders.length} reviews</span>
                                    </div>
                                </div>

                                <div style={{ ...statsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)' }}>
                                    {[
                                        { label: 'Completed', value: assignedOrders.filter(o => o.status === 'Delivered').length, trend: 'Today', icon: <CheckCircle />, color: '#10b981' },
                                        { label: 'Pending', value: assignedOrders.filter(o => o.status !== 'Delivered').length, trend: 'Priority', icon: <Package />, color: '#f59e0b' },
                                        { label: 'Earnings', value: `₹${totalEarnings.toLocaleString()}`, trend: 'Paid Out', icon: <DollarSign />, color: '#ec4899' },
                                        { label: 'Admin Bonus', value: `₹${(assignedOrders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.adminBonus || 0), 0) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, trend: 'Extra', icon: <Zap />, color: '#3b82f6' },
                                    ].map((s, i) => (
                                        <div key={i} style={saasStatCard}>
                                            <div style={statHeader}>
                                                <div style={{ ...statIconBox, color: s.color }}>{s.icon}</div>
                                                <div style={statTrend}>{s.trend}</div>
                                            </div>
                                            <div style={statContent}>
                                                <span style={statLabel}>{s.label}</span>
                                                <span style={statValue}>{s.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={doubleGrid}>
                                    <div style={chartCard}>
                                        <h3 style={cardTitle}>Delivery Volume</h3>
                                        <div style={{ width: '100%', height: '200px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={[
                                                    { name: 'Mon', trips: 4 },
                                                    { name: 'Tue', trips: 7 },
                                                    { name: 'Wed', trips: 5 },
                                                    { name: 'Thu', trips: 8 },
                                                    { name: 'Fri', sales: 6 },
                                                    { name: 'Sat', sales: 12 },
                                                    { name: 'Sun', sales: 9 },
                                                ]}>
                                                    <defs>
                                                        <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTrips)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Current Delivery Context */}
                                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Destination</h4>

                                            {assignedOrders.find(o => o.status !== 'Delivered') ? (
                                                (() => {
                                                    const active = assignedOrders.find(o => o.status !== 'Delivered');
                                                    return (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div>
                                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>{active.user?.name || 'Customer'}</div>
                                                                <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <MapPin size={14} /> {active.address}
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 700, marginTop: '0.5rem' }}>
                                                                    Order #{active.id.slice(0, 8)} • {active.productName}
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                                <button onClick={() => handleCall(active.user?.phone)} style={{ background: '#f1f5f9', border: 'none', padding: '0.75rem', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}>
                                                                    <Phone size={20} />
                                                                </button>
                                                                <button onClick={() => handleMap(active.address)} style={{ background: '#10b981', border: 'none', padding: '0.75rem', borderRadius: '10px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                                                                    <Navigation size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No active deliveries pending.</div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={chartCard}>
                                        <h3 style={cardTitle}>Quick Links</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <button style={actionBtn} onClick={() => setActiveTab('assignments')}><Truck size={18} /> View Active Routes</button>
                                            <button style={actionBtn} onClick={() => setActiveTab('roster')}><Calendar size={18} /> Check Full Schedule</button>
                                            <button style={actionBtn} onClick={() => setActiveTab('earnings')}><Wallet size={18} /> Transaction History</button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ ...chartCard, marginTop: '1.5rem' }}>
                                    <h3 style={cardTitle}>Recent Feedback</h3>
                                    {recentFeedback.length === 0 ? (
                                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No feedback received yet.</div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
                                            {recentFeedback.map(order => (
                                                <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                                                            {order.user?.name || 'Customer'}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 800, fontSize: '0.85rem' }}>
                                                            <Star size={12} color="#f59e0b" /> {order.ratingDelivery || 0}
                                                        </div>
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 6 }}>
                                                        {order.comment ? String(order.comment) : 'No comment provided.'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                        Order #{order.id.slice(0, 8)} • {new Date(order.updatedAt || order.createdAt || order.date || Date.now()).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'assignments' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Active Assignments</h3>
                                        <p style={contentSubtitle}>Navigate to customers and mark completions.</p>
                                    </div>
                                </div>

                                {currentOrder && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '24px',
                                            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
                                            overflow: 'hidden',
                                            marginBottom: '1.5rem',
                                            maxWidth: '760px'
                                        }}
                                    >
                                        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1.5rem 2rem', color: '#fff' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <ShieldCheck size={24} /> Delivery Verification
                                            </h3>
                                            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>Complete 3 steps to deliver order</p>
                                            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '8px' }}>
                                                {[1, 2, 3].map((step) => (
                                                    <div key={step} style={{ flex: 1, height: '4px', borderRadius: '4px', background: deliveryStep >= step ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }} />
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ padding: '1.5rem 2rem 2rem' }}>
                                            <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '12px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>ORDER AMOUNT</div>
                                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#b45309' }}>₹{(currentOrder.totalAmount || 0).toFixed(2)}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>PAYMENT</div>
                                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#b45309', background: '#fff', padding: '6px 12px', borderRadius: '8px' }}>
                                                            {selectedPaymentMethod || currentOrder.paymentMethod}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {otpError && (
                                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ ...errorBox, marginBottom: '1.5rem', background: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}>{otpError}</motion.div>
                                            )}

                                            {otpSent && !otpVerified && deliveryStep === 1 && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#1e40af' }}>
                                                    <CheckCircle size={18} color="#3b82f6" />
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>4-digit OTP sent to customer&apos;s email</span>
                                                </motion.div>
                                            )}

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{
                                                    background: deliveryStep === 1 ? '#fff' : '#f8fafc',
                                                    border: deliveryStep === 1 ? '2px solid #667eea' : '1px solid #e2e8f0',
                                                    borderRadius: '16px',
                                                    padding: '1.5rem',
                                                    marginBottom: '1rem',
                                                    opacity: deliveryStep > 1 ? 0.6 : 1
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: deliveryStep > 1 ? '#10b981' : '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                                        {deliveryStep > 1 ? <CheckCircle size={20} /> : '1'}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>Verify Customer OTP</h4>
                                                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>4-digit code sent to customer email</p>
                                                    </div>
                                                </div>

                                                {displayOtp && deliveryStep === 1 && (
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                                        border: '2px dashed #f59e0b',
                                                        padding: '16px',
                                                        borderRadius: '12px',
                                                        marginBottom: '1rem',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                                            🔐 TEST OTP (Backend Console)
                                                        </div>
                                                        <div style={{
                                                            fontSize: '2rem',
                                                            fontWeight: 900,
                                                            color: '#d97706',
                                                            letterSpacing: '8px',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {displayOtp}
                                                        </div>
                                                        <div style={{ fontSize: '0.65rem', color: '#92400e', marginTop: '4px', fontStyle: 'italic' }}>
                                                            Copy this OTP and paste below ↓
                                                        </div>
                                                    </div>
                                                )}

                                                {deliveryStep === 1 && (
                                                    <div>
                                                        <div style={{ ...otpDisplay, marginBottom: '1rem' }}>
                                                            <input
                                                                type="text"
                                                                maxLength="4"
                                                                value={otpInput}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                                    setOtpInput(val);
                                                                    setOtpError('');
                                                                }}
                                                                placeholder="0 0 0 0"
                                                                style={{ ...otpField, fontSize: '1.5rem', letterSpacing: '12px' }}
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={handleNextStep}
                                                            disabled={!otpInput || otpInput.length !== 4}
                                                            style={{ ...confirmBtn, width: '100%', opacity: (!otpInput || otpInput.length !== 4) ? 0.5 : 1, marginBottom: '0.75rem' }}
                                                        >
                                                            Verify OTP <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                                        </button>
                                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setOtpInput('');
                                                                    setOtpError('');
                                                                }}
                                                                style={{ ...secondaryBtn, flex: 1, fontSize: '0.85rem', padding: '0.65rem' }}
                                                            >
                                                                ↻ Re-enter OTP
                                                            </button>
                                                            <button
                                                                onClick={handleResendOtp}
                                                                disabled={resendingOtp}
                                                                style={{ ...secondaryBtn, flex: 1, fontSize: '0.85rem', padding: '0.65rem', background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e', opacity: resendingOtp ? 0.6 : 1 }}
                                                            >
                                                                {resendingOtp ? '⏳ Sending...' : '📧 Resend OTP'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {deliveryStep > 1 && (
                                                    <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '0.85rem', fontWeight: 700 }}>
                                                        <CheckCircle size={16} /> OTP Verified Successfully
                                                    </div>
                                                )}
                                            </motion.div>

                                            {deliveryStep === 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        background: '#fff',
                                                        border: '2px solid #667eea',
                                                        borderRadius: '16px',
                                                        padding: '1.5rem',
                                                        marginBottom: '1rem'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                                            2
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>Collect Payment</h4>
                                                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>Customer can pay via COD, QR, or Razorpay online</p>
                                                        </div>
                                                    </div>
                                                    {!showPaymentOptions && (
                                                        <div>
                                                            <button
                                                                onClick={() => {
                                                                    setShowPaymentOptions(true);
                                                                    setPaymentCompleted(false);
                                                                }}
                                                                style={{ ...confirmBtn, width: '100%', background: '#fbbf24', marginBottom: '10px' }}
                                                            >
                                                                <DollarSign size={18} /> Change Payment Method
                                                            </button>
                                                            {selectedPaymentMethod !== 'COD' && paymentCompleted && (
                                                                <button
                                                                    onClick={handleNextStep}
                                                                    style={{ ...confirmBtn, width: '100%' }}
                                                                >
                                                                    Continue with {selectedPaymentMethod} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                                                </button>
                                                            )}
                                                            {selectedPaymentMethod !== 'COD' && !paymentCompleted && (
                                                                <div style={{ padding: '12px', borderRadius: '10px', background: '#fef3c7', border: '1px solid #fbbf24', color: '#92400e', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                                                                    ⏳ Waiting for Razorpay / online payment to complete...
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {showPaymentOptions && (
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPaymentMethod('COD');
                                                                    setShowPaymentOptions(false);
                                                                    setOtpError('');
                                                                    const totalDue = parseFloat(currentOrder?.totalAmount || 0);
                                                                    setCodReceivedAmount(totalDue ? String(totalDue) : '');
                                                                    setCodChangeAmount(0);
                                                                }}
                                                                disabled={paymentProcessing}
                                                                style={{
                                                                    padding: '1.25rem',
                                                                    borderRadius: '12px',
                                                                    border: '2px solid #10b981',
                                                                    background: '#fff',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    opacity: paymentProcessing ? 0.6 : 1
                                                                }}
                                                            >
                                                                <Wallet size={24} color="#10b981" />
                                                                <div style={{ fontWeight: 900, color: '#1e293b' }}>Cash (COD)</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Collect cash</div>
                                                            </button>
                                                            <button
                                                                onClick={() => handlePaymentAtDelivery('UPI')}
                                                                disabled={paymentProcessing}
                                                                style={{
                                                                    padding: '1.25rem',
                                                                    borderRadius: '12px',
                                                                    border: '2px solid #667eea',
                                                                    background: '#fff',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    opacity: paymentProcessing ? 0.6 : 1
                                                                }}
                                                            >
                                                                <Zap size={24} color="#667eea" />
                                                                <div style={{ fontWeight: 900, color: '#1e293b' }}>UPI/Online</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Digital payment</div>
                                                            </button>
                                                        </div>
                                                    )}
                                                    {selectedPaymentMethod === 'COD' && !showPaymentOptions && (
                                                        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca', background: '#fff5f5' }}>
                                                            <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>COD Calculator</div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.75rem' }}>
                                                                <div>
                                                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Order Amount</div>
                                                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b45309' }}>₹{(currentOrder?.totalAmount || 0).toFixed(2)}</div>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Cash Received</div>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="1"
                                                                        value={codReceivedAmount}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            setCodReceivedAmount(val);
                                                                            const received = parseFloat(val || 0);
                                                                            const totalDue = parseFloat(currentOrder?.totalAmount || 0);
                                                                            const change = Math.max(0, received - totalDue);
                                                                            setCodChangeAmount(change);
                                                                            if (received >= totalDue) setOtpError('');
                                                                        }}
                                                                        placeholder="Enter received amount"
                                                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #fecaca', fontWeight: 700 }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Change to Return</div>
                                                                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#16a34a' }}>₹{codChangeAmount.toFixed(2)}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => handlePaymentAtDelivery('COD')}
                                                                disabled={paymentProcessing}
                                                                style={{ ...confirmBtn, width: '100%', background: '#ef4444', opacity: paymentProcessing ? 0.6 : 1 }}
                                                            >
                                                                {paymentProcessing ? '⏳ Processing...' : 'Mark COD Paid & Convert to Online'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {deliveryStep === 3 && paymentCompleted && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        background: '#fff',
                                                        border: '2px solid #667eea',
                                                        borderRadius: '16px',
                                                        padding: '1.5rem',
                                                        marginBottom: '1rem'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                                            3
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>Upload Delivery Proof</h4>
                                                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>Take photo of opened package</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: '#f8fafc', position: 'relative', marginBottom: '1rem' }}>
                                                        {photoPreview ? (
                                                            <div>
                                                                <img src={photoPreview} alt="Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
                                                                <button onClick={() => { setDeliveryPhoto(null); setPhotoPreview(null); }} style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700, textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                                    ✕ Remove & Retake
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <Package size={48} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                                                                    📸 Take Photo
                                                                </div>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    capture="environment"
                                                                    onChange={handlePhotoUpload}
                                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                                />
                                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                                    Max 5MB • JPG, PNG
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={verifyAndComplete}
                                                        disabled={!deliveryPhoto || uploadingPhoto}
                                                        style={{
                                                            ...confirmBtn,
                                                            width: '100%',
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            opacity: (!deliveryPhoto || uploadingPhoto) ? 0.5 : 1,
                                                            fontSize: '1.1rem',
                                                            padding: '1rem'
                                                        }}
                                                    >
                                                        {uploadingPhoto ? '⏳ Processing...' : '✓ Complete Delivery'}
                                                    </button>
                                                </motion.div>
                                            )}

                                            {deliveryStep === 3 && !paymentCompleted && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        background: '#fef3c7',
                                                        border: '2px solid #fbbf24',
                                                        borderRadius: '16px',
                                                        padding: '1.5rem',
                                                        marginBottom: '1rem',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                                                    <div style={{ fontWeight: 900, color: '#92400e', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                                        Payment Not Completed
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#78350f' }}>
                                                        Please complete the payment before proceeding to photo upload
                                                    </div>
                                                    <button
                                                        onClick={() => setDeliveryStep(2)}
                                                        style={{ ...confirmBtn, marginTop: '1rem', background: '#fbbf24' }}
                                                    >
                                                        ← Back to Payment
                                                    </button>
                                                </motion.div>
                                            )}

                                            <button
                                                onClick={resetDeliveryFlow}
                                                style={{ ...cancelBtn, width: '100%', marginTop: '1rem' }}
                                            >
                                                Cancel Delivery
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {assignedOrders.filter(o => o.status !== 'Delivered').length === 0 ? (
                                    <div style={emptyState}>
                                        <Truck size={48} color="#94a3b8" />
                                        <h3 style={{ marginTop: '1rem', color: '#1e293b' }}>No assignments</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Check back later for new delivery requests.</p>
                                    </div>
                                ) : (
                                    <div style={orderGrid}>
                                        {assignedOrders.filter(o => o.status !== 'Delivered').map(order => (
                                            <div key={order.id} style={orderCard}>
                                                <div style={orderHeader}>
                                                    <span style={orderId}>#ORDER-{order.id.slice(0, 8)}</span>
                                                    <span style={{ ...statusBadge, background: '#fef3c7', color: '#92400e' }}>{order.status}</span>
                                                </div>
                                                <div style={orderBody}>
                                                    <div style={orderRow}><User size={16} color="#64748b" /><span style={{ fontWeight: 700 }}>{order.user?.name || 'Customer'}</span></div>
                                                    <div style={orderRow}><MapPin size={16} color="#64748b" /><span>{order.address}</span></div>
                                                    <div style={orderRow}><Package size={16} color="#64748b" /><span>{order.productName || 'Standard Package'}</span></div>

                                                    <div style={payoutPreview}>
                                                        <div style={payoutPreviewRow}><span>Delivery Fee:</span><span>₹{order.deliveryCharge}</span></div>
                                                        {order.adminBonus > 0 && <div style={payoutPreviewRow}><span>Admin Bonus:</span><span style={{ color: '#10b981' }}>+ ₹{order.adminBonus?.toFixed(2)}</span></div>}
                                                        <div style={payoutTotalRow}><span>Total Earning:</span><span style={{ color: '#10b981' }}>₹{(order.deliveryCharge + (order.adminBonus || 0)).toFixed(2)}</span></div>
                                                    </div>
                                                </div>
                                                <div style={orderFooter}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                                        <button
                                                            onClick={() => handleMap(order.address)}
                                                            style={secondaryBtn}
                                                        >
                                                            <MapPin size={16} /> Map
                                                        </button>
                                                        <button
                                                            onClick={() => handleCall(order.user?.phone)}
                                                            style={secondaryBtn}
                                                        >
                                                            <Phone size={16} /> Call
                                                        </button>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexDirection: 'column' }}>
                                                        {(order.status === 'Assigned' || order.status === 'Shipped' || order.status === 'Packed') && (
                                                            <button
                                                                style={{ ...deliveryBtn, background: '#6366f1' }}
                                                                onClick={() => updateStatus(order.id, 'Picked Up')}
                                                            >
                                                                <Truck size={16} /> Mark as Picked Up
                                                            </button>
                                                        )}
                                                        {order.status === 'Picked Up' && (
                                                            <button
                                                                style={{ ...deliveryBtn, background: '#3b82f6' }}
                                                                onClick={() => updateStatus(order.id, 'Out for Delivery')}
                                                            >
                                                                <Navigation size={16} /> Mark as Out for Delivery
                                                            </button>
                                                        )}
                                                        {order.status === 'Out for Delivery' && (
                                                            <button
                                                                style={deliveryBtn}
                                                                onClick={() => navigate('/delivery/verify', { state: { order } })}
                                                            >
                                                                Verify & Deliver
                                                                <ArrowRight size={16} />
                                                            </button>
                                                        )}
                                                        {order.status === 'Processing' && (
                                                            <div style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '8px', fontSize: '0.85rem', color: '#92400e', textAlign: 'center' }}>
                                                                ⏳ Waiting for seller to pack order
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'roster' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Duty Roster & Performance</h3>
                                        <p style={contentSubtitle}>Daily breakdown of your trips and earnings.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                    <SmartCalendar
                                        title="Shift Activity Log"
                                        data={assignedOrders.reduce((acc, order) => {
                                            const date = new Date(order.createdAt).toISOString().split('T')[0];
                                            if (!acc[date]) acc[date] = { count: 0, earnings: 0, distance: 0 };
                                            acc[date].count += 1;
                                            if (order.status === 'Delivered') {
                                                acc[date].earnings += (order.deliveryCharge || 0) + (order.adminBonus || 0);
                                                acc[date].distance += (order.distance || 0);
                                            }
                                            return acc;
                                        }, {})}
                                        renderCellContent={(data) => (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1e293b' }}>{data.count} Trips</span>
                                                <span style={{ fontSize: '0.6rem', color: '#10b981' }}>+₹{data.earnings.toFixed(0)}</span>
                                            </div>
                                        )}
                                        onDateClick={(date, data) => {
                                            if (data) {
                                                showStatus('success', `Earned: ₹${data.earnings.toFixed(2)} | Distance: ${data.distance}km`, `${date}: ${data.count} Deliveries`);
                                            } else {
                                                showStatus('info', 'No delivery activity recorded.', date);
                                            }
                                        }}
                                    />

                                    <div style={doubleGrid}>
                                        <div style={chartCard}>
                                            <h3 style={cardTitle}>Distance Coverage</h3>
                                            <div style={{ width: '100%', height: '250px', minHeight: '250px' }}>
                                                <ResponsiveContainer width="99%" height="100%">
                                                    <AreaChart data={Object.entries(assignedOrders.reduce((acc, order) => {
                                                        const date = new Date(order.createdAt).toISOString().split('T')[0];
                                                        if (!acc[date]) acc[date] = { date: date.slice(5), distance: 0, bonus: 0 };
                                                        acc[date].distance += order.distance || 0;
                                                        acc[date].bonus += order.adminBonus || 0;
                                                        return acc;
                                                    }, {})).map(([k, v]) => v).sort((a, b) => a.date.localeCompare(b.date))}>
                                                        <defs>
                                                            <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                                        <Tooltip
                                                            contentStyle={{ background: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                                            itemStyle={{ color: '#1e293b', fontWeight: 700 }}
                                                        />
                                                        <Area type="monotone" dataKey="distance" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorFuel)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div style={chartCard}>
                                            <h3 style={cardTitle}>Pending COD Actions</h3>
                                            <div style={summaryItem}>
                                                <div>
                                                    <span style={{ fontWeight: 800, color: '#ef4444' }}>COD Deposit Needed</span>
                                                    <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                                        {assignedOrders.filter(o => o.paymentMethod === 'COD' && o.status === 'Delivered' && !o.codDeposited).length} orders
                                                    </div>
                                                </div>
                                                <button style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', marginBottom: '0.5rem',
                                                    color: '#ef4444'
                                                }}>PAY</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'history' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Delivery History</h3>
                                        <p style={contentSubtitle}>Archive of your completed trips.</p>
                                    </div>
                                </div>

                                <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>ORDER ID</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DATE</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>COD STATUS</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>FEE / BONUS</th>
                                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TOTAL EARNING</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignedOrders.filter(o => o.status === 'Delivered').length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                                        No completed deliveries yet.
                                                    </td>
                                                </tr>
                                            ) : assignedOrders.filter(o => o.status === 'Delivered').map(order => (
                                                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>{new Date(order.updatedAt || order.createdAt || order.date || Date.now()).toLocaleDateString()}</td>
                                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                                        {order.paymentMethod === 'COD' ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span style={{
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 700,
                                                                    padding: '2px 8px',
                                                                    borderRadius: 4,
                                                                    background: order.codSubmissionStatus === 'Verified' ? '#dcfce7' :
                                                                        order.codSubmissionStatus === 'SentToHub' ? '#ecfdf5' :
                                                                            order.codSubmissionStatus === 'Submitted' ? '#e0f2fe' : '#fef2f2',
                                                                    color: order.codSubmissionStatus === 'Verified' ? '#166534' :
                                                                        order.codSubmissionStatus === 'SentToHub' ? '#065f46' :
                                                                            order.codSubmissionStatus === 'Submitted' ? '#075985' : '#dc2626',
                                                                    width: 'fit-content'
                                                                }}>
                                                                    {order.codSubmissionStatus === 'Pending' ? 'COD Collected' : order.codSubmissionStatus}
                                                                </span>
                                                                {order.codSubmissionStatus === 'Pending' && (
                                                                    <button
                                                                        onClick={() => handleSubmitCOD(order.id)}
                                                                        style={{ padding: '4px 8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                                                                    >
                                                                        Submit Cash
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Paid Online</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                        ₹{order.deliveryCharge} {order.adminBonus > 0 && <span style={{ color: '#10b981' }}>+ ₹{order.adminBonus?.toFixed(2)}</span>}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>
                                                        ₹{(order.deliveryCharge + (order.adminBonus || 0)).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'earnings' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Financial Performance</h3>
                                        <p style={contentSubtitle}>Track your trip earnings and operational recoveries.</p>
                                    </div>
                                    <button style={{ padding: '0.6rem 1.2rem', background: '#10b981', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                                        Withdraw Payout
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={saasStatCard}>
                                        <div style={statHeader}>
                                            <div style={{ ...statIconBox, color: '#10b981' }}><Wallet /></div>
                                            <div style={statTrend}>Balance</div>
                                        </div>
                                        <div style={statContent}>
                                            <span style={statLabel}>Available Funds</span>
                                            <span style={statValue}>₹{financeData.wallet?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div style={saasStatCard}>
                                        <div style={statHeader}>
                                            <div style={{ ...statIconBox, color: '#3b82f6' }}><TrendingUp /></div>
                                            <div style={statTrend}>Mileage</div>
                                        </div>
                                        <div style={statContent}>
                                            <span style={statLabel}>Total Distance</span>
                                            <span style={statValue}>{financeData.totalKm?.toFixed(1)} km</span>
                                        </div>
                                    </div>
                                    <div style={saasStatCard}>
                                        <div style={statHeader}>
                                            <div style={{ ...statIconBox, color: '#f59e0b' }}><Zap /></div>
                                            <div style={statTrend}>Admin Bonus</div>
                                        </div>
                                        <div style={statContent}>
                                            <span style={statLabel}>Extra Earnings</span>
                                            <span style={statValue}>₹{(financeData.adminBonus || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        </div>
                                    </div>
                                    <div style={saasStatCard}>
                                        <div style={statHeader}>
                                            <div style={{ ...statIconBox, color: '#ec4899' }}><DollarSign /></div>
                                            <div style={statTrend}>Lifetime</div>
                                        </div>
                                        <div style={statContent}>
                                            <span style={statLabel}>Total Earnings</span>
                                            <span style={statValue}>₹{financeData.lifetimeEarnings?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={chartCard}>
                                    <h3 style={cardTitle}>Earnings Transaction History</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {financeData.transactions.length === 0 ? (
                                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No transactions recorded yet.</div>
                                        ) : financeData.transactions.map((tx, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: tx.netProfit > 0 ? '#dcfce7' : '#eff6ff', color: tx.netProfit > 0 ? '#166534' : '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {tx.netProfit > 0 ? <DollarSign size={18} /> : <ArrowRight size={18} style={{ transform: 'rotate(-45deg)' }} />}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{tx.description}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                            {new Date(tx.createdAt).toLocaleDateString()} • {tx.Order?.distance}km trip
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800, color: tx.netProfit > 0 ? '#10b981' : '#ef4444', fontSize: '1.1rem' }}>
                                                        {tx.netProfit > 0 ? '+' : ''}₹{tx.netProfit.toFixed(2)}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>SETTLED TO WALLET</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'feedback' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Ratings & Feedback</h3>
                                        <p style={contentSubtitle}>See what customers say about your deliveries.</p>
                                    </div>
                                    <div style={ratingBox}>
                                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                        <span>{avgRating} Rider Rating • {ratedOrders.length} reviews</span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
                                    {feedbackOrders.length === 0 ? (
                                        <div style={{ ...chartCard, gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>
                                            No feedback received yet.
                                        </div>
                                    ) : feedbackOrders.map(order => (
                                        <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', background: '#fff' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{order.user?.name || 'Customer'}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 800 }}>
                                                    <Star size={14} color="#f59e0b" /> {order.ratingDelivery || 0}
                                                </div>
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 8 }}>
                                                {order.comment ? String(order.comment) : 'No comment provided.'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                Order #{order.id.slice(0, 8)} • {new Date(order.updatedAt || order.createdAt || order.date || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Step-by-Step Delivery Verification Modal */}
            <AnimatePresence>
                {otpModal && (
                    <div style={modalOverlay} onClick={() => {
                        setOtpModal(false);
                        setOtpError('');
                        setOtpInput('');
                        setDeliveryStep(1);
                        setDeliveryPhoto(null);
                        setPhotoPreview(null);
                        setCodReceivedAmount('');
                        setCodChangeAmount(0);
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ ...modal, maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '24px 24px 0 0', color: '#fff', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShieldCheck size={28} /> Delivery Verification
                                </h3>
                                <p style={{ margin: '5px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>Complete 3 steps to deliver order</p>
                                {/* Progress Bar */}
                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '8px' }}>
                                    {[1, 2, 3].map((step) => (
                                        <div key={step} style={{ flex: 1, height: '4px', borderRadius: '4px', background: deliveryStep >= step ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }} />
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '0 2rem 2rem' }}>
                                {/* Order Info Card */}
                                {currentOrder && (
                                    <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>ORDER AMOUNT</div>
                                                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#b45309' }}>₹{(currentOrder.totalAmount || 0).toFixed(2)}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>PAYMENT</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#b45309', background: '#fff', padding: '6px 12px', borderRadius: '8px' }}>
                                                    {selectedPaymentMethod || currentOrder.paymentMethod}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {otpError && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ ...errorBox, marginBottom: '1.5rem', background: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}>
                                        <AlertCircle size={18} color="#ef4444" />
                                        <span style={{ fontWeight: 700 }}>{otpError}</span>
                                    </motion.div>
                                )}

                                {otpSent && !otpVerified && deliveryStep === 1 && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#1e40af' }}>
                                        <CheckCircle size={18} color="#3b82f6" />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>4-digit OTP sent to customer's email</span>
                                    </motion.div>
                                )}

                                {/* STEP 1: OTP Verification */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        background: deliveryStep === 1 ? '#fff' : '#f8fafc',
                                        border: deliveryStep === 1 ? '2px solid #667eea' : '1px solid #e2e8f0',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        marginBottom: '1rem',
                                        opacity: deliveryStep > 1 ? 0.6 : 1
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: deliveryStep > 1 ? '#10b981' : '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                            {deliveryStep > 1 ? <CheckCircle size={20} /> : '1'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>Verify Customer OTP</h4>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>4-digit code sent to customer email</p>
                                        </div>
                                    </div>

                                    {/* Display OTP for Testing */}
                                    {(() => {
                                        console.log('🔍 Render check - displayOtp:', displayOtp, 'deliveryStep:', deliveryStep);
                                        return displayOtp && deliveryStep === 1;
                                    })() && (
                                            <div style={{
                                                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                                border: '2px dashed #f59e0b',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                marginBottom: '1rem',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                                    🔐 TEST OTP (Backend Console)
                                                </div>
                                                <div style={{
                                                    fontSize: '2rem',
                                                    fontWeight: 900,
                                                    color: '#d97706',
                                                    letterSpacing: '8px',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {displayOtp}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: '#92400e', marginTop: '4px', fontStyle: 'italic' }}>
                                                    Copy this OTP and paste below ↓
                                                </div>
                                            </div>
                                        )}

                                    {deliveryStep === 1 && (
                                        <div>
                                            <div style={{ ...otpDisplay, marginBottom: '1rem' }}>
                                                <input
                                                    type="text"
                                                    maxLength="4"
                                                    value={otpInput}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        setOtpInput(val);
                                                        setOtpError('');
                                                    }}
                                                    placeholder="0 0 0 0"
                                                    style={{ ...otpField, fontSize: '1.5rem', letterSpacing: '12px' }}
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                onClick={handleNextStep}
                                                disabled={!otpInput || otpInput.length !== 4}
                                                style={{ ...confirmBtn, width: '100%', opacity: (!otpInput || otpInput.length !== 4) ? 0.5 : 1, marginBottom: '0.75rem' }}
                                            >
                                                Verify OTP <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                            </button>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button
                                                    onClick={() => {
                                                        setOtpInput('');
                                                        setOtpError('');
                                                    }}
                                                    style={{ ...secondaryBtn, flex: 1, fontSize: '0.85rem', padding: '0.65rem' }}
                                                >
                                                    ↻ Re-enter OTP
                                                </button>
                                                <button
                                                    onClick={handleResendOtp}
                                                    disabled={resendingOtp}
                                                    style={{ ...secondaryBtn, flex: 1, fontSize: '0.85rem', padding: '0.65rem', background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e', opacity: resendingOtp ? 0.6 : 1 }}
                                                >
                                                    {resendingOtp ? '⏳ Sending...' : '📧 Resend OTP'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {deliveryStep > 1 && (
                                        <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '0.85rem', fontWeight: 700 }}>
                                            <CheckCircle size={16} /> OTP Verified Successfully
                                        </div>
                                    )}
                                </motion.div>

                                {/* STEP 2: Payment Method */}
                                {deliveryStep === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: '#fff',
                                            border: '2px solid #667eea',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                                2
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>Collect Payment</h4>
                                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>Customer can pay via COD, QR, or Razorpay online</p>
                                            </div>
                                        </div>
                                        {!showPaymentOptions && (
                                            <div>
                                                <button
                                                    onClick={() => {
                                                        setShowPaymentOptions(true);
                                                        setPaymentCompleted(false); // Reset payment status when changing method
                                                    }}
                                                    style={{ ...confirmBtn, width: '100%', background: '#fbbf24', marginBottom: '10px' }}
                                                >
                                                    <DollarSign size={18} /> Change Payment Method
                                                </button>
                                                {selectedPaymentMethod !== 'COD' && paymentCompleted && (
                                                    <button
                                                        onClick={handleNextStep}
                                                        style={{ ...confirmBtn, width: '100%' }}
                                                    >
                                                        Continue with {selectedPaymentMethod} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                                    </button>
                                                )}
                                                {selectedPaymentMethod !== 'COD' && !paymentCompleted && (
                                                    <div style={{ padding: '12px', borderRadius: '10px', background: '#fef3c7', border: '1px solid #fbbf24', color: '#92400e', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                                                        ⏳ Waiting for Razorpay / online payment to complete...
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {showPaymentOptions && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPaymentMethod('COD');
                                                        setShowPaymentOptions(false);
                                                        setOtpError('');
                                                        const totalDue = parseFloat(currentOrder?.totalAmount || 0);
                                                        setCodReceivedAmount(totalDue ? String(totalDue) : '');
                                                        setCodChangeAmount(0);
                                                    }}
                                                    disabled={paymentProcessing}
                                                    style={{
                                                        padding: '1.25rem',
                                                        borderRadius: '12px',
                                                        border: '2px solid #10b981',
                                                        background: '#fff',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        opacity: paymentProcessing ? 0.6 : 1
                                                    }}
                                                >
                                                    <Wallet size={24} color="#10b981" />
                                                    <div style={{ fontWeight: 900, color: '#1e293b' }}>Cash (COD)</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Collect cash</div>
                                                </button>
                                                <button
                                                    onClick={() => handlePaymentAtDelivery('UPI')}
                                                    disabled={paymentProcessing}
                                                    style={{
                                                        padding: '1.25rem',
                                                        borderRadius: '12px',
                                                        border: '2px solid #667eea',
                                                        background: '#fff',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        opacity: paymentProcessing ? 0.6 : 1
                                                    }}
                                                >
                                                    <Zap size={24} color="#667eea" />
                                                    <div style={{ fontWeight: 900, color: '#1e293b' }}>UPI/Online</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Digital payment</div>
                                                </button>
                                            </div>
                                        )}
                                        {selectedPaymentMethod === 'COD' && !showPaymentOptions && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca', background: '#fff5f5' }}>
                                                <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>COD Calculator</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.75rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Order Amount</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b45309' }}>₹{(currentOrder?.totalAmount || 0).toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Cash Received</div>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={codReceivedAmount}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setCodReceivedAmount(val);
                                                                const received = parseFloat(val || 0);
                                                                const totalDue = parseFloat(currentOrder?.totalAmount || 0);
                                                                const change = Math.max(0, received - totalDue);
                                                                setCodChangeAmount(change);
                                                                if (received >= totalDue) setOtpError('');
                                                            }}
                                                            placeholder="Enter received amount"
                                                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #fecaca', fontWeight: 700 }}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Change to Return</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#16a34a' }}>₹{codChangeAmount.toFixed(2)}</div>
                                                </div>
                                                <button
                                                    onClick={() => handlePaymentAtDelivery('COD')}
                                                    disabled={paymentProcessing}
                                                    style={{ ...confirmBtn, width: '100%', background: '#ef4444', opacity: paymentProcessing ? 0.6 : 1 }}
                                                >
                                                    {paymentProcessing ? '⏳ Processing...' : 'Mark COD Paid & Convert to Online'}
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* STEP 3: Photo Upload */}
                                {deliveryStep === 3 && paymentCompleted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: '#fff',
                                            border: '2px solid #667eea',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                                3
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>Upload Delivery Proof</h4>
                                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>Take photo of opened package</p>
                                            </div>
                                        </div>
                                        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: '#f8fafc', position: 'relative', marginBottom: '1rem' }}>
                                            {photoPreview ? (
                                                <div>
                                                    <img src={photoPreview} alt="Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
                                                    <button onClick={() => { setDeliveryPhoto(null); setPhotoPreview(null); }} style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700, textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                        ✕ Remove & Retake
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Package size={48} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                                                        📸 Take Photo
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        capture="environment"
                                                        onChange={handlePhotoUpload}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                    />
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                        Max 5MB • JPG, PNG
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={verifyAndComplete}
                                            disabled={!deliveryPhoto || uploadingPhoto}
                                            style={{
                                                ...confirmBtn,
                                                width: '100%',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                opacity: (!deliveryPhoto || uploadingPhoto) ? 0.5 : 1,
                                                fontSize: '1.1rem',
                                                padding: '1rem'
                                            }}
                                        >
                                            {uploadingPhoto ? '⏳ Processing...' : '✓ Complete Delivery'}
                                        </button>
                                    </motion.div>
                                )}

                                {/* Warning: Payment not completed */}
                                {deliveryStep === 3 && !paymentCompleted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: '#fef3c7',
                                            border: '2px solid #fbbf24',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            marginBottom: '1rem',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                                        <div style={{ fontWeight: 900, color: '#92400e', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                            Payment Not Completed
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#78350f' }}>
                                            Please complete the payment before proceeding to photo upload
                                        </div>
                                        <button
                                            onClick={() => setDeliveryStep(2)}
                                            style={{ ...confirmBtn, marginTop: '1rem', background: '#fbbf24' }}
                                        >
                                            ← Back to Payment
                                        </button>
                                    </motion.div>
                                )}

                                {/* Cancel Button */}
                                <button
                                    onClick={() => {
                                        setOtpModal(false);
                                        setOtpError('');
                                        setOtpInput('');
                                        setDeliveryStep(1);
                                        setDeliveryPhoto(null);
                                        setPhotoPreview(null);
                                        setCodReceivedAmount('');
                                        setCodChangeAmount(0);
                                        setPaymentCompleted(false); // Reset payment status
                                        setSelectedPaymentMethod(null); // Reset payment method
                                    }}
                                    style={{ ...cancelBtn, width: '100%', marginTop: '1rem' }}
                                >
                                    Cancel Delivery
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <StatusPopup
                show={popup.show}
                type={popup.type}
                title={popup.title}
                message={popup.message}
                onClose={() => setPopup(prev => ({ ...prev, show: false }))}
            />

            {/* Online Payment QR Code Modal */}
            {showOnlinePaymentQR && currentOrder && (
                <OnlinePaymentQR
                    order={currentOrder}
                    deliveryPersonId={user.id}
                    onSuccess={handleOnlinePaymentSuccess}
                    onClose={() => setShowOnlinePaymentQR(false)}
                />
            )}
        </div>
    );
};

// Styles (Matching Admin Dashboard)
const dashboardContainer = { display: 'flex', minHeight: '100dvh', width: '100%', background: '#f1f5f9', overflow: 'hidden' };
const sidebar = { width: '280px', background: 'linear-gradient(180deg, #064e3b 0%, #022c22 100%)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' };
const logoWrapper = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', paddingLeft: '0.5rem' };
const logoIcon = { width: '42px', height: '42px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' };
const logoText = { color: '#fff', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.025em' };
const navSection = { marginBottom: '2rem' };
const navLabel = { fontSize: '0.65rem', fontWeight: 800, color: '#475569', letterSpacing: '0.1em', marginBottom: '1rem', display: 'block', paddingLeft: '0.75rem' };
const navGroup = { display: 'flex', flexDirection: 'column', gap: '0.35rem' };
const navBtn = { display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.25rem', background: 'none', border: 'none', borderRadius: '16px', textAlign: 'left', fontWeight: 600, color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', width: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
const activeNav = { ...navBtn, background: 'rgba(16, 185, 129, 0.15)', color: '#fff', fontWeight: 700, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.2)' };
const sidebarFooter = { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' };
const profileInSidebar = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0.75rem' };
const userAvatarMini = { width: '36px', height: '36px', borderRadius: '12px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' };
const profileInfo = { display: 'flex', flexDirection: 'column' };
const profName = { fontSize: '0.85rem', fontWeight: 800 };
const profRole = { fontSize: '0.7rem', fontWeight: 600 };
const logoutBtnSidebar = { ...navBtn, color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' };
const backToHubBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', color: '#94a3b8' };
const content = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' };
const topBar = { height: '80px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', flexShrink: 0 };
const topBarLeft = { display: 'flex', alignItems: 'center', gap: '1rem' };
const topBarRight = { display: 'flex', alignItems: 'center', gap: '1.5rem' };
const statusBadgeContainer = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '12px' };
const statusDot = { width: '8px', height: '8px', borderRadius: '50%' };
const shiftBtn = { background: '#1e293b', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' };
const topNavBtn = { display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#10b981', fontWeight: 800, fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '10px' };
const vDivider = { width: '1px', height: '24px', background: '#e2e8f0' };
const deliveryBadge = { background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.5px', border: '1px solid rgba(34, 197, 94, 0.2)' };
const scrollArea = { flex: 1, overflowY: 'auto', padding: '2rem 3rem' };
const pane = { display: 'flex', flexDirection: 'column' };
const adminPageHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' };
const headerInfo = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const contentTitle = { fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' };
const contentSubtitle = { fontSize: '0.95rem', color: '#64748b', fontWeight: 500 };
const ratingBox = { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' };
const saasStatCard = { background: '#ffffff', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden', cursor: 'pointer' };
const statHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const statIconBox = { width: '56px', height: '56px', borderRadius: '18px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' };
const statTrend = { fontSize: '0.75rem', fontWeight: 800, color: '#10b981', background: '#f0fdf4', padding: '0.4rem 0.75rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)' };
const statContent = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const statLabel = { fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' };
const statValue = { fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' };
const doubleGrid = { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' };
const chartCard = { background: '#ffffff', padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)' };
const cardTitle = { fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '2.5rem', letterSpacing: '-0.3px' };
const summaryItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' };
const oBadge = { fontSize: '0.65rem', fontWeight: 800, background: '#fff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' };
const actionBtn = { display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', color: '#334155', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left', marginBottom: '0.5rem' };
const orderGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' };
const orderCard = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' };
const orderHeader = { padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const orderId = { fontSize: '0.8rem', fontWeight: 800, color: '#64748b' };
const statusBadge = { padding: '0.3rem 0.7rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800 };
const orderBody = { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' };
const orderRow = { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 };
const orderFooter = { padding: '1.25rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' };
const secondaryBtn = { flex: 1, padding: '0.6rem', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '10px', color: '#475569', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
const deliveryBtn = { width: '100%', padding: '0.85rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modal = { background: '#fff', width: '90%', maxWidth: '350px', padding: '2rem', borderRadius: '24px', textAlign: 'center' };
const modalTitle = { fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' };
const modalSub = { fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' };
const errorBox = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'left' };
const otpDisplay = { marginBottom: '1.5rem' };
const otpField = { fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', letterSpacing: '0.5rem', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', width: '100%', outline: 'none' };
const modalActions = { display: 'flex', gap: '1rem' };
const cancelBtn = { flex: 1, padding: '0.85rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' };
const confirmBtn = { flex: 1, padding: '0.85rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' };
const emptyState = { padding: '6rem 0', textAlign: 'center', color: '#94a3b8' };
const emptyStateSmall = { padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' };

// Notifications
const notificationPanel = { position: 'absolute', top: '100%', right: 0, width: '300px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', zIndex: 1000, marginTop: '10px', overflow: 'hidden' };
const notifHeader = { padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 800, fontSize: '0.85rem', color: '#10b981', background: '#f8fafc' };
const notifList = { maxHeight: '350px', overflowY: 'auto' };
const notifItem = { padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' };
const notifTitle = { fontWeight: 700, fontSize: '0.8rem', color: '#1e293b' };
const notifMsg = { fontSize: '0.7rem', color: '#64748b' };
const notifTime = { fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.4rem' };
const pNoNotif = { padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' };

const payoutPreview = {
    marginTop: '1rem',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1'
};

const payoutPreviewRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#64748b',
    marginBottom: '0.25rem'
};

const payoutTotalRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    fontWeight: 800,
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #e2e8f0'
};

export default DeliveryDashboard;
