import { sequelize } from './db.js';

async function fixOrdersTable() {
    try {
        console.log('🔧 Adding codClaimedByAdmin column to Orders table...');

        await sequelize.query(`
            ALTER TABLE Orders ADD COLUMN codClaimedByAdmin INTEGER DEFAULT 0;
        `);

        console.log('✅ Column codClaimedByAdmin added successfully!');

        // Also add other missing columns if needed
        const columnsToAdd = [
            { name: 'rawPrice', type: 'REAL DEFAULT 0' },
            { name: 'roundedPrice', type: 'REAL DEFAULT 0' },
            { name: 'superCoinsFromRounding', type: 'INTEGER DEFAULT 0' },
            { name: 'superCoinsFromOrder', type: 'INTEGER DEFAULT 0' },
            { name: 'totalSuperCoins', type: 'INTEGER DEFAULT 0' }
        ];

        for (const col of columnsToAdd) {
            try {
                await sequelize.query(`ALTER TABLE Orders ADD COLUMN ${col.name} ${col.type};`);
                console.log(`✅ Column ${col.name} added`);
            } catch (err) {
                console.log(`ℹ️  Column ${col.name} might already exist`);
            }
        }

        process.exit(0);
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('✅ Column already exists!');
            process.exit(0);
        } else {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }
}

fixOrdersTable();
