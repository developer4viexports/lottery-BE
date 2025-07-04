import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Sequelize once
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
 
// Initialize models
const Admin = AdminModel(sequelize, DataTypes);
const Claim = ClaimModel(sequelize, DataTypes);
const Ticket = TicketModel(sequelize, DataTypes);
const WinningTicket = WinningTicketModel(sequelize, DataTypes);

// Single export (no duplicate)
export {
    sequelize,
    Admin,
    Claim,
    Ticket,
    WinningTicket
};
