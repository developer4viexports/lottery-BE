import { ContactMessage } from '../models/index.js ';

export const submitContactMessage = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({ success: false, message: 'All fields except file are required' });
        }

        const saved = await ContactMessage.create({
            name,
            email,
            phone,
            message,
            fileUrl
        });

        res.status(201).json({ success: true, data: saved, message: 'Message submitted successfully!' });
    } catch (err) {
        console.error('❌ Contact submit error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


export const getAllContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        console.error('❌ Error fetching contact messages:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};