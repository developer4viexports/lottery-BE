// models/GeneratedTicket.js

export default function GeneratedTicketModel(sequelize, DataTypes) {
    const GeneratedTicket = sequelize.define('GeneratedTicket', {
        numbers: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
        },
        prizeType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['Grand', 'Silver', 'Bronze', 'Consolation', 'N/A']]  // Added 'N/A'
            }
        },
        winningCombinationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'WinningCombinations', // Ensure this matches the table name in your DB
                key: 'id',
            },
            allowNull: true,
            index: true,
        },
        isAssigned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // Track whether this ticket has been assigned or not
        }
    }, {
        timestamps: true,
        tableName: 'GeneratedTickets',  // Ensure this matches the table name in your DB
        indexes: [
            { fields: ['isAssigned'] },              
            { fields: ['winningCombinationId'] },     
            // Composite index for random ticket selection performance
            { fields: ['winningCombinationId', 'isAssigned'] },
            // Index for counting queries
            { fields: ['winningCombinationId', 'isAssigned', 'createdAt'] }
        ]
    });

    return GeneratedTicket;
}
