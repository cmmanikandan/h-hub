import { sequelize } from './db.js';

const sync = async () => {
    try {
        console.log('🔄 Force Syncing database...');
        // Force alter to update schema
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced successfully.');

        // Check if column exists
        const [results] = await sequelize.query("PRAGMA table_info(Orders);");
        const hasQuantity = results.some(col => col.name === 'quantity');
        const hasPaymentMethod = results.some(col => col.name === 'paymentMethod');

        console.log(`Column 'quantity' exists: ${hasQuantity}`);
        console.log(`Column 'paymentMethod' exists: ${hasPaymentMethod}`);

    } catch (error) {
        console.error('❌ Error syncing database:', error);
    } finally {
        await sequelize.close();
    }
};

sync();
