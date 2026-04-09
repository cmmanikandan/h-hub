import { sequelize, Order } from './db.js';

const checkOrders = async () => {
    try {
        console.log('📦 Checking Orders table...');
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        console.log(`Found ${orders.length} recent orders.`);
        orders.forEach(o => {
            console.log(`Order ID: ${o.id}, Seller ID: ${o.sellerId}, Product: ${o.productName}, User ID: ${o.UserId}`);
        });

    } catch (error) {
        console.error('❌ Error checking orders:', error);
    } finally {
        await sequelize.close();
    }
};

checkOrders();
