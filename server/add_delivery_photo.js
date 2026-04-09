import { sequelize } from './db.js';

async function addDeliveryPhotoColumn() {
    try {
        console.log('🔧 Adding deliveryPhoto column to Orders table...');

        // For SQLite
        await sequelize.query(`
            ALTER TABLE Orders ADD COLUMN deliveryPhoto VARCHAR(255);
        `).catch(err => {
            if (err.message.includes('duplicate column name')) {
                console.log('ℹ️  Column already exists');
            } else {
                throw err;
            }
        });

        console.log('✅ deliveryPhoto column added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addDeliveryPhotoColumn();
