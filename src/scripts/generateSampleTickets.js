// scripts/generateSampleTickets.js
import { Ticket, WinningCombination, sequelize } from '../models/index.js';
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

function countMatches(arr1, arr2) {
    return arr1.filter(num => arr2.includes(num)).length;
}

async function createValidTicket(i, winningCombo, attempts = 0) {
    if (attempts > 10) {
        // fallback: create non-winning ticket after 10 attempts
        return createNonWinningTicket(i);
    }

    let ticketID;
    do {
        ticketID = generateTicketID();
    } while (await Ticket.findOne({ where: { ticketID } }));

    const numbers = generateTicketNumbers();
    let prizeType = null;

    const matchCount = countMatches(numbers, winningCombo.numbers);

    if (matchCount === 7 && winningCombo.grandWinners < winningCombo.grandQuota) {
        prizeType = 'Grand';
        winningCombo.grandWinners += 1;
    } else if (matchCount === 6 && winningCombo.silverWinners < winningCombo.silverQuota) {
        prizeType = 'Silver';
        winningCombo.silverWinners += 1;
    } else if (matchCount === 5 && winningCombo.bronzeWinners < winningCombo.bronzeQuota) {
        prizeType = 'Bronze';
        winningCombo.bronzeWinners += 1;
    } else if (matchCount === 4 && winningCombo.consolationWinners < winningCombo.consolationQuota) {
        prizeType = 'Consolation';
        winningCombo.consolationWinners += 1;
    } else {
        // Regenerate ticket until it doesn't match the winning conditions
        return createValidTicket(i, winningCombo, attempts + 1);
    }

    await winningCombo.save();

    return Ticket.create({
        name: `User ${i + 1}`,
        phone: `+9190000${(1000 + i).toString().padStart(4, '0')}`,
        email: `user${i + 1}@mail.com`,
        instagram: `user${i + 1}`,
        ticketID,
        numbers,
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        proofImage: '',
        purchaseProof: '',
        isSuperTicket: false,
        prizeType
    });
}

async function createNonWinningTicket(i) {
    let ticketID;
    do {
        ticketID = generateTicketID();
    } while (await Ticket.findOne({ where: { ticketID } }));

    const numbers = generateTicketNumbers();

    return Ticket.create({
        name: `User ${i + 1}`,
        phone: `+9190000${(1000 + i).toString().padStart(4, '0')}`,
        email: `user${i + 1}@mail.com`,
        instagram: `user${i + 1}`,
        ticketID,
        numbers,
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        proofImage: '',
        purchaseProof: '',
        isSuperTicket: false,
        prizeType: null
    });
}

async function main(count = 10000) {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');
        await sequelize.sync();

        const winningCombo = await WinningCombination.findOne();
        if (!winningCombo) {
            console.error('❌ No winning combination found. Please create one first.');
            process.exit(1);
        }

        console.log(`🚀 Creating ${count} sample tickets...`);

        for (let i = 0; i < count; i++) {
            await createValidTicket(i, winningCombo);
        }

        console.log('✅ Sample ticket generation complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error generating tickets:', err);
        process.exit(1);
    }
}

main();
