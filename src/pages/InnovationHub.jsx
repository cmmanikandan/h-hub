import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../utils/api';
import {
    Sparkles, Users, Truck, ShieldCheck, HandCoins, BadgePercent, Repeat, Wallet,
    MapPin, Package, Fingerprint, HeartHandshake, ArrowRight, RefreshCw, Lock, BarChart3
} from 'lucide-react';

const featureCatalog = [
    {
        key: 'group-buy',
        title: 'Hyperlocal Group Buy',
        icon: Users,
        color: '#2563eb',
        scope: 'user',
        blurb: 'Create or join live pincode deal rooms where price drops as more neighbors join.'
    },
    {
        key: 'delivery-missions',
        title: 'Delivery-to-Earn Missions',
        icon: Truck,
        color: '#059669',
        scope: 'delivery',
        blurb: 'Track streaks and earn dynamic bonuses for safer, greener, faster deliveries.'
    },
    {
        key: 'return-risk',
        title: 'Return Risk Meter',
        icon: ShieldCheck,
        color: '#ef4444',
        scope: 'user',
        blurb: 'Estimate return risk before checkout and nudge customers toward the right choice.'
    },
    {
        key: 'verification-payment',
        title: 'Pay After Verification',
        icon: Lock,
        color: '#7c3aed',
        scope: 'user',
        blurb: 'Hold payment until OTP, delivery photo, and optional unboxing proof are verified.'
    },
    {
        key: 'seller-trust',
        title: 'Seller Trust Score',
        icon: BadgePercent,
        color: '#ea580c',
        scope: 'seller',
        blurb: 'Surface a transparent trust scorecard for sellers and platform reviewers.'
    },
    {
        key: 'ai-negotiation',
        title: 'AI Negotiation Mode',
        icon: HandCoins,
        color: '#db2777',
        scope: 'user',
        blurb: 'Negotiate with bounded price guardrails for repeat buyers on select items.'
    },
    {
        key: 'resell',
        title: 'Neighborhood Resell',
        icon: Repeat,
        color: '#0f766e',
        scope: 'user',
        blurb: 'Let buyers resell verified purchases locally with proof-of-purchase trails.'
    },
    {
        key: 'family-wallet',
        title: 'Family Wallet',
        icon: Wallet,
        color: '#dc2626',
        scope: 'user',
        blurb: 'Shared household wallet with role-based spend caps and category locks.'
    },
    {
        key: 'dispatch-map',
        title: 'Live Dispatch Map',
        icon: MapPin,
        color: '#2563eb',
        scope: 'delivery',
        blurb: 'Give buyers a truthful ETA band, route confidence, and delay probability.'
    },
    {
        key: 'insurance',
        title: 'Packaging Insurance',
        icon: Package,
        color: '#4f46e5',
        scope: 'user',
        blurb: 'Offer damage-proof packaging insurance with photo-diff claim flows.'
    },
    {
        key: 'authenticity',
        title: 'Authenticity Chain',
        icon: Fingerprint,
        color: '#0891b2',
        scope: 'seller',
        blurb: 'Record a lightweight authenticity trail from seller to buyer handoff.'
    },
    {
        key: 'reverse-loyalty',
        title: 'Reverse Loyalty',
        icon: HeartHandshake,
        color: '#16a34a',
        scope: 'user',
        blurb: 'Reward sustainable behavior like low returns, reusable packaging, and green slots.'
    }
];

