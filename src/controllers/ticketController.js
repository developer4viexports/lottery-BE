import { Ticket } from '../models/index.js';
import { Op } from 'sequelize';

function generateTicketNumbers() {
    const nums = new Set();
    while (nums.size < 7) {
        const n = Math.floor(Math.random() * 100);
        nums.add(n.toString().padStart(2, '0'));
    }
    return [...nums];
}

function generateTicketID() {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `SLH-2025-${random}`;
}

export const createTicket = async (req, res) => {
    try {
        const { name, phone, email, instagram, issueDate, expiryDate } = req.body;
        const proofImage = req.file ? `/uploads/${req.file.filename}` : '';

        // Check only for fields that must be unique
        const existingTicket = await Ticket.findOne({
            where: {
                [Op.or]: [
                    { phone },
                    { email },
                    { instagram }
                ]
            }
        });

        if (existingTicket) {
            const conflictingFields = ['phone', 'email', 'instagram'];
            const matchedField = conflictingFields.find(f => req.body[f] === existingTicket[f]);

            return res.status(409).json({
                message: 'Duplicate entry found',
                field: matchedField || 'unknown'
            });
        }

        // Generate unique ticketID
        let ticketID, ticketIDExists;
        do {
            ticketID = generateTicketID();
            ticketIDExists = await Ticket.findOne({ where: { ticketID } });
        } while (ticketIDExists);

        // Generate unique numbers
        let numbers, numbersExists;
        do {
            numbers = generateTicketNumbers();
            numbersExists = await Ticket.findOne({ where: { numbers } });
        } while (numbersExists);

        const newTicket = await Ticket.create({
            name,
            phone,
            email,
            instagram,
            ticketID,
            numbers,
            issueDate,
            expiryDate,
            proofImage
        });

        res.status(201).json({ success: true, data: newTicket });

    } catch (error) {
        console.error("Ticket generation failed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllTickets = async (req, res, next) => {
    try {
        const tickets = await Ticket.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, data: tickets });
    } catch (err) {
        console.error('Error fetching tickets:', err);
        next(err);
    }
};
