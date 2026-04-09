import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import ShopPage from './pages/ShopPage';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminReturns from './pages/AdminReturns';
import SellerDashboard from './pages/SellerDashboard';
import LogixDashboard from './pages/LogixDashboard';
import OrderDetails from './pages/OrderDetails';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryVerificationPage from './pages/DeliveryVerificationPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import GuestPrompt from './components/GuestPrompt';
import Footer from './components/Footer';
import FloatingWidget from './components/FloatingWidget';

// Advanced Feature Dashboards
import ControlTower from './pages/ControlTower';
import AdminControlPanel from './pages/AdminControlPanel';
import FinanceIntelligence from './pages/FinanceIntelligence';
import DisputeManager from './pages/DisputeManager';
import EscalationManagement from './pages/EscalationManagement';
import RiderProDashboard from './pages/RiderProDashboard';
import CODRiskDashboard from './pages/CODRiskDashboard';
import ReturnAnalyticsDashboard from './pages/ReturnAnalyticsDashboard';
import SecurityAuditDashboard from './pages/SecurityAuditDashboard';

// New separate pages
import MyProfile from './pages/MyProfile';
import MyOrders from './pages/MyOrders';
import MyWallet from './pages/MyWallet';
import MyAddresses from './pages/MyAddresses';
import MyNotifications from './pages/MyNotifications';
import MyWishlist from './pages/MyWishlist';
import MyCoupons from './pages/MyCoupons';
import MyGiftCards from './pages/MyGiftCards';
import MySupercoin from './pages/MySupercoin';
import AssignOrder from './pages/AssignOrder';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

import PWAInstallBanner from './components/PWAInstallBanner';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/seller') ||
    location.pathname.startsWith('/delivery') ||
    location.pathname.startsWith('/logix');
  return (
    <>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
      {!isDashboard && <FloatingWidget />}
      <PWAInstallBanner />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GuestPrompt />
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

            {/* User Account Pages - Accessible to all authenticated users */}
            <Route path="/user/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/user/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/user/wallet" element={<ProtectedRoute><MyWallet /></ProtectedRoute>} />
            <Route path="/user/addresses" element={<ProtectedRoute><MyAddresses /></ProtectedRoute>} />
            <Route path="/user/notifications" element={<ProtectedRoute><MyNotifications /></ProtectedRoute>} />
            <Route path="/user/wishlist" element={<ProtectedRoute><MyWishlist /></ProtectedRoute>} />
            <Route path="/user/coupons" element={<ProtectedRoute><MyCoupons /></ProtectedRoute>} />
            <Route path="/user/gift-cards" element={<ProtectedRoute><MyGiftCards /></ProtectedRoute>} />
            <Route path="/user/supercoin" element={<ProtectedRoute><MySupercoin /></ProtectedRoute>} />
            <Route path="/user" element={<Navigate to="/user/profile" />} />

            <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/seller" element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/returns" element={<ProtectedRoute role="admin"><AdminReturns /></ProtectedRoute>} />
            <Route path="/admin/assign-orders" element={<ProtectedRoute role="admin"><AssignOrder /></ProtectedRoute>} />
            <Route path="/admin/control-panel" element={<ProtectedRoute role="admin"><AdminControlPanel /></ProtectedRoute>} />
            <Route path="/admin/finance" element={<ProtectedRoute role="admin"><FinanceIntelligence /></ProtectedRoute>} />
            <Route path="/admin/disputes" element={<ProtectedRoute role="admin"><DisputeManager /></ProtectedRoute>} />
            <Route path="/admin/escalations" element={<ProtectedRoute role="admin"><EscalationManagement /></ProtectedRoute>} />
            <Route path="/admin/returns" element={<ProtectedRoute role="admin"><ReturnAnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/admin/security" element={<ProtectedRoute role="admin"><SecurityAuditDashboard /></ProtectedRoute>} />
            <Route path="/admin/cod-risk" element={<ProtectedRoute role="admin"><CODRiskDashboard /></ProtectedRoute>} />

            <Route path="/logix" element={<ProtectedRoute role="logix_admin"><LogixDashboard /></ProtectedRoute>} />
            <Route path="/logix/control-tower" element={<ProtectedRoute role="logix_admin"><ControlTower /></ProtectedRoute>} />
            <Route path="/logix/cod-risk" element={<ProtectedRoute role="logix_admin"><CODRiskDashboard /></ProtectedRoute>} />

            <Route path="/delivery" element={<ProtectedRoute role="delivery"><DeliveryDashboard /></ProtectedRoute>} />
            <Route path="/delivery/verify" element={<ProtectedRoute role="delivery"><DeliveryVerificationPage /></ProtectedRoute>} />
            <Route path="/delivery/pro-dashboard" element={<ProtectedRoute role="delivery"><RiderProDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
