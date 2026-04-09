import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'hub_db.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err);
        process.exit(1);
    }
    console.log('✅ Connected to database');
});

// Add return-related columns to orders table
const alterTableSQL = [
    `ALTER TABLE Orders ADD COLUMN returnStatus TEXT DEFAULT NULL;`,
    `ALTER TABLE Orders ADD COLUMN returnReason TEXT DEFAULT NULL;`,
    `ALTER TABLE Orders ADD COLUMN returnCondition TEXT DEFAULT NULL;`,
    `ALTER TABLE Orders ADD COLUMN returnComment TEXT DEFAULT NULL;`,
    `ALTER TABLE Orders ADD COLUMN returnRequestedAt DATETIME DEFAULT NULL;`,
    `ALTER TABLE Orders ADD COLUMN refundAmount FLOAT DEFAULT 0;`,
    `ALTER TABLE Orders ADD COLUMN refundStatus TEXT DEFAULT 'Pending';`,
    `ALTER TABLE Orders ADD COLUMN refundProcessedAt DATETIME DEFAULT NULL;`,
];

let completed = 0;

alterTableSQL.forEach((sql, index) => {
    db.run(sql, (err) => {
        if (err) {
            // Column might already exist, that's okay
            if (err.message.includes('duplicate column name')) {
                console.log(`⏭️  Column ${index + 1}: Already exists`);
            } else {
                console.error(`❌ Error executing SQL ${index + 1}:`, err.message);
            }
        } else {
            console.log(`✅ SQL ${index + 1}: Column added successfully`);
        }

        completed++;
        if (completed === alterTableSQL.length) {
            console.log('\n✅ Migration completed!');
            db.close();
            process.exit(0);
        }
    });
});
