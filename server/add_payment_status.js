import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'hub_db.sqlite'),
    logging: false
});

async function addPaymentStatusColumn() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database');

        await sequelize.query(`
            ALTER TABLE "Orders" ADD COLUMN "paymentStatus" TEXT DEFAULT 'Pending';
        `);

        console.log('✅ paymentStatus column added successfully');
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
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
