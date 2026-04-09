import { User, initDB } from './db.js';

const listUsers = async () => {
    try {
        await initDB();
        
        const users = await User.findAll({
            attributes: ['id', 'email', 'name', 'role'],
            raw: true
        });
        
        console.log('\n📋 All Users:');
        console.table(users);
        
        // Search for athilakshmi
        const athiUser = users.find(u => u.email.includes('athilakshmi'));
        if (athiUser) {
            console.log('\n✅ Found user with athilakshmi:');
            console.log('Exact email:', athiUser.email);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

listUsers();
