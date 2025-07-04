// src/models/Admin.js
import bcrypt from 'bcrypt';

export default function AdminModel(sequelize, DataTypes) {
    const Admin = sequelize.define('Admin', {
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        hooks: {
            beforeCreate: async (admin) => {
                const salt = await bcrypt.genSalt(10);
                admin.password = await bcrypt.hash(admin.password, salt);
            },
        },
    });

    Admin.prototype.comparePassword = function (candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    };

    return Admin;
}
