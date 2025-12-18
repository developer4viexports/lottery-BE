import { Admin, AppSettings } from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const loginAdmin = async (req, res) => {
    // console.log('🔒 Login route called');
    const { email, password } = req.body;

    if (!email || !password) {
        // console.log('❌ Missing credentials');
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const admin = await Admin.findOne({ where: { email },raw: true });
        console.log('Admin-=-=-', admin);
        if (!admin) {
            console.log('❌ Admin not found:', email);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        console.log('Stored hash: admin.password ', admin.password);
        console.log('Entered password: password', password);
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match: isMatch', isMatch);
        if (!isMatch) {
            console.log('❌ Wrong password for:', email);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { adminId: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // console.log('✅ Login successful for:', email);
        res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin.id,
                email: admin.email,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const verifyComboPassword = async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }

    try {
        const isMatch = await AppSettings.verifyComboPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Access granted'
        });
    } catch (err) {
        console.error('Combo password verification error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const updateComboPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({
            success: false,
            message: 'New password is required'
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters'
        });
    }

    try {
        // Check if password exists in DB
        const existingPassword = await AppSettings.getSetting('combo_view_password');

        if (existingPassword) {
            // Password exists - require current password
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required'
                });
            }

            // Verify current password
            const isMatch = await AppSettings.verifyComboPassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        }

        // Set new password (hashed)
        await AppSettings.setComboPassword(newPassword);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        console.error('Update combo password error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const checkComboPasswordExists = async (req, res) => {
    try {
        const existingPassword = await AppSettings.getSetting('combo_view_password');
        res.status(200).json({
            success: true,
            exists: !!existingPassword
        });
    } catch (err) {
        console.error('Check combo password error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
