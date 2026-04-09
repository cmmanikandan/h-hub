import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

const MyNotifications = () => {
    const { profile } = useAuth();

    return (
        <div style={container}>
            <header style={header}>
                <h1 style={title}><Bell size={28} /> Notifications</h1>
            </header>

            <div style={notificationList}>
                {(profile?.notifications || []).map((notif) => (
                    <div key={notif.id} style={{ ...notifCard, background: notif.read ? 'var(--glass)' : 'rgba(99,102,241,0.05)' }}>
                        <div style={notifDot}>{!notif.read && <div style={dot} />}</div>
                        <div style={notifContent}>
                            <div style={notifTitle}>{notif.title}</div>
                            <div style={notifMsg}>{notif.msg}</div>
                            <div style={notifTime}>{notif.time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Styles
const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const header = { marginBottom: '2rem' };
const title = { fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' };
const notificationList = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const notifCard = { background: 'var(--glass)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' };
const notifDot = { width: '8px', paddingTop: '6px' };
const dot = { width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' };
const notifContent = { flex: 1 };
const notifTitle = { fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' };
const notifMsg = { fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' };
const notifTime = { fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 };

export default MyNotifications;
