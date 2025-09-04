export default function TicketModel(sequelize, DataTypes) {
    const Ticket = sequelize.define('Ticket', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            // Removed unique constraint
            validate: {
                is: {
                    args: /^\+?[1-9]\d{7,14}$/, // E.164 format
                    msg: 'Phone must be a valid international number',
                },
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            // Removed unique constraint
            validate: { isEmail: true },
        },
        instagram: {
            type: DataTypes.STRING,
            allowNull: false,
            // Removed unique constraint
        },
        ticketID: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // This should stay unique
        },
        numbers: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            unique: true, // Keep this if each number combo must be unique
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
            defaultValue: false,
        },
        purchaseProof: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        prizeType: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isIn: [['Grand', 'Silver', 'Bronze', 'Consolation', 'N/A']], // Add 'N/A' here
            },
        },
        followProof: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        winningCombinationId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'WinningCombinations',
                key: 'id',
            },
            allowNull: true,
            index: true,
        },
        ticketImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },

    }, {
        timestamps: true,
        indexes: [
            { fields: ['ticketID'] },
            { fields: ['phone'] },
            { fields: ['email'] },
            { fields: ['instagram'] },
            { fields: ['winningCombinationId'] },
            { fields: ['prizeType'] },
            // Composite indexes for duplicate checking performance
            { fields: ['winningCombinationId', 'phone'] },
            { fields: ['winningCombinationId', 'email'] },
            { fields: ['winningCombinationId', 'instagram'] },
            // Index for admin queries
            { fields: ['winningCombinationId', 'createdAt'] },
            { fields: ['createdAt'] }
        ]

    });

    return Ticket;
}
