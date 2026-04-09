// Reviews Component
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';
import api from '../utils/api';
import StatusPopup from './StatusPopup';

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, message, title, onAction });
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await api.get(`/products/${productId}/reviews`);
                setReviews(res.data.reviews || []);
                setStats(res.data.stats);
            } catch (__) {
                console.error('Failed to fetch reviews:', __);
                setReviews([]);
            }
        };
        fetchReviews();
    }, [productId]);

    const submitReview = async () => {
        try {
            await api.post(`/products/${productId}/reviews`, {
                userId: localStorage.getItem('hub_user') ? JSON.parse(localStorage.getItem('hub_user')).id : null,
                rating,
                comment
            });
            setShowSuccess(true);
            setShowForm(false);
            setComment('');
            setRating(5);
            setTimeout(() => setShowSuccess(false), 3000);
            // Refetch reviews
            const res = await api.get(`/products/${productId}/reviews`);
            setReviews(res.data.reviews || []);
            setStats(res.data.stats);
        } catch {
            showStatus('failed', 'Failed to submit review', 'Error');
        }
    };

    return (
        <div style={container}>
            <h2 style={title}>Customer Reviews</h2>

            {stats && (
                <div style={statsRow}>
                    <div style={statBox}>
                        <div style={ratingNumber}>{stats.avgRating?.toFixed(1) || 0}/5</div>
                        <div style={stars}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < Math.round(stats.avgRating) ? '#FFD700' : '#E5E7EB'} />
                            ))}
                        </div>
                        <div style={reviewCount}>{stats.total} reviews</div>
                    </div>

                    <div style={ratingBars}>
                        {[5, 4, 3, 2, 1].map(r => (
                            <div key={r} style={barRow}>
                                <span style={barLabel}>{r} Star</span>
                                <div style={progressBar}>
                                    <div style={{ ...progressFill, width: `${(stats[['five', 'four', 'three', 'two', 'one'][5 - r]] || 0) / stats.total * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button onClick={() => setShowForm(!showForm)} style={addReviewBtn}>
                ⭐ Add Review
            </button>

            {showSuccess && (
                <div style={successCard}>
                    <div style={successContent}>
                        <div style={successIcon}>🎉</div>
                        <h3 style={successTitle}>Thank you for your feedback!</h3>
                        <p style={successMessage}>Your review has been submitted successfully and will appear soon.</p>
                        <button onClick={() => setShowSuccess(false)} style={successBtn}>Got it!</button>
                    </div>
                </div>
            )}

            {showForm && (
                <div style={formBox}>
                    <div style={ratingPicker}>
                        {[1, 2, 3, 4, 5].map(r => (
                            <Star
                                key={r}
                                size={28}
                                style={{ cursor: 'pointer' }}
                                fill={r <= rating ? '#FFD700' : '#E5E7EB'}
                                onClick={() => setRating(r)}
                            />
                        ))}
                    </div>
                    <textarea
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={textarea}
                    />
                    <div style={buttonGroup}>
                        <button onClick={submitReview} style={submitBtn}>Submit Review</button>
                        <button onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={reviewsList}>
                {Array.isArray(reviews) && reviews.length > 0 ? (
                    reviews.map(r => (
                        <div key={r.id} style={reviewCard}>
                            <div style={reviewHeader}>
                                <User size={20} style={{ marginRight: '10px' }} />
                                <div>
                                    <div style={reviewerName}>{r.User?.name || 'Anonymous'}</div>
                                    <small style={reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</small>
                                </div>
                            </div>
                            <div style={reviewRating}>
                                {[...Array(r.rating)].map((_, i) => <Star key={i} size={16} fill="#FFD700" />)}
                            </div>
                            <p style={reviewComment}>{r.comment}</p>
                            <div style={reviewFooter}>
                                <ThumbsUp size={16} /> {r.helpfulCount} found helpful
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                )}
            </div>


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

const container = { padding: '2rem', background: 'var(--glass)', borderRadius: '16px', marginTop: '2rem' };
const title = { fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' };
const statsRow = { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' };
const statBox = { textAlign: 'center' };
const ratingNumber = { fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' };
const stars = { display: 'flex', justifyContent: 'center', gap: '0.25rem', margin: '0.5rem 0' };
const reviewCount = { fontSize: '0.9rem', color: 'var(--text-muted)' };
const ratingBars = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const barRow = { display: 'flex', alignItems: 'center', gap: '1rem' };
const barLabel = { width: '60px', fontSize: '0.9rem' };
const progressBar = { flex: 1, height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' };
const progressFill = { height: '100%', background: '#FFD700', transition: 'width 0.3s' };
const addReviewBtn = { padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, marginBottom: '1rem' };
const formBox = { background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--glass-border)' };
const ratingPicker = { display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' };
const textarea = { width: '100%', minHeight: '100px', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '1rem', fontFamily: 'inherit' };
const buttonGroup = { display: 'flex', gap: '1rem' };
const submitBtn = { flex: 1, padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 };
const cancelBtn = { flex: 1, padding: '0.75rem', background: '#E5E7EB', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 };
const reviewsList = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const reviewCard = { background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB' };
const reviewHeader = { display: 'flex', alignItems: 'center', marginBottom: '0.5rem' };
const reviewerName = { fontWeight: 700, fontSize: '0.95rem' };
const reviewDate = { color: 'var(--text-muted)', fontSize: '0.85rem' };
const reviewRating = { display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' };
const reviewComment = { margin: '0.5rem 0', lineHeight: 1.6, color: 'var(--text-main)' };
const reviewFooter = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' };
const successCard = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const successContent = { background: 'white', padding: '2rem', borderRadius: '20px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
const successIcon = { fontSize: '3rem', marginBottom: '1rem' };
const successTitle = { fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' };
const successMessage = { fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem' };
const successBtn = { background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' };

export default ProductReviews;