const workflowConfig = {
    'group-buy': {
        endpoint: '/innovations/group-buy/rooms',
        method: 'post',
        submitLabel: 'Create Group Buy Room',
        fields: [
            { name: 'roomId', label: 'Room ID', type: 'text', required: true, defaultValue: () => `GB-${Date.now()}` },
            { name: 'productId', label: 'Product ID', type: 'text', required: true, defaultValue: 'sample-product' },
            { name: 'pincode', label: 'Pincode', type: 'text', required: true, defaultValue: '600001' },
            { name: 'targetSize', label: 'Target Size', type: 'number', required: true, defaultValue: 10 },
            { name: 'startPrice', label: 'Start Price', type: 'number', required: true, defaultValue: 1200 },
            { name: 'minPrice', label: 'Minimum Price', type: 'number', required: true, defaultValue: 950 },
            { name: 'createdBy', label: 'Created By', type: 'text', defaultValue: (user) => user?.id || '' }
        ]
    },
    'delivery-missions': {
        endpoint: '/innovations/delivery-missions/progress',
        method: 'post',
        submitLabel: 'Update Mission Progress',
        fields: [
            { name: 'riderId', label: 'Rider ID', type: 'text', required: true, defaultValue: (user) => user?.id || 'rider-demo' },
            { name: 'missionType', label: 'Mission Type', type: 'text', required: true, defaultValue: 'eco_route' },
            { name: 'increment', label: 'Increment', type: 'number', required: true, defaultValue: 1 },
            { name: 'target', label: 'Target', type: 'number', required: true, defaultValue: 5 },
            { name: 'baseBonus', label: 'Base Bonus', type: 'number', required: true, defaultValue: 120 },
            { name: 'savingsFactor', label: 'Savings Factor', type: 'number', required: true, defaultValue: 1.2, step: '0.1' }
        ]
    },
    'return-risk': {
        endpoint: '/innovations/return-risk/score',
        method: 'post',
        submitLabel: 'Compute Return Risk',
        fields: [
            { name: 'userId', label: 'User ID', type: 'text', defaultValue: (user) => user?.id || '' },
            { name: 'productId', label: 'Product ID', type: 'text', required: true, defaultValue: 'sample-product' },
            { name: 'sizeMismatchRisk', label: 'Size Mismatch Risk', type: 'number', defaultValue: 40 },
            { name: 'imageMismatchRisk', label: 'Image Mismatch Risk', type: 'number', defaultValue: 35 },
            { name: 'compatibilityRisk', label: 'Compatibility Risk', type: 'number', defaultValue: 25 },
            { name: 'historicalReturnRate', label: 'Historical Return Rate', type: 'number', defaultValue: 15 },
            { name: 'verifiedQualityAddon', label: 'Verified Quality Addon', type: 'checkbox', defaultValue: true }
        ]
    },
    'verification-payment': {
        endpoint: '/innovations/verification-payment/hold',
        method: 'post',
        submitLabel: 'Create Payment Hold',
        fields: [
            { name: 'orderId', label: 'Order ID', type: 'text', required: true, defaultValue: () => `order-${Date.now()}` },
            { name: 'amount', label: 'Amount', type: 'number', required: true, defaultValue: 1299 },
            { name: 'holdReason', label: 'Hold Reason', type: 'text', defaultValue: 'Pending OTP + delivery proof verification' }
        ]
    },
    'seller-trust': {
        endpoint: '/innovations/seller-trust/recompute/:sellerId',
        method: 'post',
        submitLabel: 'Recompute Trust Snapshot',
        fields: [
            { name: 'sellerId', label: 'Seller ID', type: 'text', required: true, defaultValue: (user) => user?.id || 'seller-demo' },
            { name: 'onTimeDispatch', label: 'On Time Dispatch', type: 'number', defaultValue: 85 },
            { name: 'complaintResolution', label: 'Complaint Resolution', type: 'number', defaultValue: 82 },
            { name: 'returnHonesty', label: 'Return Honesty', type: 'number', defaultValue: 88 },
            { name: 'packagingQuality', label: 'Packaging Quality', type: 'number', defaultValue: 86 }
        ]
    },
    'ai-negotiation': {
        endpoint: '/innovations/ai-negotiation/start',
        method: 'post',
        submitLabel: 'Start Negotiation Session',
        fields: [
            { name: 'userId', label: 'User ID', type: 'text', required: true, defaultValue: (user) => user?.id || 'user-demo' },
            { name: 'productId', label: 'Product ID', type: 'text', required: true, defaultValue: 'sample-product' },
            { name: 'basePrice', label: 'Base Price', type: 'number', required: true, defaultValue: 1299 },
            { name: 'minPrice', label: 'Minimum Price', type: 'number', required: true, defaultValue: 999 }
        ]
    },
    'resell': {
        endpoint: '/innovations/resell/listings',
        method: 'post',
        submitLabel: 'Create Resell Listing',
        fields: [
            { name: 'sellerUserId', label: 'Seller User ID', type: 'text', required: true, defaultValue: (user) => user?.id || 'user-demo' },
            { name: 'originalOrderId', label: 'Original Order ID', type: 'text', required: true, defaultValue: 'order-demo' },
            { name: 'productId', label: 'Product ID', type: 'text', required: true, defaultValue: 'sample-product' },
            { name: 'pincode', label: 'Pincode', type: 'text', required: true, defaultValue: '600001' },
            { name: 'price', label: 'Resell Price', type: 'number', required: true, defaultValue: 899 }
        ]
    },
    'family-wallet': {
        endpoint: '/innovations/family-wallets',
        method: 'post',
        submitLabel: 'Create Family Wallet',
        fields: [
            { name: 'ownerUserId', label: 'Owner User ID', type: 'text', required: true, defaultValue: (user) => user?.id || 'user-demo' },
            { name: 'walletName', label: 'Wallet Name', type: 'text', required: true, defaultValue: 'Family Wallet' },
            { name: 'monthlyLimit', label: 'Monthly Limit', type: 'number', defaultValue: 20000 },
            { name: 'balance', label: 'Initial Balance', type: 'number', defaultValue: 5000 }
        ]
    },
    'dispatch-map': {
        endpoint: '/innovations/dispatch-map/upsert',
        method: 'post',
        submitLabel: 'Publish Dispatch Snapshot',
        fields: [
            { name: 'orderId', label: 'Order ID', type: 'text', required: true, defaultValue: 'order-demo' },
            { name: 'routeConfidence', label: 'Route Confidence', type: 'number', defaultValue: 88 },
            { name: 'delayProbability', label: 'Delay Probability', type: 'number', defaultValue: 12 },
            { name: 'etaMinMinutes', label: 'ETA Min (min)', type: 'number', defaultValue: 18 },
            { name: 'etaMaxMinutes', label: 'ETA Max (min)', type: 'number', defaultValue: 32 }
        ]
    },
    'insurance': {
        endpoint: '/innovations/packaging-insurance/claim',
        method: 'post',
        submitLabel: 'Submit Insurance Claim',
        fields: [
            { name: 'orderId', label: 'Order ID', type: 'text', required: true, defaultValue: 'order-demo' },
            { name: 'userId', label: 'User ID', type: 'text', required: true, defaultValue: (user) => user?.id || 'user-demo' },
            { name: 'premium', label: 'Premium', type: 'number', required: true, defaultValue: 49 },
            { name: 'beforePhotoUrl', label: 'Before Photo URL', type: 'text', defaultValue: '' },
            { name: 'afterPhotoUrl', label: 'After Photo URL', type: 'text', defaultValue: '' }
        ]
    },
    'authenticity': {
        endpoint: '/innovations/authenticity/record',
        method: 'post',
        submitLabel: 'Record Authenticity Event',
        fields: [
            { name: 'productId', label: 'Product ID', type: 'text', required: true, defaultValue: 'sample-product' },
            { name: 'orderId', label: 'Order ID', type: 'text', defaultValue: 'order-demo' },
            { name: 'stage', label: 'Stage', type: 'text', required: true, defaultValue: 'seller_upload' },
            { name: 'actorId', label: 'Actor ID', type: 'text', defaultValue: (user) => user?.id || '' },
            { name: 'eventHash', label: 'Event Hash', type: 'text', required: true, defaultValue: () => `hash-${Date.now()}` },
            { name: 'metaNote', label: 'Meta Note', type: 'text', defaultValue: 'Recorded from hub workflow' }
        ]
    },
    'reverse-loyalty': {
        endpoint: '/innovations/reverse-loyalty/award',
        method: 'post',
        submitLabel: 'Award Reverse Loyalty',
        fields: [
            { name: 'userId', label: 'User ID', type: 'text', required: true, defaultValue: (user) => user?.id || 'user-demo' },
            {
                name: 'eventType',
                label: 'Event Type',
                type: 'select',
                required: true,
                defaultValue: 'green_delivery_slot',
                options: [
                    { label: 'Green Delivery Slot', value: 'green_delivery_slot' },
                    { label: 'Low Return Behavior', value: 'low_return_behavior' },
                    { label: 'Reusable Packaging Return', value: 'reusable_packaging_return' },
                    { label: 'Verified Honest Review', value: 'verified_honest_review' },
                    { label: 'Community Resell', value: 'community_resell' }
                ]
            },
            { name: 'pincode', label: 'Pincode', type: 'text', defaultValue: '600001' }
        ]
    }
};

