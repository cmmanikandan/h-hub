
import { sequelize } from './db.js';

const debugDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected');

        const [results] = await sequelize.query("PRAGMA table_info(Users);");
        console.log('--- Users Table Schema ---');
        console.table(results);

        const [orderResults] = await sequelize.query("PRAGMA table_info(Orders);");
        console.log('--- Orders Table Schema ---');
        console.table(orderResults);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

debugDB();
