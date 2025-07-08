export default function WinningCombinationModel(sequelize, DataTypes) {
    const WinningCombination = sequelize.define('WinningCombination', {
        numbers: {
            type: DataTypes.ARRAY(DataTypes.STRING), // ['12', '34', '56', '78', '90', '23', '45']
            allowNull: false,
        },
        grandQuota: { type: DataTypes.INTEGER, allowNull: false },
        silverQuota: { type: DataTypes.INTEGER, allowNull: false },
        bronzeQuota: { type: DataTypes.INTEGER, allowNull: false },
        consolationQuota: { type: DataTypes.INTEGER, allowNull: false },
        grandWinners: { type: DataTypes.INTEGER, defaultValue: 0 },
        silverWinners: { type: DataTypes.INTEGER, defaultValue: 0 },
        bronzeWinners: { type: DataTypes.INTEGER, defaultValue: 0 },
        consolationWinners: { type: DataTypes.INTEGER, defaultValue: 0 },
    }, {
        timestamps: true,
    });

    return WinningCombination;
}
