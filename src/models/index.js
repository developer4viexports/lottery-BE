import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Sequelize
const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.POSTGRES_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
    }
);

// Import model factory functions
import AdminModel from './Admin.js';
import ActivateModel from './Activate.js';
import TicketModel from './Ticket.js';
import WinningTicketModel from './WinningTicket.js';
import WinningCombinationModel from './WinningCombination.js';
import GeneratedTicketModel from './GeneratedTicket.js';  // New import for GeneratedTicket
import PrizeTierModel from './PrizeTier.js';
import ContactMessageModel from './ContactMessage.js'; // Import ContactMessage model
import ClaimModel from './Claim.js'; // ✅ NEW: Claim model

// Initialize models
const Admin = AdminModel(sequelize, DataTypes);
const Activate = ActivateModel(sequelize, DataTypes);
const Ticket = TicketModel(sequelize, DataTypes);
const WinningTicket = WinningTicketModel(sequelize, DataTypes);
const WinningCombination = WinningCombinationModel(sequelize, DataTypes);
const GeneratedTicket = GeneratedTicketModel(sequelize, DataTypes);  // New model initialization
const PrizeTier = PrizeTierModel(sequelize, DataTypes);
const ContactMessage = ContactMessageModel(sequelize, DataTypes); // Initialize ContactMessage model
const Claim = ClaimModel(sequelize, DataTypes); // ✅ Initialize Claim

// ✅ Setup Associations

// One WinningCombination has many Tickets
WinningCombination.hasMany(Ticket, {
    foreignKey: 'winningCombinationId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Ticket.belongsTo(WinningCombination, {
    foreignKey: 'winningCombinationId',
});

// One WinningCombination has many Activates
WinningCombination.hasMany(Activate, {
    foreignKey: 'winningCombinationId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Activate.belongsTo(WinningCombination, {
    foreignKey: 'winningCombinationId',
});

// One WinningCombination has many GeneratedTickets (new association)
WinningCombination.hasMany(GeneratedTicket, {
    foreignKey: 'winningCombinationId',  // Foreign key in GeneratedTicket model
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
GeneratedTicket.belongsTo(WinningCombination, {
    foreignKey: 'winningCombinationId',  // Foreign key in GeneratedTicket model
});

// ✅ WinningCombination → Claims
WinningCombination.hasMany(Claim, {
    foreignKey: 'winningCombinationId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Claim.belongsTo(WinningCombination, {
    foreignKey: 'winningCombinationId',
});

// Export all models
export {
    sequelize,
    Admin,
    Activate,
    Ticket,
    WinningTicket,
    WinningCombination,
    GeneratedTicket,  // Added export for GeneratedTicket
    PrizeTier,
    ContactMessage,
    Claim, // ✅ Export Claim
};
