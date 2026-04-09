const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'hub_db.sqlite'),
    logging: false
});

async function addColumns() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('🔄 Starting migration...');

        // Check and add readyForLogix column
        try {
            await queryInterface.addColumn('Orders', 'readyForLogix', {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            });
            console.log('✅ Added readyForLogix column');
        } catch (err) {
            if (err.message.includes('duplicate column')) {
                console.log('⏭️  readyForLogix already exists');
            } else {
                console.log('⚠️  readyForLogix error:', err.message);
            }
        }

        // Check and add logixHandoverAt column
        try {
            await queryInterface.addColumn('Orders', 'logixHandoverAt', {
                type: DataTypes.DATE,
                allowNull: true
            });
            console.log('✅ Added logixHandoverAt column');
        } catch (err) {
            if (err.message.includes('duplicate column')) {
                console.log('⏭️  logixHandoverAt already exists');
            } else {
                console.log('⚠️  logixHandoverAt error:', err.message);
            }
        }

        // Check and add codSubmissionStatus column
        try {
            await queryInterface.addColumn('Orders', 'codSubmissionStatus', {
                type: DataTypes.ENUM('Pending', 'Submitted', 'Verified', 'SentToHub'),
                allowNull: true,
                defaultValue: null
            });
            console.log('✅ Added codSubmissionStatus column');
        } catch (err) {
            if (err.message.includes('duplicate column')) {
                console.log('⏭️  codSubmissionStatus already exists');
            } else {
                console.log('⚠️  codSubmissionStatus error:', err.message);
            }
        }

        // Check and add codSentToHubAt column
        try {
            await queryInterface.addColumn('Orders', 'codSentToHubAt', {
                type: DataTypes.DATE,
                allowNull: true
            });
            console.log('✅ Added codSentToHubAt column');
        } catch (err) {
            if (err.message.includes('duplicate column')) {
                console.log('⏭️  codSentToHubAt already exists');
            } else {
                console.log('⚠️  codSentToHubAt error:', err.message);
            }
        }

        // Check and add codSentToHub column
        try {
            await queryInterface.addColumn('Orders', 'codSentToHub', {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            });
            console.log('✅ Added codSentToHub column');
        } catch (err) {
            if (err.message.includes('duplicate column')) {
                console.log('⏭️  codSentToHub already exists');
            } else {
                console.log('⚠️  codSentToHub error:', err.message);
            }
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addColumns();
