export default function ClaimModel(sequelize, DataTypes) {
    const Claim = sequelize.define('Claim', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        instagram: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ticketID: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numbers: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true, // ✅ allow null initially
        },
        winningCombinationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'Claims',
        timestamps: true
    });

    return Claim;
}
