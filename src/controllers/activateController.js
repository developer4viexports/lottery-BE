import { Activate, Ticket, WinningCombination } from '../models/index.js';
import { Op } from 'sequelize';
import { uploadFilesToFirebase } from '../utils/firebaseUpload.js  ';

// Background file processing function for activate forms
const processActivateFilesAsync = async (activateId, files) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Activate file processing timeout')), 60000)
    );

    try {
        console.log(`🔄 Processing activate files in background for ID ${activateId}`);
        
        // Upload files to Firebase with timeout protection
        const uploadedFiles = await Promise.race([
            uploadFilesToFirebase(files),
            timeout
        ]);
        
        // Prepare update data
        const updateData = {};
        if (uploadedFiles && uploadedFiles.length > 0) {
            // Map uploaded files to proper fields
            uploadedFiles.forEach(file => {
                if (file.key === 'ticketImage') {
                    updateData.ticketImage = file.url;
                } else if (file.key === 'proofImage') {
                    updateData.proofImage = file.url;
                } else if (file.key === 'file') {
                    updateData.ticketImage = file.url; // Default file field
                }
            });
        }
        
        // Update activate record with file URLs
        await Activate.update(updateData, {
            where: { id: activateId }
        });
        
        console.log(`✅ Activate files processed successfully for ID ${activateId}`);
    } catch (error) {
        console.error(`❌ Failed to process activate files for ID ${activateId}:`, error);
    }
};

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

        // Optimized: Get ticket and winning combination in fewer queries
        const ticket = await Ticket.findOne({ where: { ticketID } });

        let winningCombinationId = null;
        if (ticket?.winningCombinationId) {
            winningCombinationId = ticket.winningCombinationId;
        } else {
            // Single optimized query for active or latest ended competition
            const activeOrLatestEnded = await WinningCombination.findOne({
                where: {
                    [Op.or]: [
                        { status: 'active' },
                        { status: 'ended' }
                    ]
                },
                order: [
                    ['status', 'DESC'], // 'active' comes before 'ended' alphabetically  
                    ['createdAt', 'DESC']
                ]
            });

            if (activeOrLatestEnded) {
                winningCombinationId = activeOrLatestEnded.id;
            }
        }

        if (!winningCombinationId) {
            return res.status(400).json({ success: false, message: 'Competition not found' });
        }

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

        // 4️⃣ Store files for background processing instead of blocking upload
        const hasFiles = req.files && Object.keys(req.files).length > 0;
        let ticketImage = '';
        let proofImage = '';
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

        // Process file uploads in background if files exist
        if (hasFiles) {
            // Don't await - let it process in background
            processActivateFilesAsync(newActivate.id, req.files).catch(error => {
                console.error('Background activate file upload failed for ID:', newActivate.id, error);
            });
        }

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
