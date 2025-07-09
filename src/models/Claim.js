export default function ClaimModel(sequelize, DataTypes) {
    const Claim = sequelize.define('Claim', {
        ticketID: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        phone: {
            type: DataTypes.STRING,
        },
        instagram: {
            type: DataTypes.STRING,
        },
        countryCode: {
            type: DataTypes.STRING,
        },
        ticketImage: {
            type: DataTypes.STRING,
        },
        proofImage: {
            type: DataTypes.STRING,
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

    return Claim;
}
