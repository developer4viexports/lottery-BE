export default function ClaimModel(sequelize, DataTypes) {
    const Claim = sequelize.define('Claim', {
        name: {
            type: DataTypes.STRING,
            allowNull: true, // ✅ make optional
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true, // ✅ make optional
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        instagram: {
            type: DataTypes.STRING,
            allowNull: true, // ✅ make optional
        },
        ticketID: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numbers: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        winningCombinationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'Claims',
        timestamps: true,
        indexes: [
            { fields: ['email'] },
            { fields: ['phone'] },
            { fields: ['instagram'] },
            { fields: ['winningCombinationId'] }
        ]

    });

    return Claim;
}
