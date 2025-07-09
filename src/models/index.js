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
import ClaimModel from './Claim.js';
import TicketModel from './Ticket.js';
import WinningTicketModel from './WinningTicket.js';
import WinningCombinationModel from './WinningCombination.js';

// Initialize models
const Admin = AdminModel(sequelize, DataTypes);
const Claim = ClaimModel(sequelize, DataTypes);
const Ticket = TicketModel(sequelize, DataTypes);
const WinningTicket = WinningTicketModel(sequelize, DataTypes);
const WinningCombination = WinningCombinationModel(sequelize, DataTypes);

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

// One WinningCombination has many Claims
WinningCombination.hasMany(Claim, {
    foreignKey: 'winningCombinationId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Claim.belongsTo(WinningCombination, {
    foreignKey: 'winningCombinationId',
});

// Export all
export {
    sequelize,
    Admin,
    Claim,
    Ticket,
    WinningTicket,
    WinningCombination,
};
