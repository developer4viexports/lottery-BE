import { Ticket, GeneratedTicket, WinningCombination } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';  // Import Sequelize

// Generate unique ticketID
function generateTicketID() {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `SLH-2025-${random}`;
}

// Create Ticket
// Create Ticket
export const createTicket = async (req, res) => {
    try {
        const {
            name, phone, email, instagram,
            isSuperTicket
        } = req.body;

        const proofImage = req.files?.file?.[0]
            ? `/uploads/${req.files.file[0].filename}` : '';
        const purchaseProof = req.files?.purchaseProof?.[0]
            ? `/uploads/${req.files.purchaseProof[0].filename}` : '';
        const followProof = req.files?.followProof?.[0]
            ? `/uploads/${req.files.followProof[0].filename}` : '';

        // Step 1: Get active or latest competition
        let winningCombo = await WinningCombination.findOne({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });

        if (!winningCombo) {
            winningCombo = await WinningCombination.findOne({
                where: { status: 'ended' },
                order: [['createdAt', 'DESC']]
            });
        }

        if (!winningCombo) {
            return res.status(400).json({ message: 'No active or recent competition found.' });
        }

        const winningCombinationId = winningCombo.id;

        // Set the issueDate to today's date
        const issueDate = new Date().toISOString().split('T')[0];  // Get today's date in YYYY-MM-DD format

        // Assuming winningCombo.endDate is a string in 'YYYY-MM-DD' format
        const expiryDate = new Date(winningCombo.endDate);  // Convert to Date object

        // Add 10 days
        expiryDate.setDate(expiryDate.getDate() + 20);

        // Format back to 'YYYY-MM-DD' format (Correctly formatted date)
        const formattedExpiryDate = expiryDate.toISOString().split('T')[0];  // This ensures it's in YYYY-MM-DD format

        // Step 2: Safe duplicate check — only for provided fields
        const orConditions = [];
        if (phone?.trim()) orConditions.push({ phone });
        if (email?.trim()) orConditions.push({ email });
        if (instagram?.trim()) orConditions.push({ instagram });

        if (orConditions.length > 0) {
            const duplicate = await Ticket.findOne({
                where: {
                    winningCombinationId,
                    [Op.or]: orConditions
                }
            });

            if (duplicate) {
                let field = '';
                if (phone && duplicate.phone === phone) field = 'phone';
                else if (email && duplicate.email === email) field = 'email';
                else if (instagram && duplicate.instagram === instagram) field = 'instagram';

                return res.status(409).json({
                    message: `Duplicate ${field} already used in this competition.`,
                    field
                });
            }
        }

        // Step 3: Generate unique ticketID
        let ticketID, exists = true;
        while (exists) {
            ticketID = generateTicketID();
            exists = await Ticket.findOne({ where: { ticketID } });
        }

        // Step 4: Get a random ticket from GeneratedTicket that is not assigned
        const randomTicket = await GeneratedTicket.findOne({
            where: {
                isAssigned: false,
                winningCombinationId // Filter by the current winning combination
            },
            order: Sequelize.fn('random') // Corrected to use Sequelize.fn('random')
        });

        if (!randomTicket) {
            return res.status(400).json({ message: 'No available ticket for this competition.' });
        }

        // Step 5: Assign the ticket to the user and mark it as assigned
        await randomTicket.update({ isAssigned: true }); // Mark as assigned

        // Step 6: Create the user ticket with the assigned number and prize type
        const newTicket = await Ticket.create({
            name,
            phone,
            email,
            instagram,
            ticketID,
            numbers: randomTicket.numbers, // Use the numbers from the random ticket
            issueDate,  // Set issueDate to today's date
            expiryDate: formattedExpiryDate, // Updated expiry date, 10 days after the original endDate
            proofImage,
            purchaseProof,
            followProof,
            isSuperTicket: isSuperTicket === '1' || isSuperTicket === true || isSuperTicket === 'true',
            prizeType: randomTicket.prizeType, // Use the prizeType from the random ticket
            winningCombinationId
        });

        return res.status(201).json({ success: true, data: newTicket });

    } catch (error) {
        console.error('❌ Ticket creation failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// Get all tickets from current competition
export const getAllTickets = async (req, res) => {
    try {
        let competition = await WinningCombination.findOne({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });

        if (!competition) {
            competition = await WinningCombination.findOne({
                where: { status: 'ended' },
                order: [['createdAt', 'DESC']]
            });
        }

        if (!competition) {
            return res.status(404).json({ success: false, message: 'No competition found' });
        }

        const tickets = await Ticket.findAll({
            where: { winningCombinationId: competition.id },
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ success: true, data: tickets });

    } catch (err) {
        console.error('❌ Error fetching tickets:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get single ticket by ID
export const getTicketById = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findByPk(ticketId);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        return res.json({ success: true, data: ticket });

    } catch (err) {
        console.error('❌ Error fetching ticket:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
