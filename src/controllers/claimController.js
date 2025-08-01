import { Claim, Ticket, WinningCombination } from '../models/index.js';
import { Op } from 'sequelize';

export const submitClaim = async (req, res) => {
    try {
        const { ticketID, name, email, phone, instagram, address } = req.body;

        if (!ticketID || !address || (!email && !phone)) {
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

        // ✅ Construct OR conditions only with defined fields
        const orConditions = [];
        if (email) orConditions.push({ email });
        if (phone) orConditions.push({ phone });
        if (instagram) orConditions.push({ instagram });

        const existingClaim = await Claim.findOne({
            where: {
                ticketID,
                ...(orConditions.length ? { [Op.or]: orConditions } : {})
            }
        });

        // Optional duplication check
        // if (existingClaim) {
        //     return res.status(409).json({
        //         success: false,
        //         message: 'You have already submitted a claim for this ticket.',
        //         field: 'ticketID'
        //     });
        // }

        const claim = await Claim.create({
            ticketID,
            name: name || null,
            email: email || null,
            phone: phone || null,
            instagram: ticket.instagram || null,
            address,
            numbers: ticket.numbers || null,
            winningCombinationId: ticket.winningCombinationId
        });

        return res.status(201).json({ 
            success: true, 
            message: "Claim submitted successfully!", 
            // data: claim 
        });

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

export const getTicketDetailsById = async (req, res) => {
    try {
        const { ticketID } = req.params;

        if (!ticketID) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required.',
            });
        }

        const ticket = await Ticket.findOne({
            where: { ticketID },
            attributes: ['name'], // Return only necessary fields
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.',
            });
        }

        return res.status(200).json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        console.error('❌ Error fetching ticket details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
