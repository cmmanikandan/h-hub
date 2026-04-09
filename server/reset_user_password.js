import bcrypt from 'bcrypt';
import { User, initDB } from './db.js';

const resetPassword = async () => {
    try {
        await initDB();
        
        const email = 'athilashimi37@gmail.com';
        const newPassword = 'abi@2011';
        
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });
        
        console.log('✅ Password reset successfully!');
        console.log('Email:', email);
        console.log('New Password:', newPassword);
        console.log('Role:', user.role);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetPassword();
