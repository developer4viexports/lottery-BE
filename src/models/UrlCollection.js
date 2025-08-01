export default function UrlCollectionModel(sequelize, DataTypes) {
    const UrlCollection = sequelize.define('UrlCollection', {
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true,
            },
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        revealDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    }, {
        timestamps: true,
    });

    return UrlCollection;
}
