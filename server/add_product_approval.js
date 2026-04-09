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

async function addProductApprovalColumns() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database');

        try {
            await sequelize.query(`ALTER TABLE "Products" ADD COLUMN "isApproved" INTEGER DEFAULT 0;`);
            console.log('✅ isApproved column added');
        } catch (error) {
            if (!error.message.includes('duplicate column name')) {
                throw error;
            }
            console.log('ℹ️ isApproved column already exists');
        }

        try {
            await sequelize.query(`ALTER TABLE "Products" ADD COLUMN "approvedAt" DATETIME;`);
            console.log('✅ approvedAt column added');
        } catch (error) {
            if (!error.message.includes('duplicate column name')) {
                throw error;
            }
            console.log('ℹ️ approvedAt column already exists');
        }

        try {
            await sequelize.query(`ALTER TABLE "Products" ADD COLUMN "approvedBy" TEXT;`);
            console.log('✅ approvedBy column added');
        } catch (error) {
            if (!error.message.includes('duplicate column name')) {
                throw error;
            }
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
