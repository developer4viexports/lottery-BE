// models/PrizeTier.js
export default (sequelize, DataTypes) => {
    const PrizeTier = sequelize.define('PrizeTier', {
        matchType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ticketType: {
            type: DataTypes.ENUM('regular', 'super'),
            allowNull: false,
        },
        prize: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return PrizeTier;
};
