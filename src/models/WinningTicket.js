export default function WinningTicketModel(sequelize, DataTypes) {
    const WinningTicket = sequelize.define('WinningTicket', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ticketID: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: true,
    });

    return WinningTicket;
}
