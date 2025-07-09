// src/controllers/winningComboController.js

import { WinningCombination, Ticket, Claim } from '../models/index.js'; // ✅ Claim model included
import { Op } from 'sequelize';

/**
 * Create or update the winning combination.
 * Only one active combination allowed at a time.
 */
export const createOrUpdateWinningCombination = async (req, res) => {
    try {
        const {
            numbers,
            grandQuota,
            silverQuota,
            bronzeQuota,
            consolationQuota,
            startDate,
            endDate
        } = req.body;

        // Validate numbers
        if (
            !Array.isArray(numbers) ||
            numbers.length !== 7 ||
            numbers.some(n => typeof n !== 'string' || n.length !== 2 || isNaN(parseInt(n)))
        ) {
            return res.status(400).json({ message: 'Invalid numbers format' });
        }

        // Check if an active competition exists
        const activeCombo = await WinningCombination.findOne({
            where: { status: 'active' }
        });

        if (activeCombo) {
            const updated = await activeCombo.update({
                numbers,
                grandQuota,
                silverQuota,
                bronzeQuota,
                consolationQuota,
                grandWinners: 0,
                silverWinners: 0,
                bronzeWinners: 0,
                consolationWinners: 0,
                startDate,
                endDate
            });

            return res.status(200).json({
                success: true,
                message: 'Active competition updated successfully',
                data: updated
            });
        }

        // Create a new combination
        const newCombo = await WinningCombination.create({
            numbers,
            grandQuota,
            silverQuota,
            bronzeQuota,
            consolationQuota,
            grandWinners: 0,
            silverWinners: 0,
            bronzeWinners: 0,
            consolationWinners: 0,
            startDate,
            endDate,
            status: 'active'
        });

        return res.status(201).json({
            success: true,
            message: 'New competition created successfully',
            data: newCombo
        });
    } catch (err) {
        console.error('❌ Error creating/updating winning combination:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * End the current active competition (soft delete)
 */
export const deleteWinningCombination = async (req, res) => {
    try {
        const activeCombo = await WinningCombination.findOne({
            where: { status: 'active' }
        });

        if (!activeCombo) {
            return res.status(404).json({ success: false, message: 'No active competition to end' });
        }

        await activeCombo.update({ status: 'ended' });

        res.status(200).json({
            success: true,
            message: 'Active competition marked as ended (not deleted)',
            data: activeCombo
        });
    } catch (err) {
        console.error('❌ Error soft-ending competition:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


/**
 * Get the latest winning combination
 */
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

/**
 * Get winners grouped by prizeType
 */
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

/**
 * Manually end the current competition
 */
export const endCurrentCompetitionManually = async (req, res) => {
    try {
        const current = await WinningCombination.findOne({ where: { status: 'active' } });

        if (!current) {
            return res.status(404).json({ success: false, message: 'No active competition to end.' });
        }

        await current.update({ status: 'ended' });

        return res.status(200).json({
            success: true,
            message: 'Active competition manually ended.',
            data: current
        });
    } catch (err) {
        console.error('❌ Error ending competition manually:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Get all competitions
 */
export const getAllCompetitions = async (req, res) => {
    try {
        const competitions = await WinningCombination.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, data: competitions });
    } catch (err) {
        console.error('❌ Error fetching competitions:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get a specific competition and its tickets/claims
 */
export const getCompetitionById = async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        if (isNaN(numericId)) {
            return res.status(400).json({ success: false, message: 'Invalid competition ID' });
        }

        const competition = await WinningCombination.findByPk(numericId);
        if (!competition) {
            return res.status(404).json({ success: false, message: 'Competition not found' });
        }

        const tickets = await Ticket.findAll({
            where: { winningCombinationId: numericId },
            order: [['createdAt', 'DESC']]
        });

        const claims = await Claim.findAll({
            where: { winningCombinationId: numericId },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: {
                competition,
                tickets,
                claims
            }
        });
    } catch (err) {
        console.error('❌ Error fetching competition by ID:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
