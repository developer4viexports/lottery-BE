// src/controllers/winningComboController.js
import { WinningCombination, Ticket } from '../models/index.js';
import { Op } from 'sequelize';

// src/controllers/winningComboController.js
export const createOrUpdateWinningCombination = async (req, res) => {
    try {
        const { numbers, grandQuota, silverQuota, bronzeQuota, consolationQuota } = req.body;

        // Validate input
        if (!Array.isArray(numbers) || numbers.length !== 7 ||
            numbers.some(n => typeof n !== 'string' || n.length !== 2 || isNaN(parseInt(n)))) {
            return res.status(400).json({ message: 'Invalid numbers format' });
        }

        // Check if combination exists
        const existing = await WinningCombination.findOne();

        if (existing) {
            // Update existing combination
            const updated = await existing.update({
                grandQuota,
                silverQuota,
                bronzeQuota,
                consolationQuota,
                // Reset winners counts when quotas change
                grandWinners: 0,
                silverWinners: 0,
                bronzeWinners: 0,
                consolationWinners: 0
            });
            return res.status(200).json({
                success: true,
                message: 'Combination updated successfully',
                data: updated
            });
        } else {
            // Create new combination
            const newCombo = await WinningCombination.create({
                numbers,
                grandQuota,
                silverQuota,
                bronzeQuota,
                consolationQuota,
                grandWinners: 0,
                silverWinners: 0,
                bronzeWinners: 0,
                consolationWinners: 0
            });
            return res.status(201).json({
                success: true,
                message: 'Combination created successfully',
                data: newCombo
            });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteWinningCombination = async (req, res) => {
    try {
        const combo = await WinningCombination.findOne();
        if (!combo) {
            return res.status(404).json({ success: false, message: 'No winning combination found' });
        }

        await combo.destroy();
        res.status(200).json({ success: true, message: 'Winning combination deleted' });
    } catch (err) {
        console.error('❌ Error deleting winning combination:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getLatestWinningCombination = async (req, res) => {
    try {
        const combo = await WinningCombination.findOne({
            order: [['createdAt', 'DESC']]
        });

        if (!combo) {
            return res.status(404).json({
                success: false,
                message: 'No winning combination found'
            });
        }

        res.status(200).json({ success: true, data: combo });
    } catch (err) {
        console.error('❌ Error fetching latest winning combination:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getWinnersByPrizeType = async (req, res) => {
    try {
        const winners = await Ticket.findAll({
            where: {
                prizeType: {
                    [Op.in]: ['Grand', 'Silver', 'Bronze', 'Consolation']
                }
            },
            order: [['prizeType', 'ASC'], ['createdAt', 'DESC']]
        });

        const grouped = {
            Grand: [],
            Silver: [],
            Bronze: [],
            Consolation: []
        };

        winners.forEach(ticket => {
            if (ticket.prizeType && grouped[ticket.prizeType]) {
                grouped[ticket.prizeType].push(ticket);
            }
        });

        res.status(200).json({ success: true, data: grouped });
    } catch (err) {
        console.error("❌ Error fetching winners by prize type:", err);
        res.status(500).json({ success: false, message: 'Failed to fetch winners' });
    }
};