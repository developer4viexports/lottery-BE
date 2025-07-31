import { UrlCollection } from '../models/index.js';

// POST: Add only if none exists
export const collectUrl = async (req, res) => {
    try {
        const { url, collectedAt } = req.body;
        const existing = await UrlCollection.findOne();
        if (existing) {
            return res.status(409).json({ success: false, message: "A record already exists. Use update instead." });
        }

        if (!url || !collectedAt) {

            return res.status(400).json({ success: false, message: "Missing URL or date." });
        }

        const newEntry = await UrlCollection.create({ url, collectedAt });
        return res.status(201).json({ success: true, data: newEntry });
    } catch (error) {
        console.error("❌ Error in collectUrl:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// GET: Fetch the only existing record
export const getCollectedUrl = async (req, res) => {
    try {
        const entry = await UrlCollection.findOne();
        if (!entry) {
            return res.status(404).json({ success: false, message: "No data found." });
        }

        return res.json({ success: true, data: entry });
    } catch (error) {
        console.error("❌ Error in getCollectedUrl:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// PUT: Update the only existing record
export const updateCollectedUrl = async (req, res) => {
    try {
        const entry = await UrlCollection.findOne();
        if (!entry) {
            return res.status(404).json({ success: false, message: "No entry to update." });
        }

        const { url, collectedAt } = req.body;
        if (!url && !collectedAt) {
            return res.status(400).json({ success: false, message: "Provide at least one field to update." });
        }

        if (url) entry.url = url;
        if (collectedAt) entry.collectedAt = collectedAt;

        await entry.save();

        return res.json({ success: true, message: "URL entry updated successfully.", data: entry });
    } catch (error) {
        console.error("❌ Error in updateCollectedUrl:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
