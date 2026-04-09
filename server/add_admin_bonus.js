import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

async function addAdminBonusColumn() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database');

        // Add adminBonus column if it doesn't exist
        await sequelize.query(`
            ALTER TABLE Orders ADD COLUMN adminBonus REAL DEFAULT 0;
        `);

        console.log('✅ adminBonus column added successfully');

        // Verify the column was added
        const [results] = await sequelize.query(`PRAGMA table_info(Orders);`);
        const hasColumn = results.some(col => col.name === 'adminBonus');

        if (hasColumn) {
            console.log('✓ Verification: adminBonus column exists');
        } else {
            console.log('⚠️ Warning: adminBonus column not found after addition');
        }

    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('ℹ️ adminBonus column already exists');
        } else {
            console.error('❌ Error adding adminBonus column:', error.message);
        }
    } finally {
        await sequelize.close();
    }
}

addAdminBonusColumn();
