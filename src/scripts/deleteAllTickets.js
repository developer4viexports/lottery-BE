import { sequelize } from '../models/index.js';
import { Ticket } from '../models/index.js';

async function deleteAllTickets() {
    try {
        await sequelize.sync(); // Ensure models are loaded

        const deleted = await Ticket.destroy({ where: {}, truncate: true });
        console.log(`🗑️  All tickets deleted successfully.`);
    } catch (err) {
        console.error('❌ Error deleting tickets:', err);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

deleteAllTickets();
