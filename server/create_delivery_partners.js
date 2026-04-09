import { sequelize, User } from './db.js';
import bcrypt from 'bcrypt';

async function createDeliveryPartners() {
    try {
        console.log('🔄 Creating sample H-LOGIX delivery partners...');

        const partners = [
            {
                email: 'rider1@hlogix.com',
                password: 'Rider@123456',
                name: 'Rajesh Kumar',
                phone: '9876543211',
                vehicleType: 'bike',
                vehicleNumber: 'KA-01-AB-1234',
                serviceZones: JSON.stringify(['560034', '560035']),
                fuelRatePerKm: 5.50
            },
            {
                email: 'rider2@hlogix.com',
                password: 'Rider@123456',
                name: 'Priya Singh',
                phone: '9876543212',
                vehicleType: 'bike',
                vehicleNumber: 'KA-01-CD-5678',
                serviceZones: JSON.stringify(['560036', '560037']),
                fuelRatePerKm: 5.50
            },
            {
                email: 'rider3@hlogix.com',
                password: 'Rider@123456',
                name: 'Amit Patel',
                phone: '9876543213',
                vehicleType: 'van',
                vehicleNumber: 'KA-01-XY-9999',
                serviceZones: JSON.stringify(['560034', '560035', '560036']),
                fuelRatePerKm: 8.00
            }
        ];

        for (const partner of partners) {
            const existing = await User.findOne({ where: { email: partner.email } });

            if (!existing) {
                const hashedPassword = await bcrypt.hash(partner.password, 10);

                await User.create({
                    email: partner.email,
                    password: hashedPassword,
                    role: 'delivery',
                    name: partner.name,
                    phone: partner.phone,
                    vehicleType: partner.vehicleType,
                    vehicleNumber: partner.vehicleNumber,
                    serviceZones: partner.serviceZones,
                    fuelRatePerKm: partner.fuelRatePerKm,
                    deliveryPartnerStatus: 'active',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    district: 'Bangalore',
                    pincode: '560034',
                    wallet: 5000,
                    gender: 'Not Set',
                    dob: 'Not Set'
                });
                console.log(`✅ Created: ${partner.name}`);
            } else {
                console.log(`⚠️ Already exists: ${partner.email}`);
            }
        }

        console.log('');
        console.log('═════════════════════════════════════════════');
        console.log('📦 SAMPLE DELIVERY PARTNERS CREATED');
        console.log('═════════════════════════════════════════════');
        console.log('');
        console.log('Partner 1:');
        console.log('  📧 Email: rider1@hlogix.com');
        console.log('  🔐 Password: Rider@123456');
        console.log('  🏍️ Vehicle: Bike (KA-01-AB-1234)');
        console.log('  📍 Zones: 560034, 560035');
        console.log('');
        console.log('Partner 2:');
        console.log('  📧 Email: rider2@hlogix.com');
        console.log('  🔐 Password: Rider@123456');
        console.log('  🏍️ Vehicle: Bike (KA-01-CD-5678)');
        console.log('  📍 Zones: 560036, 560037');
        console.log('');
        console.log('Partner 3:');
        console.log('  📧 Email: rider3@hlogix.com');
        console.log('  🔐 Password: Rider@123456');
        console.log('  🚐 Vehicle: Van (KA-01-XY-9999)');
        console.log('  📍 Zones: 560034, 560035, 560036');
        console.log('');
        console.log('═════════════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating delivery partners:', error.message);
        process.exit(1);
    }
}

createDeliveryPartners();
