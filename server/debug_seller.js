import { sequelize, Order, User } from './db.js';

const inspectData = async () => {
    try {
        console.log('🔍 Inspecting Database Data...');

        // 1. Find the user "athi lakshimi"
        const users = await User.findAll({
            where: { name: 'athi lakshimi' }
        });

        if (users.length === 0) {
            console.log('❌ User "athi lakshimi" not found!');
        } else {
            console.log(`✅ Found User(s):`);
            users.forEach(u => {
                console.log(`   - Name: ${u.name}, ID: ${u.id}, Role: ${u.role}`);
            });
        }

        // 2. Fetch recent orders
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        console.log('\n📦 Recent Orders:');
        orders.forEach(o => {
            console.log(`   - Order ID: ${o.id}`);
            console.log(`     Product: ${o.productName}`);
            console.log(`     Seller ID: ${o.sellerId}`);
            console.log(`     User ID (Buyer): ${o.UserId}`);
            console.log(`     Created: ${o.createdAt}`);
            console.log('-----------------------------------');
        });

    } catch (error) {
        console.error('❌ Error inspecting data:', error);
    } finally {
        await sequelize.close();
    }
};

inspectData();
