import { sequelize } from './db.js';

async function addPaymentTrackingColumns() {
    try {
        console.log('🔧 Adding payment tracking columns to Orders table...');

        // For SQLite - Add columns one by one
        await sequelize.query(`
            ALTER TABLE Orders ADD COLUMN paymentChangedAtDelivery INTEGER DEFAULT 0;
        `).catch(err => {
            if (err.message.includes('duplicate column name')) {
                console.log('ℹ️  paymentChangedAtDelivery column already exists');
            } else {
                throw err;
            }
        });

        await sequelize.query(`
            ALTER TABLE Orders ADD COLUMN paymentCollectedBy VARCHAR(255);
        `).catch(err => {
            if (err.message.includes('duplicate column name')) {
                console.log('ℹ️  paymentCollectedBy column already exists');
            } else {
                throw err;
            }
        });

        console.log('✅ Payment tracking columns added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addPaymentTrackingColumns();
