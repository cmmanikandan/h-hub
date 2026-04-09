import { sequelize, User } from './db.js';
import bcrypt from 'bcrypt';

async function createLogixAdmin() {
    try {
        console.log('🔄 Creating H-LOGIX Admin user...');

        // Check if already exists
        const existing = await User.findOne({
            where: { email: 'admin@hlogix.com' }
        });

        if (existing) {
            console.log('⚠️ H-LOGIX Admin user already exists!');
            console.log('📧 Email: admin@hlogix.com');
            console.log('🔐 Password: HLogix@123456');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('HLogix@123456', 10);

        // Create H-LOGIX Admin user
        const logixAdmin = await User.create({
            email: 'admin@hlogix.com',
            password: hashedPassword,
            role: 'logix_admin',
            name: 'H-LOGIX Admin',
            phone: '9876543210',
            city: 'Bangalore',
            state: 'Karnataka',
            district: 'Bangalore',
            pincode: '560034',
            wallet: 0,
            gender: 'Not Set',
            dob: 'Not Set'
        });

        console.log('✅ H-LOGIX Admin user created successfully!');
        console.log('');
        console.log('═════════════════════════════════════════════');
        console.log('📊 H-LOGIX ADMIN CREDENTIALS');
        console.log('═════════════════════════════════════════════');
        console.log('📧 Email:    admin@hlogix.com');
        console.log('🔐 Password: HLogix@123456');
        console.log('🆔 User ID:  ' + logixAdmin.id);
        console.log('👤 Role:     logix_admin');
        console.log('═════════════════════════════════════════════');
        console.log('');
        console.log('💡 Login at: http://localhost:5173/login');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating H-LOGIX Admin:', error.message);
        process.exit(1);
    }
}

createLogixAdmin();
