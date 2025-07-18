// ✅ PrizeTier Controller Update
import { PrizeTier } from '../models/index.js';

// GET all
export const getAllPrizeTiers = async (req, res) => {
    try {
        const entries = await PrizeTier.findAll({ order: [['matchType', 'ASC']] });
        res.json({ success: true, data: entries });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch prize tiers' });
    }
};

// POST create or update if exists
export const createOrUpdatePrizeTier = async (req, res) => {
    const { matchType, ticketType, prize } = req.body || {};
    if (!matchType || !ticketType || !prize) {
        return res.status(400).json({ success: false, message: 'All fields required' });
    }

    try {
        const [entry, created] = await PrizeTier.findOrCreate({
            where: { matchType, ticketType },
            defaults: { prize },
        });

        if (!created) {
            // Update if already exists
            await entry.update({ prize });
        }

        res.status(created ? 201 : 200).json({ success: true, data: entry });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to save prize tier' });
    }
};

// PUT update specific by ID
export const updatePrizeTier = async (req, res) => {
    const { id } = req.params;
    const { prize } = req.body;

    try {
        const updated = await PrizeTier.update(
            { prize },
            { where: { id }, returning: true }
        );

        if (!updated[0]) return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true, data: updated[1][0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update prize tier' });
    }
};

// DELETE specific by ID
export const deletePrizeTier = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await PrizeTier.destroy({ where: { id } });
        if (!result) return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete prize tier' });
    }
};

// // ✅ PrizeTier Model (unchanged)
// export default (sequelize, DataTypes) => {
//     const PrizeTier = sequelize.define('PrizeTier', {
//         matchType: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         ticketType: {
//             type: DataTypes.ENUM('regular', 'super'),
//             allowNull: false,
//         },
//         prize: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//     }, {
//         indexes: [
//             {
//                 unique: true,
//                 fields: ['matchType', 'ticketType'], // ✅ Enforce uniqueness at DB level
//             },
//         ],
//     });

//     return PrizeTier;
// };
