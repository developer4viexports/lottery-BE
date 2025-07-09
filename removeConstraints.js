// removeConstraints.js
import { sequelize } from './models/index.js';

const dropConstraints = async () => {
    try {
        await sequelize.query('ALTER TABLE "Tickets" DROP CONSTRAINT IF EXISTS "Tickets_phone_key";');
        await sequelize.query('ALTER TABLE "Tickets" DROP CONSTRAINT IF EXISTS "Tickets_email_key";');
        await sequelize.query('ALTER TABLE "Tickets" DROP CONSTRAINT IF EXISTS "Tickets_instagram_key";');
        await sequelize.query('ALTER TABLE "Tickets" DROP CONSTRAINT IF EXISTS "Tickets_numbers_key";');
        console.log('✅ Constraints removed successfully.');
    } catch (err) {
        console.error('❌ Failed to drop constraints:', err);
    } finally {
        await sequelize.close();
    }
};

dropConstraints();