const featurePermissions = {
    'group-buy': ['user', 'admin'],
    'delivery-missions': ['delivery', 'admin'],
    'return-risk': ['user', 'admin'],
    'verification-payment': ['user', 'admin', 'logix_admin'],
    'seller-trust': ['admin'],
    'ai-negotiation': ['user', 'seller', 'admin'],
    'resell': ['user', 'admin'],
    'family-wallet': ['user', 'admin'],
    'dispatch-map': ['delivery', 'admin', 'logix_admin'],
    'insurance': ['user', 'admin'],
    'authenticity': ['seller', 'delivery', 'admin', 'logix_admin'],
    'reverse-loyalty': ['user', 'admin']
};

const normalizeRole = (role) => {
    const value = String(role || '').toLowerCase();
    if (['hlogix', 'hlogix_admin', 'logix', 'logixadmin', 'logix_admin'].includes(value)) {
        return 'logix_admin';
    }
    return value;
};

const isFeatureVisibleForRole = (featureKey, role) => {
    const allowed = featurePermissions[featureKey] || ['*'];
    if (allowed.includes('*')) return true;
    if (role === 'admin') return true;
    return allowed.includes(role);
};

const toInitialWorkflowState = (featureKey, user) => {
    const config = workflowConfig[featureKey];
    if (!config) return {};

    return config.fields.reduce((acc, field) => {
        if (typeof field.defaultValue === 'function') {
            acc[field.name] = field.defaultValue(user);
        } else if (field.defaultValue !== undefined) {
            acc[field.name] = field.defaultValue;
        } else {
            acc[field.name] = field.type === 'checkbox' ? false : '';
        }
        return acc;
    }, {});
};

