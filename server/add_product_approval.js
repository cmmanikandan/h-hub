import { sequelize } from './db.js';

async function addProductApprovalColumns() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database');

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('Products');

        if (!columns.isApproved) {
            await queryInterface.addColumn('Products', 'isApproved', {
                type: sequelize.Sequelize.BOOLEAN,
                defaultValue: false
            });
            console.log('✅ isApproved column added');
        } else {
            console.log('ℹ️ isApproved column already exists');
        }

        if (!columns.approvedAt) {
            await queryInterface.addColumn('Products', 'approvedAt', {
                type: sequelize.Sequelize.DATE,
                allowNull: true
            });
            console.log('✅ approvedAt column added');
        } else {
            console.log('ℹ️ approvedAt column already exists');
        }

        if (!columns.approvedBy) {
            await queryInterface.addColumn('Products', 'approvedBy', {
                type: sequelize.Sequelize.TEXT,
                allowNull: true
            });
            console.log('✅ approvedBy column added');
        } else {
            console.log('ℹ️ approvedBy column already exists');
        }

        await sequelize.query(`UPDATE "Products" SET "isApproved" = 1 WHERE "isApproved" IS NULL;`);
        console.log('✅ Existing products marked as approved');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await sequelize.close();
    }
}

addProductApprovalColumns();
