import { sequelize } from './db.js';

async function addDeliveryTracking() {
    try {
        const queryInterface = sequelize.getQueryInterface();

        // Add delivery tracking columns
        await queryInterface.addColumn('Orders', 'assignedAt', {
            type: sequelize.Sequelize.DATE,
            allowNull: true
        });
        console.log('✅ assignedAt column added');

        await queryInterface.addColumn('Orders', 'expectedCompletionTime', {
            type: sequelize.Sequelize.DATE,
            allowNull: true
        });
        console.log('✅ expectedCompletionTime column added');

        await queryInterface.addColumn('Orders', 'completedAt', {
            type: sequelize.Sequelize.DATE,
            allowNull: true
        });
        console.log('✅ completedAt column added');

        await queryInterface.addColumn('Orders', 'isFined', {
            type: sequelize.Sequelize.BOOLEAN,
            defaultValue: false
        });
        console.log('✅ isFined column added');

        await queryInterface.addColumn('Orders', 'fineAmount', {
            type: sequelize.Sequelize.FLOAT,
            defaultValue: 0
        });
        console.log('✅ fineAmount column added');

        await queryInterface.addColumn('Orders', 'fineReason', {
            type: sequelize.Sequelize.STRING,
            allowNull: true
        });
        console.log('✅ fineReason column added');

        console.log('✅ All delivery tracking columns added successfully!');
        process.exit(0);
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('⚠️ Columns already exist');
            process.exit(0);
        }
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addDeliveryTracking();
