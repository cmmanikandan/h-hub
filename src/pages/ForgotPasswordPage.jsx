import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock,
    Mail,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    KeyRound,
    RefreshCcw
} from 'lucide-react';
import api from '../utils/api';
import { getValidationErrors, getEmailValidation, getPasswordStrength } from '../utils/validation';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSendOTP = async () => {
        const errs = getValidationErrors({ email });
        if (errs.length > 0) return setError(errs[0]);

        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/forgot-password', { email });

            // If dev mode, auto-fill OTP
            if (response.data.devMode && response.data.otp) {
                const otpDigits = response.data.otp.split('');
                setOtp(otpDigits);
                console.log('✅ Dev Mode: Reset OTP auto-filled:', response.data.otp);
            }

            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const errs = getValidationErrors({ password: newPassword, confirmPassword }, { checkConfirm: true });
        if (errs.length > 0) return setError(errs[0]);

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', {
                email,
                otp: otp.join(''),
                newPassword
            });
            setStep(4); // Success
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed. Check OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={container}>
            <div style={cardWrapper}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={card}
                >
                    <header style={header}>
                        <div style={logoBox}>
                            <KeyRound color="white" size={24} />
                        </div>
                        <h1 style={title}>
                            {step === 1 && "Reset Password"}
                            {step === 2 && "Verification"}
                            {step === 3 && "Secure Account"}
                            {step === 4 && "Success!"}
                        </h1>
                        <p style={subtitle}>
                            {step === 1 && "We'll send a recovery code to your email."}
                            {step === 2 && `Enter the 4-digit code sent to ${email}`}
                            {step === 3 && "Create a new strong password for your account."}
                            {step === 4 && "Your password has been reset successfully."}
                        </p>
                    </header>

                    {error && <div style={errorBanner}>{error}</div>}

                    <div style={formBody}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={inputStack}>
                                    <div style={inputGroup}>
                                        <label style={label}>Email Address</label>
                                        <div style={inputWrapper}>
                                            <Mail size={18} color="#94a3b8" />
                                            <input
                                                style={input}
                                                type="email"
                                                placeholder="Enter registered email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                            />
                                        </div>
                                        {email && (
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: getEmailValidation(email).color }}>
                                                {getEmailValidation(email).message}
                                            </div>
                                        )}
                                    </div>
                                    <button style={btn} onClick={handleSendOTP} disabled={!email || loading}>
                                        {loading ? 'Processing...' : 'Send Reset Code'} <ArrowRight size={20} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={inputStack}>
                                    <div style={otpContainer}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                maxLength="1"
                                                style={otpInput}
                                                value={digit}
                                                id={`otp-${i}`}
                                                onChange={e => {
                                                    const newOtp = [...otp];
                                                    newOtp[i] = e.target.value;
                                                    setOtp(newOtp);
                                                    if (e.target.value && i < 3) document.getElementById(`otp-${i + 1}`).focus();
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <button style={btn} onClick={() => setStep(3)} disabled={otp.join('').length < 4}>
                                        Verify Code <ArrowRight size={20} />
                                    </button>
                                    <button style={backTextBtn} onClick={() => setStep(1)}><ArrowLeft size={16} /> Use different email</button>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={inputStack}>
                                    <div style={inputGroup}>
                                        <label style={label}>New Password</label>
                                        <div style={inputWrapper}>
                                            <Lock size={18} color="#94a3b8" />
                                            <input
                                                style={input}
                                                type="password"
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        {newPassword && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                                    <span>Password Strength</span>
                                                    <span style={{ color: getPasswordStrength(newPassword).color, fontWeight: 700 }}>
                                                        {getPasswordStrength(newPassword).label}
                                                    </span>
                                                </div>
                                                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: getPasswordStrength(newPassword).width, background: getPasswordStrength(newPassword).color, transition: 'all 0.3s' }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div style={inputGroup}>
                                        <label style={label}>Confirm New Password</label>
                                        <div style={inputWrapper}>
                                            <ShieldCheck size={18} color="#94a3b8" />
                                            <input
                                                style={input}
                                                type="password"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                        {confirmPassword && (
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: newPassword === confirmPassword ? '#10b981' : '#ef4444' }}>
                                                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                            </div>
                                        )}
                                    </div>
                                    <div style={securityBadge}><ShieldCheck size={14} /> Enhanced Security Encryption</div>
                                    <button style={btn} onClick={handleResetPassword} disabled={!newPassword || !confirmPassword || loading}>
                                        {loading ? 'Updating...' : 'Update Password'} <RefreshCcw size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="s4" initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={successCol}>
                                    <div style={successIcon}><CheckCircle2 size={70} color="#10b981" /></div>
                                    <p style={successText}>Your account is now safe. You can login with your new password.</p>
                                    <Link to="/login" style={btn}>Return to Sign In</Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
                {step < 4 && (
                    <Link to="/login" style={backToLogin}><ArrowLeft size={16} /> Back to Sign In</Link>
                )}
            </div>
        </div>
    );
};

// Styles (Matching Register Page)
const container = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' };
const cardWrapper = { width: '100%', maxWidth: '450px' };
const card = { background: 'white', padding: '3.5rem 3rem', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const header = { textAlign: 'center', marginBottom: '2.5rem' };
const logoBox = { width: '56px', height: '56px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 16px rgba(99,102,241,0.2)' };
const title = { fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem' };
const subtitle = { color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 };
const formBody = { minHeight: '220px' };
const inputStack = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '0.6rem' };
const label = { fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' };
const inputWrapper = { display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '0 1.25rem' };
const input = { width: '100%', border: 'none', background: 'none', padding: '1rem 0', paddingLeft: '0.75rem', fontSize: '1rem', outline: 'none', color: '#1e293b', fontWeight: 600 };
const btn = { width: '100%', background: 'var(--primary)', color: 'white', border: 'none', padding: '1.1rem', borderRadius: '18px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' };
const otpContainer = { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '1rem' };
const otpInput = { width: '55px', height: '65px', borderRadius: '16px', border: '2px solid #e2e8f0', textAlign: 'center', fontSize: '1.5rem', fontWeight: 900, outline: 'none' };
const backTextBtn = { background: 'none', border: 'none', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px' };
const backToLogin = { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', marginTop: '1.5rem', justifyContent: 'center' };
const securityBadge = { background: '#f0fdf4', color: '#166534', padding: '0.7rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' };
const errorBanner = { background: '#fef2f2', color: '#991b1b', padding: '0.85rem', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #fee2e2', marginBottom: '1.5rem', textAlign: 'center' };
const successCol = { textAlign: 'center' };
const successIcon = { marginBottom: '1.5rem' };
const successText = { color: '#64748b', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 };

export default ForgotPasswordPage;
