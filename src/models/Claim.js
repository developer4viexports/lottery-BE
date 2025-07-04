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
    }, {
        timestamps: true,
    });

    return Claim;
}
