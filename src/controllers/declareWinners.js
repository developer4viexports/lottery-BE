import { WinningTicket } from '../models/index.js';

export const getWinners = async (req, res) => {
    try {
        const winners = await WinningTicket.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, data: winners });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching winners' });
    }
};

export const addWinner = async (req, res) => {
    const { name, ticketID } = req.body;

    if (!name || !ticketID) {
        return res.status(400).json({ success: false, message: 'Missing name or ticketID' });
    }

    try {
        const newWinner = await WinningTicket.create({ name, ticketID });
        res.status(201).json({ success: true, data: newWinner });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add winner' });
    }
};

export const updateWinner = async (req, res) => {
    const { id } = req.params;
    const { name, ticketID } = req.body;

    try {
        const updated = await WinningTicket.update(
            { name, ticketID },
            { where: { id }, returning: true }
        );

        if (!updated[0]) return res.status(404).json({ success: false, message: 'Winner not found' });

        res.json({ success: true, data: updated[1][0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update winner' });
    }
};

export const deleteWinner = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await WinningTicket.destroy({ where: { id } });
        if (!result) return res.status(404).json({ success: false, message: 'Winner not found' });

        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete winner' });
    }
};
