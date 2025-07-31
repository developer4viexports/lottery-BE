export default function UrlCollectionModel(sequelize, DataTypes) {
    const UrlCollection = sequelize.define('UrlCollection', {
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true,
            },
        },
        collectedAt: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    }, {
        timestamps: true,
    });

    return UrlCollection;
}
