import { PrizeTier } from '../models/index.js';

// GET all
export const getAllPrizeTiers = async (req, res) => {
    try {
        const entries = await PrizeTier.findAll({ order: [['matchType', 'ASC']] });
        res.json({ success: true, data: entries });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch prize tiers' });
    }
};

// POST create
export const createPrizeTier = async (req, res) => {
    const { matchType, ticketType, prize } = req.body;
    if (!matchType || !ticketType || !prize) {
        return res.status(400).json({ success: false, message: 'All fields required' });
    }

    try {
        const created = await PrizeTier.create({ matchType, ticketType, prize });
        res.status(201).json({ success: true, data: created });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create prize tier' });
    }
};

// PUT update
export const updatePrizeTier = async (req, res) => {
    const { id } = req.params;
    const { matchType, ticketType, prize } = req.body;

    try {
        const updated = await PrizeTier.update(
            { matchType, ticketType, prize },
            { where: { id }, returning: true }
        );

        if (!updated[0]) return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true, data: updated[1][0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update prize tier' });
    }
};

// DELETE
export const deletePrizeTier = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await PrizeTier.destroy({ where: { id } });
        if (!result) return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete prize tier' });
    }
};
