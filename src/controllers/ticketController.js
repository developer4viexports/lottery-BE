import { Op, Sequelize } from 'sequelize';
import { Ticket, GeneratedTicket, WinningCombination } from '../models/index.js';

// Helper function to generate unique ticketID
function generateTicketID() {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `SLH-2025-${random}`;
}

// Function to generate unique ticket numbers with a given count of admin numbers
function generateUniqueTicketNumbers(adminNumbers, digitsRequired, totalTickets) {
    const numberHashes = new Set();
    const tickets = [];

    while (tickets.length < totalTickets) {
        // Start with the first `digitsRequired` admin numbers
        let selectedNumbers = adminNumbers.slice(0, digitsRequired);

        // Add random numbers (00-99) until we have 7 numbers, avoiding duplicates and avoiding admin numbers for the random part
        while (selectedNumbers.length < 7) {
            const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
            if (!selectedNumbers.includes(randomNum) && !adminNumbers.includes(randomNum)) {
                selectedNumbers.push(randomNum);
            }
        }

        // Shuffle to randomize order
        selectedNumbers.sort(() => Math.random() - 0.5);
        const ticketKey = selectedNumbers.join(',');

        if (!numberHashes.has(ticketKey)) {
            numberHashes.add(ticketKey);
            tickets.push(selectedNumbers);
        }
    }

    return tickets;
}

// Create Ticket
export const createTicket = async (req, res) => {
    try {
        const { name, phone, email, instagram, isSuperTicket } = req.body;

        const proofImage = req.files?.file?.[0] ? `/uploads/${req.files.file[0].filename}` : '';
        const purchaseProof = req.files?.purchaseProof?.[0] ? `/uploads/${req.files.purchaseProof[0].filename}` : '';
        const followProof = req.files?.followProof?.[0] ? `/uploads/${req.files.followProof[0].filename}` : '';

        // Step 1: Get active competition or latest ended competition
        let winningCombo = await WinningCombination.findOne({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']],
        });

        if (!winningCombo) {
            winningCombo = await WinningCombination.findOne({
                where: { status: 'ended' },
                order: [['createdAt', 'DESC']],
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

        // Add 20 days to expiry
        expiryDate.setDate(expiryDate.getDate() + 20);
        const formattedExpiryDate = expiryDate.toISOString().split('T')[0];  // Ensure it's in YYYY-MM-DD format

        // Step 2: Safe duplicate check — only for provided fields (phone, email, instagram)
        const orConditions = [];
        if (phone?.trim()) orConditions.push({ phone });
        if (email?.trim()) orConditions.push({ email });
        if (instagram?.trim()) orConditions.push({ instagram });

        if (orConditions.length > 0) {
            const duplicate = await Ticket.findOne({
                where: {
                    winningCombinationId,
                    [Op.or]: orConditions,
                },
            });

            if (duplicate) {
                let field = '';
                if (phone && duplicate.phone === phone) field = 'phone';
                else if (email && duplicate.email === email) field = 'email';
                else if (instagram && duplicate.instagram === instagram) field = 'instagram';

                return res.status(409).json({
                    message: `Duplicate ${field} already used in this competition.`,
                    field,
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
                winningCombinationId, // Filter by the current winning combination
            },
            order: Sequelize.fn('random'), // Corrected to use Sequelize.fn('random')
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
            expiryDate: formattedExpiryDate, // Updated expiry date, 20 days after the original endDate
            proofImage,
            purchaseProof,
            followProof,
            isSuperTicket: isSuperTicket === '1' || isSuperTicket === true || isSuperTicket === 'true',
            prizeType: randomTicket.prizeType, // Use the prizeType from the random ticket
            winningCombinationId,
        });

        // Check if all tickets have been used and regenerate if needed
        const totalTickets = await GeneratedTicket.count({
            where: { winningCombinationId, isAssigned: true },
        });

        const totalGenerated = await GeneratedTicket.count({ where: { winningCombinationId } });

        if (totalTickets === totalGenerated) {
            // Regenerate tickets if all have been assigned
            await regenerateTickets(winningCombo, totalGenerated);
        }

        return res.status(201).json({ success: true, data: newTicket });
    } catch (error) {
        console.error('❌ Ticket creation failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Regenerate tickets if all tickets are used up
const regenerateTickets = async (winningCombo, totalGenerated) => {
    try {
        const { grandQuota, silverQuota, bronzeQuota, consolationQuota } = winningCombo;
        const totalParticipants = winningCombo.totalParticipants;

        // Logic to regenerate winning and non-winning tickets
        const grandTickets = generateUniqueTicketNumbers(winningCombo.numbers, 7, grandQuota);
        const silverTickets = generateUniqueTicketNumbers(winningCombo.numbers, 6, silverQuota);
        const bronzeTickets = generateUniqueTicketNumbers(winningCombo.numbers, 5, bronzeQuota);
        const consolationTickets = generateUniqueTicketNumbers(winningCombo.numbers, 4, consolationQuota);

        const winningTickets = [
            ...grandTickets.map(ticket => ({ numbers: ticket, prizeType: 'Grand', winningCombinationId: winningCombo.id })),
            ...silverTickets.map(ticket => ({ numbers: ticket, prizeType: 'Silver', winningCombinationId: winningCombo.id })),
            ...bronzeTickets.map(ticket => ({ numbers: ticket, prizeType: 'Bronze', winningCombinationId: winningCombo.id })),
            ...consolationTickets.map(ticket => ({ numbers: ticket, prizeType: 'Consolation', winningCombinationId: winningCombo.id })),
        ];

        await GeneratedTicket.bulkCreate(winningTickets);

        // Generate non-winning tickets
        const remainingTickets = totalParticipants - winningTickets.length;
        if (remainingTickets > 0) {
            const nonWinningTickets = [];
            const allGeneratedKeys = new Set(winningTickets.map(ticket => ticket.numbers.join(',')));

            while (nonWinningTickets.length < remainingTickets) {
                const randomTicket = generateUniqueTicketNumbers(winningCombo.numbers, 7, 1)[0];
                const ticketKey = randomTicket.join(',');

                if (!allGeneratedKeys.has(ticketKey)) {
                    nonWinningTickets.push({
                        numbers: randomTicket,
                        prizeType: 'N/A',
                        winningCombinationId: winningCombo.id,
                    });
                    allGeneratedKeys.add(ticketKey);
                }
            }

            await GeneratedTicket.bulkCreate(nonWinningTickets);
        }
    } catch (err) {
        console.error('❌ Error regenerating tickets:', err);
    }
};

// Get all tickets from current competition
export const getAllTickets = async (req, res) => {
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

        const tickets = await Ticket.findAll({
            where: { winningCombinationId: competition.id },
            order: [['createdAt', 'DESC']],
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
