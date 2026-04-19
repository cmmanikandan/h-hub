import React, { useState, useEffect, useCallback } from 'react';
import api, { API_BASE_URL, normalizeApiError } from '../utils/api';
import { auth, googleProvider } from '../utils/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext';

const API_URL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('hub_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [theme, setTheme] = useState(() => localStorage.getItem('hub_theme') || 'light');
    const [lang, setLang] = useState('EN');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            console.log('✨ PWA Install Prompt detected');
            setDeferredPrompt(e);
            setIsInstallable(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const installPWA = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('✅ PWA installed');
            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    const [profile, setProfile] = useState({
        gender: 'Not Set',
        dob: 'Not Set',
        altPhone: '',
        pan: '',
        wallet: 0.00,
        cashback: 0.00,
        addresses: [],
        wishlist: [],
        cart: [],
        recentlyViewed: [],
        compareList: [],
        notifications: [],
        transactions: [],
        orders: []
    });

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        setLoadingProfile(true);
        try {
            const userRes = await api.get(`/user/profile-details/${user.id}`).catch(() => {
                console.error('❌ Profile Fetch Failed');
                return { data: user };
            });

            // Orders API might fail, so handle it separately
            let ordersData = [];
            try {
                const ordersRes = await api.get(`/user/orders/${user.id}`);
                ordersData = ordersRes.data;
            } catch {
                console.warn('Orders endpoint not available, using empty orders');
                ordersData = [];
            }

            const userData = userRes.data;
            console.log('🔄 Profile Fetched:', userData); // Debug log

            setProfile(prev => ({
                ...prev,
                ...userData,
                cashback: userData.supercoins || 0.00, // Map supercoins to cashback UI
                addresses: userData.Addresses || userData.addresses || [],
                orders: ordersData.map(o => ({
                    id: o.id,
                    name: o.productName || 'Order Item',
                    image: o.productImage || '',
                    price: `₹${o.totalAmount.toLocaleString('en-IN')}`,
                    status: o.status,
                    date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    badgeColor: o.status === 'Delivered' ? '#dcfce7' : o.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                    textColor: o.status === 'Delivered' ? '#166534' : o.status === 'Cancelled' ? '#991b1b' : '#92400e',
                    canCancel: ['Processing', 'Pending'].includes(o.status),
                    canReturn: o.status === 'Delivered'
                }))
            }));
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoadingProfile(false);
        }
    }, [user]);

    const toggleWishlist = async (productId) => {
        if (!user) return { success: false, message: 'Please login first' };
        try {
            const res = await api.post('/user/wishlist/toggle', {
                userId: user.id,
                productId
            });
            if (res.data.success) {
                setProfile(prev => ({
                    ...prev,
                    wishlist: res.data.wishlist
                }));
                return { success: true, wishlist: res.data.wishlist };
            }
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            return { success: false };
        }
    };

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user, fetchProfile]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hub_theme', theme);
    }, [theme]);

    // Handle Firebase Auth Changes (Google Sign-In)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                try {
                    console.log('🔄 Syncing Firebase user with backend...');
                    const res = await api.post('/auth/firebase-sync', {
                        email: fbUser.email,
                        name: fbUser.displayName || fbUser.email.split('@')[0],
                        firebaseId: fbUser.uid
                    });

                    const userData = res.data.user;
                    const token = res.data.token;

                    setUser(userData);
                    localStorage.setItem('hub_user', JSON.stringify(userData));
                    if (token) localStorage.setItem('token', token);

                    console.log('✅ Firebase Auth Sync Successful');
                } catch (error) {
                    console.error('❌ Firebase Sync Failed:', error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('❌ Google Sign-In Error:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            console.log('🔐 Attempting login:', email);
            const res = await api.post('/auth/login', { email, password });
            console.log('✅ Login response:', res.data);
            const userData = res.data.user;
            const token = res.data.token;
            setUser(userData);
            localStorage.setItem('hub_user', JSON.stringify(userData));
            if (token) {
                localStorage.setItem('token', token);
            }
            return { success: true, user: userData };
        } catch (error) {
            console.error('❌ Login Failed:', error.response?.data);
            const normalized = normalizeApiError(error, 'Server connection failed');
            return { success: false, message: normalized.message, title: normalized.title };
        }
    };

    const logout = async () => {
        await signOut(auth).catch(console.error);
        setUser(null);
        localStorage.removeItem('hub_user');
        localStorage.removeItem('token');
        setProfile({
            gender: 'Not Set',
            dob: 'Not Set',
            altPhone: '',
            pan: '',
            wallet: 0.00,
            cashback: 0.00,
            addresses: [],
            wishlist: [],
            cart: [],
            recentlyViewed: [],
            compareList: [],
            notifications: [],
            transactions: [],
            orders: []
        });
        navigate('/login', { replace: true });
    };

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleLang = () => setLang(prev => prev === 'EN' ? 'TA' : 'EN');

    const updateProfile = async (updates) => {
        if (!user) return;
        try {
            const res = await api.put(`/user/profile/${user.id}`, updates);
            const updatedData = res.data;

            // Sync Profile State
            setProfile(prev => ({ ...prev, ...updatedData }));

            // Sync User State (for Navbar/Avatars)
            const newUser = { ...user, name: updatedData.name, ...updatedData };
            setUser(newUser);
            localStorage.setItem('hub_user', JSON.stringify(newUser));

            return { success: true };
        } catch (error) {
            console.error('Failed to update profile:', error);
            return { success: false };
        }
    };

    const addAddress = async (addr) => {
        if (!user) return;
        try {
            const payload = { ...addr };
            if (payload.city) {
                payload.district = payload.city;
                delete payload.city;
            }
            const res = await api.post('/user/addresses', { ...payload, UserId: user.id });
            setProfile(prev => ({
                ...prev,
                addresses: [...(prev.addresses || []), res.data]
            }));
            return { success: true, address: res.data };
        } catch (error) {
            console.error('Failed to add address:', error);
            return { success: false };
        }
    };

    const updateAddress = async (id, addr) => {
        try {
            // Ensure fields match backend
            const payload = { ...addr };
            if (payload.city) {
                payload.district = payload.city;
                delete payload.city;
            }

            const res = await api.put(`/user/addresses/${id}`, payload);
            setProfile(prev => ({
                ...prev,
                addresses: prev.addresses.map(a => a.id === id ? res.data : a)
            }));
            return { success: true, address: res.data };
        } catch (error) {
            console.error('Failed to update address:', error);
            return { success: false };
        }
    };

    const deleteAddress = async (id) => {
        try {
            await api.delete(`/user/addresses/${id}`);
            setProfile(prev => ({
                ...prev,
                addresses: prev.addresses.filter(a => a.id !== id)
            }));
            return { success: true };
        } catch (error) {
            console.error('Failed to delete address:', error);
            return { success: false };
        }
    };

    const addToCart = (product, quantity = 1) => {
        if (!user) return { success: false, message: 'Please login first' };

        setProfile(prev => {
            const existingItem = prev.cart.find(item => item.id === product.id);

            if (existingItem) {
                return {
                    ...prev,
                    cart: prev.cart.map(item =>
                        item.id === product.id
                            ? { ...item, qty: item.qty + quantity }
                            : item
                    )
                };
            } else {
                return {
                    ...prev,
                    cart: [...prev.cart, { ...product, qty: quantity }]
                };
            }
        });

        return { success: true };
    };

    const removeFromCart = (productId) => {
        setProfile(prev => ({
            ...prev,
            cart: prev.cart.filter(item => item.id !== productId)
        }));
    };

    const updateCartQty = (productId, quantity) => {
        setProfile(prev => ({
            ...prev,
            cart: prev.cart.map(item =>
                item.id === productId
                    ? { ...item, qty: Math.max(1, quantity) }
                    : item
            )
        }));
    };

    const clearCart = () => {
        setProfile(prev => ({ ...prev, cart: [] }));
    };

    const cancelOrder = async (orderId) => {
        try {
            const res = await api.post(`/orders/${orderId}/cancel`);
            if (res.data.success) {
                await fetchProfile(); // Refresh orders
                return { success: true };
            }
            return { success: false, message: res.data.error || 'Failed to cancel order' };
        } catch (error) {
            console.error('Cancel order error:', error);
            return { success: false, message: error.response?.data?.error || 'Server error' };
        }
    };

    const addOrder = async (orderData, syncToBackend = true) => {
        if (!user) return;

        let newOrder = { ...orderData };

        if (syncToBackend) {
            try {
                const cleanPrice = typeof orderData.price === 'string'
                    ? parseFloat(orderData.price.replace(/[₹,]/g, ''))
                    : orderData.price;

                const payload = {
                    UserId: user.id,
                    userId: user.id,
                    sellerId: orderData.sellerId || null,
                    productName: orderData.name || orderData.productName,
                    productImage: orderData.image || orderData.productImage || orderData.img,
                    totalAmount: cleanPrice,
                    quantity: orderData.quantity || orderData.qty || 1,
                    status: 'Processing',
                    address: orderData.address || 'Standard Delivery',
                    paymentMethod: orderData.paymentMethod || 'COD',
                    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                };

                const res = await api.post('/orders', payload);
                newOrder = res.data;
            } catch (error) {
                console.error('Failed to create order in SQL:', error);
                // Fallback to local state if backend fails
            }
        }

        setProfile(prev => ({
            ...prev,
            orders: [newOrder, ...(prev.orders || [])]
        }));
    };

    return (
        <AuthContext.Provider value={{
            user, login, logout,
            theme, toggleTheme,
            lang, toggleLang,
            profile, setProfile,
            fetchProfile,
            updateProfile,
            addAddress, updateAddress, deleteAddress,
            addToCart, removeFromCart, updateCartQty, clearCart,
            addOrder, cancelOrder, toggleWishlist,
            loadingProfile, loginWithGoogle,
            isInstallable, installPWA
        }}>
            {children}
        </AuthContext.Provider>
    );
};