const InnovationHub = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [activeFeature, setActiveFeature] = useState('group-buy');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [workflowValues, setWorkflowValues] = useState(toInitialWorkflowState('group-buy', user));
    const [overview, setOverview] = useState(null);
    const [overviewLoading, setOverviewLoading] = useState(false);

    const normalizedRole = useMemo(() => normalizeRole(user?.role), [user]);

    const visibleFeatures = useMemo(
        () => featureCatalog.filter((feature) => isFeatureVisibleForRole(feature.key, normalizedRole)),
        [normalizedRole]
    );

    const canViewOverview = useMemo(
        () => ['admin', 'logix_admin'].includes(normalizedRole),
        [normalizedRole]
    );

    const activeCard = useMemo(
        () => visibleFeatures.find(feature => feature.key === activeFeature) || visibleFeatures[0] || featureCatalog[0],
        [activeFeature, visibleFeatures]
    );

    const activeWorkflow = useMemo(
        () => workflowConfig[activeFeature] || null,
        [activeFeature]
    );

    const hasPermission = useMemo(() => {
        return isFeatureVisibleForRole(activeFeature, normalizedRole);
    }, [activeFeature, normalizedRole]);

    useEffect(() => {
        const requested = new URLSearchParams(location.search).get('feature');
        if (!requested) return;
        if (visibleFeatures.some(feature => feature.key === requested)) {
            setActiveFeature(requested);
        }
    }, [location.search, visibleFeatures]);

    useEffect(() => {
        if (!visibleFeatures.length) return;
        if (!visibleFeatures.some(feature => feature.key === activeFeature)) {
            setActiveFeature(visibleFeatures[0].key);
        }
    }, [activeFeature, visibleFeatures]);

    useEffect(() => {
        setWorkflowValues(toInitialWorkflowState(activeFeature, user));
        setMessage('');
        setResult(null);
    }, [activeFeature, user]);

    const fetchOverview = async () => {
        if (!canViewOverview) return;
        setOverviewLoading(true);
        try {
            const response = await api.get('/innovations/overview');
            setOverview(response.data);
        } catch (error) {
            setOverview({
                error: error.response?.data?.error || error.message || 'Failed to load overview'
            });
        } finally {
            setOverviewLoading(false);
        }
    };

    useEffect(() => {
        if (!canViewOverview) {
            setOverview(null);
            return;
        }
        fetchOverview();
    }, [canViewOverview]);

    const scopeLabel = normalizedRole || 'user';

    const callApi = async (path, payload, method = 'post') => {
        if (method === 'get') {
            const response = await api.get(path, { params: payload });
            return response.data;
        }
        const response = await api[method](path, payload);
        return response.data;
    };

    const handleWorkflowInput = (name, value) => {
        setWorkflowValues(prev => ({ ...prev, [name]: value }));
    };

    const buildRequestFromWorkflow = () => {
        if (!activeWorkflow) return { path: '', payload: {}, method: 'post' };

        const payload = {};
        activeWorkflow.fields.forEach((field) => {
            let value = workflowValues[field.name];
            if (field.type === 'number') {
                value = value === '' || value == null ? undefined : Number(value);
            }
            if (field.type === 'checkbox') {
                value = Boolean(value);
            }
            if (value !== undefined) payload[field.name] = value;
        });

        if (activeFeature === 'seller-trust') {
            const { sellerId, ...rest } = payload;
            return {
                path: activeWorkflow.endpoint.replace(':sellerId', sellerId),
                payload: rest,
                method: activeWorkflow.method
            };
        }

        if (activeFeature === 'authenticity') {
            const { metaNote, ...rest } = payload;
            return {
                path: activeWorkflow.endpoint,
                payload: {
                    ...rest,
                    meta: { note: metaNote || 'Recorded from hub workflow' }
                },
                method: activeWorkflow.method
            };
        }

        return { path: activeWorkflow.endpoint, payload, method: activeWorkflow.method };
    };

    const runLiveWorkflow = async (path, payload, method) => {
        const primary = await callApi(path, payload, method);

        if (activeFeature === 'group-buy' && primary?.roomId && user?.id) {
            const joined = await callApi(`/innovations/group-buy/rooms/${primary.roomId}/join`, {
                userId: user.id,
                userName: user.name || user.email || 'member'
            }, 'post');
            const rooms = await callApi('/innovations/group-buy/rooms', { pincode: payload.pincode }, 'get');
            return { created: primary, join: joined, liveRooms: rooms };
        }

        if (activeFeature === 'delivery-missions') {
            const missions = await callApi(`/innovations/delivery-missions/${payload.riderId}`, {}, 'get');
            return { updated: primary, liveMissions: missions };
        }

        if (activeFeature === 'verification-payment') {
            const verified = await callApi(`/innovations/verification-payment/${payload.orderId}/verify-otp`, {}, 'post');
            const proof = await callApi(`/innovations/verification-payment/${payload.orderId}/upload-proof`, {
                deliveryPhotoUrl: payload.deliveryPhotoUrl || null,
                unboxingHash: payload.unboxingHash || null
            }, 'post');
            const release = ['admin', 'logix_admin'].includes(normalizedRole)
                ? await callApi(`/innovations/verification-payment/${payload.orderId}/release`, {}, 'post')
                : { skipped: true, reason: 'Release action requires admin or logix_admin role' };
            return { hold: primary, verifyOtp: verified, uploadProof: proof, release };
        }

        if (activeFeature === 'seller-trust') {
            const snapshot = await callApi(`/innovations/seller-trust/${workflowValues.sellerId}`, {}, 'get');
            return { recompute: primary, snapshot };
        }

        if (activeFeature === 'ai-negotiation') {
            const negotiationId = primary?.negotiation?.id;
            if (negotiationId) {
                const userOffer = Math.max(Number(payload.minPrice || 0), Number(payload.basePrice || 0) - 100);
                const counter = await callApi(`/innovations/ai-negotiation/${negotiationId}/counter`, { userOffer }, 'post');
                return { start: primary, counter };
            }
            return { start: primary };
        }

        if (activeFeature === 'resell') {
            const listings = await callApi('/innovations/resell/listings', { pincode: payload.pincode }, 'get');
            return { created: primary, liveListings: listings };
        }

        if (activeFeature === 'family-wallet') {
            const walletId = primary?.id;
            if (walletId && user?.id) {
                const linkOwner = await callApi(`/innovations/family-wallets/${walletId}/members`, {
                    userId: user.id,
                    role: 'owner',
                    spendCap: Number(payload.monthlyLimit || 0),
                    categoryLocks: []
                }, 'post');

                const spendProbe = await callApi(`/innovations/family-wallets/${walletId}/spend-request`, {
                    userId: user.id,
                    amount: Math.min(100, Number(payload.balance || 0) || 0),
                    category: ''
                }, 'post');

                return { wallet: primary, ownerLinked: linkOwner, spendProbe };
            }
            return { wallet: primary };
        }

        if (activeFeature === 'dispatch-map') {
            const latest = await callApi(`/innovations/dispatch-map/${payload.orderId}`, {}, 'get');
            return { upsert: primary, latest };
        }

        if (activeFeature === 'authenticity') {
            const timeline = await callApi(`/innovations/authenticity/${payload.productId}`, {}, 'get');
            return { recorded: primary, timeline };
        }

        if (activeFeature === 'reverse-loyalty') {
            const summary = await callApi(`/innovations/reverse-loyalty/${payload.userId}`, {}, 'get');
            return { awarded: primary, summary };
        }

        return primary;
    };

    const submitWorkflow = async (e) => {
        e.preventDefault();
        if (!hasPermission) {
            setMessage(`Role '${user?.role || 'unknown'}' cannot execute ${activeCard.title}.`);
            setResult(null);
            return;
        }
        const { path, payload, method } = buildRequestFromWorkflow();
        setBusy(true);
        setMessage('');
        setResult(null);
        try {
            const liveResult = await runLiveWorkflow(path, payload, method);
            setResult(liveResult);
            setMessage('Live workflow completed');
        } catch (error) {
            setMessage(error.response?.data?.error || error.message || 'Request failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={page}>
            <div style={hero}>
                <div>
                    <div style={eyebrow}><Sparkles size={14} /> Innovation Studio</div>
                    <h1 style={title}>Next-gen commerce features, wired into H-HUB.</h1>
                    <p style={subtitle}>
                        Build trust, reduce returns, reward sustainable behavior, and create local commerce loops that big marketplaces do not ship by default.
                    </p>
                </div>
                <div style={heroMeta}>
                    <div style={metaCard}><span>Role</span><strong>{scopeLabel}</strong></div>
                    <div style={metaCard}><span>Feature count</span><strong>{visibleFeatures.length}</strong></div>
                    <div style={metaCard}><span>Status</span><strong>Live foundation</strong></div>
                </div>
            </div>

            <div style={layout}>
                <aside style={sidebar}>
                    <h2 style={sectionHeading}>Feature Set</h2>
                    <div style={featureList}>
                        {visibleFeatures.map(feature => {
                            const Icon = feature.icon;
                            const active = activeFeature === feature.key;
                            return (
                                <button key={feature.key} onClick={() => setActiveFeature(feature.key)} style={{ ...featureItem, ...(active ? featureItemActive : {}) }}>
                                    <div style={{ ...featureIconWrap, background: `${feature.color}15`, color: feature.color }}><Icon size={18} /></div>
                                    <div style={featureText}>
                                        <strong>{feature.title}</strong>
                                        <span>{feature.scope}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <main style={main}>
                    <div style={featureCard}>
                        <div style={featureHeader}>
                            <div>
                                <div style={{ ...eyebrow, marginBottom: '0.75rem' }}><activeCard.icon size={14} /> {activeCard.scope} scope</div>
                                <h3 style={featureTitle}>{activeCard.title}</h3>
                                <p style={featureBlurb}>{activeCard.blurb}</p>
                            </div>
                            <div style={{ ...badge, color: activeCard.color, borderColor: `${activeCard.color}30`, background: `${activeCard.color}12` }}>API Ready</div>
                        </div>

                        <form onSubmit={submitWorkflow} style={formShell}>
                            <div style={formGrid}>
                                {(activeWorkflow?.fields || []).map((field) => (
                                    <label key={field.name} style={formField}>
                                        <span style={formLabel}>{field.label}</span>
                                        {field.type === 'select' ? (
                                            <select
                                                value={workflowValues[field.name] ?? ''}
                                                onChange={(e) => handleWorkflowInput(field.name, e.target.value)}
                                                required={Boolean(field.required)}
                                                style={inputControl}
                                            >
                                                {(field.options || []).map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'checkbox' ? (
                                            <input
                                                type="checkbox"
                                                checked={Boolean(workflowValues[field.name])}
                                                onChange={(e) => handleWorkflowInput(field.name, e.target.checked)}
                                                style={checkboxControl}
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={workflowValues[field.name] ?? ''}
                                                onChange={(e) => handleWorkflowInput(field.name, e.target.value)}
                                                required={Boolean(field.required)}
                                                step={field.step}
                                                min={field.min}
                                                style={inputControl}
                                            />
                                        )}
                                    </label>
                                ))}
                            </div>

                            <div style={actionRow}>
                                <button type="submit" disabled={busy || !hasPermission} style={{ ...primaryBtn, opacity: busy || !hasPermission ? 0.65 : 1, cursor: busy || !hasPermission ? 'not-allowed' : 'pointer' }}><ArrowRight size={16} /> {activeWorkflow?.submitLabel || 'Run Workflow'}</button>
                                <button type="button" onClick={() => setWorkflowValues(toInitialWorkflowState(activeFeature, user))} disabled={busy} style={secondaryBtn}><RefreshCw size={16} /> Reset Form</button>
                            </div>
                        </form>

                        <div style={actionRow}>
                            <button onClick={() => navigate(-1)} style={secondaryBtn}><RefreshCw size={16} /> Back</button>
                        </div>

                        <div style={endpointBox}>
                            <div style={endpointLabel}>Example endpoint</div>
                            <div style={endpointValue}>{activeWorkflow ? `/api${activeWorkflow.endpoint}` : activeFeature}</div>
                            <p style={endpointHint}>The backend routes are protected by token and role guards where appropriate.</p>
                        </div>

                        {message && <div style={{ ...notice, ...((message === 'Live workflow completed' || message === 'Saved') ? noticeSuccess : noticeError) }}>{message}</div>}

                        {result && (
                            <pre style={resultBox}>{JSON.stringify(result, null, 2)}</pre>
                        )}
                    </div>

                    {canViewOverview && (
                        <div style={featureCard}>
                            <div style={featureHeader}>
                                <div>
                                    <div style={{ ...eyebrow, marginBottom: '0.75rem' }}><BarChart3 size={14} /> Live Overview</div>
                                    <h3 style={featureTitle}>Innovation Activity Dashboard</h3>
                                    <p style={featureBlurb}>Live counters and latest event timestamps across all innovation modules.</p>
                                </div>
                                <button type="button" onClick={fetchOverview} disabled={overviewLoading} style={secondaryBtn}>
                                    <RefreshCw size={16} /> {overviewLoading ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>

                            {overview?.error && (
                                <div style={{ ...notice, ...noticeError }}>{overview.error}</div>
                            )}

                            {!!overview?.summary && (
                                <div style={overviewMetaGrid}>
                                    <div style={overviewMetaCard}><span>Modules</span><strong>{overview.summary.modules}</strong></div>
                                    <div style={overviewMetaCard}><span>Total Events</span><strong>{overview.summary.totalEvents}</strong></div>
                                    <div style={overviewMetaCard}><span>Latest Activity</span><strong>{overview.summary.latestAt ? new Date(overview.summary.latestAt).toLocaleString() : 'N/A'}</strong></div>
                                </div>
                            )}

                            {!!overview?.cards?.length && (
                                <div style={overviewGrid}>
                                    {overview.cards.map((card) => (
                                        <div key={card.key} style={overviewCard}>
                                            <div style={overviewCardTitle}>{card.title}</div>
                                            <div style={overviewCardTotal}>{card.total}</div>
                                            <div style={overviewCardTime}>{card.latestAt ? new Date(card.latestAt).toLocaleString() : 'No events yet'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={grid}>
                        {visibleFeatures.map(feature => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.key} style={miniCard}>
                                    <div style={{ ...featureIconWrap, background: `${feature.color}15`, color: feature.color }}><Icon size={18} /></div>
                                    <strong>{feature.title}</strong>
                                    <span>{feature.blurb}</span>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
};

const page = { minHeight: '100dvh', background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)', padding: '2rem' };
const hero = { display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem', padding: '2rem', borderRadius: '32px', background: 'linear-gradient(135deg, #0f172a, #1d4ed8 55%, #0f766e)', color: '#fff', boxShadow: '0 30px 80px rgba(15,23,42,0.18)' };
const eyebrow = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' };
const title = { fontSize: 'clamp(2rem, 4vw, 4rem)', lineHeight: 1.02, margin: '1rem 0', fontWeight: 900, letterSpacing: '-0.04em', maxWidth: '12ch' };
const subtitle = { maxWidth: '62ch', fontSize: '1rem', lineHeight: 1.7, opacity: 0.92, margin: 0 };
const heroMeta = { display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '0.75rem', minWidth: '220px' };
const metaCard = { padding: '1rem 1.1rem', borderRadius: '20px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '0.35rem' };
const layout = { display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '1.5rem' };
const sidebar = { background: '#fff', borderRadius: '28px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(15,23,42,0.06)' };
const sectionHeading = { fontSize: '1rem', fontWeight: 900, margin: '0 0 1rem 0', color: '#0f172a' };
const featureList = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const featureItem = { display: 'flex', gap: '0.9rem', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '18px', background: '#fff', padding: '0.9rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' };
const featureItemActive = { borderColor: '#2563eb', boxShadow: '0 10px 20px rgba(37,99,235,0.12)', transform: 'translateY(-1px)' };
const featureIconWrap = { width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const featureText = { display: 'flex', flexDirection: 'column', gap: '0.15rem', color: '#0f172a' };
const main = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const featureCard = { background: '#fff', borderRadius: '32px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 45px rgba(15,23,42,0.06)' };
const featureHeader = { display: 'flex', justifyContent: 'space-between', gap: '1.25rem', alignItems: 'flex-start' };
const featureTitle = { fontSize: '1.75rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.04em' };
const featureBlurb = { margin: '0.75rem 0 0', color: '#475569', fontSize: '0.98rem', lineHeight: 1.7, maxWidth: '60ch' };
const badge = { border: '1px solid', borderRadius: '999px', padding: '0.45rem 0.85rem', fontSize: '0.78rem', fontWeight: 900 };
const formShell = { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' };
const formField = { display: 'flex', flexDirection: 'column', gap: '0.45rem' };
const formLabel = { fontSize: '0.8rem', color: '#475569', fontWeight: 700 };
const inputControl = { border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.7rem 0.8rem', fontSize: '0.9rem', color: '#0f172a', background: '#fff' };
const checkboxControl = { width: '18px', height: '18px', accentColor: '#0f172a' };
const actionRow = { display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '1.5rem' };
const primaryBtn = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem', border: 'none', borderRadius: '14px', background: '#0f172a', color: '#fff', padding: '0.9rem 1.1rem', fontWeight: 800, cursor: 'pointer' };
const secondaryBtn = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '14px', background: '#fff', color: '#0f172a', padding: '0.9rem 1.1rem', fontWeight: 800, cursor: 'pointer' };
const endpointBox = { marginTop: '1.5rem', padding: '1.25rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' };
const endpointLabel = { fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' };
const endpointValue = { marginTop: '0.45rem', fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' };
const endpointHint = { margin: '0.65rem 0 0', color: '#64748b', lineHeight: 1.6 };
const notice = { marginTop: '1rem', padding: '0.95rem 1rem', borderRadius: '14px', fontWeight: 700 };
const noticeSuccess = { background: '#ecfdf5', color: '#166534', border: '1px solid #bbf7d0' };
const noticeError = { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' };
const resultBox = { marginTop: '1rem', background: '#0f172a', color: '#e2e8f0', padding: '1rem', borderRadius: '18px', overflowX: 'auto', fontSize: '0.85rem' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' };
const miniCard = { background: '#fff', borderRadius: '22px', padding: '1.1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.7rem', minHeight: '150px', boxShadow: '0 10px 24px rgba(15,23,42,0.04)' };
const overviewMetaGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.9rem', marginTop: '1rem' };
const overviewMetaCard = { border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.85rem 1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.3rem' };
const overviewGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.8rem', marginTop: '1rem' };
const overviewCard = { border: '1px solid #e2e8f0', borderRadius: '14px', background: '#fff', padding: '0.9rem' };
const overviewCardTitle = { fontSize: '0.82rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 700 };
const overviewCardTotal = { fontSize: '1.4rem', color: '#0f172a', fontWeight: 900, lineHeight: 1.1 };
const overviewCardTime = { marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748b' };

export default InnovationHub;
