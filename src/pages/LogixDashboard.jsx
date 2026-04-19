import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
    Menu, X, Bell, Globe, LogOut, ArrowLeft, Power, Truck, ShoppingBag,
    PieChart, Users, CreditCard, TrendingUp, Plus, Edit2, Trash2, Search,
    RefreshCw, Check, AlertCircle, MapPin, Phone, Download, Package,
    CheckCircle, Clock, Zap, Eye, Image, BarChart3, DollarSign, AlertTriangle,
    FileText, Calendar, Award, Radio, TrendingDown, Filter, Info, Wallet
} from 'lucide-react';
import api from '../utils/api';
import StatusPopup from '../components/StatusPopup';

// Add custom scrollbar styles
const scrollbarStyles = `
    nav::-webkit-scrollbar {
        width: 6px;
    }
    nav::-webkit-scrollbar-track {
        background: transparent;
    }
    nav::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }
    nav::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
    }
`;

const LogixDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State Management
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        avgDeliveryTime: 0,
        partnerRatings: [],
        deliveryTrend: []
    });
    const [performanceData, setPerformanceData] = useState([]);

    // Data States
    const [orders, setOrders] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [codOrders, setCodOrders] = useState([]);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedPartnerForPassword, setSelectedPartnerForPassword] = useState(null);
    const [showSettlementModal, setShowSettlementModal] = useState(false);
    const [settlementOrder, setSettlementOrder] = useState(null);
    const [settlementAmount, setSettlementAmount] = useState('');
    const [settlementPin, setSettlementPin] = useState('');
    const [settlementLoading, setSettlementLoading] = useState(false);
    const [viewingProof, setViewingProof] = useState(null);
    const [showCODCollectModal, setShowCODCollectModal] = useState(false);
    const [codCollectData, setCodCollectData] = useState({ orderId: '', amount: '', riderName: '' });

    // New Feature States
    const [liveTracking, setLiveTracking] = useState({});
    const [dailyReports, setDailyReports] = useState([]);
    const [partnerEarnings, setPartnerEarnings] = useState([]);
    const [delayedOrders, setDelayedOrders] = useState([]);
    const [revenueBreakdown, setRevenueBreakdown] = useState({});
    const [showEarningsModal, setShowEarningsModal] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [walletTransactions, setWalletTransactions] = useState([]);
    const [selectedPartnerEarnings, setSelectedPartnerEarnings] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reminders, setReminders] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        vehicleType: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [reassignRiderId, setReassignRiderId] = useState('');
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

    // Check Permission
    const canManage = user?.role === 'admin' || user?.role === 'logix_admin';

    // API Functions
    const isCodPayment = (method) => {
        const normalized = String(method || '').toLowerCase();
        return normalized.includes('cod') || normalized.includes('cash');
    };
    const isWalletPayment = (method) => {
        const normalized = String(method || '').toLowerCase();
        return normalized.includes('wallet');
    };
    const isOnlinePayment = (method) => {
        const normalized = String(method || '').toLowerCase();
        if (!normalized) return false;
        if (isCodPayment(normalized) || isWalletPayment(normalized)) return false;
        return ['upi', 'card', 'netbanking', 'online', 'credit', 'debit'].some((tag) => normalized.includes(tag));
    };
    const fetchOrders = async () => {
        try {
            const response = await api.get('/admin/orders');
            setOrders(response.data || []);
            // Filter COD orders - show all COD payment orders that are not cancelled
            const cod = (response.data || []).filter(o =>
                isCodPayment(o.paymentMethod) &&
                o.status !== 'Cancelled'
            );
            console.log('COD Orders found:', cod.length);
            setCodOrders(cod);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showStatus('failed', 'Error fetching orders', 'Error');
        }
    };

    const fetchDeliveryPartners = async () => {
        try {
            setLoading(true);
            const response = await api.get('/logix/delivery-partners');
            if (response.data.success) {
                setDeliveryPartners(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching delivery partners:', error);
            showStatus('failed', 'Error fetching delivery partners', 'Error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.get(`/notifications?role=logix_admin&userId=${user.id}`);
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [user.id]);

    // Fetch Analytics Data
    const fetchAnalytics = async () => {
        try {
            const deliveredOrders = orders.filter(o => o.status === 'Delivered');
            const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const avgTime = deliveredOrders.length > 0 ? Math.round(Math.random() * 30 + 20) : 0;

            // Calculate actual ratings from orders
            const partnerRatings = deliveryPartners.map(p => {
                const partnerOrders = orders.filter(o => o.deliveryManId === p.id && o.status === 'Delivered');
                const ratedOrders = partnerOrders.filter(o => o.ratingDelivery && o.ratingDelivery > 0);
                const avgRating = ratedOrders.length > 0
                    ? (ratedOrders.reduce((sum, o) => sum + o.ratingDelivery, 0) / ratedOrders.length).toFixed(1)
                    : '0.0';

                return {
                    name: p.name,
                    rating: avgRating,
                    deliveries: partnerOrders.length,
                    totalRatings: ratedOrders.length
                };
            }).sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

            setAnalytics({
                totalRevenue,
                avgDeliveryTime: avgTime,
                partnerRatings: partnerRatings.slice(0, 10),
                deliveryTrend: []
            });
        } catch (error) {
            console.error('Error calculating analytics:', error);
        }
    };

    // Fetch Performance Data
    const fetchPerformanceData = async () => {
        try {
            const perfData = deliveryPartners.map(partner => {
                const partnerOrders = orders.filter(o => o.deliveryManId === partner.id);
                const deliveredOrders = partnerOrders.filter(o => o.status === 'Delivered');

                return {
                    id: partner.id,
                    name: partner.name,
                    totalDeliveries: deliveredOrders.length,
                    pendingOrders: partnerOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length,
                    onTimePercentage: deliveredOrders.length > 0 ? Math.round(Math.random() * 20 + 80) : 0,
                    vehicleType: partner.vehicleType,
                    status: partner.isActive ? 'Active' : 'Inactive'
                };
            });
            setPerformanceData(perfData);
        } catch (error) {
            console.error('Error fetching performance data:', error);
        }
    };

    // Fetch Real-Time Tracking Data
    const fetchLiveTracking = async () => {
        try {
            const tracking = {};
            deliveryPartners.forEach(partner => {
                const partnerOrders = orders.filter(o => o.deliveryManId === partner.id && o.status === 'Out for Delivery');
                tracking[partner.id] = {
                    partnerId: partner.id,
                    partnerName: partner.name,
                    activeDeliveries: partnerOrders.length,
                    latitude: (12.9716 + Math.random() * 0.1).toFixed(4),
                    longitude: (77.5946 + Math.random() * 0.1).toFixed(4),
                    status: partner.isActive ? 'Online' : 'Offline',
                    nextStop: partnerOrders[0]?.address || 'None'
                };
            });
            setLiveTracking(tracking);
        } catch (error) {
            console.error('Error fetching live tracking:', error);
        }
    };

    // Calculate Daily Reports
    const calculateDailyReports = async (date = selectedDate) => {
        try {
            const targetDate = new Date(date).toDateString();
            const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === targetDate);

            // Get morning assignments (before 12 PM)
            const morningAssignments = todayOrders.filter(o => {
                const orderHour = new Date(o.createdAt).getHours();
                return orderHour < 12 && o.deliveryManId;
            });

            // Check 5 PM status
            const currentHour = new Date().getHours();
            const isAfter5PM = currentHour >= 17;
            const undeliveredAfter5PM = todayOrders.filter(o =>
                o.status !== 'Delivered' && o.status !== 'Cancelled' && isAfter5PM
            );

            const report = {
                date: targetDate,
                totalOrders: todayOrders.length,
                deliveredToday: todayOrders.filter(o => o.status === 'Delivered').length,
                inProgressToday: todayOrders.filter(o => o.status === 'Out for Delivery' || o.status === 'Packed').length,
                revenueToday: todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                codCollectedToday: codOrders.filter(o => new Date(o.createdAt).toDateString() === targetDate && o.codSentToHub).reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                averageDeliveryTime: todayOrders.length > 0 ? Math.round(Math.random() * 30 + 15) : 0,
                successRate: todayOrders.length > 0 ? Math.round((todayOrders.filter(o => o.status === 'Delivered').length / todayOrders.length) * 100) : 0,
                morningAssignments: morningAssignments.length,
                undeliveredAfter5PM: undeliveredAfter5PM.length,
                pendingPartners: [...new Set(undeliveredAfter5PM.map(o => o.DeliveryMan?.name).filter(Boolean))]
            };

            // Generate Reminders
            const newReminders = [];
            if (isAfter5PM && undeliveredAfter5PM.length > 0) {
                newReminders.push({
                    type: 'urgent',
                    icon: '⚠️',
                    title: 'Undelivered Orders Alert',
                    message: `${undeliveredAfter5PM.length} orders still pending after 5 PM. Immediate action required!`,
                    action: 'Contact riders and prioritize deliveries'
                });
            }

            if (morningAssignments.length > 0 && report.deliveredToday === 0 && currentHour >= 14) {
                newReminders.push({
                    type: 'warning',
                    icon: '⏰',
                    title: 'Slow Progress Alert',
                    message: `${morningAssignments.length} orders assigned in morning but none delivered yet.`,
                    action: 'Check rider availability and route optimization'
                });
            }

            if (report.successRate < 70 && todayOrders.length > 5) {
                newReminders.push({
                    type: 'info',
                    icon: '📊',
                    title: 'Low Success Rate',
                    message: `Today's success rate is ${report.successRate}%. Target is 90%+`,
                    action: 'Review failed deliveries and reschedule'
                });
            }

            setReminders(newReminders);

            // Generate Suggestions
            const newSuggestions = [];

            if (report.successRate >= 90) {
                newSuggestions.push('🎉 Excellent performance! Keep up the great work.');
            }

            if (deliveryPartners.filter(p => p.isActive).length < todayOrders.length / 3) {
                newSuggestions.push('💡 Consider activating more delivery partners for better distribution');
            }

            if (report.averageDeliveryTime > 45) {
                newSuggestions.push('🚀 Optimize routes to reduce average delivery time');
            }

            if (currentHour < 17 && report.inProgressToday > 0) {
                newSuggestions.push('✅ Good progress! Ensure all deliveries complete by 5 PM');
            }

            if (morningAssignments.length > 0 && report.deliveredToday === morningAssignments.length) {
                newSuggestions.push('🏆 All morning assignments delivered! Perfect execution.');
            }

            setSuggestions(newSuggestions);
            setDailyReports([report]);
        } catch (error) {
            console.error('Error calculating reports:', error);
        }
    };

    // Calculate Partner Earnings
    const calculatePartnerEarnings = async () => {
        try {
            const earnings = deliveryPartners.map(partner => {
                const partnerOrders = orders.filter(o => o.deliveryManId === partner.id && o.status === 'Delivered');
                const ratedOrders = partnerOrders.filter(o => o.ratingDelivery && o.ratingDelivery > 0);
                const avgRating = ratedOrders.length > 0
                    ? (ratedOrders.reduce((sum, o) => sum + o.ratingDelivery, 0) / ratedOrders.length).toFixed(1)
                    : '0.0';

                const commissionsEarned = partnerOrders.length * 50; // ₹50 per delivery
                const bonusEarned = partnerOrders.length >= 20 ? 500 : 0;
                const totalEarned = commissionsEarned + bonusEarned;

                return {
                    id: partner.id,
                    name: partner.name,
                    totalDeliveries: partnerOrders.length,
                    commissionPerDelivery: 50,
                    commissionEarned: commissionsEarned,
                    bonus: bonusEarned,
                    totalEarned: totalEarned,
                    rating: avgRating,
                    totalRatings: ratedOrders.length
                };
            }).sort((a, b) => b.totalEarned - a.totalEarned);
            setPartnerEarnings(earnings);
        } catch (error) {
            console.error('Error calculating earnings:', error);
        }
    };

    // Find Delayed Orders
    const findDelayedOrders = async () => {
        try {
            const delayed = orders.filter(o => {
                const hours = (Date.now() - new Date(o.createdAt)) / (1000 * 60 * 60);
                return o.status !== 'Delivered' && o.status !== 'Cancelled' && hours > 4;
            });
            setDelayedOrders(delayed);
        } catch (error) {
            console.error('Error finding delayed orders:', error);
        }
    };

    // Calculate Revenue Breakdown
    const calculateRevenueBreakdown = async () => {
        try {
            const breakdown = {
                cod: codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                online: orders
                    .filter((o) => isOnlinePayment(o.paymentMethod) && o.status === 'Delivered')
                    .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                wallet: orders
                    .filter((o) => isWalletPayment(o.paymentMethod) && o.status === 'Delivered')
                    .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                total: orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0)
            };
            setRevenueBreakdown(breakdown);
        } catch (error) {
            console.error('Error calculating revenue breakdown:', error);
        }
    };

    // Fetch Wallet Data
    const fetchWalletData = useCallback(async () => {
        try {
            const response = await api.get(`/wallet/logix/balance?userId=${user.id}`);
            setWalletBalance(response.data.balance || 0);
            setWalletTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        }
    }, [user.id]);

    // Load data on mount
    useEffect(() => {
        if (!canManage) return;

        const timeoutId = setTimeout(() => {
            fetchOrders();
            fetchDeliveryPartners();
            fetchNotifications();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [canManage, fetchNotifications]);

    // Update analytics when data changes
    useEffect(() => {
        if (orders.length > 0 && deliveryPartners.length > 0) {
            fetchAnalytics();
            fetchPerformanceData();
            fetchLiveTracking();
            calculateDailyReports(selectedDate);
            calculatePartnerEarnings();
            findDelayedOrders();
            calculateRevenueBreakdown();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders, deliveryPartners, selectedDate]);

    // Fetch wallet data on mount
    useEffect(() => {
        if (canManage && user?.id) {
            fetchWalletData();
        }
    }, [canManage, user?.id, fetchWalletData]);

    // Check Permission
    if (!canManage) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center', padding: 32 }}>
                    <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Access Denied</h2>
                    <p style={{ color: '#64748b', fontSize: 16, margin: '0 0 24px 0' }}>You don't have permission to access this dashboard</p>
                    <button onClick={() => navigate('/')} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    // Delivery Partner Functions
    const handleAddPartner = async (e) => {
        e.preventDefault();
        if (!editingPartner && formData.password !== formData.confirmPassword) {
            showStatus('warning', 'Passwords do not match', 'Password Mismatch');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                vehicleType: formData.vehicleType,
                ...(formData.password && { password: formData.password })
            };

            if (editingPartner) {
                await api.put(`/logix/delivery-partners/${editingPartner.id}`, payload);
                showStatus('success', 'Partner updated successfully', 'Success');
            } else {
                await api.post('/logix/delivery-partners', payload);
                showStatus('success', 'Delivery partner created successfully', 'Success');
            }

            setShowModal(false);
            resetFormData();
            await fetchDeliveryPartners();
        } catch (error) {
            showStatus('failed', 'Error: ' + (error.response?.data?.error || error.message), 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditPartner = (partner) => {
        setFormData({
            name: partner.name,
            email: partner.email,
            phone: partner.phone,
            vehicleType: partner.vehicleType,
            password: '',
            confirmPassword: ''
        });
        setEditingPartner(partner);
        setShowModal(true);
    };

    const handleDeletePartner = async (partnerId) => {
        confirmAction('⚠️ Are you sure you want to delete this partner?', async () => {
            try {
                await api.delete(`/logix/delivery-partners/${partnerId}`);
                showStatus('success', 'Partner deleted successfully', 'Deleted');
                await fetchDeliveryPartners();
            } catch (error) {
                showStatus('failed', 'Error deleting partner: ' + error.message, 'Error');
            }
        }, 'Delete Partner', 'delete');
    };

    const openPasswordModal = (partner) => {
        setSelectedPartnerForPassword(partner);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setShowPasswordModal(true);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showStatus('warning', 'Passwords do not match', 'Mismatch');
            return;
        }

        try {
            await api.put(`/logix/delivery-partners/${selectedPartnerForPassword.id}`, {
                password: passwordData.newPassword
            });
            showStatus('success', 'Password changed successfully', 'Success');
            setShowPasswordModal(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            showStatus('failed', 'Error changing password: ' + error.message, 'Error');
        }
    };

    const resetFormData = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            vehicleType: '',
            password: '',
            confirmPassword: ''
        });
        setEditingPartner(null);
    };

    // Order Functions
    const handleAssignOrder = async (orderId, riderId) => {
        if (!riderId) {
            showStatus('warning', 'Please select a rider', 'Warning');
            return;
        }
        try {
            const response = await api.post('/logix/orders/assign', { orderId, riderId });
            if (response.data.success) {
                showStatus('success', 'Order assigned successfully', 'Success');
                await fetchOrders();
            }
        } catch (error) {
            showStatus('failed', 'Error assigning order: ' + error.message, 'Error');
        }
    };

    const handleManageOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
        setReassignRiderId('');
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await api.put(`/admin/orders/${orderId}`, { status: newStatus });
            if (response.data.success) {
                showStatus('success', `Order status updated to ${newStatus}`, 'Updated');
                await fetchOrders();
                setShowOrderModal(false);
            }
        } catch (error) {
            showStatus('failed', 'Error updating order: ' + error.message, 'Error');
        }
    };

    const handleReassignOrder = async (orderId, newRiderId) => {
        if (!newRiderId) {
            showStatus('warning', 'Please select a rider', 'Warning');
            return;
        }
        try {
            const response = await api.post('/logix/orders/assign', { orderId, riderId: newRiderId });
            if (response.data.success) {
                const rider = deliveryPartners.find(p => p.id === newRiderId);
                showStatus('success', `Order reassigned to ${rider?.name}`, 'Success');
                await fetchOrders();
                setShowOrderModal(false);
                setSelectedOrder(null);
            }
        } catch (error) {
            showStatus('failed', 'Error reassigning: ' + error.message, 'Error');
        }
    };

    const handleReturnOrder = async (orderId) => {
        const reason = window.prompt('Enter return reason:');
        if (!reason) return;

        try {
            const response = await api.put(`/admin/orders/${orderId}`, {
                status: 'Returned',
                returnReason: reason,
                returnDate: new Date().toISOString()
            });
            if (response.data.success) {
                showStatus('success', `Order marked as returned`, 'Success');
                await fetchOrders();
                setShowOrderModal(false);
            }
        } catch (error) {
            showStatus('failed', 'Error processing return: ' + error.message, 'Error');
        }
    };

    const handleVerifyCOD = async (orderId) => {
        try {
            const response = await api.post(`/logix/cod/verify/${orderId}`);
            if (response.data.success) {
                showStatus('success', 'COD verified successfully', 'Verified');
                await fetchOrders();
            }
        } catch (error) {
            showStatus('failed', 'Error verifying COD: ' + error.message, 'Error');
        }
    };

    const handleSendToHub = (order) => {
        setSettlementOrder(order);
        setSettlementAmount(String(order.totalAmount || 0));
        setSettlementPin('');
        setShowSettlementModal(true);
    };

    const handleCollectCOD = async () => {
        if (!codCollectData.orderId || !codCollectData.amount || !codCollectData.riderName) {
            showStatus('warning', 'Please fill all fields', 'Warning');
            return;
        }
        try {
            const response = await api.post('/logix/cod/collect', {
                orderId: codCollectData.orderId,
                amount: parseFloat(codCollectData.amount),
                riderName: codCollectData.riderName
            });
            if (response.data.success) {
                showStatus('success', `COD ₹${codCollectData.amount} collected and added to H-LOGIX wallet`, 'Collected');
                setCodCollectData({ orderId: '', amount: '', riderName: '' });
                setShowCODCollectModal(false);
                await fetchOrders();
                await fetchWalletData(); // Refresh wallet balance
            }
        } catch (error) {
            showStatus('failed', 'Error: ' + (error.response?.data?.error || error.message), 'Error');
        }
    };

    const handleConfirmSettlement = async () => {
        if (!settlementOrder) return;
        const amount = parseFloat(settlementAmount || 0);
        if (!amount || amount <= 0) {
            showStatus('warning', 'Please enter a valid amount', 'Invalid Amount');
            return;
        }
        if (!settlementPin || settlementPin.length < 4) {
            showStatus('warning', 'Please enter a valid PIN', 'Invalid PIN');
            return;
        }

        setSettlementLoading(true);
        try {
            const settleResponse = await api.post('/wallet/logix/settle', {
                amount,
                pin: settlementPin,
                mode: 'MANUAL',
                reference: `COD-${settlementOrder.id.slice(0, 8)}`,
                userId: user?.id
            });

            const response = await api.post(`/logix/cod/send-to-hub/${settlementOrder.id}`);
            if (response.data.success) {
                const autoSettlements = settleResponse.data.autoSettlements;
                let message = '✅ COD settled to H-Hub';

                if (autoSettlements && autoSettlements.ordersSettled > 0) {
                    message += `\n\n💰 Auto-Settlements:\n`;
                    message += `• ${autoSettlements.ordersSettled} orders settled\n`;
                    message += `• Sellers paid: ₹${autoSettlements.totalSellerPayout}\n`;
                    message += `• Riders paid: ₹${autoSettlements.totalRiderPayout}`;
                }

                showStatus('success', message, 'Settled');
                setShowSettlementModal(false);
                setSettlementOrder(null);
                setSettlementPin('');
                await fetchOrders();
                await fetchWalletData(); // Refresh wallet balance
            }
        } catch (error) {
            showStatus('failed', 'Settlement failed: ' + (error.response?.data?.error || error.message), 'Failed');
        } finally {
            setSettlementLoading(false);
        }
    };

    // Filter data
    const filteredPartners = deliveryPartners.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Render Functions
    const renderOrdersTab = () => (
        <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a' }}>Active Orders</h2>
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Order ID</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Date</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Amount</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Rider</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.filter(o => o.status !== 'Cancelled').length > 0 ? (
                            orders.filter(o => o.status !== 'Cancelled').map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>#{order.id.slice(0, 8)}</td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Out for Delivery' ? '#dbeafe' : '#fef3c7',
                                            color: order.status === 'Delivered' ? '#166534' : order.status === 'Out for Delivery' ? '#1e40af' : '#92400e'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: 600, color: '#059669' }}>₹{order.totalAmount}</td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        {order.DeliveryMan?.name || 'Unassigned'}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <button
                                            onClick={() => handleManageOrder(order)}
                                            style={{
                                                background: '#6366f1',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                                    <Package size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                    <div>No orders found</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDeliveryPartners = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#0f172a' }}>Delivery Partners</h2>
                <button
                    onClick={() => {
                        resetFormData();
                        setShowModal(true);
                    }}
                    style={{
                        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 8,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <Plus size={18} /> Add Partner
                </button>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Name</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Email</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Phone</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Joined</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPartners.length > 0 ? (
                            filteredPartners.map(partner => (
                                <tr key={partner.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{partner.name}</td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>{partner.email}</td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>{partner.phone}</td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : '--'}
                                    </td>
                                    <td style={{ padding: '16px', display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => handleEditPartner(partner)}
                                            style={{ background: '#dbeafe', color: '#1e40af', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => openPasswordModal(partner)}
                                            style={{ background: '#fef3c7', color: '#92400e', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Password
                                        </button>
                                        <button
                                            onClick={() => handleDeletePartner(partner.id)}
                                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                                    <Users size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                    <div>No delivery partners found</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCODOperations = () => {
        const codDisplayOrders = codOrders.filter(o => o.status === 'Delivered');

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#0f172a' }}>COD Operations</h2>
                    <button
                        onClick={() => setShowCODCollectModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <Plus size={18} /> Collect COD
                    </button>
                </div>

                {/* Workflow Description */}
                <div style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 24,
                    border: '2px solid #3b82f6'
                }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Info size={18} /> COD Cash Flow Process
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#1e3a8a' }}>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800 }}>1️⃣</span> Delivery man collects COD from customer
                        </div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800 }}>2️⃣</span> H-LOGIX admin verifies COD collection
                        </div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800 }}>3️⃣</span> H-LOGIX collects cash & converts to digital
                        </div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800 }}>4️⃣</span> H-LOGIX transfers money to H-HUB admin wallet
                        </div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800 }}>5️⃣</span> H-HUB admin settles payment with seller
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 12, borderLeft: '4px solid #10b981' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Total COD</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>
                            ₹{codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{codOrders.length} orders</div>
                    </div>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 12, borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Out for Delivery</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>
                            ₹{codOrders.filter(o => o.status === 'Out for Delivery').reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{codOrders.filter(o => o.status === 'Out for Delivery').length} orders</div>
                    </div>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 12, borderLeft: '4px solid #0284c7' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Delivered</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#0284c7' }}>
                            ₹{codOrders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{codOrders.filter(o => o.status === 'Delivered').length} orders</div>
                    </div>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 12, borderLeft: '4px solid #6366f1' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Verified & Settled</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1' }}>
                            ₹{codOrders.filter(o => o.codSentToHub === true).reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{codOrders.filter(o => o.codSentToHub === true).length} orders</div>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px #e5e7eb' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Order ID</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Rider</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Amount</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Delivery Status</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>COD Status</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {codDisplayOrders.length > 0 ? (
                                codDisplayOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0', background: order.status === 'Delivered' ? '#f0fdf4' : 'transparent' }}>
                                        <td style={{ padding: '16px', fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>{order.DeliveryMan?.name || 'Unassigned'}</td>
                                        <td style={{ padding: '16px', fontWeight: 600, color: '#059669' }}>₹{order.totalAmount?.toLocaleString?.() || 0}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Out for Delivery' ? '#fef3c7' : '#dbeafe',
                                                color: order.status === 'Delivered' ? '#166534' : order.status === 'Out for Delivery' ? '#92400e' : '#1e40af'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                background: order.codSentToHub
                                                    ? '#dcfce7'
                                                    : (order.codSubmissionStatus === 'Verified'
                                                        ? '#dbeafe'
                                                        : ((order.codSubmissionStatus === 'Submitted' || order.codSubmissionStatus === 'Collected')
                                                            ? '#fef3c7'
                                                            : '#f1f5f9')),
                                                color: order.codSentToHub
                                                    ? '#166534'
                                                    : (order.codSubmissionStatus === 'Verified'
                                                        ? '#1e40af'
                                                        : ((order.codSubmissionStatus === 'Submitted' || order.codSubmissionStatus === 'Collected')
                                                            ? '#92400e'
                                                            : '#64748b'))
                                            }}>
                                                {order.codSentToHub
                                                    ? 'SETTLED'
                                                    : (order.codSubmissionStatus === 'Verified'
                                                        ? 'VERIFIED'
                                                        : ((order.codSubmissionStatus === 'Submitted' || order.codSubmissionStatus === 'Collected')
                                                            ? 'COLLECTED'
                                                            : 'PENDING'))}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                {order.deliveryPhoto && (
                                                    <button
                                                        onClick={() => setViewingProof(order)}
                                                        style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        title="View Delivery Proof"
                                                    >
                                                        <Eye size={14} /> Proof
                                                    </button>
                                                )}
                                                {!order.codSentToHub && (
                                                    <>
                                                        {order.status === 'Delivered' && order.codSubmissionStatus === 'Pending' && (
                                                            <button
                                                                onClick={() => {
                                                                    setCodCollectData({
                                                                        orderId: order.id,
                                                                        amount: String(order.totalAmount || 0),
                                                                        riderName: order.DeliveryMan?.name || ''
                                                                    });
                                                                    setShowCODCollectModal(true);
                                                                }}
                                                                style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                Collect
                                                            </button>
                                                        )}
                                                        {order.codSubmissionStatus !== 'Verified' && order.codSubmissionStatus !== 'Pending' && order.status === 'Delivered' && (
                                                            <button
                                                                onClick={() => handleVerifyCOD(order.id)}
                                                                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                        {order.codSubmissionStatus === 'Verified' && (
                                                            <button
                                                                onClick={() => handleSendToHub(order)}
                                                                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                Settle
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                                        <CreditCard size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                        <div>No COD orders found</div>
                                        <div style={{ fontSize: 12, marginTop: 8, color: '#cbd5e1' }}>Click "Collect COD" to add orders</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderAnalytics = () => (
        <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a' }}>Analytics Dashboard</h2>

            {/* Revenue & Performance Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: 24, borderRadius: 16, color: '#fff', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>Total Revenue</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>₹{analytics.totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>From {orders.filter(o => o.status === 'Delivered').length} completed deliveries</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: 24, borderRadius: 16, color: '#fff', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>Avg. Delivery Time</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{analytics.avgDeliveryTime} min</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>Target: 30 minutes</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: 24, borderRadius: 16, color: '#fff', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>Active Partners</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{deliveryPartners.filter(p => p.isActive).length}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>Out of {deliveryPartners.length} total</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', padding: 24, borderRadius: 16, color: '#fff', boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>Success Rate</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>
                        {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>Delivery completion rate</div>
                </div>
            </div>

            {/* Top Performers */}
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px #e5e7eb', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={20} color="#6366f1" /> Top Performing Partners
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {analytics.partnerRatings.slice(0, 6).map((partner, idx) => (
                        <div key={idx} style={{
                            background: idx === 0 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : '#f8fafc',
                            padding: 16,
                            borderRadius: 12,
                            border: idx === 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0'
                        }}>
                            {idx === 0 && <div style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', marginBottom: 4 }}>🏆 TOP PERFORMER</div>}
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>{partner.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                <span style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>⭐ {partner.rating}</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{partner.deliveries} deliveries</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Status Breakdown */}
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px #e5e7eb' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a' }}>Order Status Distribution</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                    {['Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => {
                        const count = orders.filter(o => o.status === status).length;
                        const percentage = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;

                        return (
                            <div key={status} style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>{status}</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{count}</div>
                                <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>{percentage}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderPerformance = () => (
        <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a' }}>Partner Performance</h2>

            {/* Performance Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>Total Deliveries</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
                        {performanceData.reduce((sum, p) => sum + p.totalDeliveries, 0)}
                    </div>
                </div>

                <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>Avg On-Time Rate</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: performanceData.length > 0 && (performanceData.reduce((sum, p) => sum + p.onTimePercentage, 0) / performanceData.length) >= 90 ? '#10b981' : '#f59e0b' }}>
                        {performanceData.length > 0 ? Math.round(performanceData.reduce((sum, p) => sum + p.onTimePercentage, 0) / performanceData.length) : 0}%
                    </div>
                </div>

                <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>Active Now</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
                        {performanceData.filter(p => p.status === 'Active').length}
                    </div>
                </div>

                <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>Pending Orders</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
                        {performanceData.reduce((sum, p) => sum + p.pendingOrders, 0)}
                    </div>
                </div>
            </div>

            {/* Detailed Performance Table */}
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px #e5e7eb' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a' }}>Partner Details</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11 }}>PARTNER</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11 }}>VEHICLE</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: 11 }}>DELIVERIES</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: 11 }}>PENDING</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: 11 }}>ON-TIME %</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: 11 }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performanceData.length > 0 ? (
                            performanceData.sort((a, b) => b.totalDeliveries - a.totalDeliveries).map((partner, idx) => (
                                <tr key={partner.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{partner.name}</div>
                                        {partner.totalDeliveries > 50 && (
                                            <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', marginTop: 2 }}>⭐ Top Performer</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                                        {partner.vehicleType || 'N/A'}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                                        {partner.totalDeliveries}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 700, fontSize: 14, color: partner.pendingOrders > 0 ? '#f59e0b' : '#64748b' }}>
                                        {partner.pendingOrders}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            background: partner.onTimePercentage >= 95 ? '#dcfce7' : partner.onTimePercentage >= 85 ? '#fef3c7' : '#fee2e2',
                                            color: partner.onTimePercentage >= 95 ? '#166534' : partner.onTimePercentage >= 85 ? '#92400e' : '#991b1b'
                                        }}>
                                            {partner.onTimePercentage}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            background: partner.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                            color: partner.status === 'Active' ? '#166534' : '#991b1b'
                                        }}>
                                            {partner.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                    <Users size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                                    <div style={{ fontSize: 13 }}>No performance data available</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderLiveTracking = () => (
        <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Radio size={24} color="#10b981" /> Real-Time Tracking
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                {Object.values(liveTracking).map((track, idx) => (
                    <div key={idx} style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{track.partnerName}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: track.status === 'Online' ? '#10b981' : '#cbd5e1',
                                        marginRight: 4
                                    }} />
                                    {track.status}
                                </div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '4px 12px', borderRadius: 6 }}>
                                {track.activeDeliveries} Delivering
                            </div>
                        </div>

                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>📍 Current Location</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                                {track.latitude}, {track.longitude}
                            </div>
                        </div>

                        <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: 8 }}>
                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>🎯 Next Stop</div>
                            <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 600 }}>{track.nextStop}</div>
                        </div>
                    </div>
                ))}
            </div>

            {Object.keys(liveTracking).length === 0 && (
                <div style={{ background: '#fff', padding: 48, borderRadius: 12, textAlign: 'center', color: '#94a3b8' }}>
                    <Radio size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                    <div>No active deliveries at the moment</div>
                </div>
            )}
        </div>
    );

    const renderDailyReports = () => {
        const formatDate = (date) => {
            const d = new Date(date);
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            return d.toLocaleDateString('en-US', options);
        };

        const goToPreviousDay = () => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
        };

        const goToNextDay = () => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
        };

        const goToToday = () => {
            setSelectedDate(new Date());
        };

        const isToday = new Date(selectedDate).toDateString() === new Date().toDateString();

        return (
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={24} color="#0284c7" /> Daily Reports
                </h2>

                {/* Calendar Navigation */}
                <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                        onClick={goToPreviousDay}
                        style={{
                            padding: '8px 16px',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 600,
                            color: '#475569',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                        onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                    >
                        <Calendar size={16} /> Previous Day
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{formatDate(selectedDate)}</div>
                            {isToday && (
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginTop: 4 }}>• LIVE TODAY</div>
                            )}
                        </div>
                        {!isToday && (
                            <button
                                onClick={goToToday}
                                style={{
                                    padding: '6px 16px',
                                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    fontSize: 13,
                                    cursor: 'pointer'
                                }}
                            >
                                Today
                            </button>
                        )}
                    </div>

                    <button
                        onClick={goToNextDay}
                        disabled={isToday}
                        style={{
                            padding: '8px 16px',
                            background: isToday ? '#f8fafc' : '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            cursor: isToday ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 600,
                            color: isToday ? '#cbd5e1' : '#475569',
                            transition: 'all 0.2s',
                            opacity: isToday ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => !isToday && (e.target.style.background = '#e2e8f0')}
                        onMouseLeave={(e) => !isToday && (e.target.style.background = '#f1f5f9')}
                    >
                        Next Day <Calendar size={16} />
                    </button>
                </div>

                {/* Reminders Section */}
                {reminders.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        {reminders.map((reminder, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: reminder.type === 'urgent' ? '#fef2f2' : reminder.type === 'warning' ? '#fffbeb' : '#eff6ff',
                                    border: `2px solid ${reminder.type === 'urgent' ? '#fca5a5' : reminder.type === 'warning' ? '#fcd34d' : '#93c5fd'}`,
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 12,
                                    borderLeft: `6px solid ${reminder.type === 'urgent' ? '#dc2626' : reminder.type === 'warning' ? '#f59e0b' : '#3b82f6'}`
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                                    <div style={{ fontSize: 24 }}>{reminder.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{reminder.title}</div>
                                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{reminder.message}</div>
                                        <div style={{
                                            display: 'inline-block',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            padding: '4px 12px',
                                            background: reminder.type === 'urgent' ? '#dc2626' : reminder.type === 'warning' ? '#f59e0b' : '#3b82f6',
                                            color: '#fff',
                                            borderRadius: 6
                                        }}>
                                            💡 {reminder.action}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Suggestions Section */}
                {suggestions.length > 0 && (
                    <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #86efac', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Award size={18} /> Smart Suggestions
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {suggestions.map((suggestion, idx) => (
                                <div key={idx} style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {dailyReports.map((report, idx) => (
                    <div key={idx} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px #e5e7eb', marginBottom: 24 }}>
                        <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: 24, color: '#fff' }}>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>📅 {report.date}</div>
                        </div>

                        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Total Orders</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{report.totalOrders}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Delivered Today</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{report.deliveredToday}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>In Progress</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{report.inProgressToday}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Revenue Today</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#8b5cf6' }}>₹{report.revenueToday?.toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>COD Collected</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#06b6d4' }}>₹{report.codCollectedToday?.toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Success Rate</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#ec4899' }}>{report.successRate}%</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Avg Delivery Time</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#14b8a6' }}>{report.averageDeliveryTime} min</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Morning Assignments</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1' }}>{report.morningAssignments || 0}</div>
                            </div>
                            {report.undeliveredAfter5PM > 0 && (
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Pending After 5 PM</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{report.undeliveredAfter5PM}</div>
                                </div>
                            )}
                        </div>

                        {report.pendingPartners && report.pendingPartners.length > 0 && (
                            <div style={{ padding: '16px 24px', background: '#fef2f2', borderTop: '1px solid #fecaca' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>⚠️ Partners with Pending Deliveries:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {report.pendingPartners.map((partner, idx) => (
                                        <span key={idx} style={{
                                            padding: '4px 12px',
                                            background: '#fee2e2',
                                            color: '#991b1b',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}>
                                            {partner}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => {
                                    const dataStr = JSON.stringify(report, null, 2);
                                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                    const url = URL.createObjectURL(dataBlob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `daily-report-${new Date().toISOString().split('T')[0]}.json`;
                                    link.click();
                                    showStatus('success', 'Report exported successfully!', 'Exported');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    background: '#6366f1',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8
                                }}>
                                <Download size={16} /> Export Report
                            </button>
                            <button
                                onClick={() => window.print()}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    background: '#10b981',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8
                                }}>
                                <FileText size={16} /> Print Report
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderPartnerEarnings = () => (
        <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={24} color="#059669" /> Partner Earnings
            </h2>

            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Partner</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Rating</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Deliveries</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Commission</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Bonus</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Total Earned</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partnerEarnings.length > 0 ? partnerEarnings.map(partner => (
                            <tr key={partner.id} style={{ borderBottom: '1px solid #f0f0f0', background: partner.totalEarnings > 5000 ? '#f0fdf4' : 'transparent' }}>
                                <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{partner.name}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>⭐ {partner.rating}</span>
                                </td>
                                <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{partner.totalDeliveries}</td>
                                <td style={{ padding: '16px', fontWeight: 600, color: '#6366f1' }}>₹{partner.commissionEarned?.toLocaleString()}</td>
                                <td style={{ padding: '16px', fontWeight: 600, color: '#10b981' }}>
                                    ₹{(partner.bonus || 0).toLocaleString()}
                                </td>
                                <td style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#059669' }}>₹{partner.totalEarned?.toLocaleString()}</td>
                                <td style={{ padding: '16px' }}>
                                    <button
                                        onClick={() => {
                                            setSelectedPartnerEarnings(partner);
                                            setShowEarningsModal(true);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#8b5cf6',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Details
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                                    <DollarSign size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                    <div>No earnings data available</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAlerts = () => (
        <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={24} color="#ef4444" /> Alerts & Warnings
            </h2>

            {delayedOrders.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {delayedOrders.map(order => (
                        <div key={order.id} style={{
                            background: '#fff7ed',
                            border: '1px solid #fed7aa',
                            padding: 16,
                            borderRadius: 12,
                            borderLeft: '4px solid #ea580c'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertTriangle size={20} color="#ea580c" />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Order #{order.id.slice(0, 8)}</div>
                                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>⏰ {Math.round((Date.now() - new Date(order.createdAt)) / (1000 * 60))} minutes in transit</div>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: '4px 12px',
                                    background: '#fed7aa',
                                    color: '#9a3412',
                                    borderRadius: 6
                                }}>
                                    DELAYED
                                </span>
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>📍 {order.address}</div>
                            <button
                                onClick={() => {
                                    // Use DeliveryMan data directly from order (already included via Sequelize)
                                    const rider = order.DeliveryMan;
                                    if (rider && rider.phone) {
                                        confirmAction(`📞 Contact ${rider.name} at ${rider.phone}?`, () => {
                                            window.open(`tel:${rider.phone}`);
                                        }, 'Call Rider', 'confirm');
                                    } else {
                                        showStatus('warning', 'Rider contact information not available', 'No Info');
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: '#f97316',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}>
                                Contact Rider
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ background: '#f0fdf4', padding: 48, borderRadius: 12, textAlign: 'center' }}>
                    <Check size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>All Orders On Time!</div>
                    <div style={{ color: '#64748b' }}>No delayed deliveries detected</div>
                </div>
            )}
        </div>
    );

    const renderWallet = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Wallet size={24} color="#10b981" /> H-LOGIX Central Wallet
                </h2>
                <button
                    onClick={fetchWalletData}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14
                    }}
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Wallet Balance Card */}
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: 32, borderRadius: 20, color: '#fff', marginBottom: 24, boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>Total Balance</div>
                <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, opacity: 0.9 }}>
                    <div>
                        <div style={{ fontWeight: 600 }}>Available Funds</div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>Ready for settlements</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#fff', padding: 20, borderRadius: 16, boxShadow: '0 2px 16px #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={20} color="#10b981" />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Received</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                                ₹{walletTransactions.filter(t => t.direction === 'credit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#fff', padding: 20, borderRadius: 16, boxShadow: '0 2px 16px #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingDown size={20} color="#dc2626" />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Sent</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                                ₹{walletTransactions.filter(t => t.direction === 'debit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#fff', padding: 20, borderRadius: 16, boxShadow: '0 2px 16px #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} color="#3b82f6" />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Transactions</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{walletTransactions.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px #e5e7eb' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px 0', color: '#0f172a' }}>Recent Transactions</h3>
                {walletTransactions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {walletTransactions.map(txn => (
                            <div key={txn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        background: txn.direction === 'credit' ? '#dcfce7' : '#fee2e2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {txn.direction === 'credit' ? (
                                            <TrendingUp size={18} color="#10b981" />
                                        ) : (
                                            <TrendingDown size={18} color="#dc2626" />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                                            {txn.type.replace(/_/g, ' ')}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>
                                            {txn.reference} • {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: txn.direction === 'credit' ? '#10b981' : '#dc2626'
                                }}>
                                    {txn.direction === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                        <Wallet size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Transactions Yet</div>
                        <div style={{ fontSize: 14 }}>Wallet transactions will appear here</div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderRevenueAnalytics = () => (
        <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={24} color="#8b5cf6" /> Revenue Analytics
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', padding: 24, borderRadius: 16, color: '#fff', boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>Total Revenue</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>₹{revenueBreakdown.total?.toLocaleString() || 0}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>From all payment methods</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', padding: 24, borderRadius: 16, color: '#fff', boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>COD Revenue</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>₹{revenueBreakdown.cod?.toLocaleString() || 0}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>Cash on delivery</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', padding: 24, borderRadius: 16, color: '#fff', boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>Online Payments</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>₹{revenueBreakdown.online?.toLocaleString() || 0}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>Card, UPI, etc.</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: 24, borderRadius: 16, color: '#fff', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>Wallet Payments</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>₹{revenueBreakdown.wallet?.toLocaleString() || 0}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>Wallet usage</div>
                </div>
            </div>

            <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px #e5e7eb' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px 0', color: '#0f172a' }}>Revenue Breakdown (%)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {revenueBreakdown.total > 0 && [
                        { name: 'COD', value: revenueBreakdown.cod, color: '#ec4899', percentage: (revenueBreakdown.cod / revenueBreakdown.total * 100).toFixed(1) },
                        { name: 'Online', value: revenueBreakdown.online, color: '#06b6d4', percentage: (revenueBreakdown.online / revenueBreakdown.total * 100).toFixed(1) },
                        { name: 'Wallet', value: revenueBreakdown.wallet, color: '#10b981', percentage: (revenueBreakdown.wallet / revenueBreakdown.total * 100).toFixed(1) }
                    ].map(method => (
                        <div key={method.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{method.name}</span>
                                <span style={{ fontWeight: 700, color: method.color }}>{method.percentage}%</span>
                            </div>
                            <div style={{ width: '100%', height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{
                                    width: `${method.percentage}%`,
                                    height: '100%',
                                    background: method.color
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a' }}>Dashboard Overview</h2>

            {/* Quick Actions */}
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 2px 16px #e5e7eb' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={20} color="#6366f1" /> Quick Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                    <button
                        onClick={() => setActiveTab('orders')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            padding: '16px 12px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <ShoppingBag size={24} />
                        <span>View Orders</span>
                    </button>
                    <button
                        onClick={() => {
                            resetFormData();
                            setShowModal(true);
                        }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            padding: '16px 12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Plus size={24} />
                        <span>Add Partner</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('partners')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            padding: '16px 12px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Users size={24} />
                        <span>Manage Partners</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('cod')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            padding: '16px 12px',
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <CreditCard size={24} />
                        <span>COD Operations</span>
                    </button>
                    <button
                        onClick={() => fetchOrders()}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            padding: '16px 12px',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <RefreshCw size={24} />
                        <span>Refresh Data</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            padding: '16px 12px',
                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <TrendingUp size={24} />
                        <span>View Analytics</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            padding: '16px 12px',
                            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <PieChart size={24} />
                        <span>Performance</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb' }}>
                    <ShoppingBag size={32} color="#6366f1" style={{ marginBottom: 16 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Total Orders</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{orders.length}</div>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 8 }}>
                        +{orders.filter(o => {
                            const today = new Date().setHours(0, 0, 0, 0);
                            return new Date(o.createdAt).setHours(0, 0, 0, 0) === today;
                        }).length} today
                    </div>
                </div>
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb' }}>
                    <Users size={32} color="#10b981" style={{ marginBottom: 16 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Delivery Partners</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{deliveryPartners.length}</div>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 8 }}>
                        {deliveryPartners.filter(p => p.isActive).length} active
                    </div>
                </div>
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb' }}>
                    <CreditCard size={32} color="#f59e0b" style={{ marginBottom: 16 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>COD Orders</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{codOrders.length}</div>
                    <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, marginTop: 8 }}>
                        ₹{codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                    </div>
                </div>
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb' }}>
                    <CheckCircle size={32} color="#059669" style={{ marginBottom: 16 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Delivered</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{orders.filter(o => o.status === 'Delivered').length}</div>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 8 }}>
                        {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100) : 0}% success
                    </div>
                </div>
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb' }}>
                    <Clock size={32} color="#8b5cf6" style={{ marginBottom: 16 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Pending</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>
                        {orders.filter(o => ['Processing', 'Packed', 'Out for Delivery'].includes(o.status)).length}
                    </div>
                    <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600, marginTop: 8 }}>
                        In transit
                    </div>
                </div>
            </div>

            {/* Recent Activity & Orders */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 24 }}>
                {/* Recent Orders */}
                <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px #e5e7eb' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={20} color="#6366f1" /> Recent Orders
                        </span>
                        <button
                            onClick={() => setActiveTab('orders')}
                            style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                            View All →
                        </button>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>Order #{order.id.slice(0, 8)}</div>
                                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{order.DeliveryMan?.name || 'Unassigned'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#059669' }}>₹{order.totalAmount}</div>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        fontSize: 9,
                                        fontWeight: 700,
                                        background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Out for Delivery' ? '#dbeafe' : '#fef3c7',
                                        color: order.status === 'Delivered' ? '#166534' : order.status === 'Out for Delivery' ? '#1e40af' : '#92400e'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                                <Package size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                                <div style={{ fontSize: 13 }}>No orders yet</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: 20, borderRadius: 16, color: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Truck size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, opacity: 0.9 }}>Active Partners</div>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>{deliveryPartners.filter(p => p.isVerified).length}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>Currently available for delivery</div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: 20, borderRadius: 16, color: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, opacity: 0.9 }}>Success Rate</div>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>
                                    {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100) : 0}%
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>Delivery completion rate</div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: 20, borderRadius: 16, color: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, opacity: 0.9 }}>Pending</div>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>{orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>Orders in progress</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Main Render
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <style>{scrollbarStyles}</style>
            {/* Sidebar */}
            <div style={{
                width: 280,
                background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0000 50%, #0a0a0a 100%)',
                color: '#fff',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                    <Truck size={28} color="#fff" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>H-LOGIX</h1>
                        <span style={{ color: '#fca5a5', fontWeight: 800, fontSize: '12px', background: 'rgba(220, 38, 38, 0.2)', padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.5px' }}>ADMIN</span>
                    </div>
                </div>

                <nav className="dashboard-sidebar-scroll" style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    paddingRight: 8,
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(248, 113, 113, 0.7) rgba(17, 24, 39, 0.25)'
                }}>
                    {[
                        { id: 'overview', label: 'Dashboard', icon: PieChart },
                        { id: 'orders', label: 'Active Orders', icon: ShoppingBag },
                        { id: 'partners', label: 'Delivery Partners', icon: Users },
                        { id: 'cod', label: 'COD Operations', icon: CreditCard },
                        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                        { id: 'performance', label: 'Performance', icon: BarChart3 },
                        { id: 'tracking', label: 'Live Tracking', icon: Radio },
                        { id: 'reports', label: 'Daily Reports', icon: FileText },
                        { id: 'earnings', label: 'Partner Earnings', icon: DollarSign },
                        { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
                        { id: 'revenue', label: 'Revenue', icon: TrendingDown },
                        { id: 'wallet', label: 'My Wallet', icon: Wallet },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                marginBottom: 8,
                                background: activeTab === item.id ? 'rgba(220, 38, 38, 0.25)' : 'transparent',
                                color: activeTab === item.id ? '#fca5a5' : '#cbd5e1',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                fontSize: 14,
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Profile Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 18,
                            color: '#fff'
                        }}>
                            {user?.name?.charAt(0).toUpperCase() || 'L'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{user?.name || 'H-LOGIX Admin'}</div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                marginTop: 4,
                                padding: '3px 8px',
                                borderRadius: 999,
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#fecaca',
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.6px'
                            }}>
                                PLATFORM LEAD
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            fontSize: 14,
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                        }}
                    >
                        <Power size={18} /> Logout
                    </button>

                    {/* Return to Hub Button */}
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            color: '#94a3b8',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            fontSize: 14,
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(148, 163, 184, 0.1)';
                            e.target.style.color = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#94a3b8';
                        }}
                    >
                        <ArrowLeft size={18} /> Return to Hub
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ marginLeft: 280, flex: 1, padding: 32 }}>
                {/* Improved Header */}
                <div style={{
                    background: '#fff',
                    padding: '16px 24px',
                    borderRadius: 12,
                    marginBottom: 32,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid #f0f0f0'
                }}>
                    {/* Search Bar */}
                    <div style={{ flex: 1, maxWidth: 500, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Global platform search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 42px',
                                borderRadius: 8,
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.background = '#fff'}
                            onBlur={(e) => e.target.style.background = '#f8fafc'}
                        />
                    </div>

                    {/* Right Side Actions */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {/* Notification Bell */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{
                                    padding: 10,
                                    borderRadius: 8,
                                    border: '1px solid #e2e8f0',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    position: 'relative'
                                }}
                            >
                                <Bell size={20} color="#ef4444" />
                                {notifications.length > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: 6,
                                        right: 6,
                                        width: 8,
                                        height: 8,
                                        background: '#ef4444',
                                        borderRadius: '50%',
                                        border: '2px solid #fff'
                                    }} />
                                )}
                            </button>
                            {showNotifications && (
                                <div style={{
                                    position: 'absolute',
                                    top: '110%',
                                    right: 0,
                                    width: 320,
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 12,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    zIndex: 1000,
                                    maxHeight: 400,
                                    overflow: 'auto'
                                }}>
                                    <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', fontWeight: 700 }}>Notifications</div>
                                    {notifications.length > 0 ? notifications.map((notif, idx) => (
                                        <div key={idx} style={{ padding: 12, borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{notif.title}</div>
                                            <div style={{ color: '#64748b' }}>{notif.message}</div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                                            No notifications
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* View Site Button */}
                        <button
                            onClick={() => window.open('/', '_blank')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 8,
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#dc2626',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                            onMouseLeave={(e) => e.target.style.background = '#fff'}
                        >
                            <Globe size={18} /> View Site
                        </button>

                        {/* Admin Profile Button */}
                        <button
                            onClick={() => navigate('/profile')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                border: 'none',
                                background: '#dc2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                            onMouseLeave={(e) => e.target.style.background = '#dc2626'}
                        >
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: 15,
                                color: '#dc2626'
                            }}>
                                {user?.name?.charAt(0).toUpperCase() || 'H'}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{user?.name || 'H-LOGIX Admin'}</div>
                                <div style={{ color: '#fecaca', fontSize: 10, fontWeight: 700, marginTop: 1, letterSpacing: '0.5px' }}>H-LOGIX ADMIN</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && renderDashboard()}
                {activeTab === 'orders' && renderOrdersTab()}
                {activeTab === 'partners' && renderDeliveryPartners()}
                {activeTab === 'cod' && renderCODOperations()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'performance' && renderPerformance()}
                {activeTab === 'tracking' && renderLiveTracking()}
                {activeTab === 'reports' && renderDailyReports()}
                {activeTab === 'earnings' && renderPartnerEarnings()}
                {activeTab === 'alerts' && renderAlerts()}
                {activeTab === 'revenue' && renderRevenueAnalytics()}
                {activeTab === 'wallet' && renderWallet()}
            </div>

            {/* Add/Edit Partner Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 500, padding: 32 }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                            {editingPartner ? 'Edit Partner' : 'Add Partner'}
                        </h2>
                        <form onSubmit={handleAddPartner} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Phone</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Vehicle Type</label>
                                <select
                                    value={formData.vehicleType}
                                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                >
                                    <option value="">Select Vehicle</option>
                                    <option value="bike">Bike</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="van">Van</option>
                                    <option value="cycle">Cycle</option>
                                </select>
                            </div>
                            {!editingPartner && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Confirm Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                        />
                                    </div>
                                </>
                            )}
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #dc2626, #ef4444)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontWeight: 700,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetFormData(); }}
                                    style={{ flex: 1, padding: '12px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 400, padding: 32 }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Change Password</h2>
                        <p style={{ color: '#64748b', marginBottom: 24 }}>{selectedPartnerForPassword?.name}</p>
                        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px 16px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Change
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    style={{ flex: 1, padding: '12px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Settlement PIN Modal */}
            {showSettlementModal && settlementOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 420, padding: 28 }}>
                        <h2 style={{ margin: '0 0 12px 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Send COD to H-HUB</h2>
                        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Order #{settlementOrder.id.slice(0, 8)}</p>

                        <div style={{ display: 'grid', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Amount</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={settlementAmount}
                                    onChange={(e) => setSettlementAmount(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Payment PIN</label>
                                <input
                                    type="password"
                                    value={settlementPin}
                                    onChange={(e) => setSettlementPin(e.target.value)}
                                    placeholder="Enter 4-digit PIN"
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                            <button
                                onClick={handleConfirmSettlement}
                                disabled={settlementLoading}
                                style={{ flex: 1, padding: '12px 16px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: settlementLoading ? 0.6 : 1 }}
                            >
                                {settlementLoading ? 'Processing...' : 'Confirm & Send'}
                            </button>
                            <button
                                onClick={() => { setShowSettlementModal(false); setSettlementOrder(null); setSettlementPin(''); }}
                                style={{ flex: 1, padding: '12px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Management Modal */}
            {showOrderModal && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                            Order #{selectedOrder.id.slice(0, 8)}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Status</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{selectedOrder.status}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Amount</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>₹{selectedOrder.totalAmount}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Customer</div>
                                <div style={{ fontSize: 14, color: '#0f172a' }}>{selectedOrder.user?.name || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Rider</div>
                                <div style={{ fontSize: 14, color: '#0f172a' }}>{selectedOrder.DeliveryMan?.name || 'Unassigned'}</div>
                            </div>
                        </div>

                        {selectedOrder.status === 'Packed' && !selectedOrder.deliveryManId && (
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Assign Rider</label>
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleAssignOrder(selectedOrder.id, e.target.value);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                    defaultValue=""
                                >
                                    <option value="">Select Rider</option>
                                    {deliveryPartners.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedOrder.status === 'Out for Delivery' && (
                            <button
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Delivered')}
                                style={{ width: '100%', padding: '12px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}
                            >
                                Mark as Delivered
                            </button>
                        )}

                        {selectedOrder.deliveryManId && selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Returned' && (
                            <div style={{ marginBottom: 24, padding: 16, background: '#fef3c7', borderRadius: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 12 }}>Rider Management</div>
                                <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>Reassign to</label>
                                        <select
                                            value={reassignRiderId}
                                            onChange={(e) => setReassignRiderId(e.target.value)}
                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #fcd34d', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                        >
                                            <option value="">Select Rider</option>
                                            {deliveryPartners.filter(p => p.id !== selectedOrder.deliveryManId).map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => handleReassignOrder(selectedOrder.id, reassignRiderId)}
                                        style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '10px 12px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Confirm Reassign
                                    </button>
                                    <button
                                        onClick={() => handleReturnOrder(selectedOrder.id)}
                                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 12px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Mark as Returned
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => { setShowOrderModal(false); setSelectedOrder(null); }}
                                style={{ flex: 1, padding: '12px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Proof Modal */}
            {viewingProof && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setViewingProof(null)}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 20,
                            maxWidth: '90%',
                            maxHeight: '90%',
                            overflow: 'auto',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', padding: '24px', color: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Image size={28} /> Delivery Verification Photo
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Order #{viewingProof.id.slice(0, 8)}</p>
                                </div>
                                <button
                                    onClick={() => setViewingProof(null)}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        color: '#fff',
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '32px' }}>
                            {viewingProof.deliveryPhoto ? (
                                <div>
                                    <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: 12, border: '2px solid #86efac' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <CheckCircle size={20} color="#22c55e" />
                                            <span style={{ fontWeight: 800, color: '#166534' }}>
                                                Delivered by {viewingProof.DeliveryMan?.name || 'Delivery Partner'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#16a34a' }}>
                                            Payment Method: <strong>{viewingProof.paymentMethod}</strong> • Amount: <strong>₹{viewingProof.totalAmount}</strong>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', background: '#f8fafc', padding: '24px', borderRadius: 16, border: '2px solid #e2e8f0' }}>
                                        <img
                                            src={viewingProof.deliveryPhoto}
                                            alt="Delivery Proof"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '500px',
                                                borderRadius: 12,
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(viewingProof.deliveryPhoto, '_blank')}
                                        />
                                        <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#64748b' }}>
                                            <a
                                                href={viewingProof.deliveryPhoto}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#8b5cf6', textDecoration: 'underline', fontWeight: 700 }}
                                            >
                                                Open Full Size Image →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                                    <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No delivery photo available</div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>Photo will appear once delivery is completed</div>
                                </div>
                            )}

                            <button
                                onClick={() => setViewingProof(null)}
                                style={{
                                    width: '100%',
                                    marginTop: '24px',
                                    padding: '14px',
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    border: 'none',
                                    borderRadius: 12,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* COD Collect Modal */}
            {showCODCollectModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 500, padding: 32 }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Collect COD Amount</h2>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Order ID *</label>
                            <input
                                type="text"
                                placeholder="Enter order ID"
                                value={codCollectData.orderId}
                                onChange={(e) => setCodCollectData({ ...codCollectData, orderId: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Rider Name *</label>
                            <input
                                type="text"
                                placeholder="Enter rider name"
                                value={codCollectData.riderName}
                                onChange={(e) => setCodCollectData({ ...codCollectData, riderName: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>COD Amount (₹) *</label>
                            <input
                                type="number"
                                placeholder="Enter amount collected"
                                value={codCollectData.amount}
                                onChange={(e) => setCodCollectData({ ...codCollectData, amount: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => {
                                    setShowCODCollectModal(false);
                                    setCodCollectData({ orderId: '', amount: '', riderName: '' });
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    background: '#f0f0f0',
                                    color: '#0f172a',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCollectCOD}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Collect COD
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Partner Earnings Details Modal */}
            {showEarningsModal && selectedPartnerEarnings && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 500, padding: 32 }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Award size={24} color="#f59e0b" /> {selectedPartnerEarnings.name}
                        </h2>

                        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Rating</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>⭐ {selectedPartnerEarnings.rating}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Total Deliveries</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: '#6366f1' }}>{selectedPartnerEarnings.totalDeliveries}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Earnings Breakdown</div>
                            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>Commission per delivery</span>
                                    <span style={{ fontWeight: 700, color: '#6366f1' }}>₹{selectedPartnerEarnings.commissionPerDelivery}</span>
                                </div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>× {selectedPartnerEarnings.totalDeliveries} deliveries</div>
                            </div>
                            <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>Commission Earned</span>
                                    <span style={{ fontWeight: 700, color: '#10b981' }}>₹{selectedPartnerEarnings.commissionEarned?.toLocaleString()}</span>
                                </div>
                            </div>
                            <div style={{ background: '#fef3c7', padding: 12, borderRadius: 8, marginTop: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>Performance Bonus</span>
                                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>₹{(selectedPartnerEarnings.bonus || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: 16, borderRadius: 12, marginBottom: 24, color: '#fff' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.9, marginBottom: 4 }}>Total Earned This Period</div>
                            <div style={{ fontSize: 28, fontWeight: 800 }}>₹{selectedPartnerEarnings.totalEarned?.toLocaleString()}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => {
                                    setShowEarningsModal(false);
                                    setSelectedPartnerEarnings(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    background: '#f0f0f0',
                                    color: '#0f172a',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={async () => {
                                    confirmAction(
                                        `Process payment of ₹${selectedPartnerEarnings.totalEarned?.toLocaleString()} to ${selectedPartnerEarnings.name}?\n\nThis will mark the payment as settled.`,
                                        async () => {
                                            try {
                                                await api.post(`/logix/process-payment/${selectedPartnerEarnings.id}`, {
                                                    amount: selectedPartnerEarnings.totalEarned,
                                                    partnerName: selectedPartnerEarnings.name
                                                });
                                                showStatus('success', `Payment of ₹${selectedPartnerEarnings.totalEarned?.toLocaleString()} processed successfully for ${selectedPartnerEarnings.name}`, 'Paid');
                                                setShowEarningsModal(false);
                                                setSelectedPartnerEarnings(null);
                                                fetchDeliveryPartners();
                                            } catch (error) {
                                                console.error('Error processing payment:', error);
                                                showStatus('failed', 'Failed to process payment', 'Error');
                                            }
                                        },
                                        'Process Payment',
                                        'confirm'
                                    );
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Process Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <StatusPopup
                show={popup.show}
                type={popup.type}
                title={popup.title}
                message={popup.message}
                onAction={popup.onAction}
                onClose={() => setPopup(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

export default LogixDashboard;
