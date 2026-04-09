/**
 * Bulk Actions Component
 * Allows selecting multiple items and performing batch operations
 */

import React from 'react';
import { CheckSquare, Square, Trash2, Ban, CheckCircle, Download } from 'lucide-react';
import { useState } from 'react';
import StatusPopup from './StatusPopup';

const BulkActions = ({
    selectedItems = [],
    totalItems = 0,
    onSelectAll,
    onDeselectAll,
    onBulkDelete,
    onBulkActivate,
    onBulkDeactivate,
    onBulkExport
}) => {
    const allSelected = selectedItems.length === totalItems && totalItems > 0;
    const someSelected = selectedItems.length > 0 && selectedItems.length < totalItems;
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, message, title, onAction });
    };

    const confirmAction = (msg, action, title = 'Confirm Action', type = 'confirm') => {
        showStatus(type, msg, title, () => {
            action();
            setPopup(prev => ({ ...prev, show: false }));
        });
    };

    return (
        <div style={containerStyle}>
            {selectedItems.length > 0 ? (
                <div style={activeBarStyle}>
                    <div style={selectionInfoStyle}>
                        <button
                            onClick={allSelected ? onDeselectAll : onSelectAll}
                            style={checkboxButtonStyle}
                        >
                            {allSelected ? (
                                <CheckSquare size={20} color="#6366f1" />
                            ) : someSelected ? (
                                <div style={indeterminateStyle}>
                                    <CheckSquare size={20} color="#6366f1" />
                                </div>
                            ) : (
                                <Square size={20} color="#94a3b8" />
                            )}
                        </button>
                        <span style={countTextStyle}>
                            {selectedItems.length} selected
                        </span>
                    </div>

                    <div style={actionsContainerStyle}>
                        {onBulkExport && (
                            <button
                                onClick={() => onBulkExport(selectedItems)}
                                style={actionButtonStyle}
                                title="Export Selected"
                            >
                                <Download size={16} />
                                <span>Export</span>
                            </button>
                        )}

                        {onBulkActivate && (
                            <button
                                onClick={() => onBulkActivate(selectedItems)}
                                style={{ ...actionButtonStyle, ...activateButtonStyle }}
                                title="Activate Selected"
                            >
                                <CheckCircle size={16} />
                                <span>Activate</span>
                            </button>
                        )}

                        {onBulkDeactivate && (
                            <button
                                onClick={() => onBulkDeactivate(selectedItems)}
                                style={{ ...actionButtonStyle, ...deactivateButtonStyle }}
                                title="Deactivate Selected"
                            >
                                <Ban size={16} />
                                <span>Deactivate</span>
                            </button>
                        )}

                        {onBulkDelete && (
                            <button
                                onClick={() => {
                                    confirmAction(
                                        `Delete ${selectedItems.length} items permanently?`,
                                        () => onBulkDelete(selectedItems),
                                        'Delete Items',
                                        'delete'
                                    );
                                }}
                                style={{ ...actionButtonStyle, ...deleteButtonStyle }}
                                title="Delete Selected"
                            >
                                <Trash2 size={16} />
                                <span>Delete</span>
                            </button>
                        )}

                        <button
                            onClick={onDeselectAll}
                            style={cancelButtonStyle}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div style={inactiveBarStyle}>
                    <button
                        onClick={onSelectAll}
                        style={selectAllButtonStyle}
                    >
                        <Square size={18} color="#94a3b8" />
                        <span>Select All</span>
                    </button>
                </div>
            )}

            <StatusPopup
                show={popup.show}
                type={popup.type}
                title={popup.title}
                message={popup.message}
                onAction={popup.onAction}
                onClose={() => setPopup(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

// Styles
const containerStyle = {
    marginBottom: '1rem'
};

const activeBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
};

const inactiveBarStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
};

const selectionInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const checkboxButtonStyle = {
    background: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const indeterminateStyle = {
    opacity: 0.6
};

const countTextStyle = {
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: '600'
};

const actionsContainerStyle = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
};

const actionButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#475569'
};

const activateButtonStyle = {
    color: '#10b981',
    background: 'rgba(16, 185, 129, 0.1)'
};

const deactivateButtonStyle = {
    color: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.1)'
};

const deleteButtonStyle = {
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)'
};

const cancelButtonStyle = {
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer'
};

const selectAllButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer'
};

export default BulkActions;
