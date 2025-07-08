import { Ticket, WinningCombination } from '../models/index.js';
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

export async function generateValidTicket({ name, phone, email, instagram, issueDate, expiryDate, proofImage, purchaseProof, isSuperTicket }) {
    // Check duplicate user (by phone/email/instagram)
    const existing = await Ticket.findOne({
        where: {
            [Op.or]: [{ phone }, { email }, { instagram }]
        }
    });
    if (existing) {
        throw new Error('Duplicate user info');
    }

    let ticketID, ticketIDExists;
    do {
        ticketID = generateTicketID();
        ticketIDExists = await Ticket.findOne({ where: { ticketID } });
    } while (ticketIDExists);

    let numbers, prizeType = null;
    const winningCombo = await WinningCombination.findOne();

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
                // Safe non-winner
                isValid = true;
            }
        }
        await winningCombo.save();
    } else {
        numbers = generateTicketNumbers();
    }

    const ticket = await Ticket.create({
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
        isSuperTicket: !!isSuperTicket,
        prizeType
    });

    return ticket;
}
