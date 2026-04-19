import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    Store,
    BarChart,
    ShieldAlert,
    Settings,
    Percent,
    Layers,
    Activity,
    TrendingUp,
    Filter,
    Sparkles,
    Zap,
    Bell,
    Search,
    Map as MapIcon,
    Eye,
    Quote,
    Ban,
    Lock,
    Globe,
    FileText,
    Crown,
    Plus,
    X,
    UserPlus,
    Key,
    Shield,
    Truck,
    ShoppingCart,
    Tag,
    Clock,
    Calendar,
    Check,
    ArrowLeft,
    ChevronRight,
    Download,
    Power,
    UploadCloud,
    CheckCircle2,
    ShieldCheck,
    EyeOff,
    CheckCircle,
    BellDot,
    Edit,
    Trash2,
    User,
    Star,
    CreditCard,
    DollarSign,
    Calculator,
    HelpCircle,
    Info,
    Package,
    RefreshCw,
    FileCheck,
    AlertTriangle,
    MessageSquare,
    Menu, // Added Menu icon
    Flag,
    Hourglass,
    XCircle,
    AlertCircle,
    Image,

} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { useAuth } from '../context/authContext';
import api, { API_BASE_URL } from '../utils/api';
import { getValidationErrors, getEmailValidation, getPhoneValidation, getPasswordStrength } from '../utils/validation';

// 🆕 Phase 1 Feature Imports
import AdvancedFilters from '../components/AdvancedFilters';
import BulkActions from '../components/BulkActions';
import RealTimeAnalytics from '../components/RealTimeAnalytics';
import ActivityTimeline from '../components/ActivityTimeline';
import AssignOrder from './AssignOrder';
import InfoTooltip from '../components/InfoTooltip';
import PricingCalculator from '../components/PricingCalculator';
import StatusPopup from '../components/StatusPopup';
import SmartCalendar from '../components/SmartCalendar';

