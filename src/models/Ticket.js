export default function TicketModel(sequelize, DataTypes) {
    const Ticket = sequelize.define('Ticket', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            is: {
                args: /^\+?[1-9]\d{7,14}$/, // Allows +91..., 10-15 digits
                msg: 'Phone must be a valid international number (E.164 format)',
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        instagram: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        ticketID: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        numbers: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            unique: true,
        },
        issueDate: {
            type: DataTypes.STRING,
        },
        expiryDate: {
            type: DataTypes.STRING,
        },
        proofImage: {
            type: DataTypes.STRING,
        },
        isSuperTicket: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        purchaseProof: {
            type: DataTypes.STRING,
            allowNull: true
        },
        prizeType: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isIn: [['Grand', 'Silver', 'Bronze', 'Consolation']],
            },
        },
        followProof: {
            type: DataTypes.STRING,
            allowNull: true
        },

    }, {
        timestamps: true,
    });

    return Ticket;
}
