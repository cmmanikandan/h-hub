import { sequelize } from './db.js';

const addColumns = async () => {
    try {
        console.log('🔧 Manually adding missing columns to Orders table...');

        const columns = [
            { name: 'quantity', type: 'INTEGER DEFAULT 1' },
            { name: 'paymentMethod', type: "VARCHAR(255) DEFAULT 'COD'" },
            { name: 'productId', type: 'INTEGER NULL' },
            { name: 'coupon', type: 'VARCHAR(255) NULL' },
            { name: 'discount', type: 'FLOAT DEFAULT 0' },
            { name: 'ratingProduct', type: 'INTEGER NULL' },
            { name: 'ratingDelivery', type: 'INTEGER NULL' },
            { name: 'feedbackComment', type: 'TEXT NULL' },
            { name: 'isExpress', type: 'BOOLEAN DEFAULT 0' },
            { name: 'expressCharge', type: 'FLOAT DEFAULT 0' },
            { name: 'taxAmount', type: 'FLOAT DEFAULT 0' },
            { name: 'sellerId', type: 'VARCHAR(255) NULL' },
            { name: 'deliveryManId', type: 'VARCHAR(255) NULL' },
            { name: 'settlementStatus', type: "VARCHAR(255) DEFAULT 'Pending'" },
            { name: 'packingCost', type: 'FLOAT DEFAULT 0' },
            { name: 'shippingCost', type: 'FLOAT DEFAULT 0' },
            { name: 'adsCost', type: 'FLOAT DEFAULT 0' },
            { name: 'deliveryCharge', type: 'FLOAT DEFAULT 0' },
            { name: 'gstPercentage', type: 'FLOAT DEFAULT 0' },
            { name: 'gstAmount', type: 'FLOAT DEFAULT 0' },
            { name: 'sellerAmount', type: 'FLOAT DEFAULT 0' },
            { name: 'adminProfit', type: 'FLOAT DEFAULT 0' },
            { name: 'deliveryAmount', type: 'FLOAT DEFAULT 0' },
            { name: 'distance', type: 'FLOAT DEFAULT 0' },
            { name: 'fuelCharge', type: 'FLOAT DEFAULT 0' }
        ];

        for (const col of columns) {
            try {
                await sequelize.query(`ALTER TABLE Orders ADD COLUMN ${col.name} ${col.type};`);
                console.log(`✅ Added column: ${col.name}`);
            } catch (e) {
                console.log(`ℹ️ Column ${col.name} might already exist or error: ${e.message}`);
            }
        }

        console.log('✅ Finished updating Orders table.');

        // Also check Users table for missing columns like supercoins
        console.log('🔧 Checking Users table...');
        const userColumns = [
            { name: 'supercoins', type: 'INTEGER DEFAULT 0' },
            { name: 'wishlist', type: "TEXT DEFAULT '[]'" },
            { name: 'transactions', type: "TEXT DEFAULT '[]'" },
            { name: 'supercoinHistory', type: "TEXT DEFAULT '[]'" },
            { name: 'isVerified', type: 'BOOLEAN DEFAULT 0' }
        ];

        for (const col of userColumns) {
            try {
                await sequelize.query(`ALTER TABLE Users ADD COLUMN ${col.name} ${col.type};`);
                console.log(`✅ Added column: ${col.name} to Users`);
            } catch (e) {
                console.log(`ℹ️ Column ${col.name} in Users might already exist or error: ${e.message}`);
            }
        }

        console.log('🔧 Checking Products table for financial columns...');
        const productColumns = [
            { name: 'sellerPrice', type: 'FLOAT DEFAULT 0' },
            { name: 'platformPrice', type: 'FLOAT DEFAULT 0' },
            { name: 'adminProfit', type: 'FLOAT DEFAULT 0' },
            { name: 'packingCost', type: 'FLOAT DEFAULT 0' },
            { name: 'shippingCost', type: 'FLOAT DEFAULT 0' },
            { name: 'adsCost', type: 'FLOAT DEFAULT 0' },
            { name: 'gstPercentage', type: 'FLOAT DEFAULT 0' }
        ];

        for (const col of productColumns) {
            try {
                await sequelize.query(`ALTER TABLE Products ADD COLUMN ${col.name} ${col.type};`);
                console.log(`✅ Added column: ${col.name} to Products`);
            } catch (e) {
                console.log(`ℹ️ Column ${col.name} in Products might already exist or error: ${e.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Error adding columns:', error);
    } finally {
        await sequelize.close();
    }
};

addColumns();
