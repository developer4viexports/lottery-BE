import { Op, Sequelize } from 'sequelize';
import { Ticket, GeneratedTicket, WinningCombination } from '../models/index.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

//send email setings
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});



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
        const { name, phone, email, instagram, isSuperTicket, expiryDate } = req.body;

        const proofImage = req.files?.file?.[0] ? `/uploads/${req.files.file[0].filename}` : '';
        const purchaseProof = req.files?.purchaseProof?.[0] ? `/uploads/${req.files.purchaseProof[0].filename}` : '';
        const followProof = req.files?.followProof?.[0] ? `/uploads/${req.files.followProof[0].filename}` : '';

        // ✅ Step 1: Always get the latest competition (active or ended)
        const winningCombo = await WinningCombination.findOne({
            order: [['createdAt', 'DESC']],
        });

        if (!winningCombo) {
            return res.status(400).json({ success: false, message: 'No competition found.' });
        }

        // ✅ Step 2: If status is ended, return message and stop creation
        if (winningCombo.status === 'ended') {
            return res.status(403).json({
                success: false,
                message: 'Competition has ended. Ticket creation is closed.',
            });
        }

        const winningCombinationId = winningCombo.id;

        // Set the issueDate to today's date
        const issueDate = new Date().toISOString().split('T')[0];  // Get today's date in YYYY-MM-DD format

        // Assuming winningCombo.endDate is a string in 'YYYY-MM-DD' format
        // const expiryDate2 = new Date(expiryDate);  // Convert to Date object

        const formattedExpiryDate = expiryDate;  // Ensure it's in YYYY-MM-DD format

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

        const ticketData = { ...newTicket.get() }; // convert Sequelize instance to plain object
        delete ticketData.prizeType;               // safely remove prizeType only from the response

        return res.status(201).json({ success: true, data: ticketData }); // send cleaned object

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

export const uploadTicketImage = async (req, res) => {
    try {
        const ticketId = req.body.ticketId;
        const file = req.file;

        if (!ticketId || !file) {
            return res.status(400).json({ success: false, message: 'Ticket ID or image missing' });
        }

        // Save to DB
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

        ticket.ticketImage = `/uploads/${file.filename}`;

        await ticket.save();

        return res.status(200).json({ success: true, message: 'Ticket image uploaded', path: ticket.ticketImage });
    } catch (err) {
        console.error('❌ Upload failed:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const sendTicketEmail = async (req, res) => {
    const { id } = req.params;

    try {
        const ticket = await Ticket.findByPk(id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if (!ticket.email || !ticket.ticketImage) {
            return res.status(400).json({ success: false, message: 'Missing email or ticket image' });
        }

        const imagePath = `.${ticket.ticketImage}`;
        const fs = await import('fs/promises');

        try {
            await fs.access(imagePath); // Check if file exists
        } catch {
            return res.status(404).json({ success: false, message: 'Ticket image not found on server' });
        }

        await transporter.sendMail({
            from: "booking@birc.in",
            to: ticket.email,
            subject: "🎫 Your Shrilalmahal Lucky Ticket",
            html: `
                <p>Hi ${ticket.name},</p>
                <p>Thanks for participating in the Lucky Draw!</p>
                <p>Your ticket ID: <strong>${ticket.ticketID}</strong></p>
                <p>See your attached ticket image below. Best of luck! 🍀</p>
            `,
            attachments: [
                {
                    filename: `${ticket.ticketID}.png`,
                    path: imagePath,
                    contentType: 'image/png',
                }
            ]
        });

        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
        console.error('❌ Failed to send ticket email:', err);
        return res.status(500).json({ success: false, message: 'Failed to send ticket email' });
    }
};
