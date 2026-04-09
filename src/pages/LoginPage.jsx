import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    LogIn,
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
    Eye,
    EyeOff,
    Gem
} from 'lucide-react';
import { validateEmail } from '../utils/validation';
import StatusPopup from '../components/StatusPopup';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [status, setStatus] = useState({ show: false, type: 'success', title: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await login(email, password);
            if (result.success) {
                setStatus({
                    show: true,
                    type: 'success',
                    title: 'Login successful',
                    message: 'Welcome back. Redirecting...'
                });
                const savedUser = JSON.parse(localStorage.getItem('hub_user'));
                const role = savedUser.role;
                setTimeout(() => {
                    if (role === 'admin') navigate('/admin');
                    else if (role === 'seller') navigate('/seller');
                    else if (role === 'delivery') navigate('/delivery');
                    else if (role === 'logix_admin') navigate('/logix');
                    else navigate('/');
                }, 1200);
            } else {
                setStatus({
                    show: true,
                    type: 'failed',
                    title: result.title || 'Login failed',
                    message: result.message || 'Email or password is incorrect.'
                });
                setError(result.message || 'Invalid credentials.');
            }
        } catch (err) {
            setStatus({ show: true, type: 'failed', title: 'System Error', message: 'Unexpected client error occurred. Please reload and try again.' });
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={container}>
            <div style={decorBlur1} />
            <div style={decorBlur2} />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={loginCard}>
                <header style={lHeader}>
                    <div style={logoCircle}><Gem size={32} color="white" /></div>
                    <h1 style={lTitle}>H-HUB</h1>
                    <p style={lSub}>Sign in to continue.</p>
                </header>

                {error && <div style={errBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={lForm}>
                    <div style={lInputGroup}>
                        <label style={lLabel}>Email</label>
                        <div style={lInputWrapper}>
                            <Mail size={18} color="var(--text-muted)" />
                            <input
                                style={lInput}
                                placeholder="name@company.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={lInputGroup}>
                        <div style={lLabelRow}>
                            <label style={lLabel}>Password</label>
                            <Link to="/forgot-password" style={lForgot}>Forgot password?</Link>
                        </div>
                        <div style={lInputWrapper}>
                            <Lock size={18} color="var(--text-muted)" />
                            <input
                                style={lInput}
                                placeholder="••••••••"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={lToggleBtn}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button style={lBtn} type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div style={divider}>
                    <div style={line} />
                    <span style={dividerText}>OR</span>
                    <div style={line} />
                </div>

                <button type="button" onClick={loginWithGoogle} style={googleBtn}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
                    Continue with Google
                </button>

                <div style={lFooter}>
                    <p style={lFootText}>Your data is protected.</p>
                    <div style={lJoinRow}>
                        New here? <Link to="/register" style={lJoinLink}>Create account</Link>
                    </div>
                </div>
            </motion.div>

            <StatusPopup
                show={status.show}
                type={status.type}
                title={status.title}
                message={status.message}
                onClose={() => setStatus({ ...status, show: false })}
            />
        </div>
    );
};

// Styles
const container = { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' };
const decorBlur1 = { position: 'absolute', width: '500px', height: '500px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '50%', filter: 'blur(80px)', top: '-10%', left: '-10%' };
const decorBlur2 = { position: 'absolute', width: '500px', height: '500px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '50%', filter: 'blur(80px)', bottom: '-10%', right: '-10%' };

const loginCard = { background: 'white', width: '100%', maxWidth: '480px', padding: '4.5rem 3.5rem', borderRadius: '48px', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', position: 'relative', zIndex: 1 };
const lHeader = { textAlign: 'center', marginBottom: '3.5rem' };
const logoCircle = { width: '70px', height: '70px', background: 'var(--primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.3)' };
const lTitle = { fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.75rem', letterSpacing: '-0.5px' };
const lSub = { color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 };

const errBox = { background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #fee2e2', marginBottom: '2.5rem', textAlign: 'center' };
const lForm = { display: 'flex', flexDirection: 'column', gap: '2rem' };
const lInputGroup = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const lLabel = { fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const lLabelRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' };
const lForgot = { fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' };
const lInputWrapper = { display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '0 1.5rem', transition: 'all 0.2s', height: '60px' };
const lInput = { flex: 1, border: 'none', background: 'none', padding: '1rem', fontSize: '1rem', fontWeight: 600, outline: 'none', color: 'var(--text-main)' };
const lToggleBtn = { color: 'var(--text-muted)', padding: '0.5rem' };

const lBtn = { background: 'var(--primary)', color: 'white', padding: '1.25rem', borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', boxShadow: '0 15px 30px -10px rgba(37, 99, 235, 0.4)', marginTop: '1rem' };

const lFooter = { marginTop: '4rem', textAlign: 'center' };
const lFootText = { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1.5rem' };
const lJoinRow = { fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' };
const lJoinLink = { color: 'var(--primary)', fontWeight: 800, marginLeft: '0.5rem' };

const divider = { display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' };
const line = { flex: 1, height: '1px', background: '#e2e8f0' };
const dividerText = { fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap' };
const googleBtn = { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' };

export default LoginPage;
