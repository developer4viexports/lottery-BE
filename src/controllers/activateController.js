import { Activate, Ticket, WinningCombination } from '../models/index.js';
import { Op } from 'sequelize';
import { uploadFilesToFirebase } from '../utils/firebaseUpload.js  ';

// ========================
// Submit Activate
// ========================
export const submitActivate = async (req, res) => {
    try {
        const {
            ticketID,
            name,
            email,
            phone,
            instagram,
            countryCode
        } = req.body || {};

        if (!ticketID || (!email && !phone)) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // const ticketImage = req.files?.ticketImage?.[0]?.filename
        //     ? `/uploads/${req.files.ticketImage[0].filename}` : '';

        // const proofImage = req.files?.proofImage?.[0]?.filename
        //     ? `/uploads/${req.files.proofImage[0].filename}` : '';

        // Determine winningCombinationId
        let winningCombinationId = null;
        const ticket = await Ticket.findOne({ where: { ticketID } });

        if (ticket?.winningCombinationId) {
            winningCombinationId = ticket.winningCombinationId;
        } else {
            const activeOrLatestEnded = await WinningCombination.findOne({
                where: { status: 'active' },
                order: [['createdAt', 'DESC']]
            }) || await WinningCombination.findOne({
                where: { status: 'ended' },
                order: [['createdAt', 'DESC']]
            });

            if (activeOrLatestEnded) {
                winningCombinationId = activeOrLatestEnded.id;
            }
        }

        if (!winningCombinationId) {
            return res.status(400).json({ success: false, message: 'Competition not found' });
        }
        // const ticket = await Ticket.findOne({ where: { ticketID } });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Invalid Ticket ID. No ticket found with this ID.',
                field: 'ticketID'
            });
        }
        // Check for duplicate activate with same phone/email/instagram in this competition
        const orConditions = [];
        if (phone) orConditions.push({ phone });
        if (email) orConditions.push({ email });
        if (instagram) orConditions.push({ instagram });

        if (orConditions.length > 0) {
            const duplicate = await Activate.findOne({
                where: {
                    winningCombinationId,
                    [Op.or]: orConditions
                }
            });

            if (duplicate) {
                let field = '';
                if (duplicate.phone === phone) field = 'phone';
                else if (duplicate.email === email) field = 'email';
                else if (duplicate.instagram === instagram) field = 'instagram';

                return res.status(409).json({
                    success: false,
                    message: `Duplicate ${field} already used in this competition.`,
                    field
                });
            }
        }

        // 4️⃣ Upload files to Firebase
        let ticketImage = '';
        let proofImage = '';
        const uploadedFiles = await uploadFilesToFirebase(req.files);

        if (uploadedFiles && uploadedFiles.length > 0) {
            ticketImage = uploadedFiles[0]?.url || '';
            proofImage = uploadedFiles[1]?.url || '';
        }
        // Create Activate
        const newActivate = await Activate.create({
            ticketID,
            name: ticket.name || null,
            email: email || null,
            phone: phone || null,
            instagram: ticket.instagram || null,
            countryCode: countryCode || null,
            numbers: ticket.numbers || null,
            ticketImage,
            proofImage,
            winningCombinationId
        });

        return res.status(201).json({
            success: true,
            message: 'Activate submitted successfully!',
            data: newActivate
        });

    } catch (err) {
        console.error('❌ Submit Activate error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ========================
// Get All Activate for Current Competition
// ========================
export const getActivates = async (req, res) => {
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

        const activates = await Activate.findAll({
            where: { winningCombinationId: competition.id },
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: activates
        });

    } catch (err) {
        console.error('❌ Error fetching activates:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


// ✅ Export both functions for use in routes
// export { submitActivate, getActivates };
