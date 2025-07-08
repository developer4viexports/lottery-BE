import { Ticket, WinningCombination } from '../models/index.js';
import { Op } from 'sequelize';

// Helper: Generate 7 unique 2-digit numbers (as strings)
function generateTicketNumbers() {
    const nums = new Set();
    while (nums.size < 7) {
        const n = Math.floor(Math.random() * 100);
        nums.add(n.toString().padStart(2, '0'));
    }
    return [...nums];
}

// Helper: Generate unique ticketID
function generateTicketID() {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `SLH-2025-${random}`;
}

// Helper: Count how many numbers match between two sets
function countMatches(arr1, arr2) {
    return arr1.filter(num => arr2.includes(num)).length;
}

export const createTicket = async (req, res) => {
    try {
        const {
            name, phone, email, instagram,
            issueDate, expiryDate, isSuperTicket
        } = req.body;

        const proofImage = req.files?.file?.[0] ? `/uploads/${req.files.file[0].filename}` : ''; // ✅ match "file"
        const purchaseProof = req.files?.purchaseProof?.[0] ? `/uploads/${req.files.purchaseProof[0].filename}` : '';
        const followProof = req.files?.followProof?.[0]
            ? `/uploads/${req.files.followProof[0].filename}`
            : '';


        // Check for duplicate phone/email/instagram
        const existingTicket = await Ticket.findOne({
            where: {
                [Op.or]: [{ phone }, { email }, { instagram }]
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

        // Generate a unique ticketID
        let ticketID, ticketIDExists;
        do {
            ticketID = generateTicketID();
            ticketIDExists = await Ticket.findOne({ where: { ticketID } });
        } while (ticketIDExists);

        const winningCombo = await WinningCombination.findOne();
        let numbers, prizeType = null;

        if (winningCombo) {
            let isValid = false;

            while (!isValid) {
                numbers = generateTicketNumbers();
                const matchCount = countMatches(numbers, winningCombo.numbers);

                if (matchCount === 7 && winningCombo.grandWinners < winningCombo.grandQuota) {
                    prizeType = 'Grand';
                    winningCombo.grandWinners += 1;
                    isValid = true;
                } else if (matchCount === 6 && winningCombo.silverWinners < winningCombo.silverQuota) {
                    prizeType = 'Silver';
                    winningCombo.silverWinners += 1;
                    isValid = true;
                } else if (matchCount === 5 && winningCombo.bronzeWinners < winningCombo.bronzeQuota) {
                    prizeType = 'Bronze';
                    winningCombo.bronzeWinners += 1;
                    isValid = true;
                } else if (matchCount === 4 && winningCombo.consolationWinners < winningCombo.consolationQuota) {
                    prizeType = 'Consolation';
                    winningCombo.consolationWinners += 1;
                    isValid = true;
                } else if (matchCount < 4) {
                    // Does not qualify for any prize — valid
                    isValid = true;
                }

                // If prize was eligible but quota full, retry loop to generate a new set
            }

            await winningCombo.save();
        } else {
            // No combination found, just generate a random set of numbers
            numbers = generateTicketNumbers();
        }

        const newTicket = await Ticket.create({
            name,
            phone,
            email,
            instagram,
            ticketID,
            numbers,
            issueDate,
            expiryDate,
            proofImage,
            purchaseProof,
            followProof, // ✅ NEW
            isSuperTicket: isSuperTicket === '1' || isSuperTicket === true || isSuperTicket === 'true',
            prizeType
        });

        return res.status(201).json({ success: true, data: newTicket });

    } catch (error) {
        console.error('❌ Ticket creation failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllTickets = async (req, res, next) => {
    try {
        const tickets = await Ticket.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: tickets });
    } catch (err) {
        console.error('❌ Error fetching tickets:', err);
        next(err);
    }
};
