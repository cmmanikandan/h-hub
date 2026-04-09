/**
 * Advanced Filter Component for Admin Dashboard
 * Supports date range, status, role, and search filters
 */

import React, { useState } from 'react';
import { Filter, X, Calendar, Search } from 'lucide-react';

const AdvancedFilters = ({ onFilterChange, filterOptions = {} }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        role: 'all',
        status: 'all',
        verified: 'all',
        dateFrom: '',
        dateTo: ''
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            role: 'all',
            status: 'all',
            verified: 'all',
            dateFrom: '',
            dateTo: ''
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const activeFilterCount = Object.values(filters).filter(v =>
        v && v !== 'all' && v !== ''
    ).length;

    return (
        <div style={containerStyle}>
            <button
                onClick={() => setShowFilters(!showFilters)}
                style={filterButtonStyle}
            >
                <Filter size={16} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                    <span style={badgeStyle}>{activeFilterCount}</span>
                )}
            </button>

            {showFilters && (
                <div style={filterPanelStyle}>
                    <div style={filterHeaderStyle}>
                        <h4 style={filterTitleStyle}>Advanced Filters</h4>
                        <button onClick={() => setShowFilters(false)} style={closeButtonStyle}>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={filterGridStyle}>
                        {/* Search Filter */}
                        <div style={filterGroupStyle}>
                            <label style={labelStyle}>Search</label>
                            <div style={searchWrapperStyle}>
                                <Search size={14} color="#94a3b8" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        {filterOptions.showRole !== false && (
                            <div style={filterGroupStyle}>
                                <label style={labelStyle}>Role</label>
                                <select
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="user">User</option>
                                    <option value="seller">Seller</option>
                                    <option value="delivery">Delivery</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}

                        {/* Status Filter */}
                        {filterOptions.showStatus !== false && (
                            <div style={filterGroupStyle}>
                                <label style={labelStyle}>Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        )}

                        {/* Verification Filter */}
                        {filterOptions.showVerified !== false && (
                            <div style={filterGroupStyle}>
                                <label style={labelStyle}>Verification</label>
                                <select
                                    value={filters.verified}
                                    onChange={(e) => handleFilterChange('verified', e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="all">All</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                            </div>
                        )}

                        {/* Date From */}
                        <div style={filterGroupStyle}>
                            <label style={labelStyle}>From Date</label>
                            <div style={dateWrapperStyle}>
                                <Calendar size={14} color="#94a3b8" />
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Date To */}
                        <div style={filterGroupStyle}>
                            <label style={labelStyle}>To Date</label>
                            <div style={dateWrapperStyle}>
                                <Calendar size={14} color="#94a3b8" />
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={filterActionsStyle}>
                        <button onClick={clearFilters} style={clearButtonStyle}>
                            Clear All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const containerStyle = {
    position: 'relative'
};

const filterButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const badgeStyle = {
    background: '#6366f1',
    color: '#fff',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: '700'
};

const filterPanelStyle = {
    position: 'absolute',
    top: 'calc(100% + 0.5rem)',
    right: 0,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    minWidth: '500px',
    zIndex: 1000
};

const filterHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
};

const filterTitleStyle = {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '0.25rem'
};

const filterGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
};

const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
};

const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const searchWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
};

const dateWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
};

const inputStyle = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '0.875rem',
    color: '#1e293b'
};

const selectStyle = {
    padding: '0.5rem 0.75rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#1e293b',
    outline: 'none',
    cursor: 'pointer'
};

const filterActionsStyle = {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end'
};

const clearButtonStyle = {
    padding: '0.5rem 1rem',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer'
};

export default AdvancedFilters;
