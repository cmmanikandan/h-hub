import { sequelize } from './db.js';

// Add return-related columns to orders table
const alterTableColumns = [
    { name: 'returnStatus', type: 'TEXT', defaultValue: null },
    { name: 'returnReason', type: 'TEXT', defaultValue: null },
    { name: 'returnCondition', type: 'TEXT', defaultValue: null },
    { name: 'returnComment', type: 'TEXT', defaultValue: null },
    { name: 'returnRequestedAt', type: 'DATE', defaultValue: null },
    { name: 'refundAmount', type: 'FLOAT', defaultValue: 0 },
    { name: 'refundStatus', type: 'TEXT', defaultValue: 'Pending' },
    { name: 'refundProcessedAt', type: 'DATE', defaultValue: null },
];

async function addColumns() {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const queryInterface = sequelize.getQueryInterface();
    const existingColumns = await queryInterface.describeTable('Orders');

    for (let index = 0; index < alterTableColumns.length; index++) {
        const column = alterTableColumns[index];

        if (existingColumns[column.name]) {
            console.log(`⏭️  Column ${index + 1}: Already exists`);
            continue;
        }

        try {
            await queryInterface.addColumn('Orders', column.name, {
                type: sequelize.Sequelize[column.type],
                defaultValue: column.defaultValue
            });
            console.log(`✅ SQL ${index + 1}: Column added successfully`);
        } catch (error) {
            if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
                console.log(`⏭️  Column ${index + 1}: Already exists`);
            } else {
                console.error(`❌ Error executing SQL ${index + 1}:`, error.message);
            }
        }
    }

    console.log('\n✅ Migration completed!');
    await sequelize.close();
}

addColumns().catch(async (error) => {
    console.error('❌ Migration failed:', error.message);
    await sequelize.close();
    process.exit(1);
});
