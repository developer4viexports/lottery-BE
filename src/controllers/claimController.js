import { Claim, Ticket, WinningCombination } from '../models/index.js';
import { Op } from 'sequelize';

export const submitClaim = async (req, res) => {
    try {
        const { ticketID, name, email, phone, instagram } = req.body;

        if (!ticketID || !name || !email || !phone || !instagram) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const ticket = await Ticket.findOne({ where: { ticketID } });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Invalid Ticket ID. No ticket found with this ID.',
                field: 'ticketID'
            });
        }

        const existingClaim = await Claim.findOne({
            where: {
                ticketID,
                [Op.or]: [{ email }, { phone }, { instagram }]
            }
        });

        // if (existingClaim) {
        //     return res.status(409).json({
        //         success: false,
        //         message: 'You have already submitted a claim for this ticket.',
        //         field: 'ticketID'
        //     });
        // }

        const claim = await Claim.create({
            ticketID,
            name,
            email,
            phone,
            instagram,
            numbers: ticket.numbers,
            winningCombinationId: ticket.winningCombinationId
        });

        return res.status(201).json({ success: true, data: claim });

    } catch (err) {
        console.error('❌ Claim submission failed:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getAllClaims = async (req, res) => {
    try {
        let competition = await WinningCombination.findOne({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']],
        });

        if (!competition) {
            competition = await WinningCombination.findOne({
                where: { status: 'ended' },
                order: [['createdAt', 'DESC']],
            });
        }

        if (!competition) {
            return res.status(404).json({ success: false, message: 'No competition found' });
        }

        const claims = await Claim.findAll({
            where: { winningCombinationId: competition.id },
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({ success: true, data: claims });
    } catch (err) {
        console.error('❌ Error fetching claims:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
