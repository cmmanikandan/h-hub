/**
 * Export Utilities for H-HUB Platform
 * Handles CSV, Excel, and PDF exports
 */

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data, headers = null) => {
    if (!data || data.length === 0) return '';

    // Get headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0]);

    // Create header row
    const headerRow = csvHeaders.join(',');

    // Create data rows
    const dataRows = data.map(row => {
        return csvHeaders.map(header => {
            const value = row[header];
            // Handle values with commas, quotes, or newlines
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (data, filename = 'export.csv', headers = null) => {
    const csv = convertToCSV(data, headers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Export users to CSV
 */
export const exportUsersToCSV = (users) => {
    const exportData = users.map(user => ({
        ID: user.id,
        Name: user.name,
        Email: user.email,
        Role: user.role,
        Phone: user.phone || 'N/A',
        City: user.city || 'N/A',
        State: user.state || 'N/A',
        Status: user.isActive ? 'Active' : 'Suspended',
        Verified: user.isVerified ? 'Yes' : 'No',
        'Joined Date': new Date(user.createdAt).toLocaleDateString(),
        'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
    }));

    downloadCSV(exportData, `users_export_${Date.now()}.csv`);
};

/**
 * Export orders to CSV
 */
export const exportOrdersToCSV = (orders) => {
    const exportData = orders.map(order => ({
        'Order ID': order.id,
        Product: order.productName || 'N/A',
        Customer: order.customerName || 'N/A',
        Amount: order.totalAmount,
        Status: order.status,
        'Is Express': order.isExpress ? 'Yes' : 'No',
        'Order Date': new Date(order.createdAt).toLocaleDateString(),
        'Delivery Date': order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Pending'
    }));

    downloadCSV(exportData, `orders_export_${Date.now()}.csv`);
};

/**
 * Export products to CSV
 */
export const exportProductsToCSV = (products) => {
    const exportData = products.map(product => ({
        ID: product.id,
        Name: product.name,
        Category: product.Category?.name || 'Uncategorized',
        Price: product.price,
        Stock: product.stock || 0,
        Brand: product.brand || 'N/A',
        Rating: product.rating || 'N/A',
        Badge: product.badge || 'None',
        'Created Date': new Date(product.createdAt).toLocaleDateString()
    }));

    downloadCSV(exportData, `products_export_${Date.now()}.csv`);
};

/**
 * Export sellers to CSV
 */
export const exportSellersToCSV = (sellers) => {
    const exportData = sellers.map(seller => ({
        ID: seller.id,
        Name: seller.name,
        Email: seller.email,
        Phone: seller.phone || 'N/A',
        City: seller.city || 'N/A',
        State: seller.state || 'N/A',
        Verified: seller.isVerified ? 'Yes' : 'No',
        Status: seller.isActive ? 'Active' : 'Suspended',
        'Joined Date': new Date(seller.createdAt).toLocaleDateString()
    }));

    downloadCSV(exportData, `sellers_export_${Date.now()}.csv`);
};

/**
 * Format date for export
 */
export const formatDateForExport = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format currency for export
 */
export const formatCurrencyForExport = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
};
