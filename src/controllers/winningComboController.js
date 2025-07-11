import { Op, Sequelize } from 'sequelize';
import { sequelize, WinningCombination, GeneratedTicket, Claim, Ticket } from '../models/index.js';

// Helper function to generate unique tickets with a given count of admin numbers.
function generateUniqueTicketNumbers(adminNumbers, digitsRequired, totalTickets) {
    const numberHashes = new Set();
    const tickets = [];

    while (tickets.length < totalTickets) {
        // Start with the first `digitsRequired` admin numbers
        let selectedNumbers = adminNumbers.slice(0, digitsRequired);

        // Add random numbers (00-99) until we have 7 numbers, avoiding duplicates and avoiding admin numbers for the random part
        while (selectedNumbers.length < 7) {
            const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
            if (
                !selectedNumbers.includes(randomNum) &&
                !adminNumbers.includes(randomNum)
            ) {
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

export const createOrUpdateWinningCombination = async (req, res) => {
    const t = await sequelize.transaction(); // Use sequelize.transaction() here
    try {
        const {
            numbers,  // Admin's 7 digits
            totalParticipants,
            grandQuota,
            silverQuota,
            bronzeQuota,
            consolationQuota,
            startDate,
            endDate
        } = req.body;

        // Validate number format
        if (
            !Array.isArray(numbers) ||
            numbers.length !== 7 ||
            numbers.some(n => typeof n !== 'string' || n.length !== 2 || isNaN(parseInt(n)))
        ) {
            await t.rollback(); // Rollback transaction on error
            return res.status(400).json({ message: 'Invalid numbers format' });
        }

        if (!totalParticipants || totalParticipants <= 0) {
            await t.rollback(); // Rollback transaction on error
            return res.status(400).json({ message: 'Invalid totalParticipants' });
        }

        // Create a new competition (initialize winner counts with quotas)
        const newCombo = await WinningCombination.create({
            numbers,
            totalParticipants,
            grandQuota,
            silverQuota,
            bronzeQuota,
            consolationQuota,
            grandWinners: grandQuota,       // initialize winners count to quota
            silverWinners: silverQuota,
            bronzeWinners: bronzeQuota,
            consolationWinners: consolationQuota,
            startDate,
            endDate,
            status: 'active'
        }, { transaction: t });  // Pass transaction

        const winningTickets = [];  // will hold all winning ticket records to insert

        // 1. Generate Grand Winner tickets (7 admin digits)
        const grandTickets = generateUniqueTicketNumbers(numbers, 7, grandQuota);
        grandTickets.forEach(ticketNums => {
            winningTickets.push({
                numbers: ticketNums,
                prizeType: 'Grand',
                winningCombinationId: newCombo.id
            });
        });

        // 2. Generate Silver Winner tickets (6 admin digits + 1 random)
        const silverTickets = generateUniqueTicketNumbers(numbers, 6, silverQuota);
        silverTickets.forEach(ticketNums => {
            winningTickets.push({
                numbers: ticketNums,
                prizeType: 'Silver',
                winningCombinationId: newCombo.id
            });
        });

        // 3. Generate Bronze Winner tickets (5 admin digits + 2 random)
        const bronzeTickets = generateUniqueTicketNumbers(numbers, 5, bronzeQuota);
        bronzeTickets.forEach(ticketNums => {
            winningTickets.push({
                numbers: ticketNums,
                prizeType: 'Bronze',
                winningCombinationId: newCombo.id
            });
        });

        // 4. Generate Consolation Winner tickets (4 admin digits + 3 random)
        const consolationTickets = generateUniqueTicketNumbers(numbers, 4, consolationQuota);
        consolationTickets.forEach(ticketNums => {
            winningTickets.push({
                numbers: ticketNums,
                prizeType: 'Consolation',
                winningCombinationId: newCombo.id
            });
        });

        // 5. Insert all winning tickets in bulk
        if (winningTickets.length > 0) {
            await GeneratedTicket.bulkCreate(winningTickets, { transaction: t });  // Insert in bulk with transaction
        }

        // 6. Generate Non-Winning Tickets for the remaining participants
        const totalWinningCount = grandQuota + silverQuota + bronzeQuota + consolationQuota;
        const remainingTicketsCount = totalParticipants - totalWinningCount;
        if (remainingTicketsCount > 0) {
            const allGeneratedKeys = new Set(winningTickets.map(ticket => ticket.numbers.join(',')));
            const nonWinningTickets = [];

            while (nonWinningTickets.length < remainingTicketsCount) {
                // Create a random ticket of 7 unique numbers (00-99)
                const ticketSet = new Set();
                while (ticketSet.size < 7) {
                    const randNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
                    ticketSet.add(randNum);
                }
                const ticketNums = Array.from(ticketSet);
                ticketNums.sort(() => Math.random() - 0.5);  // shuffle order

                const ticketKey = ticketNums.join(',');

                // Check if this ticket matches any winning ticket
                if (!allGeneratedKeys.has(ticketKey)) {
                    let valid = false;
                    const matchCount = countMatches(ticketNums, newCombo.numbers);

                    // If it matches any winning criteria (7, 6, 5, or 4 matches), discard the ticket
                    if (matchCount === 7 && grandQuota > 0) {
                        continue;  // Matches Grand winner criteria
                    } else if (matchCount === 6 && silverQuota > 0) {
                        continue;  // Matches Silver winner criteria
                    } else if (matchCount === 5 && bronzeQuota > 0) {
                        continue;  // Matches Bronze winner criteria
                    } else if (matchCount === 4 && consolationQuota > 0) {
                        continue;  // Matches Consolation winner criteria
                    }

                    // If no match with winning criteria, it's a valid non-winning ticket
                    nonWinningTickets.push({
                        numbers: ticketNums,
                        prizeType: 'N/A',  // No prize for non-winners
                        winningCombinationId: newCombo.id
                    });
                    allGeneratedKeys.add(ticketKey);  // Keep track of the generated ticket
                }
            }

            // 7. Insert non-winning tickets in bulk (chunked to avoid large queries)
            const chunkSize = 1000;
            for (let i = 0; i < nonWinningTickets.length; i += chunkSize) {
                const chunk = nonWinningTickets.slice(i, i + chunkSize);
                await GeneratedTicket.bulkCreate(chunk, { transaction: t });
            }
        }

        // Commit transaction if everything is successful
        await t.commit();
        return res.status(201).json({
            success: true,
            message: `Competition created and ${totalParticipants} tickets generated successfully.`,
            data: newCombo
        });
    } catch (err) {
        console.error('❌ Error creating/updating winning combination:', err);
        await t.rollback();  // Rollback transaction on error
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Helper function to count matches between two ticket numbers
function countMatches(ticket1, ticket2) {
    return ticket1.filter(num => ticket2.includes(num)).length;
}



/* ----------------------- End Active Competition ----------------------- */

export const deleteWinningCombination = async (req, res) => {
    try {
        const activeCombo = await WinningCombination.findOne({ where: { status: 'active' } });

        if (!activeCombo) {
            return res.status(404).json({ success: false, message: 'No active competition to end' });
        }

        await activeCombo.update({ status: 'ended' });

        res.status(200).json({
            success: true,
            message: 'Active competition marked as ended',
            data: activeCombo
        });
    } catch (err) {
        console.error('❌ Error ending competition:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

/* ----------------------- Get Latest Combination ----------------------- */

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
        console.error('❌ Error fetching latest combination:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

/* ----------------------- Winners by Prize Type showing on winning combination page by active cometition or if no active then latest ended one ----------------------- */

export const getWinnersByPrizeType = async (req, res) => {
    try {
        // Get the latest active competition or the most recent ended competition
        let competition = await WinningCombination.findOne({
            where: { status: 'active' },  // Check for active competition
            order: [['createdAt', 'DESC']],  // Order by creation date (most recent first)
        });

        // If no active competition, get the latest ended competition
        if (!competition) {
            competition = await WinningCombination.findOne({
                where: { status: 'ended' },  // Check for ended competition
                order: [['createdAt', 'DESC']],  // Order by creation date (most recent first)
            });
        }

        // If no competition is found, return an error
        if (!competition) {
            return res.status(404).json({ success: false, message: 'No active or recent competition found' });
        }

        const competitionId = competition.id;  // Get the competition ID

        // Fetch winners for the competition
        const winners = await Ticket.findAll({
            where: {
                prizeType: {
                    [Op.in]: ['Grand', 'Silver', 'Bronze', 'Consolation']  // Filter by prize types
                },
                winningCombinationId: competitionId  // Filter by the competition ID
            },
            order: [['prizeType', 'ASC'], ['createdAt', 'DESC']]  // Order winners by prize type and creation date
        });

        // Group winners by prize type
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
        console.error("❌ Error fetching winners:", err);
        res.status(500).json({ success: false, message: 'Failed to fetch winners' });
    }
};



/* ----------------------- End Manually ----------------------- */

export const endCurrentCompetitionManually = async (req, res) => {
    try {
        const current = await WinningCombination.findOne({ where: { status: 'active' } });

        if (!current) {
            return res.status(404).json({ success: false, message: 'No active competition to end.' });
        }

        await current.update({ status: 'ended' });

        return res.status(200).json({
            success: true,
            message: 'Competition manually ended.',
            data: current
        });
    } catch (err) {
        console.error('❌ Manual end error:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/* ----------------------- Get All Competitions ----------------------- */

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

/* ----------------------- Get Single Competition ----------------------- */

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
