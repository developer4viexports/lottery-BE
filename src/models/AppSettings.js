import bcrypt from 'bcryptjs';

export default function AppSettingsModel(sequelize, DataTypes) {
    const AppSettings = sequelize.define('AppSettings', {
        key: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            primaryKey: true,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        timestamps: true,
    });

    // Static method to get a setting
    AppSettings.getSetting = async function(key) {
        const setting = await this.findByPk(key);
        return setting ? setting.value : null;
    };

    // Static method to set a setting
    AppSettings.setSetting = async function(key, value) {
        const [setting] = await this.upsert({ key, value });
        return setting;
    };

    // Static method to set hashed password
    AppSettings.setComboPassword = async function(plainPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        return this.setSetting('combo_view_password', hashedPassword);
    };

    // Static method to verify combo password
    AppSettings.verifyComboPassword = async function(plainPassword) {
        const hashedPassword = await this.getSetting('combo_view_password');
        if (!hashedPassword) return false;
        return bcrypt.compare(plainPassword, hashedPassword);
    };

    return AppSettings;
}
