// src/createAdmin.js
import dotenv from 'dotenv';
import { sequelize, Admin } from './models/index.js'; // ✅ Correct import

dotenv.config();

const createAdmin = async () => {
    try {
        const requiredEnv = ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD'];
        for (const key of requiredEnv) {
            if (!process.env[key]) {
                throw new Error(`Missing required environment variable: ${key}`);
            }
        }

        await sequelize.authenticate();
        console.log('✅ DB authenticated');

        await sequelize.sync();
        console.log('✅ Models synced');

        const email = 'admin@viexports.com';
        const password = 'Admin@123';

        const existing = await Admin.findOne({ where: { email } });
        if (existing) {
            console.log('⚠️ Admin already exists:', email);
            return;
        }

        // ❌ DO NOT hash here — model will handle it
        const admin = await Admin.create({ email, password });
        console.log('✅ Admin created:', admin.email);

    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
    } finally {
        await sequelize.close();
        process.exit();
    }
};

// Only run if called directly
if (process.argv[1].endsWith('createAdmin.js')) {
    createAdmin();
}

export default createAdmin;
