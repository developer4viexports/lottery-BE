import { Admin } from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const loginAdmin = async (req, res) => {
    // console.log('🔒 Login route called');
    const { email, password } = req.body;

    if (!email || !password) {
        // console.log('❌ Missing credentials');
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const admin = await Admin.findOne({ where: { email } });

        if (!admin) {
            // console.log('❌ Admin not found:', email);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        // console.log('Stored hash:', admin.password);
        // console.log('Entered password:', password);
        const isMatch = await bcrypt.compare(password, admin.password);
        // console.log('Password match:', isMatch);
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
