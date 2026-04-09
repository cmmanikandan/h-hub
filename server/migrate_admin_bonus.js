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

async function addAdminBonusColumn() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database');

        // Add adminBonus column if it doesn't exist
        await sequelize.query(`
            ALTER TABLE "Orders" ADD COLUMN "adminBonus" REAL DEFAULT 0;
        `);

        console.log('✅ adminBonus column added successfully');

    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('ℹ️ adminBonus column already exists');
        } else if (error.message.includes('no such table')) {
            console.log('❌ Orders table does not exist');
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        await sequelize.close();
        console.log('✓ Database connection closed');
    }
}

addAdminBonusColumn();