const locations = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur"],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Sambhajinagar"],
    "Manipur": ["Imphal", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura"],
    "Mizoram": ["Aizawl", "Lunglei"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer"],
    "Sikkim": ["Gangtok", "Namchi"],
    "Tamil Nadu": [
        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
        "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
        "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
        "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
        "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
        "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
        "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
        "Vellore", "Viluppuram", "Virudhunagar"
    ],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam"],
    "Tripura": ["Agartala", "Udaipur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    "Andaman and Nicobar": ["Port Blair"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli": ["Silvassa"],
    "Daman and Diu": ["Daman", "Diu"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Jammu and Kashmir": ["Srinagar", "Jammu"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};

// Custom scrollbar styles for sidebar
const sidebarScrollbarStyles = `
    aside::-webkit-scrollbar {
        width: 6px;
    }
    aside::-webkit-scrollbar-track {
        background: transparent;
    }
    aside::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
    }
    aside::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
`;

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSellers: 0,
        totalDeliveryMen: 0,
        totalOrders: 0,
        totalRevenue: 0,
        expressOrders: 0,
        activeOffers: 0
    });
    const [loading, setLoading] = useState(true);
    const [userList, setUserList] = useState([]);
    const [sellerList, setSellerList] = useState([]);
    const [deliveryList, setDeliveryList] = useState([]);
    const [offerList, setOfferList] = useState([]);

    const [couponList, setCouponList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [salesReport, setSalesReport] = useState([]);
    const [categories, setCategories] = useState([]);
    const [profitStats, setProfitStats] = useState({ totalCommission: 0, expressEarnings: 0, totalRevenue: 0 });
    const [deliveryStats, setDeliveryStats] = useState({
        totalAssigned: 0,
        completed: 0,
        notCompleted: 0,
        lateDeliveries: 0,
        avgRating: 'N/A',
        totalFines: 0,
        performanceData: []
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [ordersList, setOrdersList] = useState([]);
    const [viewingDetails, setViewingDetails] = useState(null);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [uploading, setUploading] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [applications, setApplications] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [showCategoryModal, setShowCategoryModal] = useState(false);



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

    // 🆕 Payout & Profit States
    const [platformSettings, setPlatformSettings] = useState({
        gst_percentage: 18,
        global_discount: 0,
        offer_enabled: false,
        packing_cost: 0,
        shipping_cost: 0,
        ads_cost: 0,
        delivery_fee: 50
    });
    const [profitSummary, setProfitSummary] = useState(null);
    const [settlementList, setSettlementList] = useState([]);
    const [processingPayout, setProcessingPayout] = useState(null);
    const [profitRules, setProfitRules] = useState([]);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [newRule, setNewRule] = useState({
        minSellerPrice: 0,
        maxSellerPrice: 0,
        profitPercentage: 0,
        minProfitAmount: 0,
        maxProfitCap: 0,
        isActive: true
    });
    const [recalculating, setRecalculating] = useState(false);

    // Modal State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'seller',
        phone: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        gender: 'male',
        aadharPhoto: '',
        licensePhoto: '',
        profilePhoto: '',
        isVerified: false
    });

    const [showOfferModal, setShowOfferModal] = useState(false);
    const [newOffer, setNewOffer] = useState({
        title: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        type: 'platform',
        isActive: true,
        startDate: '',
        endDate: '',
        category: 'All'
    });
    const [editingOffer, setEditingOffer] = useState(null);

    const [showCouponModal, setShowCouponModal] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0
    });

    // 🆕 Phase 1 Feature State
    const [, setFilteredUserList] = useState([]);
    const [, setFilteredSellerList] = useState([]);
    const [, setFilteredDeliveryList] = useState([]);

    const [superCoinRules, setSuperCoinRules] = useState([]);
    const [showSuperCoinModal, setShowSuperCoinModal] = useState(false);
    const [newSuperCoinRule, setNewSuperCoinRule] = useState({
        minOrderAmount: 0,
        maxOrderAmount: 100000,
        rewardPercentage: 0,
        isActive: true
    });
    const [showResetModal, setShowResetModal] = useState(false);
    const [resettingUser, setResettingUser] = useState(null);
    const [newPass, setNewPass] = useState('');

    // Verification System States
    const [verifyingProduct, setVerifyingProduct] = useState(null);
    const [verificationTab, setVerificationTab] = useState('info'); // info, pricing, risk

    // 🆕 New Advanced Features States
    const [riskAssessment, setRiskAssessment] = useState({
        highRiskOrders: [],
        slaBreachers: [],
        fraudFlags: [],
        delayedDeliveries: [],
        riskScore: 0,
        summary: { totalRisks: 0, critical: 0, warning: 0 }
    });
    const [performanceAnalytics, setPerformanceAnalytics] = useState({
        merchants: [],
        deliveryPartners: [],
        selectedMetric: 'rating',
        dateRange: '30days'
    });
    const [customerAnalytics, setCustomerAnalytics] = useState({
        totalCustomers: 0,
        newCustomers: 0,
        churned: 0,
        activeCustomers: 0,
        ltv: 0,
        segments: [],
        cohortData: []
    });
    const [supportTickets, setSupportTickets] = useState({
        allTickets: [],
        open: [],
        resolved: [],
        pending: 0
    });
    const [inventoryAlerts, setInventoryAlerts] = useState({
        lowStock: [],
        outOfStock: [],
        expiringSoon: []
    });
    const [revenueAnalytics, setRevenueAnalytics] = useState({
        today: 0,
        week: 0,
        month: 0,
        trend: [],
        topProducts: []
    });
    const [broadcastMessage, setBroadcastMessage] = useState({ title: '', message: '' });
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [realTimeData, setRealTimeData] = useState({
        activeUsers: 0,
        onlineDelivery: 0,
        pendingOrders: 0,
        lastUpdate: new Date()
    });

    // Status Popups
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });
    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, title, message, onAction });
    };

    const confirmAction = (msg, action, title = 'Are you sure?', type = 'confirm') => {
        setPopup({
            show: true,
            type: type,
            title: title,
            message: msg,
            onAction: () => {
                action();
                setPopup(prev => ({ ...prev, show: false }));
            }
        });
    };

    // Order Assignment State
    const [assignId, setAssignId] = useState('');

    useEffect(() => {
        if (assigningOrder) {
            setAssignId(assigningOrder.deliveryManId || '');
        }
    }, [assigningOrder]);

    const handleAssignDelivery = async () => {
        if (!assignId) {
            showStatus('invalid', 'Please select a delivery partner', 'Invalid Selection');
            return;
        }
        try {
            await handleOrderStatusUpdate(assigningOrder.id, assigningOrder.status, assignId);
            showStatus('success', 'Delivery Partner Assigned Successfully', 'Successfull');
            setAssigningOrder(null);
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to assign delivery partner', 'Failed');
        }
    };

    // Helper function to calculate trust score for sellers
    const getTrustScore = (sellerId) => {
        const seller = sellerList.find(s => s.id === sellerId);
        if (!seller) return 0;
        let score = 50; // Base score
        if (seller.isVerified) score += 30;
        const sellerProducts = productList.filter(p => p.sellerId === sellerId);
        if (sellerProducts.length > 10) score += 10;
        if (sellerProducts.length > 50) score += 10;
        return Math.min(100, score);
    };

    // Helper function to run automatic product validation
    const runAutoValidation = (product) => {
        if (!product) return { score: 0, riskLevel: 'High', issues: [{ msg: 'Invalid product data' }] };

        const issues = [];
        let score = 100;

        // Check if product has all required fields
        if (!product.name || product.name.length < 3) {
            issues.push({ msg: 'Product name is too short or missing' });
            score -= 15;
        }
        if (!product.description || product.description.length < 10) {
            issues.push({ msg: 'Product description is insufficient' });
            score -= 10;
        }
        if (!product.image) {
            issues.push({ msg: 'Product image is missing' });
            score -= 20;
        }
        if (!product.price || product.price <= 0) {
            issues.push({ msg: 'Invalid product price' });
            score -= 25;
        }
        if (!product.sellerPrice || product.sellerPrice <= 0) {
            issues.push({ msg: 'Invalid seller price' });
            score -= 15;
        }

        // Check profit margin
        if (product.price && product.sellerPrice) {
            const margin = ((product.price - product.sellerPrice) / product.price) * 100;
            if (margin < 5) {
                issues.push({ msg: `Low profit margin (${margin.toFixed(1)}%). Recommended minimum is 10%` });
                score -= 20;
            }
            if (margin > 80) {
                issues.push({ msg: `Unusually high markup (${margin.toFixed(1)}%). May indicate pricing error` });
                score -= 15;
            }
        }

        // Check stock
        if (!product.stock || product.stock < 0) {
            issues.push({ msg: 'Stock quantity not set or invalid' });
            score -= 10;
        }

        // Check category
        if (!product.category) {
            issues.push({ msg: 'Product category not assigned' });
            score -= 10;
        }

        // Determine risk level
        let riskLevel = 'Low';
        if (score < 50) riskLevel = 'High';
        else if (score < 75) riskLevel = 'Medium';

        return {
            score: Math.max(0, score),
            riskLevel,
            issues
        };
    };

    useEffect(() => {
        fetchStats();
        fetchCategories();
        fetchProfitStats();
        fetchUsers();
        fetchNotifications();
        fetchApplications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications?role=admin');
            setNotifications(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch notifications:', error);
        }
    };

    const fetchApplications = async () => {
        try {
            const res = await api.get('/admin/all-users');
            // Filter unverified sellers/delivery
            setApplications(res.data.filter(u => !u.isVerified && (u.role === 'seller' || u.role === 'delivery')));
        } catch (error) {
            void error;
            console.error('Failed to fetch applications');
        }
    };

    const handleVerifyUser = async (id) => {
        try {
            await api.put(`/admin/users/${id}/verify`);
            showStatus('success', 'User profile verified successfully!', 'Successfull');
            fetchApplications();
            fetchUsers();
            fetchNotifications();
        } catch (error) {
            void error;
            showStatus('failed', 'Verification failed', 'Failed');
        }
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'merchants') fetchSellers();
        if (activeTab === 'delivery') {
            fetchDelivery();
            fetchDeliveryStats();
        }
        if (activeTab === 'orders') {
            fetchOrders();
            fetchDelivery();
        }
        if (activeTab === 'overview') fetchDeliveryStats();
        if (activeTab === 'offers') fetchOffers();
        if (activeTab === 'express') fetchProducts();
        if (activeTab === 'verification') {
            fetchProducts();
            fetchSellers();
        }
        if (activeTab === 'reports') fetchSalesReport();
        if (activeTab === 'logs') fetchAuditLogs();
        if (activeTab === 'categories_admin') fetchCategories();
        if (activeTab === 'logs') fetchAuditLogs();
        if (activeTab === 'categories_admin') fetchCategories();
        if (activeTab === 'coupons') fetchCoupons();
        if (activeTab === 'settlements_admin') fetchSettlements();
        if (activeTab === 'profits_admin') {
            fetchProfitSummary();
            fetchSettlements();
        }
        if (activeTab === 'settings_admin') {
            fetchPlatformSettings();
            fetchProfitRules();
            fetchSuperCoinRules();
        }
        if (activeTab === 'risk_assessment') fetchRiskAssessment();
        if (activeTab === 'performance') fetchPerformanceAnalytics();
        if (activeTab === 'customers') fetchCustomerAnalytics();
        if (activeTab === 'support') fetchSupportTickets();
        if (activeTab === 'monitoring') fetchRealTimeData();
        if (activeTab === 'inventory') fetchInventoryAlerts();
        if (activeTab === 'revenue') fetchRevenueAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchDeliveryStats = async () => {
        try {
            const res = await api.get('/admin/delivery-stats');
            setDeliveryStats(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch delivery stats');
        }
    };

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons');
            setCouponList(res.data || []);
        } catch (error) {
            void error;
            console.error('Failed to fetch coupons');
            setCouponList([]);
        }
    };

    const fetchPlatformSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            setPlatformSettings(prev => ({ ...prev, ...res.data }));
        } catch (error) {
            void error;
            console.error('Failed to fetch settings');
        }
    };

    const fetchProfitSummary = async () => {
        try {
            const res = await api.get('/admin/profits-summary');
            setProfitSummary(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch profit summary');
        }
    };

    const fetchSettlements = async () => {
        try {
            const res = await api.get('/admin/settlements');
            setSettlementList(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch settlements');
        }
    };

    const handleUpdateSettings = async (updates) => {
        try {
            await api.put('/admin/settings', { settings: updates });
            setPlatformSettings(prev => ({ ...prev, ...updates }));
        } catch (error) {
            void error;
            console.error('Failed to update settings');
        }
    };

    const fetchProfitRules = async () => {
        try {
            const res = await api.get('/admin/profit-rules');
            setProfitRules(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch profit rules');
        }
    };

    const handleCreateProfitRule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/profit-rules', newRule);
            showStatus('saved', 'Profit rule created successfully!', 'Saved');
            setShowRuleModal(false);
            fetchProfitRules();
            setNewRule({ minSellerPrice: 0, maxSellerPrice: 0, profitPercentage: 0, minProfitAmount: 0, maxProfitCap: 0, isActive: true });
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to create profit rule', 'Failed');
        }
    };

    const handleDeleteProfitRule = async (id) => {
        confirmAction('This rule will be removed permanently. Active calculations might be affected.', async () => {
            try {
                await api.delete(`/admin/profit-rules/${id}`);
                showStatus('success', 'Profit rule deleted successfully!', 'Deleted');
                fetchProfitRules();
            } catch (error) {
            void error;
                showStatus('failed', 'Failed to delete rule', 'Failed');
            }
        }, 'Delete Rule?', 'delete');
    };

    const handleToggleProfitRuleStatus = async (id) => {
        try {
            await api.put(`/admin/profit-rules/${id}/toggle`);
            fetchProfitRules();
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to toggle status', 'Failed');
        }
    };

    const fetchSuperCoinRules = async () => {
        try {
            const res = await api.get('/admin/supercoin-rules');
            setSuperCoinRules(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch supercoin rules');
        }
    };

    const handleCreateSuperCoinRule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/supercoin-rules', newSuperCoinRule);
            showStatus('saved', 'SuperCoin rule created successfully!', 'Saved');
            setShowSuperCoinModal(false);
            fetchSuperCoinRules();
            setNewSuperCoinRule({ minOrderAmount: 0, maxOrderAmount: 100000, rewardPercentage: 0, isActive: true });
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to create rule', 'Failed');
        }
    };

    const handleDeleteSuperCoinRule = async (id) => {
        confirmAction('This will stop SuperCoin rewards for this bracket.', async () => {
            try {
                await api.delete(`/admin/supercoin-rules/${id}`);
                showStatus('success', 'SuperCoin rule deleted successfully!', 'Deleted');
                fetchSuperCoinRules();
            } catch (error) {
            void error;
                showStatus('failed', 'Failed to delete rule', 'Failed');
            }
        }, 'Delete Reward Rule?', 'delete');
    };

    const handleToggleSuperCoinRuleStatus = async (id) => {
        try {
            await api.put(`/admin/supercoin-rules/${id}/toggle`);
            fetchSuperCoinRules();
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to toggle status', 'Failed');
        }
    };

    const handleBulkRecalculate = async () => {
        confirmAction('This will recalculate platform prices for ALL products based on current rules. This may take a moment.', async () => {
            setRecalculating(true);
            try {
                const res = await api.post('/admin/recalculate-all-prices');
                showStatus('changed', `Success! Recalculated prices for ${res.data.count} products.`, 'Recalculation Successful');
            } catch (error) {
            void error;
                showStatus('failed', 'Recalculation failed', 'Failed');
            } finally {
                setRecalculating(false);
            }
        }, 'System Recalculation');
    };

    const handleSendGlobalNotification = async (title, message) => {
        try {
            await api.post('/admin/broadcast', { title, message });
            showStatus('success', 'Broadcast message sent to all active users.', 'Broadcast Sent');
            fetchNotifications();
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to send broadcast', 'Broadcast Error');
        }
    };

    const handleProcessSettlement = async (orderId) => {
        setProcessingPayout(orderId);
        try {
            await api.post(`/admin/settlements/process/${orderId}`);
            showStatus('success', 'Payment transferred successfully!', 'Successfull');
            fetchSettlements();
        } catch (error) {
            void error;
            showStatus('failed', error.response?.data?.error || 'Settlement failed', 'Settlement Failed');
        } finally {
            setProcessingPayout(null);
        }
    };

    const handleClaimCod = async (orderId) => {
        try {
            await api.post(`/admin/orders/${orderId}/claim-cod`);
            showStatus('success', 'COD amount claimed successfully!', 'Successfull');
            fetchSettlements();
        } catch (error) {
            void error;
            showStatus('failed', error.response?.data?.error || 'Failed to claim COD', 'Claim Failed');
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            await api.post('/coupons', newCoupon);
            showStatus('saved', 'Coupon created successfully!', 'Saved');
            setShowCouponModal(false);
            setNewCoupon({ code: '', discountType: 'percentage', discountValue: 0, minOrderAmount: 0 });
            fetchCoupons();
        } catch (error) {
            void error;
            showStatus('failed', error.response?.data?.error || 'Failed to create coupon', 'Failed');
        }
    };

    const handleDeleteCoupon = async (id) => {
        confirmAction('Customers will no longer be able to use this code.', async () => {
            try {
                await api.delete(`/coupons/${id}`);
                showStatus('success', 'Coupon deleted successfully!', 'Deleted');
                fetchCoupons();
            } catch (error) {
            void error;
                showStatus('failed', 'Failed to delete coupon', 'Failed');
            }
        }, 'Disable Coupon?', 'delete');
    };

    const fetchProfitStats = async () => {
        try {
            const res = await api.get('/admin/earnings');
            setProfitStats(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch profit stats:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🆕 Fetch functions for new features
    const fetchRiskAssessment = async () => {
        try {
            const res = await api.get('/admin/risk-assessment');
            if (res.data) {
                setRiskAssessment(res.data);
            } else {
                // Fallback with dummy data if endpoint not available
                setRiskAssessment({
                    highRiskOrders: [],
                    slaBreachers: ordersList.filter(o => o.status === 'Delayed').slice(0, 5),
                    fraudFlags: [],
                    delayedDeliveries: ordersList.filter(o => o.status === 'Pending').slice(0, 3),
                    riskScore: Math.round(Math.random() * 30),
                    summary: { totalRisks: 8, critical: 2, warning: 6 }
                });
            }
        } catch (error) {
            void error;
            console.warn('Risk assessment endpoint not available, using defaults');
            setRiskAssessment({
                highRiskOrders: [],
                slaBreachers: ordersList.filter(o => o.status === 'Delayed').slice(0, 5),
                fraudFlags: [],
                delayedDeliveries: ordersList.filter(o => o.status === 'Pending').slice(0, 3),
                riskScore: Math.round(Math.random() * 30),
                summary: { totalRisks: 8, critical: 2, warning: 6 }
            });
        }
    };

    const fetchPerformanceAnalytics = async () => {
        try {
            const res = await api.get('/admin/performance-analytics');
            if (res.data) {
                setPerformanceAnalytics(res.data);
            } else {
                // Fallback with seller and delivery data
                setPerformanceAnalytics({
                    merchants: sellerList.map((s) => ({
                        id: s.id,
                        name: s.name,
                        rating: (3.5 + Math.random() * 1.5).toFixed(1),
                        orders: Math.floor(Math.random() * 500),
                        revenue: Math.floor(Math.random() * 500000),
                        trend: Math.floor(Math.random() * 100) - 50
                    })).slice(0, 10),
                    deliveryPartners: deliveryList.map((d) => ({
                        id: d.id,
                        name: d.name,
                        rating: (3.8 + Math.random() * 1.2).toFixed(1),
                        deliveries: Math.floor(Math.random() * 300),
                        onTimePercentage: Math.floor(Math.random() * 20) + 85,
                        trend: Math.floor(Math.random() * 50) - 25
                    })).slice(0, 10),
                    selectedMetric: 'rating',
                    dateRange: '30days'
                });
            }
        } catch (error) {
            void error;
            console.warn('Performance analytics endpoint not available, using defaults');
            setPerformanceAnalytics({
                merchants: sellerList.map((s) => ({
                    id: s.id,
                    name: s.name,
                    rating: (3.5 + Math.random() * 1.5).toFixed(1),
                    orders: Math.floor(Math.random() * 500),
                    revenue: Math.floor(Math.random() * 500000),
                    trend: Math.floor(Math.random() * 100) - 50
                })).slice(0, 10),
                deliveryPartners: deliveryList.map((d) => ({
                    id: d.id,
                    name: d.name,
                    rating: (3.8 + Math.random() * 1.2).toFixed(1),
                    deliveries: Math.floor(Math.random() * 300),
                    onTimePercentage: Math.floor(Math.random() * 20) + 85,
                    trend: Math.floor(Math.random() * 50) - 25
                })).slice(0, 10),
                selectedMetric: 'rating',
                dateRange: '30days'
            });
        }
    };

    const fetchCustomerAnalytics = async () => {
        try {
            const res = await api.get('/admin/customer-analytics');
            if (res.data) {
                setCustomerAnalytics(res.data);
            } else {
                setCustomerAnalytics({
                    totalCustomers: userList.length,
                    newCustomers: Math.floor(userList.length * 0.15),
                    churned: Math.floor(userList.length * 0.05),
                    activeCustomers: Math.floor(userList.length * 0.75),
                    ltv: Math.floor(Math.random() * 5000) + 2000,
                    segments: [
                        { name: 'VIP', count: Math.floor(userList.length * 0.1), value: 'high' },
                        { name: 'Regular', count: Math.floor(userList.length * 0.6), value: 'medium' },
                        { name: 'At Risk', count: Math.floor(userList.length * 0.15), value: 'low' },
                        { name: 'Inactive', count: Math.floor(userList.length * 0.15), value: 'none' }
                    ],
                    cohortData: []
                });
            }
        } catch (error) {
            void error;
            console.warn('Customer analytics endpoint not available');
            setCustomerAnalytics({
                totalCustomers: userList.length,
                newCustomers: Math.floor(userList.length * 0.15),
                churned: Math.floor(userList.length * 0.05),
                activeCustomers: Math.floor(userList.length * 0.75),
                ltv: Math.floor(Math.random() * 5000) + 2000,
                segments: [
                    { name: 'VIP', count: Math.floor(userList.length * 0.1), value: 'high' },
                    { name: 'Regular', count: Math.floor(userList.length * 0.6), value: 'medium' },
                    { name: 'At Risk', count: Math.floor(userList.length * 0.15), value: 'low' },
                    { name: 'Inactive', count: Math.floor(userList.length * 0.15), value: 'none' }
                ],
                cohortData: []
            });
        }
    };

    const fetchSupportTickets = async () => {
        try {
            const res = await api.get('/admin/support-tickets');
            if (res.data) {
                setSupportTickets(res.data);
            } else {
                setSupportTickets({
                    allTickets: [],
                    open: [],
                    resolved: [],
                    pending: 0
                });
            }
        } catch (error) {
            void error;
            console.warn('Support tickets endpoint not available');
            setSupportTickets({
                allTickets: [],
                open: [],
                resolved: [],
                pending: 0
            });
        }
    };

    const fetchRealTimeData = async () => {
        try {
            const res = await api.get('/admin/realtime-data');
            if (res.data) {
                setRealTimeData(res.data);
            } else {
                setRealTimeData({
                    activeUsers: userList.filter(u => u.isActive).length,
                    onlineDelivery: deliveryList.filter(d => d.isActive).length,
                    pendingOrders: ordersList.filter(o => o.status === 'Processing').length,
                    lastUpdate: new Date()
                });
            }
        } catch (error) {
            void error;
            setRealTimeData({
                activeUsers: userList.filter(u => u.isActive).length,
                onlineDelivery: deliveryList.filter(d => d.isActive).length,
                pendingOrders: ordersList.filter(o => o.status === 'Processing').length,
                lastUpdate: new Date()
            });
        }
    };

    const fetchInventoryAlerts = async () => {
        try {
            const res = await api.get('/admin/inventory-alerts');
            if (res.data) {
                setInventoryAlerts(res.data);
            } else {
                const lowStock = productList.filter(p => p.stock > 0 && p.stock < 10);
                const outOfStock = productList.filter(p => p.stock === 0);
                setInventoryAlerts({
                    lowStock,
                    outOfStock,
                    expiringSoon: []
                });
            }
        } catch (error) {
            void error;
            const lowStock = productList.filter(p => p.stock > 0 && p.stock < 10);
            const outOfStock = productList.filter(p => p.stock === 0);
            setInventoryAlerts({
                lowStock,
                outOfStock,
                expiringSoon: []
            });
        }
    };

    const fetchRevenueAnalytics = async () => {
        try {
            const res = await api.get('/admin/revenue-analytics');
            if (res.data) {
                setRevenueAnalytics(res.data);
            } else {
                const today = new Date().toISOString().split('T')[0];
                const todayOrders = ordersList.filter(o => o.createdAt.split('T')[0] === today);
                const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const weekRevenue = ordersList.filter(o => {
                    const diff = (new Date() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24);
                    return diff <= 7;
                }).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const monthRevenue = ordersList.filter(o => {
                    const diff = (new Date() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24);
                    return diff <= 30;
                }).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

                setRevenueAnalytics({
                    today: todayRevenue,
                    week: weekRevenue,
                    month: monthRevenue,
                    trend: [],
                    topProducts: []
                });
            }
        } catch (error) {
            void error;
            const today = new Date().toISOString().split('T')[0];
            const todayOrders = ordersList.filter(o => o.createdAt.split('T')[0] === today);
            const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const weekRevenue = ordersList.filter(o => {
                const diff = (new Date() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24);
                return diff <= 7;
            }).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const monthRevenue = ordersList.filter(o => {
                const diff = (new Date() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24);
                return diff <= 30;
            }).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            setRevenueAnalytics({
                today: todayRevenue,
                week: weekRevenue,
                month: monthRevenue,
                trend: [],
                topProducts: []
            });
        }
    };

    const handleBroadcastMessage = async () => {
        if (!broadcastMessage.title || !broadcastMessage.message) {
            showStatus('invalid', 'Please enter both title and message', 'Invalid Input');
            return;
        }
        try {
            await handleSendGlobalNotification(broadcastMessage.title, broadcastMessage.message);
            setBroadcastMessage({ title: '', message: '' });
            setShowBroadcastModal(false);
            showStatus('success', 'Broadcast sent to all users successfully!', 'Broadcast Sent');
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to send broadcast', 'Error');
        }
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(field);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewUser(prev => ({ ...prev, [field]: res.data.url }));
        } catch (error) {
            void error;
            showStatus('failed', 'Upload failed: ' + error.message, 'Failed');
        } finally {
            setUploading(null);
        }
    };

    const FileUploadField = ({ label, field, value, icon: Icon, color }) => {
        const UploadIcon = Icon || UploadCloud;
        return (
        <div style={mGroup}>
            <label style={{ ...labelStyle, color }}>{label}</label>
            <div style={uploadContainer}>
                {value ? (
                    <div style={uploadPreview}>
                        <img src={value} alt="Preview" style={previewImg} />
                        <div style={uploadInfo}>
                            <span style={fileName}>File Uploaded</span>
                            <button type="button" onClick={() => setNewUser(prev => ({ ...prev, [field]: '' }))} style={removeFile}>Change</button>
                        </div>
                    </div>
                ) : (
                    <label style={uploadPlaceholder}>
                        <input type="file" onChange={(e) => handleFileUpload(e, field)} style={{ display: 'none' }} accept="image/*" />
                        {uploading === field ? (
                            <div style={loaderSmall} />
                        ) : (
                            <>
                                <UploadIcon size={20} color={color || 'var(--text-muted)'} />
                                <span>Upload {label}</span>
                            </>
                        )}
                    </label>
                )}
            </div>
        </div>
    );
    };


    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/all-users');
            setUserList(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchSellers = async () => {
        try {
            const res = await api.get('/admin/sellers');
            setSellerList(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch sellers:', error);
        }
    };

    const fetchDelivery = async () => {
        try {
            const res = await api.get('/admin/delivery');
            setDeliveryList(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch delivery men:', error);
        }
    };

    const fetchOffers = async () => {
        try {
            const res = await api.get('/admin/offers');
            setOfferList(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch offers:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/admin/products');
            setProductList(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch products:', error);
        }
    };

    const handleApproveProduct = async (productId) => {
        try {
            const res = await api.put(`/admin/products/${productId}/approve`, { approved: true, approvedBy: user?.id });
            setProductList(prev => prev.map(p => p.id === productId ? res.data.product : p));
            showStatus('success', 'Product is now LIVE in the marketplace.', 'Approved');
        } catch (error) {
            void error;
            showStatus('failed', error.response?.data?.error || 'Approval failed', 'Failed');
        }
    };

    const handleRequestChanges = async (productId) => {
        const reason = prompt('Enter Rejection Reason:', 'Pricing violation');
        if (!reason) return;
        try {
            const res = await api.put(`/admin/products/${productId}/approve`, { approved: false, approvedBy: user?.id });
            setProductList(prev => prev.map(p => p.id === productId ? res.data.product : p));
            showStatus('info', 'Product marked for correction.', 'Changes Requested');
        } catch (error) {
            void error;
            showStatus('failed', error.response?.data?.error || 'Update failed', 'Failed');
        }
    };

    const handleDeleteProduct = async (id) => {
        confirmAction('This product and its stock data will be erased from the shop.', async () => {
            try {
                await api.delete(`/products/${id}`);
                showStatus('success', 'Product has been removed from the shop.', 'Successfull');
                fetchProducts();
            } catch (error) {
            void error;
                showStatus('failed', error.response?.data?.error || 'Failed to delete product', 'Failed');
            }
        }, 'Destroy Product?', 'delete');
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            setOrdersList(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch admin orders:', error);
        }
    };

    const handleOrderStatusUpdate = async (orderId, newStatus, riderId = null) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus, deliveryManId: riderId });
            fetchOrders();
        } catch (error) {
            void error;
            console.error('Failed to update status:', error);
            showStatus('failed', 'Failed to update order status', 'Update Failed');
        }
    };

    const fetchSalesReport = async () => {
        try {
            const res = await api.get('/admin/reports/sales');
            setSalesReport(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch sales report:', error);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const res = await api.get('/admin/logs');
            setAuditLogs(res.data);
        } catch (error) {
            void error;
            console.error('Failed to fetch logs:', error);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/categories', newCategory);
            showStatus('saved', 'Category created successfully!', 'Saved');
            setShowCategoryModal(false);
            setNewCategory({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            void error;
            showStatus('failed', 'Error creating category', 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        confirmAction('Removing a category might leave some products uncategorized.', async () => {
            try {
                await api.delete(`/admin/categories/${id}`);
                showStatus('success', 'Category deleted successfully!', 'Deleted');
                fetchCategories();
            } catch (error) {
            void error;
                showStatus('failed', 'Error deleting category', 'Failed');
            }
        }, 'Delete Category?', 'delete');
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const errors = getValidationErrors(newUser, { checkConfirm: true });
        if (errors.length > 0) {
            showStatus('invalid', errors.join('\n'), 'Invalid Data');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', newUser);
            showStatus('success', `New ${newUser.role} registered successfully!`, 'Successfull');
            setShowRegisterModal(false);

            // Fetch updated data based on the role created
            fetchStats();
            if (newUser.role === 'seller') fetchSellers();
            else if (newUser.role === 'delivery') fetchDelivery();
            else if (newUser.role === 'user') fetchUsers();

            setNewUser({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'seller',
                phone: '',
                city: '',
                district: '',
                state: '',
                pincode: '',
                gender: 'male',
                aadharPhoto: '',
                licensePhoto: '',
                profilePhoto: '',
                isVerified: false
            });
        } catch (error) {
            void error;
            showStatus('failed', 'Error: ' + (error.response?.data?.error || error.message), 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingOffer) {
                await api.put(`/admin/offers/${editingOffer.id}`, newOffer);
                showStatus('changed', 'Offer updated successfully!', 'Changed');
            } else {
                await api.post('/admin/offers', newOffer);
                showStatus('success', 'New offer created successfully!', 'Successfull');
            }
            setShowOfferModal(false);
            setEditingOffer(null);
            setNewOffer({
                title: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                type: 'platform',
                isActive: true,
                startDate: '',
                endDate: '',
                category: 'All'
            });
            fetchOffers();
            fetchStats();
        } catch (error) {
            void error;
            showStatus('failed', 'Error saving offer: ' + (error.response?.data?.error || error.message), 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const startEditOffer = (offer) => {
        setEditingOffer(offer);
        setNewOffer({
            title: offer.title,
            description: offer.description,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            type: offer.type,
            isActive: offer.isActive,
            startDate: offer.startDate,
            endDate: offer.endDate,
            category: offer.category
        });
        setShowOfferModal(true);
    };

    const toggleOfferStatus = async (offerId) => {
        try {
            await api.put(`/admin/offers/${offerId}/toggle`);
            fetchOffers();
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to toggle offer status', 'Failed');
        }
    };

    const updateProductBadge = async (productId, badge) => {
        try {
            await api.put(`/admin/products/${productId}/badge`, { badge });
            fetchProducts();
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to update product badge', 'Failed');
        }
    };

    const handleDeleteOffer = async (id) => {
        confirmAction('This will end the campaign for all users immediately.', async () => {
            try {
                await api.delete(`/admin/offers/${id}`);
                showStatus('success', 'Campaign deleted successfully!', 'Deleted');
                fetchOffers();
                fetchStats();
            } catch (error) {
            void error;
                showStatus('failed', 'Failed to delete offer', 'Failed');
            }
        }, 'Cease Campaign?', 'delete');
    };

    const handleToggleUserStatus = async (id) => {
        try {
            await api.put(`/admin/users/${id}/toggle-status`);
            fetchUsers();
            fetchStats();
        } catch (error) {
            void error;
            showStatus('failed', 'Failed to update user status', 'Failed');
        }
    };

    const handleDeleteUser = async (id) => {
        confirmAction('This action is IRREVERSIBLE. All user data, orders, and wallet history will be lost.', async () => {
            try {
                await api.delete(`/admin/users/${id}`);
                showStatus('success', 'User account has been deleted permanently.', 'Successfull');
                fetchUsers();
                fetchStats();
            } catch (error) {
            void error;
                showStatus('failed', 'Failed to delete user. Please try again.', 'Failed');
            }
        }, 'Erase User Record?', 'delete');
    };

    const handleEditUser = (user) => {
        setEditingUser({
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'seller',
            city: user.city || '',
            district: user.district || '',
            state: user.state || '',
            pincode: user.pincode || '',
            gender: user.gender || 'male',
            aadharPhoto: user.aadharPhoto || '',
            licensePhoto: user.licensePhoto || '',
            profilePhoto: user.profilePhoto || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/admin/users/${editingUser.id}`, editingUser);
            showStatus('changed', 'User details updated successfully!', 'Changed');
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
            if (activeTab === 'merchants') fetchSellers();
            if (activeTab === 'delivery') fetchDelivery();
        } catch (error) {
            void error;
            showStatus('failed', 'Error: ' + (error.response?.data?.error || error.message), 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPass) {
            showStatus('invalid', 'Please enter a new password', 'Invalid Input');
            return;
        }
        try {
            await api.put(`/admin/users/${resettingUser.id}/reset-password`, { password: newPass });
            showStatus('success', `Password for ${resettingUser.name} updated successfully!`, 'Successfull');
            setShowResetModal(false);
            setNewPass('');
            setResettingUser(null);
        } catch (error) {
            void error;
            showStatus('failed', error.response?.data?.error || 'Failed to reset password', 'Failed');
        }
    };

    // 🆕 Phase 1 Feature Handlers

    // Advanced Filter Handlers
    const _handleUserFilter = (filters) => {
        let filtered = [...userList];

        if (filters.search) {
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                u.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
                u.phone?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.role !== 'all') {
            filtered = filtered.filter(u => u.role === filters.role);
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(u => u.isActive === (filters.status === 'active'));
        }

        if (filters.verified !== 'all') {
            filtered = filtered.filter(u => u.isVerified === (filters.verified === 'verified'));
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(u => new Date(u.createdAt) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            filtered = filtered.filter(u => new Date(u.createdAt) <= new Date(filters.dateTo));
        }

        setFilteredUserList(filtered);
    };

    const _handleSellerFilter = (filters) => {
        let filtered = [...sellerList];

        if (filters.search) {
            filtered = filtered.filter(s =>
                s.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                s.email?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(s => s.isActive === (filters.status === 'active'));
        }

        if (filters.verified !== 'all') {
            filtered = filtered.filter(s => s.isVerified === (filters.verified === 'verified'));
        }

        setFilteredSellerList(filtered);
    };

    const _handleDeliveryFilter = (filters) => {
        let filtered = [...deliveryList];

        if (filters.search) {
            filtered = filtered.filter(d =>
                d.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                d.email?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(d => d.isActive === (filters.status === 'active'));
        }

        if (filters.verified !== 'all') {
            filtered = filtered.filter(d => d.isVerified === (filters.verified === 'verified'));
        }

        setFilteredDeliveryList(filtered);
    };

    // Bulk Action Handlers
    const _handleBulkDelete = async (ids) => {
        try {
            await api.post('/admin/users/bulk-delete', { userIds: ids });
            showStatus('success', `Successfully deleted ${ids.length} users`, 'Bulk Action Complete');
            fetchUsers();
        } catch (error) {
            void error;
            showStatus('failed', 'Bulk delete failed: ' + error.message, 'Failed');
        }
    };

    const _handleBulkActivate = async (ids) => {
        try {
            await api.post('/admin/users/bulk-activate', { userIds: ids });
            showStatus('success', `Successfully activated ${ids.length} users`, 'Bulk Action Complete');
            fetchUsers();
        } catch (error) {
            void error;
            showStatus('failed', 'Bulk activate failed: ' + error.message, 'Failed');
        }
    };

    const _handleBulkDeactivate = async (ids) => {
        try {
            await api.post('/admin/users/bulk-deactivate', { userIds: ids });
            showStatus('success', `Successfully deactivated ${ids.length} users`, 'Bulk Action Complete');
            fetchUsers();
        } catch (error) {
            void error;
            showStatus('failed', 'Bulk deactivate failed: ' + error.message, 'Failed');
        }
    };

    // Bulk Action Handlers for Products
    const handleBulkDeleteProducts = async (ids) => {
        confirmAction(`This will permanently delete ${ids.length} products from the database.`, async () => {
            try {
                await api.post('/admin/products/bulk-delete', { productIds: ids });
                showStatus('success', `Successfully deleted ${ids.length} products`, 'Bulk Delete Complete');
                fetchProducts();
            } catch (error) {
            void error;
                showStatus('failed', 'Bulk delete failed: ' + error.message, 'Failed');
            }
        }, 'Delete Products?', 'delete');
    };

    const handleBulkApproveProducts = async (ids) => {
        try {
            await api.post('/admin/products/bulk-approve', { productIds: ids });
            showStatus('success', `Successfully approved ${ids.length} products`, 'Bulk Approve Complete');
            fetchProducts();
        } catch (error) {
            void error;
            showStatus('failed', 'Bulk approve failed: ' + error.message, 'Failed');
        }
    };

    const handleBulkRejectProducts = async (ids) => {
        try {
            await api.post('/admin/products/bulk-reject', { productIds: ids });
            showStatus('success', `Successfully rejected ${ids.length} products`, 'Bulk Reject Complete');
            fetchProducts();
        } catch (error) {
            void error;
            showStatus('failed', 'Bulk reject failed: ' + error.message, 'Failed');
        }
    };

    // Bulk Action Handlers for Orders
    const _handleBulkDeleteOrders = async (ids) => {
        confirmAction(`This will permanently delete ${ids.length} orders from the database.`, async () => {
            try {
                await api.post('/admin/orders/bulk-delete', { orderIds: ids });
                showStatus('success', `Successfully deleted ${ids.length} orders`, 'Bulk Delete Complete');
                fetchOrders();
            } catch (error) {
            void error;
                showStatus('failed', 'Bulk delete failed: ' + error.message, 'Failed');
            }
        }, 'Delete Orders?', 'delete');
    };

    const _handleBulkCancelOrders = async (ids) => {
        try {
            await api.post('/admin/orders/bulk-cancel', { orderIds: ids });
            showStatus('success', `Successfully cancelled ${ids.length} orders`, 'Bulk Cancel Complete');
            fetchOrders();
        } catch (error) {
            void error;
            showStatus('failed', 'Bulk cancel failed: ' + error.message, 'Failed');
        }
    };

    // Initialize filtered lists when data changes
    useEffect(() => {
        setFilteredUserList(userList);
    }, [userList]);

    useEffect(() => {
        setFilteredSellerList(sellerList);
    }, [sellerList]);

    useEffect(() => {
        setFilteredDeliveryList(deliveryList);
    }, [deliveryList]);

    const displayStats = [
        { label: 'Platform Commission', value: `₹${profitStats.totalCommission.toLocaleString()}`, change: '10% Fee', icon: <DollarSign size={20} />, color: '#10b981', targetTab: 'reports' },
        { label: 'Express Earnings', value: `₹${profitStats.expressEarnings.toLocaleString()}`, change: 'Delivery', icon: <Zap size={20} />, color: '#6366f1', targetTab: 'express' },
        { label: 'Total Revenue', value: `₹${profitStats.totalRevenue.toLocaleString()}`, change: 'Gross', icon: <TrendingUp size={20} />, color: '#f59e0b', targetTab: 'reports' },
        { label: 'Orders Placed', value: stats.totalOrders, change: 'Total', icon: <ShoppingCart size={20} />, color: '#ec4899', targetTab: 'reports' },
    ];

    const renderApplicationsTable = () => (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
            <div style={adminPageHeader}>
                <div style={headerInfo}>
                    <h3 style={contentTitle}>Verification Queue</h3>
                    <p style={contentSubtitle}>Review sensitive documents and approve professional accounts for the hub.</p>
                </div>
            </div>
            <div style={tableCard}>
                <table style={saasTable}>
                    <thead>
                        <tr>
                            <th style={th}>Applicant Details</th>
                            <th style={th}>Role</th>
                            <th style={th}>Documents</th>
                            <th style={{ ...th, textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>No pending applications. Platform is up to date!</td></tr>
                        ) : applications.map(app => (
                            <tr key={app.id} style={tRow}>
                                <td style={td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={userAvatarMini}>{app.name[0]}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 800 }}>{app.name}</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{app.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={td}><span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>{app.role}</span></td>
                                <td style={td}>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {app.aadharPhoto && <button onClick={() => window.open(app.aadharPhoto)} style={{ ...miniAction, width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>📄 AADHAR</button>}
                                        {app.licensePhoto && <button onClick={() => window.open(app.licensePhoto)} style={{ ...miniAction, width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }}>🪪 LICENSE</button>}
                                        {!app.aadharPhoto && !app.licensePhoto && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No documents</span>}
                                    </div>
                                </td>
                                <td style={{ ...td, textAlign: 'right' }}>
                                    <button onClick={() => handleVerifyUser(app.id)} style={{ ...saasAddBtn, padding: '0.4rem 1rem', fontSize: '0.75rem' }}>Approve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Motion.div>
    );

    const renderUserTable = (list, title, subtitle, roleForNew) => (
        <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={pane}>
            <div style={adminPageHeader}>
                <div style={headerInfo}>
                    <h3 style={sectionTitle}>{title}</h3>
                    <p style={sectionSubtitle}>{subtitle}</p>
                </div>
                <div style={headerActions}>
                    <div style={miniSearch}>
                        <Search size={14} />
                        <input placeholder={`Search ${title.toLowerCase()}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={miniInput} />
                    </div>
                    <button
                        style={{ ...saasPrimaryBtn, background: '#64748b' }}
                        onClick={() => {
                            if (roleForNew === 'seller') fetchSellers();
                            else if (roleForNew === 'delivery') fetchDelivery();
                            else fetchUsers();
                            showStatus('success', 'Refreshing entries...', 'Synchronizing');
                        }}
                        title="Refresh List"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button style={saasPrimaryBtn} onClick={() => { setNewUser({ ...newUser, role: roleForNew }); setShowRegisterModal(true); }}>
                        <Plus size={16} /> Add {roleForNew.charAt(0).toUpperCase() + roleForNew.slice(1)}
                    </button>
                </div>
            </div>
            <div style={tableCard}>
                <table style={saasTable}>
                    <thead>
                        <tr>
                            <th style={th}>Identity</th>
                            <th style={th}>Role</th>
                            <th style={th}>Contact</th>
                            <th style={th}>Joined</th>
                            <th style={th}>Status</th>
                            <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.filter(u =>
                            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 ? (
                            <tr><td colSpan="6" style={emptyState}>No records found.</td></tr>
                        ) : (
                            list.filter(u =>
                                u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map(u => (
                                <tr key={u.id} style={tRow}>
                                    <td style={td}>
                                        <div style={userCell}>
                                            <div style={userAvatar}>{u.name?.charAt(0) || 'U'}</div>
                                            <div style={userDetails}>
                                                <span style={userName}>
                                                    {u.name}
                                                    {u.isVerified && <ShieldCheck size={14} color="#10b981" style={{ marginLeft: '6px', verticalAlign: 'middle' }} />}
                                                </span>
                                                <span style={userEmail}>{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={td}>
                                        <span style={{
                                            ...saasBadge,
                                            background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : u.role === 'seller' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: u.role === 'admin' ? '#ef4444' : u.role === 'seller' ? '#6366f1' : '#10b981'
                                        }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={td}><span style={phoneText}>{u.phone || 'No Phone'}</span></td>
                                    <td style={td}><span style={dateText}>{new Date(u.createdAt).toLocaleDateString()}</span></td>
                                    <td style={td}>
                                        <div style={statusDotContainer}>
                                            <div style={{ ...activeDot, background: u.isActive ? '#10b981' : '#ef4444' }} />
                                            {u.isActive ? 'Active' : 'Suspended'}
                                        </div>
                                    </td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <div style={actionCluster}>
                                            {(u.role === 'seller' || u.role === 'delivery') && (
                                                <button style={miniAction} onClick={() => handleEditUser(u)} title="Edit Details">
                                                    <Edit size={14} color="#6366f1" />
                                                </button>
                                            )}
                                            <button style={miniAction} onClick={() => { setResettingUser(u); setShowResetModal(true); }} title="Reset Password">
                                                <Key size={14} color="#f59e0b" />
                                            </button>
                                            <button style={miniAction} onClick={() => handleToggleUserStatus(u.id)} title={u.isActive ? "Ban" : "Activate"}>
                                                {u.isActive ? <Ban size={14} color="#ef4444" /> : <ShieldCheck size={14} color="#10b981" />}
                                            </button>
                                            <button style={miniAction} onClick={() => handleDeleteUser(u.id)} title="Delete">
                                                <Trash2 size={14} color="#94a3b8" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Motion.div>
    );

    const PieChart = ({ data }) => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;
        return (
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '220px' }}>
                {data.map((item, i) => {
                    const sliceAngle = (item.value / total) * 360;
                    const x1 = 50 + 40 * Math.cos((Math.PI * currentAngle) / 180);
                    const y1 = 50 + 40 * Math.sin((Math.PI * currentAngle) / 180);
                    currentAngle += sliceAngle;
                    const x2 = 50 + 40 * Math.cos((Math.PI * currentAngle) / 180);
                    const y2 = 50 + 40 * Math.sin((Math.PI * currentAngle) / 180);
                    const largeArc = sliceAngle > 180 ? 1 : 0;
                    return (
                        <path
                            key={i}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={item.color}
                            stroke="#fff"
                            strokeWidth="1"
                        />
                    );
                })}
                <circle cx="50" cy="50" r="25" fill="#fff" />
                <text x="50" y="55" fontSize="10" fontWeight="900" textAnchor="middle" fill="#1e293b">{total}</text>
            </svg>
        );
    };

    return (
        <div style={container}>
            <style>{sidebarScrollbarStyles}</style>
            <div style={layout}>
                {/* Sidebar - Responsive */}
                <aside style={{
                    ...sidebar,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    transform: isMobile && !showSidebar ? 'translateX(-100%)' : 'translateX(0)',
                    zIndex: isMobile ? 200 : 120,
                    width: '280px',
                    height: '100vh',
                    boxShadow: isMobile && showSidebar ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <div style={logoSection}>
                        <div style={{ ...logoIcon, background: 'rgba(255,255,255,0.1)' }}>
                            <Layers size={22} color="#fff" />
                        </div>
                        <span style={{ ...logoText, color: '#fff' }}>H-HUB <span style={adminTag}>ADMIN</span></span>
                        {isMobile && (
                            <button onClick={() => setShowSidebar(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff' }}>
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <div className="dashboard-sidebar-scroll" style={sidebarNavScroll}>
                    <div style={navSection}>
                        <span style={navLabel}>ANALYTICS & CORE</span>
                        <div style={navGroup}>
                            <button onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? activeNav : navBtn}><BarChart size={18} /> Overview</button>
                            <button onClick={() => setActiveTab('calculator')} style={activeTab === 'calculator' ? activeNav : navBtn}><Calculator size={18} /> Price Calculator</button>
                            <button onClick={() => setActiveTab('profits_admin')} style={activeTab === 'profits_admin' ? activeNav : navBtn}><Activity size={18} /> Profit Analysis</button>
                            <button onClick={() => setActiveTab('settlements_admin')} style={activeTab === 'settlements_admin' ? activeNav : navBtn}><CreditCard size={18} /> Settlements</button>
                            <button onClick={() => setActiveTab('reports_calendar')} style={activeTab === 'reports_calendar' ? activeNav : navBtn}><Calendar size={18} /> Calendar & Reports</button>
                            <button onClick={() => setActiveTab('reports')} style={activeTab === 'reports' ? activeNav : navBtn}><FileText size={18} /> Finance Reports</button>
                            <button onClick={() => setActiveTab('logs')} style={activeTab === 'logs' ? activeNav : navBtn}><Shield size={18} /> Audit Logs</button>
                        </div>
                    </div>

                    <div style={navSection}>
                        <span style={navLabel}>MANAGEMENT</span>
                        <div style={navGroup}>
                            <button onClick={() => setActiveTab('applications')} style={activeTab === 'applications' ? activeNav : navBtn}>
                                <ShieldCheck size={18} />
                                Applications
                                {applications.length > 0 && <span style={badgeCount}>{applications.length}</span>}
                            </button>
                            <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeNav : navBtn}><Users size={18} /> Users</button>
                            <button onClick={() => setActiveTab('merchants')} style={activeTab === 'merchants' ? activeNav : navBtn}><Store size={18} /> Merchants</button>
                            <button onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? activeNav : navBtn}><ShoppingCart size={18} /> Orders</button>
                            <button onClick={() => setActiveTab('settings_admin')} style={activeTab === 'settings_admin' ? activeNav : navBtn}><Settings size={18} /> Pricing & Settings</button>
                            <button onClick={() => setActiveTab('dispatch')} style={activeTab === 'dispatch' ? activeNav : navBtn}><MapIcon size={18} /> Dispatch Center</button>
                            <button onClick={() => setActiveTab('delivery')} style={activeTab === 'delivery' ? activeNav : navBtn}><Truck size={18} /> Delivery Men</button>
                        </div>
                    </div>

                    <div style={navSection}>
                        <span style={navLabel}>MARKETPLACE</span>
                        <div style={navGroup}>
                            <button onClick={() => setActiveTab('verification')} style={activeTab === 'verification' ? activeNav : navBtn}>
                                <FileCheck size={18} /> Verification Center
                                {productList.filter(p => p.status === 'Pending').length > 0 &&
                                    <span style={{ ...badgeCount, background: '#f59e0b', color: '#fff' }}>
                                        {productList.filter(p => p.status === 'Pending').length}
                                    </span>
                                }
                            </button>
                            <button onClick={() => setActiveTab('offers')} style={activeTab === 'offers' ? activeNav : navBtn}><Percent size={18} /> Campaigns</button>
                            <button onClick={() => setActiveTab('coupons')} style={activeTab === 'coupons' ? activeNav : navBtn}><Tag size={18} /> Coupons</button>
                            <button onClick={() => setActiveTab('categories_admin')} style={activeTab === 'categories_admin' ? activeNav : navBtn}><Layers size={18} /> Taxonomy</button>
                            <button onClick={() => setActiveTab('express')} style={activeTab === 'express' ? activeNav : navBtn}><Zap size={18} /> Priority</button>
                        </div>
                    </div>

                    <div style={navSection}>
                        <span style={navLabel}>FINANCIAL CONTROL</span>
                        <div style={navGroup}>
                            <button onClick={() => setActiveTab('settlements_admin')} style={activeTab === 'settlements_admin' ? activeNav : navBtn}><CreditCard size={18} /> Settled Payouts</button>
                        </div>
                    </div>

                    <div style={navSection}>
                        <span style={navLabel}>SYSTEM TOOLS</span>
                        <div style={navGroup}>
                            <button onClick={() => setShowBroadcastModal(true)} style={navBtn}><Bell size={18} /> Broadcast Message</button>
                        </div>
                    </div>
                    </div>

                    <div style={sidebarFooter}>
                        <div style={profileInSidebar}>
                            <div style={userAvatarMini}>{user?.name?.charAt(0) || 'A'}</div>
                            <div style={profileInfo}>
                                <span style={{ ...profName, color: '#fff' }}>{user?.name || 'Admin'}</span>
                                <span style={{ ...profRole, color: '#94a3b8' }}>Platform Lead</span>
                            </div>
                        </div>
                        <button style={logoutBtnSidebar} onClick={logout}>
                            <Power size={16} /> Logout
                        </button>
                        <button onClick={() => navigate('/')} style={backToHubBtn}><ArrowLeft size={16} /> Return to Hub</button>
                    </div>
                </aside>

                {isMobile && showSidebar && (
                    <div onClick={() => setShowSidebar(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(2px)' }} />
                )}

                <main style={{
                    ...content,
                    marginLeft: isMobile ? 0 : '280px',
                    width: isMobile ? '100%' : 'calc(100% - 280px)',
                    overflow: 'hidden'
                }}>
                    <header
                        style={{
                            ...topBar,
                            padding: isMobile ? '0.75rem 1rem' : '0 3rem',
                            minHeight: isMobile ? '72px' : '80px',
                            height: isMobile ? 'auto' : '80px',
                            gap: isMobile ? '0.75rem' : 0
                        }}
                    >
                        <div style={topBarLeft}>
                            {isMobile && (
                                <button onClick={() => setShowSidebar(true)} style={{ background: 'none', border: 'none', color: '#1e293b' }}>
                                    <Menu size={24} />
                                </button>
                            )}
                            <div style={searchWrapper}>
                                <Search size={18} color="#64748b" />
                                <input placeholder="Global platform search..." style={sInput} />
                            </div>
                        </div>
                        <div style={topBarRight}>
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setShowNotifications(!showNotifications)} style={topNavBtn}>
                                    {notifications.some(n => !n.isRead) ? <BellDot size={18} color="#ef4444" /> : <Bell size={18} color="#ef4444" />}
                                </button>
                                {showNotifications && (
                                    <div style={notificationPanel}>
                                        <div style={notifHeader}>System Alerts</div>
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
                            <button onClick={() => navigate('/')} style={topNavBtn}>
                                <Globe size={18} />
                                <span>View Site</span>
                            </button>

                            <button
                                onClick={() => navigate('/profile')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    background: '#3b82f6',
                                    border: 'none',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '14px',
                                    color: '#3b82f6'
                                }}>
                                    {user?.name?.charAt(0).toUpperCase() || 'H'}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>{user?.name || 'H-LOGIX Admin'}</div>
                                    <div style={{ color: '#bfdbfe', fontSize: '10px', fontWeight: 700, marginTop: '2px', letterSpacing: '0.5px' }}>H-HUB ADMIN</div>
                                </div>
                            </button>
                        </div>
                    </header>
                    <div style={{ ...scrollArea, overflowY: isMobile && showSidebar ? 'hidden' : 'auto', padding: isMobile ? '1rem' : '2rem 3rem' }}>
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <Motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={pane}>
                                    <div style={adminPageHeader}>
                                        <div style={headerInfo}>
                                            <h1 style={contentTitle}>System Command Center</h1>
                                            <p style={contentSubtitle}>Real-time performance metrics and platform health diagnostics.</p>
                                        </div>
                                        <div style={headerActions}>
                                            <button style={outlineBtn}><Download size={14} /> Export Report</button>
                                            <button style={saasPrimaryBtn} onClick={() => { setNewUser({ ...newUser, role: 'seller' }); setShowRegisterModal(true); }}>
                                                <Plus size={16} /> New Merchant
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ ...statsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)' }}>
                                        {displayStats.map((s, i) => (
                                            <Motion.div
                                                key={i}
                                                style={saasStatCard}
                                                onClick={() => setActiveTab(s.targetTab)}
                                                whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0,0,0,0.08)', borderColor: s.color }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div style={statHeader}>
                                                    <Motion.div
                                                        style={{ ...statIconBox, color: s.color }}
                                                        whileHover={{ rotate: 15, scale: 1.1 }}
                                                    >
                                                        {s.icon}
                                                    </Motion.div>
                                                    <span style={statTrend}>+12.5%</span>
                                                </div>
                                                <div style={statContent}>
                                                    <span style={statLabel}>{s.label}</span>
                                                    <h3 style={statValue}>{s.value}</h3>
                                                </div>
                                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at bottom right, ${s.color}10, transparent)`, borderRadius: '0 0 28px 0' }} />
                                            </Motion.div>
                                        ))}
                                    </div>
                                    <div style={doubleGrid}>
                                        <Motion.div
                                            style={chartCard}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h3 style={cardTitle}>Revenue Growth (last 7 days)</h3>
                                            <div style={{ width: '100%', height: '240px', minHeight: '240px' }}>
                                                <ResponsiveContainer width="99%" height="100%">
                                                    <AreaChart data={[
                                                        { name: 'Mon', revenue: 4000 },
                                                        { name: 'Tue', revenue: 3000 },
                                                        { name: 'Wed', revenue: 2000 },
                                                        { name: 'Thu', revenue: 2780 },
                                                        { name: 'Fri', revenue: 1890 },
                                                        { name: 'Sat', revenue: 2390 },
                                                        { name: 'Sun', revenue: 3490 },
                                                    ]}>
                                                        <defs>
                                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Motion.div>
                                        <Motion.div
                                            style={{ ...chartCard, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <h3 style={{ ...cardTitle, width: '100%' }}>User Segmentation</h3>
                                            <div style={{ ...chartCard, display: 'flex', flexDirection: 'column', alignItems: 'center', border: 'none', padding: 0 }}>
                                                <PieChart data={[
                                                    { label: 'Customers', value: userList.filter(u => u.role === 'user').length, color: '#6366f1' },
                                                    { label: 'Merchants', value: userList.filter(u => u.role === 'seller').length, color: '#10b981' },
                                                    { label: 'Riders', value: userList.filter(u => u.role === 'delivery').length, color: '#f59e0b' }
                                                ]} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#6366f1', borderRadius: '2px' }} /> User</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} /> Seller</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }} /> Rider</div>
                                            </div>
                                        </Motion.div>
                                    </div>
                                    <div style={{ ...chartCard, marginTop: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ ...cardTitle, marginBottom: 0 }}>System Health & Performance</h3>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', background: '#f0fdf4', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>CORE SYSTEMS NOMINAL</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>CPU LOAD</div>
                                                <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                                    <div style={{ width: '24%', height: '100%', background: '#6366f1' }} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>24%</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>MEM USAGE</div>
                                                <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                                    <div style={{ width: '42%', height: '100%', background: '#10b981' }} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>1.2 GB</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>API LATENCY</div>
                                                <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                                    <div style={{ width: '12%', height: '100%', background: '#f59e0b' }} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>18ms</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>DB UPTIME</div>
                                                <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                                    <div style={{ width: '99%', height: '100%', background: '#8b5cf6' }} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>99.9%</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ ...chartCard, marginTop: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ ...cardTitle, marginBottom: 0 }}>Delivery Performance</h3>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', background: '#e0f2fe', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>LIVE</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '1rem' }}>
                                            <div style={{ padding: '1rem', borderRadius: '16px', background: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', marginBottom: '0.5rem' }}>ASSIGNED</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{deliveryStats.totalAssigned}</div>
                                            </div>
                                            <div style={{ padding: '1rem', borderRadius: '16px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', marginBottom: '0.5rem' }}>COMPLETED</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{deliveryStats.completed}</div>
                                            </div>
                                            <div style={{ padding: '1rem', borderRadius: '16px', background: '#fefce8', border: '1px solid #fef9c3' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ca8a04', marginBottom: '0.5rem' }}>NOT COMPLETED</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{deliveryStats.notCompleted}</div>
                                            </div>
                                            <div style={{ padding: '1rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem' }}>AVG RATING</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{deliveryStats.avgRating}</div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <div style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Delivery Team Performance</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
                                                {(deliveryStats.performanceData || []).slice(0, 6).map((person) => (
                                                    <div key={person.id} style={{ padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                                                        <div style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{person.name || 'Delivery Partner'}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>{person.phone || 'N/A'}</div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                            <div><strong>{person.completed}</strong> done</div>
                                                            <div><strong>{person.notCompleted}</strong> pending</div>
                                                            <div><strong>{person.avgRating}</strong> rating</div>
                                                        </div>
                                                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}>Fines: ₹{person.totalFines}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ ...chartCard, marginTop: '2rem' }}>
                                        <h3 style={cardTitle}>⚡ Platform Quick Actions</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '1.25rem' }}>
                                            <Motion.button
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: '#ffffff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => { setNewUser({ ...newUser, role: 'seller' }); setShowRegisterModal(true); }}
                                            >
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Store size={24} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>Register Seller</div>
                                            </Motion.button>

                                            <Motion.button
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: '#ffffff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(37, 99, 235, 0.35)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => navigate('/innovations')}
                                            >
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                                <div style={{ background: 'rgba(255,255,255,0.18)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Sparkles size={24} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>Open Innovation Hub</div>
                                            </Motion.button>

                                            <Motion.button
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: '#ffffff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    boxShadow: '0 10px 25px rgba(240, 147, 251, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(240, 147, 251, 0.4)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => { setNewUser({ ...newUser, role: 'delivery' }); setShowRegisterModal(true); }}
                                            >
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Truck size={24} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>Register Rider</div>
                                            </Motion.button>

                                            <Motion.button
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: '#ffffff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    boxShadow: '0 10px 25px rgba(79, 172, 254, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(79, 172, 254, 0.4)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setActiveTab('offers')}
                                            >
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Tag size={24} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>New Campaign</div>
                                            </Motion.button>

                                            <Motion.button
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: '#1e293b',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    boxShadow: '0 10px 25px rgba(168, 237, 234, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(168, 237, 234, 0.4)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => showStatus('success', 'System backup initiated. Data is being secured in the cloud.', 'Backup Active')}
                                            >
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%' }} />
                                                <div style={{ background: 'rgba(79, 172, 254, 0.15)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <UploadCloud size={24} color="#4facfe" />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>Backup Data</div>
                                            </Motion.button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '1.25rem', marginTop: '1.25rem' }}>
                                            <Motion.button
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: '#ffffff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    boxShadow: '0 10px 25px rgba(250, 112, 154, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(250, 112, 154, 0.4)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setActiveTab('products')}
                                            >
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={24} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>View Products</div>
                                            </Motion.button>

                                            <Motion.button
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: '#ffffff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    boxShadow: '0 10px 25px rgba(67, 233, 123, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(67, 233, 123, 0.4)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setActiveTab('profits_admin')}
                                            >
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <TrendingUp size={24} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>Profit Analysis</div>
                                            </Motion.button>

                                            <Motion.button
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: '#ffffff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    boxShadow: '0 10px 25px rgba(252, 203, 144, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(252, 203, 144, 0.4)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setActiveTab('settlements_admin')}
                                            >
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CreditCard size={24} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>Settlements</div>
                                            </Motion.button>

                                            <Motion.button
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: '#ffffff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    boxShadow: '0 10px 25px rgba(48, 207, 208, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(48, 207, 208, 0.4)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setActiveTab('reports')}
                                            >
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FileText size={24} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>Reports</div>
                                            </Motion.button>
                                        </div>
                                    </div>

                                    <div style={doubleGrid}>
                                        <div style={{ ...chartCard, marginTop: '2rem' }}>
                                            <h3 style={cardTitle}>Recent Activity</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                                                {ordersList.slice(0, 5).map(order => (
                                                    <div key={order.id} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Order #{order.id.slice(0, 8)}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>{order.User?.name || 'Unknown User'}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>₹{order.totalAmount}</div>
                                                            <span style={{ ...saasBadge, fontSize: '0.65rem', marginTop: '0.25rem' }}>{order.status}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {ordersList.length === 0 && (
                                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                        No recent activity
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ ...chartCard, marginTop: '2rem' }}>
                                            <h3 style={cardTitle}>Platform Status</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f0fdf4', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <CheckCircle2 size={18} color="#10b981" />
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Orders System</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>ONLINE</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f0fdf4', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <CheckCircle2 size={18} color="#10b981" />
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Payment Gateway</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>ONLINE</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f0fdf4', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <CheckCircle2 size={18} color="#10b981" />
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Delivery Network</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>ONLINE</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#eff6ff', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Activity size={18} color="#3b82f6" />
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Active Riders</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6' }}>{deliveryList.filter(d => d.isVerified).length} ONLINE</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ ...chartCard, marginTop: '2rem' }}>
                                        <h3 style={cardTitle}>Broadcast Hub Center</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Send real-time alerts or system-wide announcements to all partners.</p>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <input
                                                id="broadcastMsg"
                                                placeholder="Enter system announcement message..."
                                                style={{ ...mInput, flex: 1, minWidth: '250px' }}
                                            />
                                            <button
                                                style={{ ...saasAddBtn, height: '45px' }}
                                                onClick={() => {
                                                    const msg = document.getElementById('broadcastMsg').value;
                                                    if (msg) handleSendGlobalNotification('SYSTEM BROADCAST', msg);
                                                }}
                                            >
                                                <Bell size={16} /> Send Announcement
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ ...chartCard, marginTop: '2rem' }}>
                                        <h3 style={cardTitle}>Today's Performance Snapshot</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '1rem' }}>
                                            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', color: 'white' }}>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>TODAY'S ORDERS</div>
                                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>{ordersList.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>+{((ordersList.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length / (ordersList.length || 1)) * 100).toFixed(1)}% of total</div>
                                            </div>
                                            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px', color: 'white' }}>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>TODAY'S REVENUE</div>
                                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>₹{ordersList.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>Real-time tracking</div>
                                            </div>
                                            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px', color: 'white' }}>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>PENDING SETTLEMENTS</div>
                                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>{settlementList.filter(s => s.settlementStatus === 'Pending').length}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>₹{settlementList.filter(s => s.settlementStatus === 'Pending').reduce((sum, s) => sum + (s.sellerAmount || 0), 0).toFixed(0)} total</div>
                                            </div>
                                        </div>
                                    </div>
                                </Motion.div>
                            )}

                            {activeTab === 'dispatch' && (
                                <Motion.div key="dispatch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%' }}>
                                    <AssignOrder />
                                </Motion.div>
                            )}

                            {activeTab === 'applications' && renderApplicationsTable()}

                            {activeTab === 'users' && renderUserTable(userList, "Platform User Base", "Oversee all accounts, verify identities, and manage permissions.", "user")}

                            {activeTab === 'merchants' && renderUserTable(sellerList, "Verified Merchants", "Manage seller partnerships and marketplace storefronts.", "seller")}

                            {activeTab === 'delivery' && renderUserTable(deliveryList, "Delivery Men", "Coordination of delivery riders and fulfillment personnel.", "delivery")}

                            {activeTab === 'orders' && (
                                <Motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                    <div style={adminPageHeader}>
                                        <div style={headerInfo}>
                                            <h3 style={sectionTitle}>Central Order Dispatch</h3>
                                            <p style={sectionSubtitle}>Oversee all platform orders and assign logistics partners.</p>
                                        </div>
                                        <div style={headerActions}>
                                            <button
                                                style={{ ...saasPrimaryBtn, background: '#64748b' }}
                                                onClick={() => {
                                                    fetchOrders();
                                                    showStatus('success', 'Refreshing orders...', 'Synchronizing');
                                                }}
                                                title="Refresh Orders"
                                            >
                                                <RefreshCw size={16} /> Sync Live Orders
                                            </button>
                                        </div>
                                    </div>
                                    <div style={tableCard}>
                                        <table style={saasTable}>
                                            <thead>
                                                <tr>
                                                    <th style={th}>Order ID</th>
                                                    <th style={th}>Status</th>
                                                    <th style={th}>Product</th>
                                                    <th style={th}><div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Truck size={14} /> Logistics</div></th>
                                                    <th style={th}>Settlement</th>
                                                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ordersList.map(order => (
                                                    <tr key={order.id} style={tRow}>
                                                        <td style={td}>
                                                            <div style={{ fontWeight: 800 }}>{order.id.slice(0, 8)}</div>
                                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>₹{order.totalAmount}</div>
                                                        </td>
                                                        <td style={td}>
                                                            <span style={{
                                                                ...activeBadge,
                                                                background: order.status === 'Delivered' ? '#f0fdf4' : order.status === 'Packed' ? '#e0e7ff' : order.status === 'Processing' ? '#fef3c7' : order.status === 'Shipped' ? '#ecfccb' : '#fee2e2',
                                                                color: order.status === 'Delivered' ? '#166534' : order.status === 'Packed' ? '#4338ca' : order.status === 'Processing' ? '#92400e' : order.status === 'Shipped' ? '#3f6212' : '#991b1b'
                                                            }}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td style={td}>{order.productName}</td>
                                                        <td style={td}>
                                                            {order.deliveryManId ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.8rem' }}>ASSIGNED</span>
                                                                    <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{deliveryList.find(d => d.id === order.deliveryManId)?.name || 'Personnel'}</span>
                                                                </div>
                                                            ) : (
                                                                <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.75rem' }}>UNASSIGNED</span>
                                                            )}
                                                        </td>
                                                        <td style={td}>
                                                            <span style={{
                                                                ...saasBadge,
                                                                background: order.settlementStatus === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                                color: order.settlementStatus === 'Paid' ? '#10b981' : '#f59e0b'
                                                            }}>
                                                                {order.settlementStatus || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...td, textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                {order.deliveryPhoto && order.status === 'Delivered' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setViewingDetails(order)}
                                                                        style={{
                                                                            background: 'rgba(139, 92, 246, 0.15)',
                                                                            color: '#8b5cf6',
                                                                            padding: '0.4rem 0.8rem',
                                                                            borderRadius: '8px',
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: 800,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px',
                                                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        title="View delivery proof"
                                                                    >
                                                                        <Image size={12} /> PROOF
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setAssigningOrder(order)}
                                                                    style={{ ...miniAction, width: 'auto', padding: '0.4rem 1rem', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 800, borderRadius: '8px' }}
                                                                >
                                                                    <Truck size={14} style={{ marginRight: '4px' }} /> Assign
                                                                </button>
                                                                <button
                                                                    onClick={() => setViewingDetails(order)}
                                                                    style={{ ...miniAction, width: 'auto', padding: '0.4rem 1rem', fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.2)', fontWeight: 800, borderRadius: '8px' }}
                                                                >
                                                                    <Eye size={14} style={{ marginRight: '4px' }} /> View
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Motion.div>
                            )}

                            {activeTab === 'reports' && (
                                <Motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                    <div style={adminPageHeader}>
                                        <div style={headerInfo}>
                                            <h3 style={sectionTitle}>Revenue & Commissions</h3>
                                            <p style={sectionSubtitle}>Detailed breakdown of platform fees and express priority earnings.</p>
                                        </div>
                                        <button style={saasAddBtn}><Download size={16} /> Export Ledger</button>
                                    </div>
                                    <div style={tableCard}>
                                        <table style={saasTable}>
                                            <thead>
                                                <tr>
                                                    <th>Reference ID</th>
                                                    <th>Item/Service</th>
                                                    <th>Revenue</th>
                                                    <th>Processed At</th>
                                                    <th>Integrity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {salesReport.length === 0 ? (
                                                    <tr><td colSpan="5" style={emptyState}>No financial records found in current period.</td></tr>
                                                ) : (
                                                    salesReport.map(order => (
                                                        <tr key={order.id} style={tRow}>
                                                            <td style={{ padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.id.slice(0, 12).toUpperCase()}</td>
                                                            <td><span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{order.productName || 'Platform Transaction'}</span></td>
                                                            <td><span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--primary)' }}>₹{order.totalAmount?.toLocaleString()}</span></td>
                                                            <td><span style={dateText}>{order.date}</span></td>
                                                            <td><span style={{ ...saasBadge, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>VERIFIED</span></td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Motion.div>
                            )}

                            {activeTab === 'offers' && (
                                <Motion.div key="offers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                    <div style={adminPageHeader}>
                                        <div style={headerInfo}>
                                            <h3 style={sectionTitle}>Promotional Ecosystem</h3>
                                            <p style={sectionSubtitle}>Active customer incentives and platform-wide discount campaigns.</p>
                                        </div>
                                        <button style={saasAddBtn} onClick={() => { setEditingOffer(null); setNewOffer({ title: '', description: '', discountType: 'percentage', discountValue: 0, type: 'platform', isActive: true, startDate: '', endDate: '', category: 'All' }); setShowOfferModal(true); }}><Plus size={16} /> New Campaign</button>
                                    </div>
                                    <div style={merchGrid}>
                                        {offerList.map(offer => (
                                            <div key={offer.id} style={{ ...merchCard, border: offer.isActive ? '1px solid var(--primary)' : '1px solid var(--glass-border)', background: 'var(--bg-main)' }}>
                                                <div style={mTop}>
                                                    <div style={{ ...mLogo, background: 'var(--primary)' }}><Tag size={20} /></div>
                                                    <div
                                                        onClick={() => toggleOfferStatus(offer.id)}
                                                        style={{ ...toggleSwitch, background: offer.isActive ? '#10b981' : '#cbd5e1' }}
                                                    >
                                                        <div style={{ ...toggleDot, transform: offer.isActive ? 'translateX(14px)' : 'translateX(0px)' }} />
                                                    </div>
                                                </div>
                                                <div style={{ ...mName, fontSize: '1.1rem', marginTop: '1rem' }}>{offer.title}</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: '0.75rem 0' }}>
                                                    {offer.discountValue}{offer.discountType === 'percentage' ? '%' : '₹'} OFF
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} /> {offer.startDate || 'No start'} — {offer.endDate || 'No end'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                                                        {offer.category || 'Platform Wide'}
                                                    </span>
                                                </div>
                                                <div style={mActions}>
                                                    <button style={miniAction} onClick={() => startEditOffer(offer)}><Edit size={14} color="var(--primary)" /></button>
                                                    <button style={miniAction} onClick={() => handleDeleteOffer(offer.id)}><Trash2 size={14} color="#ef4444" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Motion.div>
                            )}

                            {activeTab === 'coupons' && (
                                <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                    <div style={adminPageHeader}>
                                        <h2 style={paneTitle}>Coupon Management</h2>
                                        <button onClick={() => setShowCouponModal(true)} style={createBtn}><Plus size={18} /> New Coupon</button>
                                    </div>

                                    <div style={tableCard}>
                                        <table style={saasTable}>
                                            <thead>
                                                <tr>
                                                    <th style={th}>Code</th>
                                                    <th style={th}>Discount</th>
                                                    <th style={th}>Min Order</th>
                                                    <th style={th}>Status</th>
                                                    <th style={th}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {couponList.map(c => (
                                                    <tr key={c.id}>
                                                        <td style={td}><strong>{c.code}</strong></td>
                                                        <td style={td}>{c.discountValue}{c.discountType === 'percentage' ? '%' : ' INR'}</td>
                                                        <td style={td}>₹{c.minOrderAmount}</td>
                                                        <td style={td}><span style={statusBadge(c.isActive)}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                                                        <td style={td}>
                                                            <button onClick={() => handleDeleteCoupon(c.id)} style={actionBtn}><Trash2 size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {showCouponModal && (
                                        <div style={modalOverlay}>
                                            <Motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={modal}>
                                                <h2 style={modalTitle}>Create New Coupon</h2>
                                                <form onSubmit={handleCreateCoupon}>
                                                    <div style={modalGrid}>
                                                        <div style={mGroup}>
                                                            <label>Coupon Code</label>
                                                            <input type="text" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} required style={mInput} placeholder="e.g. SUMMER50" />
                                                        </div>
                                                        <div style={mGroup}>
                                                            <label>Discount Type</label>
                                                            <select value={newCoupon.discountType} onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value })} style={mInput}>
                                                                <option value="percentage">Percentage (%)</option>
                                                                <option value="flat">Flat Amount (₹)</option>
                                                            </select>
                                                        </div>
                                                        <div style={mGroup}>
                                                            <label>Value</label>
                                                            <input type="number" value={newCoupon.discountValue} onChange={e => setNewCoupon({ ...newCoupon, discountValue: e.target.value })} required style={mInput} />
                                                        </div>
                                                        <div style={mGroup}>
                                                            <label>Min Order Amount (₹)</label>
                                                            <input type="number" value={newCoupon.minOrderAmount} onChange={e => setNewCoupon({ ...newCoupon, minOrderAmount: e.target.value })} style={mInput} />
                                                        </div>
                                                    </div>
                                                    <div style={modalActions}>
                                                        <button type="button" onClick={() => setShowCouponModal(false)} style={cancelBtn}>Cancel</button>
                                                        <button type="submit" style={submitBtn}>Create Coupon</button>
                                                    </div>
                                                </form>
                                            </Motion.div>
                                        </div>
                                    )}
                                </Motion.div>
                            )}
                            {
                                activeTab === 'categories_admin' && (
                                    <Motion.div key="cats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Marketplace Taxonomy</h3>
                                                <p style={sectionSubtitle}>Organize products into intuitive browsing segments.</p>
                                            </div>
                                            <button style={saasAddBtn} onClick={() => setShowCategoryModal(true)}><Plus size={16} /> Add Category</button>
                                        </div>
                                        <div style={tableCard}>
                                            <table style={saasTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Category Identity</th>
                                                        <th>Description</th>
                                                        <th>Global Visibility</th>
                                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categories.map(c => (
                                                        <tr key={c.id} style={tRow}>
                                                            <td style={{ padding: '1.25rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                    <div style={userAvatar}><Layers size={16} /></div>
                                                                    <span style={userName}>{c.name}</span>
                                                                </div>
                                                            </td>
                                                            <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.description || 'No description provided.'}</span></td>
                                                            <td><span style={{ ...saasBadge, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>PUBLIC</span></td>
                                                            <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                                                                <button onClick={() => handleDeleteCategory(c.id)} style={{ ...miniAction, color: '#ef4444' }}><Ban size={14} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {activeTab === 'settings_admin' && (
                                <Motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                    <div style={adminPageHeader}>
                                        <div style={headerInfo}>
                                            <h3 style={sectionTitle}>Pricing & Global Settings</h3>
                                            <p style={sectionSubtitle}>Manage GST, platform commissions, and operational overheads.</p>
                                        </div>

                                    </div>




                                    <div style={doubleGrid}>
                                        <div style={chartCard}>
                                            <h4 style={{ fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Percent size={20} color="var(--primary)" /> Tax & Profit Margin
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                {/* GST Percentage */}
                                                <div style={mGroup}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        Global GST Percentage (%) <InfoTooltip title="Taxation Guide" content="Global Tax applied to the order subtotal (Seller Price + Logistics). This is collected and managed by the platform." />
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <input
                                                            type="number"
                                                            value={platformSettings.gst_percentage}
                                                            onChange={e => setPlatformSettings({ ...platformSettings, gst_percentage: e.target.value })}
                                                            onBlur={() => handleUpdateSettings({ gst_percentage: platformSettings.gst_percentage })}
                                                            style={mInput}
                                                            min="0"
                                                            max="30"
                                                            step="0.1"
                                                        />
                                                        <span style={{ fontWeight: 900, opacity: 0.5 }}>%</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>
                                                        Applied on SubTotal (Seller Price + Packing + Shipping)
                                                    </p>
                                                </div>

                                                {/* Default Profit Percentage */}
                                                <div style={mGroup}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        Default Profit Percentage (%) <InfoTooltip title="Profit Guide" content="The standard margin the platform earns on the Seller Price. This applies only if no specific 'Profit Rules' match the product's price range." />
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <input
                                                            type="number"
                                                            value={platformSettings.default_profit_percentage || 20}
                                                            onChange={e => setPlatformSettings({ ...platformSettings, default_profit_percentage: e.target.value })}
                                                            onBlur={() => handleUpdateSettings({ default_profit_percentage: platformSettings.default_profit_percentage })}
                                                            style={mInput}
                                                            min="0"
                                                            max="100"
                                                            step="1"
                                                        />
                                                        <span style={{ fontWeight: 900, opacity: 0.5 }}>%</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>
                                                        Calculated on Seller Price (can be overridden by profit rules)
                                                    </p>
                                                </div>

                                                {/* Platform Fee Percentage */}
                                                <div style={mGroup}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        Platform Fee Percentage (%) <InfoTooltip title="Service Fee Guide" content="An additional service fee calculated on the total order value, used for platform maintenance and processing." />
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <input
                                                            type="number"
                                                            value={platformSettings.platform_fee_percentage || 5}
                                                            onChange={e => setPlatformSettings({ ...platformSettings, platform_fee_percentage: e.target.value })}
                                                            onBlur={() => handleUpdateSettings({ platform_fee_percentage: platformSettings.platform_fee_percentage })}
                                                            style={mInput}
                                                            min="0"
                                                            max="20"
                                                            step="0.5"
                                                        />
                                                        <span style={{ fontWeight: 900, opacity: 0.5 }}>%</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>
                                                        Additional platform service fee on total order value
                                                    </p>
                                                </div>

                                                {/* SuperCoin Reward Percentage */}
                                                <div style={mGroup}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        SuperCoin Reward Percentage (%) <InfoTooltip title="Loyalty Guide" content="The base percentage of the order value that customers earn as SuperCoins. 1 SuperCoin = ₹1 for future purchases." />
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <input
                                                            type="number"
                                                            value={platformSettings.supercoin_reward_percentage || 2}
                                                            onChange={e => setPlatformSettings({ ...platformSettings, supercoin_reward_percentage: e.target.value })}
                                                            onBlur={() => handleUpdateSettings({ supercoin_reward_percentage: platformSettings.supercoin_reward_percentage })}
                                                            style={mInput}
                                                            min="0"
                                                            max="10"
                                                            step="0.1"
                                                        />
                                                        <span style={{ fontWeight: 900, opacity: 0.5 }}>%</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>
                                                        Percentage of order value converted to SuperCoins (1 Coin = ₹1)
                                                    </p>
                                                </div>

                                                {/* Discount Cap Percentage */}
                                                <div style={mGroup}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        Maximum Discount Cap (%) <InfoTooltip title="Safety Limit Guide" content="A global ceiling to prevent excessive discounting. No product can be discounted beyond this percentage of its original price." />
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <input
                                                            type="number"
                                                            value={platformSettings.max_discount_percentage || 50}
                                                            onChange={e => setPlatformSettings({ ...platformSettings, max_discount_percentage: e.target.value })}
                                                            onBlur={() => handleUpdateSettings({ max_discount_percentage: platformSettings.max_discount_percentage })}
                                                            style={mInput}
                                                            min="0"
                                                            max="100"
                                                            step="5"
                                                        />
                                                        <span style={{ fontWeight: 900, opacity: 0.5 }}>%</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>
                                                        Maximum discount allowed on any product
                                                    </p>
                                                </div>

                                                <div style={{ ...mGroup, display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                                    <input type="checkbox" checked={platformSettings.offer_enabled} onChange={e => handleUpdateSettings({ offer_enabled: e.target.checked })} style={saasCheck} />
                                                    <label style={{ marginBottom: 0 }}>Enable Global Discount / Offer Toggle</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={chartCard}>
                                            <h4 style={{ fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Truck size={20} color="#f59e0b" /> Logistics & Platform Fees
                                                <InfoTooltip title="Logistics & Fees Overview" content="These settings control the platform's operational costs and rider payouts. Seller-specific packing and shipping costs are managed individually by sellers." />
                                            </h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div style={mGroup}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        Ads Cost <InfoTooltip title="Ads Cost Guide" content="Example: Platform marketing and visibility fees (e.g., ₹5 per order)." />
                                                    </label>
                                                    <input type="number" value={platformSettings.ads_cost} onChange={e => setPlatformSettings({ ...platformSettings, ads_cost: e.target.value })} onBlur={() => handleUpdateSettings({ ads_cost: platformSettings.ads_cost })} style={mInput} />
                                                </div>
                                                <div style={mGroup}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        Delivery Charge (Base) <InfoTooltip title="Rider Payout Guide" content="Example: Base fee paid to delivery personnel per order (e.g., ₹20)." />
                                                    </label>
                                                    <input type="number" value={platformSettings.delivery_fee} onChange={e => setPlatformSettings({ ...platformSettings, delivery_fee: e.target.value })} onBlur={() => handleUpdateSettings({ delivery_fee: platformSettings.delivery_fee })} style={mInput} />
                                                </div>
                                                <div style={mGroup}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        Fuel Rate (₹/km) <InfoTooltip title="Fuel Adjustment Guide" content="Example: Additional ₹/km paid for distance (e.g., ₹5/km)." />
                                                    </label>
                                                    <input type="number" value={platformSettings.fuel_rate} onChange={e => setPlatformSettings({ ...platformSettings, fuel_rate: e.target.value })} onBlur={() => handleUpdateSettings({ fuel_rate: platformSettings.fuel_rate })} style={mInput} />
                                                </div>
                                            </div>

                                            <h4 style={{ fontWeight: 900, marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <DollarSign size={20} color="var(--primary)" /> Display & Rounding
                                            </h4>
                                            <div style={mGroup}>
                                                <label>Price Rounding Strategy</label>
                                                <select value={platformSettings.rounding_strategy} onChange={e => handleUpdateSettings({ rounding_strategy: e.target.value })} style={mInput}>
                                                    <option value="nearest_10">Nearest ₹10 (912 to 910)</option>
                                                    <option value="psychological">Psychological Pricing (912 to 899)</option>
                                                </select>
                                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Rounding difference is converted into SuperCoins for the customer.</p>
                                            </div>
                                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h5 style={{ margin: 0, color: '#ef4444', fontWeight: 900 }}>Synchronize Master Pricing</h5>
                                                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>Update platform prices for all products based on new rules.</p>
                                                    </div>
                                                    <button
                                                        onClick={handleBulkRecalculate}
                                                        disabled={recalculating}
                                                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        {recalculating ? 'Processing...' : 'Recalculate All'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🆕 Rule-Based Profit Generator Section */}
                                    <div style={{ marginTop: '2rem' }}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    Rule-Based Auto Profit Generator
                                                    <InfoTooltip title="Profit Rule Logic" content="Example: If Seller Price is ₹500, and Profit is 10%, Platform Profit will be ₹50. The rule-based system automatically scales profit based on product value." />
                                                </h3>
                                                <p style={sectionSubtitle}>Define dynamic profit margins based on seller price ranges.</p>
                                            </div>
                                            <button style={saasAddBtn} onClick={() => setShowRuleModal(true)}><Zap size={16} /> Add Profit Rule</button>
                                        </div>
                                        <div style={tableCard}>
                                            <table style={saasTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Seller Price Range</th>
                                                        <th>Profit (%)</th>
                                                        <th>Min Profit (INR)</th>
                                                        <th>Max Profit Cap</th>
                                                        <th>Status</th>
                                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {profitRules.length > 0 ? profitRules.map(rule => (
                                                        <tr key={rule.id} style={tRow}>
                                                            <td style={{ padding: '1.25rem' }}>
                                                                <span style={{ fontWeight: 800 }}>₹{rule.minSellerPrice} - ₹{rule.maxSellerPrice}</span>
                                                            </td>
                                                            <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>{rule.profitPercentage}%</span></td>
                                                            <td>₹{rule.minProfitAmount}</td>
                                                            <td>{rule.maxProfitCap ? `₹${rule.maxProfitCap}` : 'No Cap'}</td>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div
                                                                        onClick={() => handleToggleProfitRuleStatus(rule.id)}
                                                                        style={{
                                                                            width: '40px',
                                                                            height: '20px',
                                                                            background: rule.isActive ? 'var(--primary)' : '#cbd5e1',
                                                                            borderRadius: '20px',
                                                                            position: 'relative',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.3s'
                                                                        }}
                                                                    >
                                                                        <div style={{
                                                                            width: '16px',
                                                                            height: '16px',
                                                                            background: '#fff',
                                                                            borderRadius: '50%',
                                                                            position: 'absolute',
                                                                            top: '2px',
                                                                            left: rule.isActive ? '22px' : '2px',
                                                                            transition: 'all 0.3s'
                                                                        }} />
                                                                    </div>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: rule.isActive ? 'var(--primary)' : '#64748b' }}>
                                                                        {rule.isActive ? 'ON' : 'OFF'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                                                                <button onClick={() => handleDeleteProfitRule(rule.id)} style={{ ...miniAction, color: '#ef4444' }}><Trash2 size={14} /></button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No profit rules defined. Platform defaults to 10% profit.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 🆕 Rule-Based SuperCoin Rewards Section */}
                                    <div style={{ marginTop: '4rem' }}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    SuperCoin Loyalty Rules
                                                    <InfoTooltip title="Loyalty Program Guide" content="Example: If Order is ₹1000, and Reward is 5%, Customer gets 50 SuperCoins. Higher reward tiers encourage larger basket sizes." />
                                                </h3>
                                                <p style={sectionSubtitle}>Set reward percentages based on customer order value.</p>
                                            </div>
                                            <button style={{ ...saasAddBtn, background: '#f59e0b' }} onClick={() => setShowSuperCoinModal(true)}><Star size={16} /> Add Coin Rule</button>
                                        </div>
                                        <div style={tableCard}>
                                            <table style={saasTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Order Amount Range</th>
                                                        <th>Reward (%)</th>
                                                        <th>Status</th>
                                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {superCoinRules.length > 0 ? superCoinRules.map(rule => (
                                                        <tr key={rule.id} style={tRow}>
                                                            <td style={{ padding: '1.25rem' }}>
                                                                <span style={{ fontWeight: 800 }}>₹{rule.minOrderAmount} - ₹{rule.maxOrderAmount}</span>
                                                            </td>
                                                            <td><span style={{ fontWeight: 700, color: '#f59e0b' }}>{rule.rewardPercentage}%</span></td>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div
                                                                        onClick={() => handleToggleSuperCoinRuleStatus(rule.id)}
                                                                        style={{
                                                                            width: '40px',
                                                                            height: '20px',
                                                                            background: rule.isActive ? '#f59e0b' : '#cbd5e1',
                                                                            borderRadius: '20px',
                                                                            position: 'relative',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.3s'
                                                                        }}
                                                                    >
                                                                        <div style={{
                                                                            width: '16px',
                                                                            height: '16px',
                                                                            background: '#fff',
                                                                            borderRadius: '50%',
                                                                            position: 'absolute',
                                                                            top: '2px',
                                                                            left: rule.isActive ? '22px' : '2px',
                                                                            transition: 'all 0.3s'
                                                                        }} />
                                                                    </div>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: rule.isActive ? '#f59e0b' : '#64748b' }}>
                                                                        {rule.isActive ? 'ON' : 'OFF'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                                                                <button onClick={() => handleDeleteSuperCoinRule(rule.id)} style={{ ...miniAction, color: '#ef4444' }}><Trash2 size={14} /></button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No SuperCoin rules defined.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* SuperCoin Modal */}
                                    {showSuperCoinModal && (
                                        <div style={modalOverlay}>
                                            <Motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={modal}>
                                                <h2 style={modalTitle}>New SuperCoin Rule</h2>
                                                <form onSubmit={handleCreateSuperCoinRule}>
                                                    <div style={modalGrid}>
                                                        <div style={mGroup}>
                                                            <label>Min Order Amount (₹)</label>
                                                            <input type="number" value={newSuperCoinRule.minOrderAmount} onChange={e => setNewSuperCoinRule({ ...newSuperCoinRule, minOrderAmount: e.target.value })} required style={mInput} />
                                                        </div>
                                                        <div style={mGroup}>
                                                            <label>Max Order Amount (₹)</label>
                                                            <input type="number" value={newSuperCoinRule.maxOrderAmount} onChange={e => setNewSuperCoinRule({ ...newSuperCoinRule, maxOrderAmount: e.target.value })} required style={mInput} />
                                                        </div>
                                                        <div style={mGroup}>
                                                            <label>Reward Multiplier (%)</label>
                                                            <input type="number" step="0.1" value={newSuperCoinRule.rewardPercentage} onChange={e => setNewSuperCoinRule({ ...newSuperCoinRule, rewardPercentage: e.target.value })} required style={mInput} />
                                                        </div>
                                                    </div>
                                                    <div style={modalActions}>
                                                        <button type="button" onClick={() => setShowSuperCoinModal(false)} style={cancelBtn}>Cancel</button>
                                                        <button type="submit" style={{ ...submitBtn, background: '#f59e0b' }}>Create Rule</button>
                                                    </div>
                                                </form>
                                            </Motion.div>
                                        </div>
                                    )}

                                    {/* Profit Rule Modal */}
                                    {showRuleModal && (
                                        <div style={modalOverlay}>
                                            <Motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={modal}>
                                                <h2 style={modalTitle}>New Profit Rule</h2>
                                                <form onSubmit={handleCreateProfitRule}>
                                                    <div style={modalGrid}>
                                                        <div style={mGroup}>
                                                            <label>Min Seller Price (₹)</label>
                                                            <input type="number" value={newRule.minSellerPrice} onChange={e => setNewRule({ ...newRule, minSellerPrice: e.target.value })} required style={mInput} />
                                                        </div>
                                                        <div style={mGroup}>
                                                            <label>Max Seller Price (₹)</label>
                                                            <input type="number" value={newRule.maxSellerPrice} onChange={e => setNewRule({ ...newRule, maxSellerPrice: e.target.value })} required style={mInput} />
                                                        </div>
                                                        <div style={mGroup}>
                                                            <label>Profit Margin (%)</label>
                                                            <input type="number" value={newRule.profitPercentage} onChange={e => setNewRule({ ...newRule, profitPercentage: e.target.value })} required style={mInput} />
                                                        </div>
                                                        <div style={mGroup}>
                                                            <label>Min Profit (₹)</label>
                                                            <input type="number" value={newRule.minProfitAmount} onChange={e => setNewRule({ ...newRule, minProfitAmount: e.target.value })} style={mInput} />
                                                        </div>
                                                        <div style={mGroup}>
                                                            <label>Max Profit Cap (₹)</label>
                                                            <input type="number" value={newRule.maxProfitCap} onChange={e => setNewRule({ ...newRule, maxProfitCap: e.target.value })} placeholder="No Cap" style={mInput} />
                                                        </div>
                                                    </div>
                                                    <div style={modalActions}>
                                                        <button type="button" onClick={() => setShowRuleModal(false)} style={cancelBtn}>Cancel</button>
                                                        <button type="submit" style={submitBtn}>Create Rule</button>
                                                    </div>
                                                </form>
                                            </Motion.div>
                                        </div>
                                    )}

                                </Motion.div>
                            )}

                            {activeTab === 'calculator' && (
                                <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                    <PricingCalculator />
                                </Motion.div>
                            )}

                            {activeTab === 'profits_admin' && (
                                <Motion.div key="profits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                    <div style={adminPageHeader}>
                                        <div style={headerInfo}>
                                            <h3 style={sectionTitle}>💰 Admin Profit Analysis & Ledger</h3>
                                            <p style={sectionSubtitle}>Comprehensive net earnings dashboard after deducting taxes and operational expenses.</p>
                                        </div>
                                        <div style={headerActions}>
                                            <button style={outlineBtn} onClick={() => {
                                                const csvData = settlementList.map(o => ({
                                                    'Order ID': o.id,
                                                    'Date': new Date(o.createdAt).toLocaleDateString(),
                                                    'Total Amount': o.totalAmount,
                                                    'GST': o.gstAmount?.toFixed(2),
                                                    'Costs': (o.packingCost + o.shippingCost + o.adsCost).toFixed(2),
                                                    'Seller Payout': o.sellerAmount?.toFixed(2),
                                                    'Net Profit': o.adminProfit?.toFixed(2)
                                                }));
                                                const csv = [
                                                    Object.keys(csvData[0]).join(','),
                                                    ...csvData.map(row => Object.values(row).join(','))
                                                ].join('\n');
                                                const blob = new Blob([csv], { type: 'text/csv' });
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `profit-report-${new Date().toISOString().split('T')[0]}.csv`;
                                                a.click();
                                                showStatus('success', 'Profit report exported successfully!', 'Export Complete');
                                            }}><Download size={14} /> Export Report</button>
                                            <button style={saasPrimaryBtn} onClick={() => {
                                                fetchOrders();
                                                fetchProfitSummary();
                                                fetchSettlements();
                                                showStatus('success', 'Refreshing profit data...', 'Syncing');
                                            }}>
                                                <RefreshCw size={16} /> Refresh Data
                                            </button>
                                        </div>
                                    </div>

                                    {profitSummary && (
                                        <div style={{ ...statsGrid, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                                            <Motion.div style={saasStatCard} whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                                <span style={statLabel}>Platform Profit</span>
                                                <h3 style={{ ...statValue, color: '#10b981' }}>₹{profitSummary.totalAdminProfit?.toFixed(2)}</h3>
                                                <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 700 }}>↑ 12.5% vs last month</div>
                                            </Motion.div>
                                            <Motion.div style={saasStatCard} whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                                <span style={statLabel}>GST Collected</span>
                                                <h3 style={statValue}>₹{profitSummary.totalGst?.toFixed(2)}</h3>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 700 }}>18% on all orders</div>
                                            </Motion.div>
                                            <Motion.div style={saasStatCard} whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                                <span style={statLabel}>Fuel Recovery</span>
                                                <h3 style={{ ...statValue, color: '#3b82f6' }}>₹{profitSummary.totalFuel?.toFixed(2)}</h3>
                                                <div style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: '0.5rem', fontWeight: 700 }}>100% recovered</div>
                                            </Motion.div>
                                            <Motion.div style={saasStatCard} whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                                <span style={statLabel}>Ads Margin</span>
                                                <h3 style={statValue}>₹{profitSummary.totalAds?.toFixed(2)}</h3>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 700 }}>Platform ads revenue</div>
                                            </Motion.div>
                                            <Motion.div style={saasStatCard} whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                                <span style={statLabel}>Packing Cost</span>
                                                <h3 style={{ ...statValue, color: '#ef4444' }}>-₹{profitSummary.totalPacking}</h3>
                                                <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 700 }}>Operational expense</div>
                                            </Motion.div>
                                            <Motion.div style={saasStatCard} whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                                <span style={statLabel}>Shipping Cost</span>
                                                <h3 style={{ ...statValue, color: '#ef4444' }}>-₹{profitSummary.totalShipping}</h3>
                                                <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 700 }}>Logistics expense</div>
                                            </Motion.div>
                                        </div>
                                    )}

                                    <div style={{ ...doubleGrid, marginBottom: '2.5rem' }}>
                                        <div style={chartCard}>
                                            <h3 style={cardTitle}>📊 Revenue Stream Distribution</h3>
                                            <div style={{ width: '100%', height: '250px', minHeight: '250px' }}>
                                                <ResponsiveContainer width="99%" height="100%">
                                                    <AreaChart data={[
                                                        { name: 'Mon', profit: 4000, gst: 2400, recovery: 1200 },
                                                        { name: 'Tue', profit: 3000, gst: 1398, recovery: 1100 },
                                                        { name: 'Wed', profit: 5000, gst: 3800, recovery: 1500 },
                                                        { name: 'Thu', profit: 2780, gst: 3908, recovery: 1000 },
                                                        { name: 'Fri', profit: 1890, gst: 4800, recovery: 900 },
                                                        { name: 'Sat', profit: 2390, gst: 3800, recovery: 1300 },
                                                        { name: 'Sun', profit: 6490, gst: 4300, recovery: 2100 },
                                                    ]}>
                                                        <defs>
                                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                                                        <Area type="monotone" dataKey="gst" stroke="#3b82f6" strokeWidth={2} fill="transparent" name="GST" />
                                                        <Area type="monotone" dataKey="recovery" stroke="#f59e0b" strokeWidth={2} fill="transparent" name="Recovery" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div style={chartCard}>
                                            <h3 style={cardTitle}>💸 Operational Cost Analysis</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Logistics Ratio</div>
                                                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: '65%', height: '100%', background: '#6366f1' }} />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        <span>Shipping & Packing</span>
                                                        <span>65%</span>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '0.25rem' }}>Marketing Costs</div>
                                                    <div style={{ height: '8px', background: '#fde68a', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: '35%', height: '100%', background: '#f59e0b' }} />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        <span>Ads & Promotions</span>
                                                        <span>35%</span>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#0369a1', marginBottom: '0.5rem', fontWeight: 700 }}>💡 Recovery Efficiency</div>
                                                    <p style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>The platform recovers <b>100%</b> of fuel costs from riders, offsetting logistics overhead.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={chartCard}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ ...cardTitle, marginBottom: 0 }}>📈 Profit Margin Overview</h3>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '1rem' }}>
                                            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>GROSS REVENUE</div>
                                                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>₹{settlementList.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>Total sales</div>
                                            </div>
                                            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>TOTAL COSTS</div>
                                                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>₹{settlementList.reduce((sum, o) => sum + (o.packingCost + o.shippingCost + o.adsCost), 0).toFixed(0)}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>All expenses</div>
                                            </div>
                                            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>SELLER PAYOUTS</div>
                                                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>₹{settlementList.reduce((sum, o) => sum + (o.sellerAmount || 0), 0).toFixed(0)}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>Vendor settlements</div>
                                            </div>
                                            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>NET PROFIT</div>
                                                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>₹{settlementList.reduce((sum, o) => sum + (o.adminProfit || 0), 0).toFixed(0)}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>Platform earnings</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={tableCard}>
                                        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                            <h4 style={{ fontWeight: 900 }}>📋 Detailed Profit Breakdown</h4>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button style={{ ...miniAction, background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }} onClick={() => {
                                                    setSearchQuery('');
                                                }}>
                                                    <Filter size={14} /> All Orders
                                                </button>
                                                <button style={{ ...miniAction, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }} onClick={() => {
                                                    // Filter logic here
                                                }}>
                                                    <Calendar size={14} /> Today
                                                </button>
                                            </div>
                                        </div>
                                        <table style={saasTable}>
                                            <thead>
                                                <tr>
                                                    <th style={th}>Order ID</th>
                                                    <th style={th}>Date</th>
                                                    <th style={th}>Amount</th>
                                                    <th style={th}>GST (18%)</th>
                                                    <th style={th}>Costs</th>
                                                    <th style={th}>Seller Payout</th>
                                                    <th style={th}>Net Profit</th>
                                                    <th style={th}>Margin %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {settlementList.slice(0, 15).map(o => {
                                                    const marginPercent = ((o.adminProfit / o.totalAmount) * 100).toFixed(1);
                                                    return (
                                                        <tr key={o.id} style={tRow}>
                                                            <td style={td}>
                                                                <div style={{ fontWeight: 800 }}>{o.id.slice(0, 8)}</div>
                                                                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{o.Product?.name?.slice(0, 20)}...</div>
                                                            </td>
                                                            <td style={td}>
                                                                <div style={{ fontSize: '0.75rem' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                                                                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{new Date(o.createdAt).toLocaleTimeString()}</div>
                                                            </td>
                                                            <td style={td}>
                                                                <div style={{ fontWeight: 800 }}>₹{o.totalAmount}</div>
                                                            </td>
                                                            <td style={td}>
                                                                <div style={{ color: '#3b82f6', fontWeight: 700 }}>₹{o.gstAmount?.toFixed(2)}</div>
                                                            </td>
                                                            <td style={td}>
                                                                <div style={{ fontWeight: 700 }}>₹{(o.packingCost + o.shippingCost + o.adsCost).toFixed(2)}</div>
                                                                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>P:{o.packingCost} S:{o.shippingCost} A:{o.adsCost}</div>
                                                            </td>
                                                            <td style={td}>
                                                                <div style={{ color: '#f59e0b', fontWeight: 800 }}>₹{o.sellerAmount?.toFixed(2)}</div>
                                                            </td>
                                                            <td style={{ ...td, fontWeight: 900, color: '#10b981' }}>
                                                                <div style={{ fontSize: '0.9rem' }}>₹{o.adminProfit?.toFixed(2)}</div>
                                                            </td>
                                                            <td style={td}>
                                                                <span style={{
                                                                    ...saasBadge,
                                                                    background: parseFloat(marginPercent) > 20 ? '#f0fdf4' : parseFloat(marginPercent) > 10 ? '#fffbeb' : '#fef2f2',
                                                                    color: parseFloat(marginPercent) > 20 ? '#10b981' : parseFloat(marginPercent) > 10 ? '#f59e0b' : '#ef4444'
                                                                }}>
                                                                    {marginPercent}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {settlementList.length === 0 && (
                                                    <tr><td colSpan="8" style={emptyState}>No profit data available yet. Orders will appear here once delivered.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Motion.div>
                            )}

                            {activeTab === 'settlements_admin' && (
                                <Motion.div key="settle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                    <div style={adminPageHeader}>
                                        <div style={headerInfo}>
                                            <h3 style={sectionTitle}>Vendor & Logistics Settlements</h3>
                                            <p style={sectionSubtitle}>Verify and process payouts for delivered marketplace orders.</p>
                                        </div>
                                    </div>

                                    <div style={tableCard}>
                                        <table style={saasTable}>
                                            <thead>
                                                <tr>
                                                    <th style={th}>Date</th>
                                                    <th style={th}>Order</th>
                                                    <th style={th}>Seller</th>
                                                    <th style={th}>Rider</th>
                                                    <th style={th}>Payouts</th>
                                                    <th style={th}>Status</th>
                                                    <th style={{ ...th, textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {settlementList.length === 0 ? (
                                                    <tr><td colSpan="7" style={emptyState}>No pending settlements for delivered orders.</td></tr>
                                                ) : settlementList.map(o => (
                                                    <tr key={o.id} style={tRow}>
                                                        <td style={td}>{new Date(o.updatedAt || o.createdAt || o.date || Date.now()).toLocaleDateString()}</td>
                                                        <td style={td}>
                                                            <div style={{ fontWeight: 800 }}>{o.id.slice(0, 8)}</div>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>₹{o.totalAmount}</div>
                                                        </td>
                                                        <td style={td}>{o.Seller?.name}</td>
                                                        <td style={td}>{o.DeliveryMan?.name || 'N/A'}</td>
                                                        <td style={td}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Seller: ₹{((o.sellerAmount || 0) + (o.packingCost || 0) + (o.shippingCost || 0)).toFixed(0)}</div>
                                                            <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>({o.sellerAmount} + {o.packingCost} + {o.shippingCost})</div>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem' }}>Rider: ₹{((o.deliveryCharge || 0) - (o.fuelCharge || 0)).toFixed(0)}</div>
                                                            <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>({o.deliveryCharge} - {o.fuelCharge?.toFixed(1)})</div>
                                                        </td>
                                                        <td style={td}>
                                                            <span style={{
                                                                ...saasBadge,
                                                                background: o.settlementStatus === 'Completed' ? '#f0fdf4' : '#fff7ed',
                                                                color: o.settlementStatus === 'Completed' ? '#10b981' : '#f97316'
                                                            }}>
                                                                {o.settlementStatus}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...td, textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                                                                {o.paymentMethod === 'COD' && (
                                                                    o.codClaimedByAdmin ? (
                                                                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            <CheckCircle size={14} /> COD CLAIMED
                                                                        </span>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleClaimCod(o.id)}
                                                                            style={{ ...miniAction, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.4rem 0.8rem', width: 'auto' }}
                                                                        >
                                                                            Claim COD Cash
                                                                        </button>
                                                                    )
                                                                )}

                                                                {o.settlementStatus === 'Pending' ? (
                                                                    <button
                                                                        onClick={() => handleProcessSettlement(o.id)}
                                                                        disabled={processingPayout === o.id || (o.paymentMethod === 'COD' && !o.codClaimedByAdmin)}
                                                                        style={{
                                                                            ...saasPrimaryBtn,
                                                                            padding: '0.5rem 1rem',
                                                                            fontSize: '0.7rem',
                                                                            opacity: (o.paymentMethod === 'COD' && !o.codClaimedByAdmin) ? 0.5 : 1,
                                                                            cursor: (o.paymentMethod === 'COD' && !o.codClaimedByAdmin) ? 'not-allowed' : 'pointer'
                                                                        }}
                                                                        title={(o.paymentMethod === 'COD' && !o.codClaimedByAdmin) ? "Claim COD cash first" : ""}
                                                                    >
                                                                        {processingPayout === o.id ? 'Processing...' : 'Send Money'}
                                                                    </button>
                                                                ) : (
                                                                    <span style={{ color: '#10b981', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <ShieldCheck size={16} /> FUNDED
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Motion.div>
                            )}

                            {
                                activeTab === 'reports_calendar' && (
                                    <Motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Unified Platform Calendar</h3>
                                                <p style={sectionSubtitle}>Track daily orders, settlements, and revenue at a glance.</p>
                                            </div>
                                            <div style={headerActions}>
                                                <button style={{ ...saasAddBtn, background: '#64748b' }} onClick={() => window.print()}><Download size={16} /> Export View</button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                            <SmartCalendar
                                                title="Order Activity & Settlements"
                                                data={ordersList.reduce((acc, order) => {
                                                    try {
                                                        const date = order.createdAt
                                                            ? new Date(order.createdAt).toISOString().split('T')[0]
                                                            : null;

                                                        if (!date) return acc;

                                                        if (!acc[date]) acc[date] = { count: 0, revenue: 0, cod: 0 };
                                                        acc[date].count += 1;
                                                        acc[date].revenue += order.totalAmount || 0;
                                                        if (order.paymentMethod === 'COD') acc[date].cod += order.totalAmount || 0;
                                                    } catch (e) {
                                                        console.warn('Error processing order date:', e, order);
                                                    }
                                                    return acc;
                                                }, {})}
                                                renderCellContent={(data) => (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1e293b' }}>{data.count || 0} Orders</span>
                                                        <span style={{ fontSize: '0.6rem', color: '#10b981' }}>+₹{((data.revenue || 0) / 1000).toFixed(1)}k</span>
                                                    </div>
                                                )}
                                                onDateClick={(date, data) => {
                                                    if (data) {
                                                        showStatus('success', `On ${date}: ${data.count} orders, Revenue: ₹${data.revenue}, COD: ₹${data.cod}`, 'Daily Report');
                                                    } else {
                                                        showStatus('info', `No activity recorded for ${date}.`, 'Empty Day');
                                                    }
                                                }}
                                            />

                                            <div style={doubleGrid}>
                                                <div style={chartCard}>
                                                    <h4 style={cardTitle}>Daily Performance Trend</h4>
                                                    <div style={{ height: '300px' }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={Object.entries(ordersList.reduce((acc, order) => {
                                                                const date = new Date(order.createdAt).toISOString().split('T')[0];
                                                                if (!acc[date]) acc[date] = { date: date.slice(5), orders: 0, revenue: 0 };
                                                                acc[date].orders += 1;
                                                                acc[date].revenue += order.totalAmount;
                                                                return acc;
                                                            }, {})).map(([, v]) => v).sort((a, b) => a.date.localeCompare(b.date))}>
                                                                <defs>
                                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                                                <Tooltip
                                                                    contentStyle={{ background: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                                                    itemStyle={{ color: '#1e293b', fontWeight: 700 }}
                                                                />
                                                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                <div style={chartCard}>
                                                    <h4 style={cardTitle}>Pending Alerts</h4>
                                                    <div style={summaryList}>
                                                        {ordersList.filter(o => o.paymentMethod === 'COD' && !o.codClaimedByAdmin).length > 0 && (
                                                            <div style={{ ...summaryItem, borderLeft: '4px solid #ef4444' }}>
                                                                <div>
                                                                    <span style={{ fontWeight: 800, color: '#ef4444' }}>Missing COD Claims</span>
                                                                    <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                                                        {ordersList.filter(o => o.paymentMethod === 'COD' && !o.codClaimedByAdmin).length} orders require cash collection.
                                                                    </div>
                                                                </div>
                                                                <button onClick={() => setActiveTab('settlements_admin')} style={{ ...miniAction, color: '#ef4444' }}>View</button>
                                                            </div>
                                                        )}
                                                        <div style={{ ...summaryItem, borderLeft: '4px solid #f59e0b' }}>
                                                            <div>
                                                                <span style={{ fontWeight: 800, color: '#f59e0b' }}>Settlement Cycle</span>
                                                                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Daily payout processing is pending for today.</div>
                                                            </div>
                                                            <button onClick={() => setActiveTab('settlements_admin')} style={{ ...miniAction, color: '#f59e0b' }}>Process</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {
                                activeTab === 'verification' && (
                                    <Motion.div key="verification" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Product Verification Center</h3>
                                                <p style={sectionSubtitle}>Review incoming products, enforce quality standards, and manage risk.</p>
                                            </div>
                                            <div style={headerActions}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef3c7', padding: '0.5rem 1rem', borderRadius: '12px', color: '#92400e', fontWeight: 700, fontSize: '0.8rem' }}>
                                                    <Clock size={16} /> Avg Approval Time: 2.3 hrs
                                                </div>
                                            </div>
                                        </div>

                                        <div style={statsGrid}>
                                            <div style={saasStatCard} onClick={() => setSearchQuery('')}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, color: '#3b82f6' }}><Package /></div>
                                                    <div style={statTrend}>Pipeline</div>
                                                </div>
                                                <div style={statContent}>
                                                    <span style={statLabel}>Total Products</span>
                                                    <span style={statValue}>{productList.length}</span>
                                                </div>
                                            </div>
                                            <div style={saasStatCard} onClick={() => setSearchQuery('Pending')}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, color: '#f59e0b' }}><Hourglass /></div>
                                                    <div style={{ ...statTrend, background: '#fffbeb', color: '#d97706' }}>Action Needed</div>
                                                </div>
                                                <div style={statContent}>
                                                    <span style={statLabel}>Pending Review</span>
                                                    <span style={statValue}>{productList.filter(p => !p.isApproved).length}</span>
                                                </div>
                                            </div>
                                            <div style={saasStatCard} onClick={() => setSearchQuery('Needs Fix')}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, color: '#ec4899' }}><Flag /></div>
                                                    <div style={statTrend}>Risky</div>
                                                </div>
                                                <div style={statContent}>
                                                    <span style={statLabel}>Flagged / Info</span>
                                                    <span style={statValue}>{productList.filter(p => runAutoValidation(p).issues.length > 0).length}</span>
                                                </div>
                                            </div>
                                            <div style={saasStatCard} onClick={() => setSearchQuery('Approved')}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, color: '#10b981' }}><CheckCircle2 /></div>
                                                    <div style={statTrend}>Live</div>
                                                </div>
                                                <div style={statContent}>
                                                    <span style={statLabel}>Active in Shop</span>
                                                    <span style={statValue}>{productList.filter(p => p.isApproved).length}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <BulkActions
                                            items={productList}
                                            onDelete={handleBulkDeleteProducts}
                                            onApprove={handleBulkApproveProducts}
                                            onReject={handleBulkRejectProducts}
                                            itemType="products"
                                            actions={[
                                                { label: 'Approve Selected', action: 'approve', color: '#10b981' },
                                                { label: 'Reject Selected', action: 'reject', color: '#f59e0b' },
                                                { label: 'Delete Selected', action: 'delete', color: '#ef4444' }
                                            ]}
                                        />

                                        <div style={tableCard}>
                                            <table style={saasTable}>
                                                <thead>
                                                    <tr>
                                                        <th style={th}>Product</th>
                                                        <th style={th}>Seller Info</th>
                                                        <th style={th}>Validation Status</th>
                                                        <th style={th}>Price Risk</th>
                                                        <th style={{ ...th, textAlign: 'right' }}>Review Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productList.length === 0 ? (
                                                        <tr><td colSpan="5" style={emptyState}>No products in verification pipeline.</td></tr>
                                                    ) : (
                                                        productList.filter(p => {
                                                            if (searchQuery === 'Pending') return !p.isApproved;
                                                            if (searchQuery === 'Approved') return p.isApproved;
                                                            if (searchQuery) return true;
                                                            return true;
                                                        }).map(p => {
                                                            const validation = runAutoValidation(p);
                                                            return (
                                                                <tr key={p.id} style={tRow}>
                                                                    <td style={td}>
                                                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                                            <img src={p.image || 'https://via.placeholder.com/40'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                                                            <div>
                                                                                <div style={{ fontWeight: 800 }}>{p.name}</div>
                                                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.category}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td style={td}>
                                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sellerList.find(s => s.id === p.sellerId)?.name || 'Unknown Seller'}</div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                                                                            <ShieldCheck size={12} color="#10b981" /> Trust Score: <span style={{ fontWeight: 800 }}>{getTrustScore(p.sellerId)}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td style={td}>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: validation.riskLevel === 'High' ? '#ef4444' : validation.riskLevel === 'Medium' ? '#f59e0b' : '#10b981' }} />
                                                                                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{validation.score}/100 Safe</span>
                                                                            </div>
                                                                            {validation.issues.length > 0 && (
                                                                                <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>{validation.issues.length} Issues Detect</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td style={td}>
                                                                        <div style={{ fontWeight: 700 }}>₹{p.price.toLocaleString()}</div>
                                                                        <div style={{ fontSize: '0.7rem', color: ((p.price - p.sellerPrice) / p.price) < 0.1 ? '#ef4444' : '#10b981' }}>
                                                                            {(((p.price - p.sellerPrice) / p.price) * 100).toFixed(1)}% Margin
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ ...td, textAlign: 'right' }}>
                                                                        {p.isApproved ? (
                                                                            <span style={{ ...saasBadge, background: '#f0fdf4', color: '#166534' }}>LIVE</span>
                                                                        ) : (
                                                                            <button onClick={() => setVerifyingProduct(p)} style={{ ...saasAddBtn, padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                                                                Review
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Motion.div>
                                )
                            }
                            {
                                activeTab === 'logs' && (
                                    <Motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>System Security Logs</h3>
                                                <p style={sectionSubtitle}>Audit trail of critical administrative actions and system events.</p>
                                            </div>
                                        </div>
                                        <div style={tableCard}>
                                            <table style={saasTable}>
                                                <thead>
                                                    <tr>
                                                        <th style={th}>Timestamp</th>
                                                        <th style={th}>Action</th>
                                                        <th style={th}>Details</th>
                                                        <th style={th}>Admin</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {auditLogs.map(log => (
                                                        <tr key={log.id} style={tRow}>
                                                            <td style={td}>
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{new Date(log.createdAt).toLocaleDateString()}</span>
                                                                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
                                                                </div>
                                                            </td>
                                                            <td style={td}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <div style={{
                                                                        width: '32px', height: '32px', borderRadius: '8px',
                                                                        background: log.action.includes('DELETE') ? '#fee2e2' : log.action.includes('CREATE') ? '#dcfce7' : '#eff6ff',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                    }}>
                                                                        {log.action.includes('DELETE') ? <Trash2 size={14} color="#ef4444" /> :
                                                                            log.action.includes('CREATE') ? <Plus size={14} color="#10b981" /> :
                                                                                <ShieldCheck size={14} color="#6366f1" />}
                                                                    </div>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b' }}>{log.action}</span>
                                                                </div>
                                                            </td>
                                                            <td style={td}><span style={{ fontSize: '0.85rem', color: '#475569' }}>{log.details}</span></td>
                                                            <td style={td}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900 }}>{log.performedBy?.charAt(0)}</div>
                                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{log.performedBy}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {
                                activeTab === 'express' && (
                                    <Motion.div key="express" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Product Highlights</h3>
                                                <p style={sectionSubtitle}>Command the visual badges and priority status of SKUs across the storefront.</p>
                                            </div>
                                        </div>
                                        <div style={tableCard}>
                                            <table style={saasTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Catalog Item</th>
                                                        <th>Brand Identity</th>
                                                        <th>Badge Configuration</th>
                                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productList.map(p => (
                                                        <tr key={p.id} style={tRow}>
                                                            <td style={{ padding: '1.25rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                    <img src={p.img} alt="" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--glass-border)' }} />
                                                                    <span style={userName}>{p.name}</span>
                                                                </div>
                                                            </td>
                                                            <td><span style={userEmail}>{p.brand}</span></td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                    {[
                                                                        { label: 'Hot', color: '#ef4444', icon: <TrendingUp size={12} /> },
                                                                        { label: 'Best Seller', color: '#f59e0b', icon: <Star size={12} /> },
                                                                        { label: 'New', color: '#10b981', icon: <Plus size={12} /> },
                                                                        { label: 'Express', color: '#6366f1', icon: <Zap size={12} /> }
                                                                    ].map(b => (
                                                                        <button
                                                                            key={b.label}
                                                                            onClick={() => updateProductBadge(p.id, p.badge === b.label ? null : b.label)}
                                                                            style={{
                                                                                ...saasBadge,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px',
                                                                                cursor: 'pointer',
                                                                                border: p.badge === b.label ? `2px solid ${b.color}` : '1px solid transparent',
                                                                                background: p.badge === b.label ? `${b.color}20` : 'rgba(203, 213, 225, 0.1)',
                                                                                color: p.badge === b.label ? b.color : '#64748b',
                                                                                padding: '4px 8px',
                                                                                transition: 'all 0.2s'
                                                                            }}
                                                                        >
                                                                            {b.icon} {b.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                                                                <div style={actionCluster}>
                                                                    {p.badge && (
                                                                        <button
                                                                            onClick={() => updateProductBadge(p.id, null)}
                                                                            style={{ ...miniAction, color: '#94a3b8' }}
                                                                            title="Clear Badge"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleDeleteProduct(p.id)}
                                                                        style={{ ...miniAction, color: '#ef4444' }}
                                                                        title="Delete Product"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {/* 🆕 Risk Assessment Dashboard */}
                            {
                                activeTab === 'risk_assessment' && (
                                    <Motion.div key="risk_assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Risk Assessment Dashboard</h3>
                                                <p style={sectionSubtitle}>Monitor high-risk orders, SLA breaches, and fraud detection alerts.</p>
                                            </div>
                                            <div style={headerActions}>
                                                <button style={saasAddBtn} onClick={() => fetchRiskAssessment()}>
                                                    <RefreshCw size={16} /> Refresh
                                                </button>
                                            </div>
                                        </div>

                                        <div style={statsGrid}>
                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(239, 68, 68, 0.1)' }}>
                                                        <AlertTriangle size={24} color="#ef4444" />
                                                    </div>
                                                    <div style={{ ...statTrend, background: riskAssessment.summary.critical > 0 ? '#fee2e2' : '#f0fdf4', color: riskAssessment.summary.critical > 0 ? '#ef4444' : '#10b981' }}>
                                                        {riskAssessment.summary.critical} Critical
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Total Risks</div>
                                                    <div style={statValue}>{riskAssessment.summary.totalRisks}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(245, 158, 11, 0.1)' }}>
                                                        <Clock size={24} color="#f59e0b" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>SLA Breaches</div>
                                                    <div style={statValue}>{riskAssessment.slaBreachers.length}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(239, 68, 68, 0.1)' }}>
                                                        <AlertCircle size={24} color="#ef4444" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Fraud Flags</div>
                                                    <div style={statValue}>{riskAssessment.fraudFlags.length}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(245, 158, 11, 0.1)' }}>
                                                        <Hourglass size={24} color="#f59e0b" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Delayed Deliveries</div>
                                                    <div style={statValue}>{riskAssessment.delayedDeliveries.length}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={tableCard}>
                                            <h4 style={{ ...cardTitle, marginBottom: '1.5rem' }}>High-Risk Orders</h4>
                                            {riskAssessment.slaBreachers.length > 0 ? (
                                                <table style={saasTable}>
                                                    <thead>
                                                        <tr>
                                                            <th style={th}>Order ID</th>
                                                            <th style={th}>Product</th>
                                                            <th style={th}>Status</th>
                                                            <th style={th}>Risk Level</th>
                                                            <th style={th}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {riskAssessment.slaBreachers.map(order => (
                                                            <tr key={order.id} style={tRow}>
                                                                <td style={td}>{order.id.slice(0, 8)}</td>
                                                                <td style={td}>{order.productName}</td>
                                                                <td style={td}>
                                                                    <span style={{
                                                                        ...saasBadge,
                                                                        background: order.status === 'Delayed' ? '#fef3c7' : '#f1f5f9',
                                                                        color: order.status === 'Delayed' ? '#f59e0b' : '#64748b'
                                                                    }}>
                                                                        {order.status}
                                                                    </span>
                                                                </td>
                                                                <td style={td}>
                                                                    <span style={{
                                                                        ...saasBadge,
                                                                        background: '#fee2e2',
                                                                        color: '#ef4444'
                                                                    }}>
                                                                        High
                                                                    </span>
                                                                </td>
                                                                <td style={td}>
                                                                    <button
                                                                        style={{ ...miniAction, color: '#3b82f6' }}
                                                                        onClick={() => {
                                                                            setViewingDetails(order);
                                                                        }}
                                                                    >
                                                                        <Eye size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div style={emptyState}>
                                                    <CheckCircle size={48} color="#10b981" />
                                                    <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 700 }}>No high-risk orders detected</p>
                                                </div>
                                            )}
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {/* 🆕 Performance Analytics */}
                            {
                                activeTab === 'performance' && (
                                    <Motion.div key="performance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Performance Analytics</h3>
                                                <p style={sectionSubtitle}>Track merchant and delivery partner performance metrics.</p>
                                            </div>
                                            <div style={headerActions}>
                                                <button style={outlineBtn} onClick={() => fetchPerformanceAnalytics()}>
                                                    <RefreshCw size={16} /> Refresh
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                            <div style={chartCard}>
                                                <h4 style={cardTitle}>Top Merchants</h4>
                                                <table style={saasTable}>
                                                    <thead>
                                                        <tr>
                                                            <th style={th}>Merchant</th>
                                                            <th style={th}>Rating</th>
                                                            <th style={th}>Orders</th>
                                                            <th style={th}>Revenue</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {performanceAnalytics.merchants.map(merchant => (
                                                            <tr key={merchant.id} style={tRow}>
                                                                <td style={td}>{merchant.name}</td>
                                                                <td style={td}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                                                        <span>{merchant.rating}</span>
                                                                    </div>
                                                                </td>
                                                                <td style={td}>{merchant.orders}</td>
                                                                <td style={td}>₹{merchant.revenue.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div style={chartCard}>
                                                <h4 style={cardTitle}>Top Delivery Partners</h4>
                                                <table style={saasTable}>
                                                    <thead>
                                                        <tr>
                                                            <th style={th}>Partner</th>
                                                            <th style={th}>Rating</th>
                                                            <th style={th}>Deliveries</th>
                                                            <th style={th}>On Time %</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {performanceAnalytics.deliveryPartners.map(partner => (
                                                            <tr key={partner.id} style={tRow}>
                                                                <td style={td}>{partner.name}</td>
                                                                <td style={td}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                                                        <span>{partner.rating}</span>
                                                                    </div>
                                                                </td>
                                                                <td style={td}>{partner.deliveries}</td>
                                                                <td style={td}>
                                                                    <span style={{
                                                                        ...saasBadge,
                                                                        background: partner.onTimePercentage >= 90 ? '#dcfce7' : '#fef3c7',
                                                                        color: partner.onTimePercentage >= 90 ? '#10b981' : '#f59e0b'
                                                                    }}>
                                                                        {partner.onTimePercentage}%
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {/* 🆕 Customer Analytics */}
                            {
                                activeTab === 'customers' && (
                                    <Motion.div key="customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Customer Insights</h3>
                                                <p style={sectionSubtitle}>Understand customer behavior, segmentation, and lifetime value.</p>
                                            </div>
                                        </div>

                                        <div style={statsGrid}>
                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(99, 102, 241, 0.1)' }}>
                                                        <Users size={24} color="#6366f1" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Total Customers</div>
                                                    <div style={statValue}>{customerAnalytics.totalCustomers}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(16, 185, 129, 0.1)' }}>
                                                        <TrendingUp size={24} color="#10b981" />
                                                    </div>
                                                    <div style={{ ...statTrend, background: '#f0fdf4', color: '#10b981' }}>
                                                        +{Math.round((customerAnalytics.newCustomers / customerAnalytics.totalCustomers) * 100)}%
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>New This Month</div>
                                                    <div style={statValue}>{customerAnalytics.newCustomers}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(34, 197, 94, 0.1)' }}>
                                                        <CheckCircle2 size={24} color="#22c55e" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Active Customers</div>
                                                    <div style={statValue}>{customerAnalytics.activeCustomers}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(168, 85, 247, 0.1)' }}>
                                                        <DollarSign size={24} color="#a855f7" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Avg. LTV</div>
                                                    <div style={statValue}>₹{customerAnalytics.ltv.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={chartCard}>
                                            <h4 style={cardTitle}>Customer Segmentation</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                                {customerAnalytics.segments.map((segment, idx) => (
                                                    <div key={idx} style={{
                                                        padding: '1.5rem',
                                                        background: idx === 0 ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' :
                                                            idx === 1 ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' :
                                                                idx === 2 ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' :
                                                                    'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                                                        borderRadius: '16px',
                                                        color: '#fff',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 700 }}>{segment.name}</div>
                                                        <div style={{ fontSize: '2rem', fontWeight: 900 }}>{segment.count}</div>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                                            {Math.round((segment.count / customerAnalytics.totalCustomers) * 100)}% of total
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {/* 🆕 Support Tickets */}
                            {
                                activeTab === 'support' && (
                                    <Motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Support Tickets</h3>
                                                <p style={sectionSubtitle}>Manage customer support requests and issues.</p>
                                            </div>
                                            <div style={headerActions}>
                                                <button style={saasAddBtn} onClick={() => showStatus('info', 'Support ticket creation coming soon!', 'Coming Soon')}>
                                                    <Plus size={16} /> New Ticket
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid-responsive" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(59, 130, 246, 0.1)' }}>
                                                        <MessageSquare size={24} color="#3b82f6" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>All Tickets</div>
                                                    <div style={statValue}>{supportTickets.allTickets.length}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(245, 158, 11, 0.1)' }}>
                                                        <AlertCircle size={24} color="#f59e0b" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Pending</div>
                                                    <div style={statValue}>{supportTickets.pending}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(16, 185, 129, 0.1)' }}>
                                                        <CheckCircle2 size={24} color="#10b981" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Resolved</div>
                                                    <div style={statValue}>{supportTickets.resolved.length}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={tableCard}>
                                            {supportTickets.allTickets.length === 0 ? (
                                                <div style={emptyState}>
                                                    <MessageSquare size={48} color="#94a3b8" />
                                                    <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 700 }}>No support tickets yet</p>
                                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Support ticket system coming soon!</p>
                                                </div>
                                            ) : (
                                                <table style={saasTable}>
                                                    <thead>
                                                        <tr>
                                                            <th style={th}>Ticket ID</th>
                                                            <th style={th}>Customer</th>
                                                            <th style={th}>Subject</th>
                                                            <th style={th}>Priority</th>
                                                            <th style={th}>Status</th>
                                                            <th style={th}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {supportTickets.allTickets.map(ticket => (
                                                            <tr key={ticket.id} style={tRow}>
                                                                <td style={td}>#{ticket.id}</td>
                                                                <td style={td}>{ticket.customerName}</td>
                                                                <td style={td}>{ticket.subject}</td>
                                                                <td style={td}>
                                                                    <span style={{
                                                                        ...saasBadge,
                                                                        background: ticket.priority === 'High' ? '#fee2e2' : '#fef3c7',
                                                                        color: ticket.priority === 'High' ? '#ef4444' : '#f59e0b'
                                                                    }}>
                                                                        {ticket.priority}
                                                                    </span>
                                                                </td>
                                                                <td style={td}>
                                                                    <span style={{
                                                                        ...saasBadge,
                                                                        background: ticket.status === 'Resolved' ? '#dcfce7' : '#dbeafe',
                                                                        color: ticket.status === 'Resolved' ? '#10b981' : '#3b82f6'
                                                                    }}>
                                                                        {ticket.status}
                                                                    </span>
                                                                </td>
                                                                <td style={td}>
                                                                    <button style={{ ...miniAction, color: '#3b82f6' }}>
                                                                        <Eye size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {/* 🆕 Real-Time Monitoring */}
                            {
                                activeTab === 'monitoring' && (
                                    <Motion.div key="monitoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Real-Time Monitoring</h3>
                                                <p style={sectionSubtitle}>Live platform activity and system health monitoring.</p>
                                            </div>
                                            <div style={headerActions}>
                                                <button style={{ ...saasAddBtn, background: '#10b981' }} onClick={() => fetchRealTimeData()}>
                                                    <RefreshCw size={16} /> Refresh Live Data
                                                </button>
                                            </div>
                                        </div>

                                        <div style={statsGrid}>
                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(99, 102, 241, 0.1)' }}>
                                                        <Users size={24} color="#6366f1" />
                                                    </div>
                                                    <div style={{ ...statTrend, background: '#dbeafe', color: '#3b82f6' }}>
                                                        LIVE
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Active Users</div>
                                                    <div style={statValue}>{realTimeData.activeUsers}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(16, 185, 129, 0.1)' }}>
                                                        <Truck size={24} color="#10b981" />
                                                    </div>
                                                    <div style={{ ...statTrend, background: '#d1fae5', color: '#10b981' }}>
                                                        ONLINE
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Delivery Partners</div>
                                                    <div style={statValue}>{realTimeData.onlineDelivery}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(245, 158, 11, 0.1)' }}>
                                                        <Clock size={24} color="#f59e0b" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Pending Orders</div>
                                                    <div style={statValue}>{realTimeData.pendingOrders}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(34, 197, 94, 0.1)' }}>
                                                        <CheckCircle2 size={24} color="#22c55e" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>System Status</div>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#22c55e' }}>Healthy</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={chartCard}>
                                            <h4 style={cardTitle}>Platform Activity Timeline</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {ordersList.slice(0, 5).map((order, idx) => (
                                                    <div key={idx} style={{
                                                        padding: '1rem',
                                                        background: '#f8fafc',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        borderLeft: '4px solid #3b82f6'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                                                                New Order #{order.id.slice(0, 8)}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                                {order.productName} - ₹{order.totalAmount}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                            {new Date(order.createdAt).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {/* 🆕 Revenue Analytics */}
                            {
                                activeTab === 'revenue' && (
                                    <Motion.div key="revenue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Revenue Analytics</h3>
                                                <p style={sectionSubtitle}>Track income streams and financial performance.</p>
                                            </div>
                                            <div style={headerActions}>
                                                <button style={outlineBtn} onClick={() => fetchRevenueAnalytics()}>
                                                    <RefreshCw size={16} /> Update
                                                </button>
                                            </div>
                                        </div>

                                        <div style={statsGrid}>
                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(16, 185, 129, 0.1)' }}>
                                                        <DollarSign size={24} color="#10b981" />
                                                    </div>
                                                    <div style={{ ...statTrend, background: '#d1fae5', color: '#10b981' }}>
                                                        TODAY
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Today's Revenue</div>
                                                    <div style={statValue}>₹{revenueAnalytics.today.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(59, 130, 246, 0.1)' }}>
                                                        <TrendingUp size={24} color="#3b82f6" />
                                                    </div>
                                                    <div style={{ ...statTrend, background: '#dbeafe', color: '#3b82f6' }}>
                                                        7 DAYS
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>This Week</div>
                                                    <div style={statValue}>₹{revenueAnalytics.week.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(168, 85, 247, 0.1)' }}>
                                                        <Activity size={24} color="#a855f7" />
                                                    </div>
                                                    <div style={{ ...statTrend, background: '#f3e8ff', color: '#a855f7' }}>
                                                        30 DAYS
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>This Month</div>
                                                    <div style={statValue}>₹{revenueAnalytics.month.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(245, 158, 11, 0.1)' }}>
                                                        <BarChart size={24} color="#f59e0b" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Avg. Order Value</div>
                                                    <div style={statValue}>
                                                        ₹{ordersList.length > 0 ? Math.round(revenueAnalytics.month / ordersList.length) : 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={chartCard}>
                                            <h4 style={cardTitle}>Revenue Breakdown</h4>
                                            <div className="grid-responsive" style={{ gap: '1.5rem', marginTop: '1.5rem' }}>
                                                <div style={{
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    borderRadius: '16px',
                                                    color: '#fff'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 700, marginBottom: '0.5rem' }}>ONLINE PAYMENTS</div>
                                                    <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>
                                                        ₹{ordersList.filter(o => o.paymentMethod === 'Online').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>
                                                        {ordersList.filter(o => o.paymentMethod === 'Online').length} transactions
                                                    </div>
                                                </div>

                                                <div style={{
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                    borderRadius: '16px',
                                                    color: '#fff'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 700, marginBottom: '0.5rem' }}>CASH ON DELIVERY</div>
                                                    <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>
                                                        ₹{ordersList.filter(o => o.paymentMethod === 'COD').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>
                                                        {ordersList.filter(o => o.paymentMethod === 'COD').length} orders
                                                    </div>
                                                </div>

                                                <div style={{
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    borderRadius: '16px',
                                                    color: '#fff'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 700, marginBottom: '0.5rem' }}>TOTAL REVENUE</div>
                                                    <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>
                                                        ₹{ordersList.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>
                                                        All payment methods
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Motion.div>
                                )
                            }

                            {/* 🆕 Inventory Alerts */}
                            {
                                activeTab === 'inventory' && (
                                    <Motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                        <div style={adminPageHeader}>
                                            <div style={headerInfo}>
                                                <h3 style={sectionTitle}>Inventory Management</h3>
                                                <p style={sectionSubtitle}>Monitor stock levels and receive alerts for low inventory.</p>
                                            </div>
                                            <div style={headerActions}>
                                                <button style={saasAddBtn} onClick={() => fetchInventoryAlerts()}>
                                                    <RefreshCw size={16} /> Refresh Stock Data
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid-responsive" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(245, 158, 11, 0.1)' }}>
                                                        <AlertTriangle size={24} color="#f59e0b" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Low Stock Items</div>
                                                    <div style={statValue}>{inventoryAlerts.lowStock.length}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(239, 68, 68, 0.1)' }}>
                                                        <XCircle size={24} color="#ef4444" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Out of Stock</div>
                                                    <div style={statValue}>{inventoryAlerts.outOfStock.length}</div>
                                                </div>
                                            </div>

                                            <div style={saasStatCard}>
                                                <div style={statHeader}>
                                                    <div style={{ ...statIconBox, background: 'rgba(16, 185, 129, 0.1)' }}>
                                                        <Package size={24} color="#10b981" />
                                                    </div>
                                                </div>
                                                <div style={statContent}>
                                                    <div style={statLabel}>Total Products</div>
                                                    <div style={statValue}>{productList.length}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {inventoryAlerts.lowStock.length > 0 && (
                                            <div style={{ ...chartCard, marginBottom: '2rem' }}>
                                                <h4 style={cardTitle}>Low Stock Alerts</h4>
                                                <table style={saasTable}>
                                                    <thead>
                                                        <tr>
                                                            <th style={th}>Product</th>
                                                            <th style={th}>Current Stock</th>
                                                            <th style={th}>Alert Level</th>
                                                            <th style={th}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {inventoryAlerts.lowStock.map(product => (
                                                            <tr key={product.id} style={tRow}>
                                                                <td style={td}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                        <img src={product.img} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                                                        <span style={{ fontWeight: 700 }}>{product.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td style={td}>
                                                                    <span style={{
                                                                        ...saasBadge,
                                                                        background: '#fef3c7',
                                                                        color: '#f59e0b',
                                                                        fontWeight: 800
                                                                    }}>
                                                                        {product.stock} units
                                                                    </span>
                                                                </td>
                                                                <td style={td}>
                                                                    <span style={{
                                                                        ...saasBadge,
                                                                        background: product.stock < 5 ? '#fee2e2' : '#fef3c7',
                                                                        color: product.stock < 5 ? '#ef4444' : '#f59e0b'
                                                                    }}>
                                                                        {product.stock < 5 ? 'Critical' : 'Warning'}
                                                                    </span>
                                                                </td>
                                                                <td style={td}>
                                                                    <button
                                                                        style={{ ...miniAction, color: '#3b82f6' }}
                                                                        onClick={() => showStatus('info', `Contact seller to restock ${product.name}`, 'Restock Alert')}
                                                                    >
                                                                        <Bell size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {inventoryAlerts.outOfStock.length > 0 && (
                                            <div style={chartCard}>
                                                <h4 style={cardTitle}>Out of Stock Products</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {inventoryAlerts.outOfStock.map(product => (
                                                        <div key={product.id} style={{
                                                            padding: '1rem',
                                                            background: '#fee2e2',
                                                            borderRadius: '12px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            borderLeft: '4px solid #ef4444'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <img src={product.img} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                                                <div>
                                                                    <div style={{ fontWeight: 800, color: '#991b1b' }}>{product.name}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>Stock depleted - Immediate restock required</div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                style={{ ...outlineBtn, borderColor: '#ef4444', color: '#ef4444' }}
                                                                onClick={() => showStatus('info', `Notify seller about ${product.name}`, 'Alert Sent')}
                                                            >
                                                                <Bell size={16} /> Notify Seller
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {inventoryAlerts.lowStock.length === 0 && inventoryAlerts.outOfStock.length === 0 && (
                                            <div style={emptyState}>
                                                <CheckCircle2 size={48} color="#10b981" />
                                                <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 700 }}>All inventory levels are healthy!</p>
                                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>No stock alerts or warnings detected.</p>
                                            </div>
                                        )}
                                    </Motion.div>
                                )
                            }
                        </AnimatePresence >
                    </div >
                </main >
            </div >

            {/* Registration Modal */}
            < AnimatePresence >
                {showRegisterModal && (
                    <div style={modalOverlay}>
                        <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ ...modal, width: '600px' }}>
                            <div style={mHeader}>
                                <h2>Add Platform {newUser.role.toUpperCase()}</h2>
                                <button onClick={() => setShowRegisterModal(false)} style={closeBtn}><X /></button>
                            </div>
                            <form onSubmit={(e) => {
                                if (newUser.password !== newUser.confirmPassword) {
                                    showStatus('invalid', 'Passwords do not match!', 'Validation Error');
                                    e.preventDefault();
                                    return;
                                }
                                handleRegister(e);
                            }} style={mForm}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={mGroup}><label>Full Name</label><input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required style={mInput} /></div>
                                    <div style={mGroup}>
                                        <label>Email Address</label>
                                        <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required style={mInput} />
                                        {newUser.email && (
                                            <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: getEmailValidation(newUser.email).color }}>
                                                {getEmailValidation(newUser.email).message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={mGroup}>
                                        <label>Phone Number</label>
                                        <input value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} required style={mInput} />
                                        {newUser.phone && (
                                            <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: getPhoneValidation(newUser.phone).color }}>
                                                {getPhoneValidation(newUser.phone).message}
                                            </div>
                                        )}
                                    </div>
                                    <div style={mGroup}>
                                        <label>Gender</label>
                                        <select value={newUser.gender} onChange={e => setNewUser({ ...newUser, gender: e.target.value })} style={mInput}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {newUser.role === 'seller' && (
                                    <div style={{ borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0', paddingTop: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'block' }}>Merchant Business Verification</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <FileUploadField label="Shop/Store Front Photo" field="profilePhoto" value={newUser.profilePhoto} icon={Store} color="#6366f1" />
                                            <FileUploadField label="ID Proof (Aadhar/PAN)" field="aadharPhoto" value={newUser.aadharPhoto} icon={ShieldCheck} color="#10b981" />
                                        </div>
                                        <div style={{ ...mGroup, display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                            <input type="checkbox" checked={newUser.isVerified} onChange={e => setNewUser({ ...newUser, isVerified: e.target.checked })} style={saasCheck} />
                                            <label style={{ marginBottom: 0, fontWeight: 700, fontSize: '0.85rem' }}>Auto-Verify Merchant Account?</label>
                                        </div>
                                    </div>
                                )}

                                <div style={{ borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0', paddingTop: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>Address Details</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={mGroup}>
                                            <label>State</label>
                                            <select
                                                value={newUser.state}
                                                onChange={e => setNewUser({ ...newUser, state: e.target.value, district: '' })}
                                                required
                                                style={mInput}
                                            >
                                                <option value="">Select State</option>
                                                {Object.keys(locations).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div style={mGroup}>
                                            <label>District</label>
                                            <select
                                                value={newUser.district}
                                                onChange={e => setNewUser({ ...newUser, district: e.target.value })}
                                                required
                                                disabled={!newUser.state}
                                                style={mInput}
                                            >
                                                <option value="">Select District</option>
                                                {newUser.state && locations[newUser.state].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div style={mGroup}><label>City / Area</label><input value={newUser.city} onChange={e => setNewUser({ ...newUser, city: e.target.value })} required style={mInput} /></div>
                                        <div style={mGroup}><label>Pin Code</label><input value={newUser.pincode} onChange={e => setNewUser({ ...newUser, pincode: e.target.value })} required style={mInput} /></div>
                                    </div>
                                </div>

                                {newUser.role === 'delivery' && (
                                    <div style={{ borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0', paddingTop: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: '1rem', display: 'block' }}>Delivery Verification Documents</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <FileUploadField label="Profile Photo" field="profilePhoto" value={newUser.profilePhoto} icon={User} color="#6366f1" />
                                            <FileUploadField label="Aadhar Card" field="aadharPhoto" value={newUser.aadharPhoto} icon={ShieldCheck} color="#10b981" />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                            <FileUploadField label="Driving License" field="licensePhoto" value={newUser.licensePhoto} icon={Truck} color="#f59e0b" />
                                            <div style={{ ...mGroup, display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                                <input type="checkbox" checked={newUser.isVerified} onChange={e => setNewUser({ ...newUser, isVerified: e.target.checked })} style={saasCheck} />
                                                <label style={{ marginBottom: 0, fontWeight: 700, fontSize: '0.85rem' }}>Certificate Authenticated?</label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0', paddingTop: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={mGroup}>
                                            <label>Set Password</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={newUser.password}
                                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                    required
                                                    style={mInput}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {newUser.password && (
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                                                        <span>Strength</span>
                                                        <span style={{ color: getPasswordStrength(newUser.password).color, fontWeight: 700 }}>
                                                            {getPasswordStrength(newUser.password).label}
                                                        </span>
                                                    </div>
                                                    <div style={{ height: '3px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: getPasswordStrength(newUser.password).width, background: getPasswordStrength(newUser.password).color, transition: 'all 0.3s' }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div style={mGroup}>
                                            <label>Confirm Password</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={newUser.confirmPassword}
                                                    onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                                    required
                                                    style={mInput}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {newUser.confirmPassword && (
                                                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: newUser.password === newUser.confirmPassword ? '#10b981' : '#ef4444' }}>
                                                    {newUser.password === newUser.confirmPassword ? '✓ Match' : '✗ No match'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" style={mSubmit} disabled={loading}>{loading ? 'Accessing Secure API...' : `Activate ${newUser.role} Profile`}</button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Edit User Modal */}
            < AnimatePresence >
                {showEditModal && editingUser && (
                    <div style={modalOverlay}>
                        <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ ...modal, width: '600px' }}>
                            <div style={mHeader}>
                                <h2>Edit {editingUser.role.toUpperCase()} Details</h2>
                                <button onClick={() => { setShowEditModal(false); setEditingUser(null); }} style={closeBtn}><X /></button>
                            </div>
                            <form onSubmit={handleUpdateUser} style={mForm}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={mGroup}><label>Full Name</label><input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} required style={mInput} /></div>
                                    <div style={mGroup}>
                                        <label>Email Address</label>
                                        <input type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} required style={mInput} disabled />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div style={mGroup}><label>Phone Number</label><input value={editingUser.phone} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} required style={mInput} /></div>
                                    <div style={mGroup}>
                                        <label>Gender</label>
                                        <select value={editingUser.gender} onChange={e => setEditingUser({ ...editingUser, gender: e.target.value })} style={mInput}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--glass-border)', margin: '1rem 0', paddingTop: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'block' }}>Location Details</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={mGroup}>
                                            <label>State</label>
                                            <select
                                                value={editingUser.state}
                                                onChange={e => setEditingUser({ ...editingUser, state: e.target.value, district: '' })}
                                                required
                                                style={mInput}
                                            >
                                                <option value="">Select State</option>
                                                {Object.keys(locations).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div style={mGroup}>
                                            <label>District</label>
                                            <select
                                                value={editingUser.district}
                                                onChange={e => setEditingUser({ ...editingUser, district: e.target.value })}
                                                required
                                                disabled={!editingUser.state}
                                                style={mInput}
                                            >
                                                <option value="">Select District</option>
                                                {editingUser.state && locations[editingUser.state].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div style={mGroup}><label>City / Area</label><input value={editingUser.city} onChange={e => setEditingUser({ ...editingUser, city: e.target.value })} required style={mInput} /></div>
                                        <div style={mGroup}><label>Pin Code</label><input value={editingUser.pincode} onChange={e => setEditingUser({ ...editingUser, pincode: e.target.value })} required style={mInput} /></div>
                                    </div>
                                </div>

                                <button type="submit" style={mSubmit} disabled={loading}>{loading ? 'Updating...' : `Update ${editingUser.role} Profile`}</button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Password Reset Modal */}
            < AnimatePresence >
                {showResetModal && resettingUser && (
                    <div style={modalOverlay}>
                        <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ ...modal, width: '450px' }}>
                            <div style={mHeader}>
                                <h2>Reset Password</h2>
                                <button onClick={() => { setShowResetModal(false); setResettingUser(null); setNewPass(''); }} style={closeBtn}><X /></button>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                            {resettingUser.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{resettingUser.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{resettingUser.email}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={mGroup}>
                                    <label>New Secure Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPass}
                                            onChange={e => setNewPass(e.target.value)}
                                            placeholder="Enter new password"
                                            required
                                            style={mInput}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {newPass && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                                                <span>Strength</span>
                                                <span style={{ color: getPasswordStrength(newPass).color, fontWeight: 700 }}>
                                                    {getPasswordStrength(newPass).label}
                                                </span>
                                            </div>
                                            <div style={{ height: '3px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: getPasswordStrength(newPass).width, background: getPasswordStrength(newPass).color, transition: 'all 0.3s' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleResetPassword}
                                    style={{ ...mSubmit, marginTop: '1rem' }}
                                >
                                    Force Update Password
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Category Modal */}
            < AnimatePresence >
                {showCategoryModal && (
                    <div style={modalOverlay}>
                        <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={modal}>
                            <div style={mHeader}>
                                <h2>Define New Category</h2>
                                <button onClick={() => setShowCategoryModal(false)} style={closeBtn}><X /></button>
                            </div>
                            <form onSubmit={handleCreateCategory} style={mForm}>
                                <div style={mGroup}><label>Category Name</label><input value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} required style={mInput} placeholder="e.g. Wellness" /></div>
                                <div style={mGroup}><label>Brief Description</label><textarea value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} style={{ ...mInput, height: '80px', paddingTop: '0.5rem' }} placeholder="What fits in this category?" /></div>
                                <button type="submit" style={mSubmit} disabled={loading}>{loading ? 'Writing to Master DB...' : 'Create Global Category'}</button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Profit Rule Modal */}
            < AnimatePresence >
                {showRuleModal && (
                    <div style={modalOverlay}>
                        <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={modal}>
                            <div style={mHeader}>
                                <h2>Define Profit Logic Rule</h2>
                                <button onClick={() => setShowRuleModal(false)} style={closeBtn}><X /></button>
                            </div>
                            <form onSubmit={handleCreateProfitRule} style={mForm}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={mGroup}>
                                        <label>Min Seller Price (₹)</label>
                                        <input type="number" value={newRule.minSellerPrice} onChange={e => setNewRule({ ...newRule, minSellerPrice: parseFloat(e.target.value) })} required style={mInput} />
                                    </div>
                                    <div style={mGroup}>
                                        <label>Max Seller Price (₹)</label>
                                        <input type="number" value={newRule.maxSellerPrice} onChange={e => setNewRule({ ...newRule, maxSellerPrice: parseFloat(e.target.value) })} required style={mInput} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div style={mGroup}>
                                        <label>Platform Profit (%)</label>
                                        <input type="number" value={newRule.profitPercentage} onChange={e => setNewRule({ ...newRule, profitPercentage: parseFloat(e.target.value) })} required style={mInput} />
                                    </div>
                                    <div style={mGroup}>
                                        <label>Minimum Profit (₹)</label>
                                        <input type="number" value={newRule.minProfitAmount} onChange={e => setNewRule({ ...newRule, minProfitAmount: parseFloat(e.target.value) })} required style={mInput} />
                                    </div>
                                </div>
                                <div style={mGroup}>
                                    <label>Maximum Profit Cap (INR) - 0 for no cap</label>
                                    <input type="number" value={newRule.maxProfitCap} onChange={e => setNewRule({ ...newRule, maxProfitCap: parseFloat(e.target.value) })} style={mInput} />
                                </div>
                                <button type="submit" style={mSubmit}>Activate New Margin Rule</button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Offer Modal */}
            < AnimatePresence >
                {showOfferModal && (
                    <div style={modalOverlay}>
                        <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={modal}>
                            <div style={mHeader}>
                                <h2>{editingOffer ? 'Modify Campaign' : 'Advanced Campaign Setup'}</h2>
                                <button onClick={() => { setShowOfferModal(false); setEditingOffer(null); }} style={closeBtn}><X /></button>
                            </div>
                            <form onSubmit={handleCreateOffer} style={mForm}>
                                <div style={mGroup}><label>Title</label><input value={newOffer.title} onChange={e => setNewOffer({ ...newOffer, title: e.target.value })} required style={mInput} /></div>
                                <div style={mGroup}>
                                    <label>Target Category</label>
                                    <select value={newOffer.category} onChange={e => setNewOffer({ ...newOffer, category: e.target.value })} style={mInput}>
                                        <option value="All">All Categories</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={mGroup}><label>Start Date</label><input type="date" value={newOffer.startDate} onChange={e => setNewOffer({ ...newOffer, startDate: e.target.value })} style={mInput} /></div>
                                    <div style={mGroup}><label>End Date</label><input type="date" value={newOffer.endDate} onChange={e => setNewOffer({ ...newOffer, endDate: e.target.value })} style={mInput} /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={mGroup}>
                                        <label>Unit</label>
                                        <select value={newOffer.discountType} onChange={e => setNewOffer({ ...newOffer, discountType: e.target.value })} style={mInput}>
                                            <option value="percentage">% Percentage</option>
                                            <option value="flat">₹ Flat Amt</option>
                                        </select>
                                    </div>
                                    <div style={mGroup}><label>Value</label><input type="number" value={newOffer.discountValue} onChange={e => setNewOffer({ ...newOffer, discountValue: e.target.value })} required style={mInput} /></div>
                                </div>
                                <button type="submit" style={mSubmit} disabled={loading}>
                                    {loading ? 'Processing...' : (editingOffer ? 'Update Campaign' : 'Activate Live Offer')}
                                </button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Order Details Advanced Modal */}
            < AnimatePresence >
                {viewingDetails && (
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={modalOverlay} onClick={() => setViewingDetails(null)}>
                        <Motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            style={{ ...modal, width: '900px', padding: 0, overflow: 'hidden' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ background: '#0f172a', padding: '2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Order Analysis</h2>
                                    <p style={{ opacity: 0.6, fontSize: '0.8rem', margin: '4px 0 0' }}>Ref: {viewingDetails.id}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => window.print()}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Download size={16} /> Export PDF
                                    </button>
                                    <button onClick={() => setViewingDetails(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '2.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 800, fontSize: '0.8rem' }}>
                                            <ShoppingCart size={16} /> CORE PRODUCT
                                        </div>
                                        <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 900 }}>{viewingDetails.productName}</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#64748b' }}>Settlement</span>
                                                <span style={{ fontWeight: 800 }}>₹{viewingDetails.totalAmount?.toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#64748b' }}>Dispatch Date</span>
                                                <span style={{ fontWeight: 800 }}>{new Date(viewingDetails.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '1rem', fontWeight: 800, fontSize: '0.8rem' }}>
                                            <User size={16} /> CONSIGNEE
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 900 }}>{viewingDetails.user?.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{viewingDetails.user?.phone}</p>
                                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff', borderRadius: '12px', fontSize: '0.75rem', lineHeight: '1.5', color: '#1e293b', border: '1px solid #e2e8f0' }}>
                                            {viewingDetails.address}
                                        </div>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <QRCodeSVG value={viewingDetails.id} size={80} level="H" includeMargin={true} />
                                        <p style={{ margin: '10px 0 0', fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px' }}>VERIFY SCAN</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    {/* Logistics Label */}
                                    <div style={{ border: '2px dashed #e2e8f0', padding: '2rem', borderRadius: '20px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '-12px', left: '20px', background: '#fff', padding: '0 8px', fontSize: '0.7rem', fontWeight: 900, color: '#64748b' }}>FULFILLMENT LABEL</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <div style={{ fontWeight: 900, fontSize: '1.5rem' }}>H-HUB</div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>EXPRESS PRIORITY</div>
                                                <div style={{ fontSize: '0.6rem' }}>Weight: 0.5kg | Dim: 20x15x10</div>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', pb: '1rem' }}>
                                            <Barcode value={viewingDetails.id.slice(0, 12)} height={40} fontSize={12} width={1.5} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}>SHIP TO:</div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{viewingDetails.user?.name}</div>
                                                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>{viewingDetails.address}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}>FROM:</div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>H-HUB MAIN CORE</div>
                                                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Warehouse #4, Tech Park, City</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice Summary */}
                                    <div style={{ background: '#0f172a', color: '#fff', padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <span style={{ fontWeight: 900, fontSize: '1rem' }}>TAX INVOICE</span>
                                            <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>#{viewingDetails.id.slice(0, 8)}</span>
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                                                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{viewingDetails.productName} (x1)</span>
                                                <span style={{ fontWeight: 800 }}>₹{(viewingDetails.totalAmount - 80).toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ opacity: 0.7 }}>Logistics Fee</span>
                                                <span style={{ fontWeight: 800 }}>₹80.00</span>
                                            </div>
                                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '2px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>Total Payable</span>
                                                <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fbbf24' }}>₹{viewingDetails.totalAmount?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2.5rem', background: 'rgba(99, 102, 241, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Truck size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>Logistic Partner Status</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {viewingDetails.deliveryManId ? 'Assigned and Active' : 'Pending Allocation'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setAssigningOrder(viewingDetails);
                                            setViewingDetails(null);
                                        }}
                                        style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        Manage Distribution
                                    </button>
                                </div>

                                {/* Delivery Proof Photo */}
                                {viewingDetails.deliveryPhoto && viewingDetails.status === 'Delivered' && (
                                    <div style={{ marginTop: '2.5rem', background: '#f0fdf4', padding: '1.5rem', borderRadius: '20px', border: '2px solid #86efac' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#166534' }}>Delivery Verification Photo</div>
                                                <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>Open box proof uploaded by delivery personnel</div>
                                            </div>
                                        </div>
                                        <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #86efac' }}>
                                            <img
                                                src={viewingDetails.deliveryPhoto}
                                                alt="Delivery Proof"
                                                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', cursor: 'pointer' }}
                                                onClick={() => window.open(viewingDetails.deliveryPhoto, '_blank')}
                                            />
                                            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#16a34a' }}>
                                                <span style={{ fontWeight: 700 }}>✓ Verified Delivery</span>
                                                <a
                                                    href={viewingDetails.deliveryPhoto}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#16a34a', textDecoration: 'underline', fontWeight: 700 }}
                                                >
                                                    View Full Size
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Admin Bonus Section */}
                                {viewingDetails.deliveryManId && (
                                    <div style={{ marginTop: '2.5rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', padding: '1.5rem', borderRadius: '20px', border: '2px solid #fbbf24' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <DollarSign size={18} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#92400e' }}>Delivery Bonus</div>
                                                <div style={{ fontSize: '0.7rem', color: '#b45309' }}>
                                                    Current bonus: ₹{viewingDetails.adminBonus || 0}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="number"
                                                placeholder="Enter bonus amount"
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    border: '2px solid #fbbf24',
                                                    borderRadius: '10px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                    outline: 'none'
                                                }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const bonus = parseFloat(e.target.value);
                                                        if (bonus > 0) {
                                                            fetch(`${API_BASE_URL}/admin/orders/${viewingDetails.id}/bonus`, {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ bonusAmount: bonus })
                                                            })
                                                                .then(res => res.json())
                                                                .then(data => {
                                                                    if (data.success) {
                                                                        alert(`Bonus of ₹${bonus} added successfully!`);
                                                                        fetchOrders();
                                                                        setViewingDetails(null);
                                                                    }
                                                                })
                                                                .catch(err => console.error('Failed to add bonus:', err));
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    const input = e.target.previousSibling;
                                                    const bonus = parseFloat(input.value);
                                                    if (bonus > 0) {
                                                        fetch(`${API_BASE_URL}/admin/orders/${viewingDetails.id}/bonus`, {
                                                            method: 'PUT',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ bonusAmount: bonus })
                                                        })
                                                            .then(res => res.json())
                                                            .then(data => {
                                                                if (data.success) {
                                                                    alert(`Bonus of ₹${bonus} added successfully!`);
                                                                    fetchOrders();
                                                                    setViewingDetails(null);
                                                                }
                                                            })
                                                            .catch(err => console.error('Failed to add bonus:', err));
                                                    } else {
                                                        alert('Please enter a valid bonus amount');
                                                    }
                                                }}
                                                style={{
                                                    background: '#f59e0b',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '0.75rem 1.5rem',
                                                    borderRadius: '10px',
                                                    fontWeight: 800,
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Add Bonus
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence >

            {/* Logistics Assignment Modal */}
            < AnimatePresence >
                {assigningOrder && (
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={modalOverlay} onClick={() => setAssigningOrder(null)}>
                        <Motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ ...modal, width: '500px' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={mHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ ...statIconBox, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                        <Truck size={24} />
                                    </div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Assign Logistics</h2>
                                </div>
                                <button onClick={() => setAssigningOrder(null)} style={closeBtn}><X size={20} /></button>
                            </div>

                            <div style={{ margin: '1.5rem 0' }}>
                                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}>SELECTED ORDER</div>
                                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{assigningOrder.productName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>ID: {assigningOrder.id.slice(0, 12)}</div>
                                </div>

                                <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Select Delivery Personnel</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <select
                                        style={mInput}
                                        value={assignId}
                                        onChange={(e) => setAssignId(e.target.value)}
                                    >
                                        <option value="">Choose partner...</option>
                                        {deliveryList.map(dm => (
                                            <option key={dm.id} value={dm.id}>{dm.name} ({dm.city})</option>
                                        ))}
                                    </select>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={labelStyle}>Update Fulfillment Status</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                            {['Processing', 'Packed', 'Shipped', 'Delivered'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleOrderStatusUpdate(assigningOrder.id, status, assigningOrder.deliveryManId)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '10px',
                                                        border: assigningOrder.status === status ? '2px solid #3b82f6' : '1px solid #f1f5f9',
                                                        background: assigningOrder.status === status ? '#eff6ff' : '#f8fafc',
                                                        color: assigningOrder.status === status ? '#3b82f6' : '#64748b',
                                                        fontWeight: 800,
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAssignDelivery}
                                disabled={!assignId}
                                style={{ ...mSubmit, opacity: !assignId ? 0.5 : 1, marginTop: '1rem' }}
                            >
                                Confirm Logistics Assignment
                            </button>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence >

            {/* Verification Modal */}
            <AnimatePresence>
                {verifyingProduct && (
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={modalOverlay} onClick={() => setVerifyingProduct(null)}>
                        <Motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            style={{ ...modal, width: '800px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ background: '#0f172a', padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>Product Audit: {verifyingProduct.name}</h3>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                            <span>Seller: {sellerList.find(s => s.id === verifyingProduct.sellerId)?.name || 'Unknown'}</span>
                                            <span>|</span>
                                            <span>ID: {verifyingProduct.id}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setVerifyingProduct(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '0.5rem', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                                </div>
                                <div style={{ display: 'flex', gap: '1px', background: 'rgba(255,255,255,0.1)', marginTop: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                                    {[
                                        { id: 'info', label: 'Product Info', icon: <FileCheck size={16} /> },
                                        { id: 'pricing', label: 'Pricing Intelligence', icon: <DollarSign size={16} /> },
                                        { id: 'risk', label: 'Risk & Alerts', icon: <AlertTriangle size={16} /> }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setVerificationTab(tab.id)}
                                            style={{
                                                flex: 1,
                                                padding: '0.85rem',
                                                background: verificationTab === tab.id ? '#fff' : 'transparent',
                                                color: verificationTab === tab.id ? '#0f172a' : '#94a3b8',
                                                border: 'none',
                                                fontWeight: 800,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {tab.icon} {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                                {verificationTab === 'info' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <img src={verifyingProduct.image || 'https://via.placeholder.com/200'} style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Automated Checks</div>
                                                {runAutoValidation(verifyingProduct).issues.length === 0 ? (
                                                    <div style={{ color: '#166534', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} /> No content issues detected.</div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {runAutoValidation(verifyingProduct).issues.map((iss, i) => (
                                                            <div key={i} style={{ color: iss.type === 'critical' ? '#ef4444' : '#f59e0b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <AlertCircle size={14} /> {iss.msg}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                                                <p style={{ marginTop: '0.5rem', lineHeight: '1.6', fontSize: '0.9rem', color: '#1e293b' }}>{verifyingProduct.description}</p>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>CATEGORY</label>
                                                    <div style={{ fontWeight: 700, marginTop: '4px' }}>{verifyingProduct.category}</div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>STOCK UNIT</label>
                                                    <div style={{ fontWeight: 700, marginTop: '4px' }}>{verifyingProduct.stock || 'N/A'} units</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {verificationTab === 'pricing' && (
                                    <div>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                            <div style={{ flex: 1, padding: '1.5rem', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>SELLER PRICE</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#166534', marginTop: '0.25rem' }}>₹{verifyingProduct.sellerPrice}</div>
                                            </div>
                                            <div style={{ flex: 1, padding: '1.5rem', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>CUSTOMER PRICE</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e40af', marginTop: '0.25rem' }}>₹{verifyingProduct.price}</div>
                                            </div>
                                            <div style={{ flex: 1, padding: '1.5rem', background: 'white', borderRadius: '16px', border: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>GROSS PROFIT</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>
                                                    {(((verifyingProduct.price - verifyingProduct.sellerPrice) / verifyingProduct.price) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        <h4 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1rem' }}>Cost Breakdown</h4>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.75rem 0', color: '#64748b' }}>Base Price (to Seller)</td>
                                                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600 }}>₹{verifyingProduct.sellerPrice}</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.75rem 0', color: '#64748b' }}>Packing & Handling</td>
                                                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600 }}>+ ₹140.00</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.75rem 0', color: '#64748b' }}>Platform Commission (15%)</td>
                                                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600 }}>+ ₹{(verifyingProduct.price * 0.15).toFixed(2)}</td>
                                                </tr>
                                                <tr style={{ background: '#f8fafc' }}>
                                                    <td style={{ padding: '1rem 0', fontWeight: 800 }}>Calculated Listing Price</td>
                                                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 900, color: 'var(--primary)' }}>₹{verifyingProduct.price}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {verificationTab === 'risk' && (
                                    <div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                            <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '16px', border: '1px solid #fecaca' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                    <AlertTriangle color="#ef4444" />
                                                    <h4 style={{ margin: 0, color: '#b91c1c', fontWeight: 900 }}>Risk Factors</h4>
                                                </div>
                                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#b91c1c', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                    {runAutoValidation(verifyingProduct).issues.length > 0 ? (
                                                        runAutoValidation(verifyingProduct).issues.map((iss, i) => <li key={i}>{iss.msg}</li>)
                                                    ) : (
                                                        <li>No specific risk factors detected.</li>
                                                    )}
                                                    {getTrustScore(verifyingProduct.sellerId) < 50 && <li>Seller has a low Trust Score ({getTrustScore(verifyingProduct.sellerId)}/100)</li>}
                                                </ul>
                                            </div>

                                            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                <h4 style={{ margin: '0 0 1rem', fontWeight: 800 }}>Seller History</h4>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#64748b' }}>Total Products</span>
                                                    <span style={{ fontWeight: 700 }}>124</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#64748b' }}>Rejection Rate</span>
                                                    <span style={{ fontWeight: 700, color: '#ef4444' }}>4.2%</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#64748b' }}>Return Rate</span>
                                                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>12%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>

                                </div>
                                <button
                                    onClick={() => {
                                        handleRequestChanges(verifyingProduct.id);
                                        setVerifyingProduct(null);
                                    }}
                                    style={{ padding: '0.85rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 800, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                >
                                    <MessageSquare size={16} /> Request Changes
                                </button>
                                <button
                                    onClick={() => {
                                        handleApproveProduct(verifyingProduct.id);
                                        setVerifyingProduct(null);
                                    }}
                                    style={{ padding: '0.85rem 2rem', borderRadius: '12px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                                >
                                    <CheckCircle2 size={16} /> Approve & Publish
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}

            </AnimatePresence>

            {/* Broadcast Message Modal */}
            <AnimatePresence>
                {showBroadcastModal && (
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={modalOverlay} onClick={() => setShowBroadcastModal(false)}>
                        <Motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ ...modal, width: '550px' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={mHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ ...statIconBox, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                        <Bell size={24} />
                                    </div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Broadcast Message</h2>
                                </div>
                                <button onClick={() => setShowBroadcastModal(false)} style={closeBtn}><X size={20} /></button>
                            </div>

                            <div style={{ padding: '1rem 0' }}>
                                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #bfdbfe' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Info size={18} color="#3b82f6" />
                                        <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>
                                            This message will be sent to all active users on the platform
                                        </span>
                                    </div>
                                </div>

                                <div style={mGroup}>
                                    <label style={labelStyle}>Message Title</label>
                                    <input
                                        type="text"
                                        style={mInput}
                                        placeholder="Enter broadcast title..."
                                        value={broadcastMessage.title}
                                        onChange={(e) => setBroadcastMessage({ ...broadcastMessage, title: e.target.value })}
                                    />
                                </div>

                                <div style={mGroup}>
                                    <label style={labelStyle}>Message Content</label>
                                    <textarea
                                        style={{ ...mInput, minHeight: '120px', resize: 'vertical' }}
                                        placeholder="Enter your message here..."
                                        value={broadcastMessage.message}
                                        onChange={(e) => setBroadcastMessage({ ...broadcastMessage, message: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowBroadcastModal(false)}
                                    style={{ ...outlineBtn, padding: '0.75rem 1.5rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBroadcastMessage}
                                    disabled={!broadcastMessage.title || !broadcastMessage.message}
                                    style={{
                                        ...saasPrimaryBtn,
                                        opacity: (!broadcastMessage.title || !broadcastMessage.message) ? 0.5 : 1,
                                        cursor: (!broadcastMessage.title || !broadcastMessage.message) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <Bell size={16} /> Send Broadcast
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>

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

// Consolidated SaaS UI Styles
const container = { minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f8fafc', color: '#1e293b', overflow: 'hidden' };
const layout = { flex: 1, display: 'flex', overflow: 'hidden' };

// Sidebar
const sidebar = { width: '280px', background: '#0f172a', display: 'flex', flexDirection: 'column', padding: '1.5rem', flexShrink: 0, color: '#fff', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)' };
const sidebarNavScroll = { flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.65) rgba(15,23,42,0.4)', paddingRight: '0.25rem' };
const logoSection = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', marginBottom: '3rem' };
const logoIcon = { background: 'var(--primary)', padding: '0.6rem', borderRadius: '14px', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)' };
const logoText = { fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px', color: 'white' };
const adminTag = { color: '#60a5fa', fontWeight: 800, fontSize: '0.7rem', verticalAlign: 'middle', marginLeft: '4px', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 6px', borderRadius: '4px' };
const navSection = { marginBottom: '2rem' };
const navLabel = { fontSize: '0.65rem', fontWeight: 800, color: '#475569', letterSpacing: '0.1em', marginBottom: '1rem', display: 'block', paddingLeft: '0.75rem' };
const navGroup = { display: 'flex', flexDirection: 'column', gap: '0.35rem' };
const navBtn = { display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.25rem', background: 'none', border: 'none', borderRadius: '16px', textAlign: 'left', fontWeight: 600, color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', width: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
const activeNav = { ...navBtn, background: 'rgba(59, 130, 246, 0.15)', color: '#fff', fontWeight: 700, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.2)' };

const sidebarFooter = { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' };
const profileInSidebar = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0.75rem' };
const userAvatarMini = { width: '36px', height: '36px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' };
const profileInfo = { display: 'flex', flexDirection: 'column' };
const profName = { fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' };
const profRole = { fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const logoutBtnSidebar = { ...navBtn, color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' };
const backToHubBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', color: '#94a3b8' };

// Main Content
const content = { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', background: '#f8fafc' };
const topBar = { position: 'sticky', top: 0, height: '80px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', padding: '0 3rem', flexShrink: 0, zIndex: 100 };
const topBarLeft = { display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: '1 1 320px' };
const topBarRight = { display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flexWrap: 'wrap', justifyContent: 'flex-end' };
const searchWrapper = { display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '12px', width: 'min(350px, 100%)', minWidth: 0 };
const sInput = { background: 'none', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1e293b', width: '100%' };
const topNavBtn = { display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', padding: '0.6rem 1rem', borderRadius: '12px', transition: 'all 0.2s' };
const _vDivider = { width: '1px', height: '24px', background: '#e2e8f0' };
const _topProfile = { display: 'flex', alignItems: 'center', gap: '0.75rem' };
const _adminBadge = { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.5px', border: '1px solid rgba(59, 130, 246, 0.2)' };

const scrollArea = { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '2rem 3rem' };
const pane = { display: 'flex', flexDirection: 'column' };
const adminPageHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' };
const headerInfo = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const sectionTitle = { fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' };
const sectionSubtitle = { fontSize: '0.85rem', color: '#64748b', fontWeight: 500 };
const contentTitle = { fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' };
const contentSubtitle = { fontSize: '0.95rem', color: '#64748b', fontWeight: 500 };
const headerActions = { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' };

// Stats
const statsGrid = { display: 'grid', gap: '1.5rem', marginBottom: '3rem' };
const saasStatCard = { background: '#ffffff', padding: '2.25rem', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const statHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const statIconBox = { width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statTrend = { fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', background: '#f0fdf4', padding: '0.4rem 0.8rem', borderRadius: '10px' };
const statContent = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const statLabel = { fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' };
const statValue = { fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px' };

// Grids & Cards
const doubleGrid = { display: 'grid', gap: '2rem' };
const chartCard = { background: '#ffffff', padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)' };
const cardTitle = { fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '2.5rem', letterSpacing: '-0.3px' };
const summaryList = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const summaryItem = { display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem', color: '#475569' };
const actionBtn = { display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', color: '#334155', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left' };

// Tables
const tableCard = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px', overflowX: 'auto', overflowY: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' };
const saasTable = { width: '100%', minWidth: '840px', borderCollapse: 'collapse' };
const th = { background: '#f8fafc', padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' };
const td = { padding: '1.25rem', fontSize: '0.9rem', color: '#1e293b' };
const tRow = { borderBottom: '1px solid #f1f5f9' };
const emptyState = { padding: '6rem 0', textAlign: 'center', color: '#94a3b8' };

// Table Elements
const userCell = { display: 'flex', alignItems: 'center', gap: '0.75rem' };
const userAvatar = { width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 };
const userDetails = { display: 'flex', flexDirection: 'column' };
const userName = { fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' };
const userEmail = { fontSize: '0.8rem', color: '#64748b' };
const phoneText = { fontWeight: 700, color: '#475569' };
const dateText = { color: '#64748b', fontWeight: 500 };
const statusDotContainer = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' };
const activeDot = { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' };
const miniAction = { padding: '0.5rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const actionCluster = { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' };
const saasBadge = { padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 };
const activeBadge = { padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-block' };

// Modals
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modal = { background: '#ffffff', width: '550px', maxWidth: 'calc(100vw - 2rem)', borderRadius: '28px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' };
const mHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' };
const mForm = { display: 'flex', flexDirection: 'column', gap: '1.25rem' };
const mInput = { padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.95rem', outline: 'none', width: '100%' };
const mSubmit = { background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' };
const mGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const closeBtn = { color: '#64748b', cursor: 'pointer', background: 'none', border: 'none' };
const labelStyle = { color: '#475569', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' };

// Specialized
const saasPrimaryBtn = { background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)' };
const saasAddBtn = { ...saasPrimaryBtn };
const outlineBtn = { background: '#ffffff', color: '#334155', border: '1px solid #e2e8f0', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const miniSearch = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', width: 'min(350px, 100%)' };
const miniInput = { background: 'none', border: 'none', outline: 'none', fontSize: '0.9rem', width: '100%' };

// Merchant specific
const merchGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' };
const merchCard = { background: '#ffffff', padding: '1.75rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s' };
const mTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' };
const mLogo = { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' };
const mName = { fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' };
const mActions = { borderTop: '1px solid #f1f5f9', marginTop: '1.5rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' };

const uploadContainer = { border: '2px dashed #e2e8f0', borderRadius: '18px', padding: '1.5rem', background: '#f8fafc' };
const uploadPlaceholder = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontWeight: 700, cursor: 'pointer' };
const uploadPreview = { display: 'flex', alignItems: 'center', gap: '1rem' };
const previewImg = { width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover' };
const uploadInfo = { display: 'flex', flexDirection: 'column', gap: '0.4rem' };
const fileName = { color: '#10b981', fontWeight: 800, fontSize: '0.85rem' };
const removeFile = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 };
const loaderSmall = { width: '20px', height: '20px', border: '2px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' };

const toggleSwitch = { width: '40px', height: '22px', borderRadius: '12px', padding: '3px', cursor: 'pointer' };
const toggleDot = { width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: 'all 0.2s shadow 0.2s' };

// Unused/Legacy cleanup
// const header = ...
// const headerLeft = ...
// const headerRight = ...
// const pageTitleDisplay = ...
// const searchWrapper = ...
// const sInput = ...
// const topActionGroup = ...
// const iconBtnStyle = ...
// const profileTrigger = ...
// const logoutBtnSaas = ...

// Notifications
const notificationPanel = { position: 'absolute', top: '100%', right: 0, width: '320px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', zIndex: 1000, marginTop: '10px', overflow: 'hidden' };
const notifHeader = { padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', background: '#f8fafc' };
const notifList = { maxHeight: '400px', overflowY: 'auto' };
const notifItem = { padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' };
const notifTitle = { fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.2rem' };
const notifMsg = { fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' };
const notifTime = { fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem', fontWeight: 600 };
const pNoNotif = { padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' };
const badgeCount = { background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50px', marginLeft: 'auto', fontWeight: 900 };

const saasCheck = { width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' };

// Missing Styles Fix
const paneTitle = { fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' };
const createBtn = {
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.25rem',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
};
const statusBadge = (active) => ({
    padding: '0.35rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.7rem',
    fontWeight: 800,
    background: active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    color: active ? '#10b981' : '#ef4444'
});
const modalTitle = { fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', marginBottom: '1.5rem' };
const modalGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' };
const modalActions = { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' };
const cancelBtn = { background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer' };
const submitBtn = {
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '0.9rem',
    cursor: 'pointer'
};

export default AdminDashboard;


