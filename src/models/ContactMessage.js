// src/models/ContactMessage.js
export default (sequelize, DataTypes) => {
    const ContactMessage = sequelize.define('ContactMessage', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'contact_messages',
        timestamps: true,
    });

    return ContactMessage;
};
