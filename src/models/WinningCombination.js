export default function WinningCombinationModel(sequelize, DataTypes) {
    const WinningCombination = sequelize.define('WinningCombination', {
        numbers: {
            type: DataTypes.ARRAY(DataTypes.STRING), // ['12', '34', ...]
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

        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active',
            validate: {
                isIn: [['active', 'ended']]
            }
        }

    }, {
        timestamps: true,
        tableName: 'WinningCombinations'
    });

    return WinningCombination;
}
