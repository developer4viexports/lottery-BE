// src/controllers/generatedTicketController.js

import { GeneratedTicket } from '../models/index.js';

// Controller function to get all generated tickets
export const getAllGeneratedTickets = async (req, res) => {
    try {
        // Fetch all tickets from the GeneratedTicket model
        const tickets = await GeneratedTicket.findAll({
            order: [['createdAt', 'DESC']]  // Optionally, you can order them by creation date
        });

        if (!tickets.length) {
            return res.status(404).json({
                success: false,
                message: 'No tickets found.'
            });
        }

        // Return the fetched tickets
        res.status(200).json({
            success: true,
            data: tickets
        });
    } catch (err) {
        console.error('❌ Error fetching generated tickets:', err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

export const deleteAllGeneratedTickets = async (req, res) => {
    try {
        // Delete all tickets from the GeneratedTicket model
        const result = await GeneratedTicket.destroy({
            where: {},  // Empty condition to delete all rows
        });

        if (result === 0) {
            return res.status(404).json({ success: false, message: 'No tickets found to delete.' });
        }

        res.status(200).json({
            success: true,
            message: `${result} tickets deleted successfully.`,
        });
    } catch (err) {
        console.error('❌ Error deleting all tickets:', err);
        res.status(500).json({ success: false, message: 'Failed to delete tickets' });
    }
};
