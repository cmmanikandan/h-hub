import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

// Inject CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-50%) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(-50%) scale(1);
        }
    }
`;
if (!document.querySelector('#info-tooltip-styles')) {
    style.id = 'info-tooltip-styles';
    document.head.appendChild(style);
}

const InfoTooltip = ({ title, content, position = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={iconButton}
                title="Click for more information"
            >
                <Info size={16} />
            </button>

            {isOpen && (
                <>
                    <div style={overlay} onClick={() => setIsOpen(false)} />
                    <div style={{ ...tooltip, ...(position === 'left' ? tooltipLeft : tooltipRight) }}>
                        <div style={tooltipHeader}>
                            <h4 style={tooltipTitle}>{title}</h4>
                            <button onClick={() => setIsOpen(false)} style={closeButton}>
                                <X size={16} />
                            </button>
                        </div>
                        <div style={tooltipContent}>
                            {typeof content === 'string' ? (
                                <p style={tooltipText}>{content}</p>
                            ) : (
                                content
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Styles
const iconButton = {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
    marginLeft: '8px'
};

const overlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
    backdropFilter: 'blur(2px)'
};

const tooltip = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#fff',
    border: '2px solid #6366f1',
    borderRadius: '12px',
    padding: '0',
    minWidth: '320px',
    maxWidth: '450px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    animation: 'slideIn 0.2s ease-out'
};

const tooltipRight = {};

const tooltipLeft = {};

const tooltipHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '10px 10px 0 0',
    color: '#fff'
};

const tooltipTitle = {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 700
};

const closeButton = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '4px',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    transition: 'background 0.2s'
};

const tooltipContent = {
    padding: '16px',
    maxHeight: '400px',
    overflowY: 'auto'
};

const tooltipText = {
    margin: 0,
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: '#475569'
};

export default InfoTooltip;
