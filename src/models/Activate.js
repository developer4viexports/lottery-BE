export default function ActivateModel(sequelize, DataTypes) {
    const Activate = sequelize.define('Activate', {
        ticketID: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        instagram: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        countryCode: {
            type: DataTypes.STRING,
            allowNull: true,    
        },
        ticketImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        proofImage: {
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
        },
    }, {
        timestamps: true,
    });

    return Activate;
}
