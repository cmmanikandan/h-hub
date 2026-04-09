import { sequelize, ProfitTransaction, Order, User, ProfitRule } from './db.js';

async function resetFinance() {
    console.log('--- RESETTING FINANCIAL DATA ---');
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Clear all profit transactions
        const txCount = await ProfitTransaction.destroy({ where: {}, truncate: true });
        console.log(`Cleared ${txCount} Profit Transactions.`);

        // 2. Reset user wallets, supercoins, and earnings
        const [usersUpdated] = await User.update(
            { wallet: 0, supercoins: 0 },
            { where: {} }
        );
        console.log(`Reset wallets for ${usersUpdated} users.`);

        // 3. Reset Order financial fields to Pending and nullify distribution fields if needed
        const [ordersUpdated] = await Order.update(
            { settlementStatus: 'Pending' },
            { where: {} }
        );
        console.log(`Set ${ordersUpdated} orders back to Pending settlement.`);

        // 4. (Optional) Remove legacy bonus or old data if specific columns exist
        // Note: We don't drop columns here, just reset data values.

        console.log('--- FINANCIAL RESET COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('Reset failed:', error);
        process.exit(1);
    }
}

resetFinance();
