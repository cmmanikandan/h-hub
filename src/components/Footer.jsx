import React from 'react';
import { ShoppingBag, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
            <div style={gridStyle} className="section-shell">
                    {/* Brand Section */}
                    <div style={brandSection}>
                        <Link to="/" style={logoStyle}>
                            <ShoppingBag color="var(--primary)" size={28} />
                            <span style={logoText}>H-Hub</span>
                        </Link>
                        <p style={descriptionStyle}>
                            Your one-stop destination for premium products. Experience the best in quality, delivery, and customer service.
                        </p>
                        <div style={socialLinks}>
                            <SocialIcon icon={<Facebook size={18} />} />
                            <SocialIcon icon={<Twitter size={18} />} />
                            <SocialIcon icon={<Instagram size={18} />} />
                            <SocialIcon icon={<Youtube size={18} />} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={columnStyle}>
                        <h3 style={headingStyle}>Quick Links</h3>
                        <ul style={listStyle}>
                            <li><Link to="/" style={linkStyle} className="link-animated">Home</Link></li>
                            <li><Link to="/shop" style={linkStyle} className="link-animated">Shop Now</Link></li>
                            <li><Link to="/cart" style={linkStyle} className="link-animated">My Cart</Link></li>
                            <li><Link to="/user/profile" style={linkStyle} className="link-animated">My Account</Link></li>
                            <li><Link to="/user/orders" style={linkStyle} className="link-animated">Order History</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div style={columnStyle}>
                        <h3 style={headingStyle}>Customer Care</h3>
                        <ul style={listStyle}>
                            <li><Link to="#" style={linkStyle} className="link-animated">Help Center</Link></li>
                            <li><Link to="#" style={linkStyle} className="link-animated">Terms & Conditions</Link></li>
                            <li><Link to="#" style={linkStyle} className="link-animated">Privacy Policy</Link></li>
                            <li><Link to="#" style={linkStyle} className="link-animated">Returns & Refunds</Link></li>
                            <li><Link to="#" style={linkStyle} className="link-animated">Shipping Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div style={columnStyle}>
                        <h3 style={headingStyle}>Stay Updated</h3>
                        <p style={textStyle}>Subscribe to get the latest news and exclusive offers.</p>
                        <div style={newsletterBox}>
                            <input type="email" placeholder="Enter your email" style={inputStyle} />
                            <button style={btnStyle} className="btn-glow">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                        <div style={contactInfo}>
                            <div style={contactItem}>
                                <Mail size={16} /> <span>support@hhub.com</span>
                            </div>
                            <div style={contactItem}>
                                <Phone size={16} /> <span>+1 234 567 890</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={bottomBar}>
                    <p>&copy; {new Date().getFullYear()} H-Hub. All rights reserved.</p>
                    <div style={paymentMethods}>
                        <span>Secure Payments</span>
                        <div style={paymentIcons}>
                            <div style={cardIcon}>VISA</div>
                            <div style={cardIcon}>MC</div>
                            <div style={cardIcon}>UPI</div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon }) => (
    <a href="#" style={socialIconStyle} className="card-interactive" aria-label="Social media link">
        {icon}
    </a>
);

// Styles
const footerStyle = {
    background: 'linear-gradient(180deg, rgba(243, 251, 253, 0.9), rgba(237, 248, 251, 0.95))',
    color: 'var(--text-main)',
    padding: '4rem 0 1.2rem',
    marginTop: '4rem',
    borderTop: '1px solid rgba(8, 145, 178, 0.16)'
};

const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '3rem',
    marginBottom: '3rem',
    padding: '2rem',
    borderRadius: '24px'
};

const brandSection = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
};

const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    textDecoration: 'none'
};

const logoText = {
    fontSize: '1.8rem',
    fontWeight: 900,
    color: 'var(--text-main)',
    letterSpacing: '-0.5px'
};

const descriptionStyle = {
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    fontSize: '0.95rem',
    maxWidth: '35ch'
};

const socialLinks = {
    display: 'flex',
    gap: '1rem'
};

const socialIconStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    background: 'linear-gradient(180deg, #ffffff, #eef9fb)',
    border: '1px solid rgba(8, 145, 178, 0.16)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-main)',
    transition: 'all 0.2s',
    textDecoration: 'none'
};

const columnStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem'
};

const headingStyle = {
    fontSize: '1.1rem',
    fontWeight: 800,
    marginBottom: '0.5rem',
    color: 'var(--text-main)'
};

const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem'
};

const linkStyle = {
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '0.93rem',
    transition: 'color 0.2s'
};

const textStyle = {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    lineHeight: '1.5'
};

const newsletterBox = {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    padding: '0.4rem',
    borderRadius: '14px',
    border: '1px solid rgba(8, 145, 178, 0.2)',
    background: '#ffffff'
};

const inputStyle = {
    flex: 1,
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(8, 145, 178, 0.16)',
    background: 'linear-gradient(180deg, #ffffff, #f4fbfd)',
    color: 'var(--text-main)',
    outline: 'none'
};

const btnStyle = {
    background: 'linear-gradient(130deg, var(--primary), var(--accent))',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    width: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
};

const contactInfo = {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem'
};

const contactItem = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
};

const bottomBar = {
    borderTop: '1px solid rgba(8, 145, 178, 0.16)',
    paddingTop: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
};

const paymentMethods = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const paymentIcons = {
    display: 'flex',
    gap: '0.5rem'
};

const cardIcon = {
    background: 'linear-gradient(180deg, #ffffff, #eef9fb)',
    border: '1px solid rgba(8, 145, 178, 0.16)',
    padding: '2px 6px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    color: 'var(--text-main)'
};

export default Footer;
