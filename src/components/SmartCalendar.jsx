import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SmartCalendar = ({
    data = {},
    onDateClick,
    title = "Calendar",
    renderCellContent // Function to render custom metrics in cell
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Validate and ensure data is an object
    const validatedData = React.useMemo(() => {
        if (typeof data === 'object' && data !== null) {
            return data;
        }
        return {};
    }, [data]);

    const getDaysInMonth = (date) => {
        try {
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        } catch (error) {
            console.error('Error getting days in month:', error);
            return 30;
        }
    };

    const getFirstDayOfMonth = (date) => {
        try {
            return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        } catch (error) {
            console.error('Error getting first day:', error);
            return 0;
        }
    };

    const formatDate = (date) => {
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate); // 0 = Sunday

    // Create calendar grid
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div style={container}>
            <div style={header}>
                <div style={titleGroup}>
                    <div style={iconBox}><Calendar size={20} /></div>
                    <div>
                        <h3 style={headerTitle}>{title}</h3>
                        <p style={headerSubtitle}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
                    </div>
                </div>
                <div style={controls}>
                    <button onClick={handlePrevMonth} style={navBtn}><ChevronLeft size={20} /></button>
                    <span style={monthLabel}>{monthNames[currentDate.getMonth()]}</span>
                    <button onClick={handleNextMonth} style={navBtn}><ChevronRight size={20} /></button>
                </div>
            </div>

            <div style={grid}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={dayHeader}>{d}</div>
                ))}

                {days.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} style={emptyCell} />;

                    const dateStr = formatDate(date);
                    const dayData = validatedData[dateStr] || null;
                    const isToday = formatDate(new Date()) === dateStr;

                    return (
                        <motion.div
                            key={dateStr}
                            whileHover={{ scale: 1.02, zIndex: 10 }}
                            onClick={() => onDateClick && onDateClick(dateStr, dayData)}
                            style={{
                                ...cell,
                                border: isToday ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                background: dayData ? '#ffffff' : '#f8fafc'
                            }}
                        >
                            <div style={dateNumber}>
                                <span style={{
                                    background: isToday ? 'var(--primary)' : 'transparent',
                                    color: isToday ? '#fff' : '#64748b',
                                    padding: '2px 6px',
                                    borderRadius: '12px',
                                    fontWeight: 700
                                }}>{date.getDate()}</span>
                            </div>

                            {dayData && (
                                <div style={metricsContainer}>
                                    {renderCellContent ? renderCellContent(dayData) : (
                                        <div style={dotIndicator} />
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

// Styles
const container = {
    background: '#ffffff',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
};

const header = {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc'
};

const titleGroup = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const iconBox = {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'white',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary)'
};

const headerTitle = {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 900,
    color: '#0f172a'
};

const headerSubtitle = {
    margin: 0,
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: 600
};

const controls = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'white',
    padding: '0.25rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
};

const navBtn = {
    background: 'none',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
};

const monthLabel = {
    fontWeight: 800,
    fontSize: '0.9rem',
    color: '#334155',
    minWidth: '80px',
    textAlign: 'center'
};

const grid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    background: '#e2e8f0' // color for borders
};

const dayHeader = {
    background: '#f1f5f9',
    padding: '1rem',
    textAlign: 'center',
    fontWeight: 800,
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase'
};

const cell = {
    background: 'white',
    minHeight: '120px',
    padding: '0.75rem',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'background 0.2s'
};

const emptyCell = {
    background: '#f8fafc',
    minHeight: '120px'
};

const dateNumber = {
    display: 'flex',
    justifyContent: 'flex-end',
    fontSize: '0.8rem'
};

const metricsContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '0.7rem'
};

const dotIndicator = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--primary)',
    alignSelf: 'center'
};

export default SmartCalendar;
