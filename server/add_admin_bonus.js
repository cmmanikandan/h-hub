import { sequelize } from './db.js';

async function addAdminBonusColumn() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database');

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('Orders');

        if (columns.adminBonus) {
            console.log('ℹ️ adminBonus column already exists');
        } else {
            await queryInterface.addColumn('Orders', 'adminBonus', {
                type: sequelize.Sequelize.REAL,
                defaultValue: 0
            });
            console.log('✅ adminBonus column added successfully');
        }

    } catch (error) {
        if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
            console.log('ℹ️ adminBonus column already exists');
        } else {
            console.error('❌ Error adding adminBonus column:', error.message);
        }
    } finally {
        await sequelize.close();
    }
}

addAdminBonusColumn();
