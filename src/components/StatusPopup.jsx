import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Check, X, RefreshCw } from 'lucide-react';
import './StatusPopup.css';

const StatusPopup = ({
    show,
    type = 'success',
    title,
    message,
    onClose,
    onAction,
    actionLabel,
    cancelLabel = 'Cancel'
}) => {
    const MotionDiv = motion.div;

    const config = useMemo(() => {
        const configs = {
            success: {
                icon: <Check size={38} strokeWidth={2.75} />,
                title: title || 'Success',
                actionLabel: actionLabel || 'Done',
                tone: 'success'
            },
            failed: {
                icon: <X size={38} strokeWidth={2.75} />,
                title: title || 'Action failed',
                actionLabel: actionLabel || 'Try again',
                tone: 'failed'
            },
            warning: {
                icon: <AlertTriangle size={38} strokeWidth={2.75} />,
                title: title || 'Warning',
                actionLabel: actionLabel || 'Understood',
                tone: 'warning'
            },
            confirm: {
                icon: <Info size={38} strokeWidth={2.75} />,
                title: title || 'Please confirm',
                actionLabel: actionLabel || 'Proceed',
                showCancel: true,
                tone: 'confirm'
            },
            delete: {
                icon: <XCircle size={38} strokeWidth={2.5} />,
                title: title || 'Delete item',
                actionLabel: actionLabel || 'Delete',
                showCancel: true,
                tone: 'delete'
            },
            invalid: {
                icon: <XCircle size={38} strokeWidth={2.5} />,
                title: title || 'Invalid input',
                actionLabel: actionLabel || 'Fix it',
                tone: 'invalid'
            },
            changed: {
                icon: <RefreshCw size={38} strokeWidth={2.5} />,
                title: title || 'Updated',
                actionLabel: actionLabel || 'Continue',
                tone: 'changed'
            },
            saved: {
                icon: <CheckCircle size={38} strokeWidth={2.5} />,
                title: title || 'Saved',
                actionLabel: actionLabel || 'Great',
                tone: 'saved'
            }
        };

        return configs[type] || configs.success;
    }, [type, title, actionLabel]);

    useEffect(() => {
        if (!show) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <MotionDiv
                    className="status-popup-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose?.();
                        }
                    }}
                >
                    <MotionDiv
                        className={`status-popup-card status-popup-${config.tone}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label={config.title}
                        initial={{ y: 24, scale: 0.94, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 16, scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', damping: 24, stiffness: 290 }}
                    >
                        <div className="status-popup-glow" />

                        <div className="status-popup-header">
                            <div className="status-popup-eyebrow">H-Hub Notification</div>
                        </div>

                        <div className="status-popup-icon">
                            {config.icon}
                        </div>

                        <h2 className="status-popup-title">{config.title}</h2>
                        <p className="status-popup-message">{message || 'No additional details were provided.'}</p>

                        <div className="status-popup-actions">
                            {config.showCancel && (
                                <button
                                    onClick={onClose}
                                    className="status-popup-cancel"
                                >
                                    {cancelLabel}
                                </button>
                            )}
                            <button
                                onClick={onAction || onClose}
                                className="status-popup-primary"
                            >
                                {config.actionLabel}
                            </button>
                        </div>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

export default StatusPopup;
