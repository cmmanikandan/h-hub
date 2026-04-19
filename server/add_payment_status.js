import { sequelize } from './db.js';

async function addPaymentStatusColumn() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database');

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('Orders');

        if (columns.paymentStatus) {
            console.log('ℹ️ paymentStatus column already exists');
        } else {
            await queryInterface.addColumn('Orders', 'paymentStatus', {
                type: sequelize.Sequelize.TEXT,
                defaultValue: 'Pending'
            });
            console.log('✅ paymentStatus column added successfully');
        }
    } catch (error) {
        if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
            console.log('ℹ️ paymentStatus column already exists');
        } else if (error.message.includes('no such table')) {
            console.log('❌ Orders table does not exist');
        } else {
            console.error('❌ Error adding paymentStatus column:', error.message);
        }
    } finally {
        await sequelize.close();
    }
}

addPaymentStatusColumn();
