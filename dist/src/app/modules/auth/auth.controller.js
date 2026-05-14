import { AuthService } from './auth.service.js';
// ========================================
// Auth Controller - শুধু রিকোয়েস্ট/রেসপন্স হ্যান্ডল করে
// ========================================
// 1. রেজিস্ট্রেশন
export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'ইমেইল, পাসওয়ার্ড এবং নাম প্রয়োজন'
            });
        }
        const result = await AuthService.register(email, password, name);
        res.status(201).json({
            success: true,
            message: 'রেজিস্ট্রেশন সফল হয়েছে',
            data: result
        });
    }
    catch (error) {
        console.error('Register error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে'
        });
    }
};
// 2. লগইন
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'ইমেইল এবং পাসওয়ার্ড প্রয়োজন'
            });
        }
        const result = await AuthService.login(email, password);
        res.json({
            success: true,
            message: 'লগইন সফল হয়েছে',
            data: result
        });
    }
    catch (error) {
        console.error('Login error:', error.message);
        res.status(401).json({
            success: false,
            message: error.message || 'লগইন ব্যর্থ হয়েছে'
        });
    }
};
// 3. ডেমো লগইন
export const demoLogin = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'রোল প্রয়োজন (admin, manager, user)'
            });
        }
        const result = await AuthService.demoLogin(role);
        res.json({
            success: true,
            message: `${role} হিসেবে লগইন সফল হয়েছে`,
            data: result
        });
    }
    catch (error) {
        console.error('Demo login error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'ডেমো লগইন ব্যর্থ হয়েছে'
        });
    }
};
// 4. প্রোফাইল দেখা
export const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'আপনি লগইন করেননি'
            });
        }
        const user = await AuthService.getProfile(userId);
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        console.error('Get profile error:', error.message);
        res.status(404).json({
            success: false,
            message: error.message || 'প্রোফাইল পাওয়া যায়নি'
        });
    }
};
// 5. প্রোফাইল আপডেট
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, phone, address } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'আপনি লগইন করেননি'
            });
        }
        const user = await AuthService.updateProfile(userId, { name, phone, address });
        res.json({
            success: true,
            message: 'প্রোফাইল আপডেট করা হয়েছে',
            data: { user }
        });
    }
    catch (error) {
        console.error('Update profile error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে'
        });
    }
};
// 6. পাসওয়ার্ড পরিবর্তন
export const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'আপনি লগইন করেননি'
            });
        }
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড প্রয়োজন'
            });
        }
        await AuthService.changePassword(userId, currentPassword, newPassword);
        res.json({
            success: true,
            message: 'পাসওয়ার্ড পরিবর্তন করা হয়েছে'
        });
    }
    catch (error) {
        console.error('Change password error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে'
        });
    }
};
// 7. ডেমো ক্রেডেনশিয়াল পাওয়া
export const getDemoCredentials = async (req, res) => {
    try {
        const credentials = await AuthService.getDemoCredentials();
        res.json({
            success: true,
            data: {
                credentials,
                message: 'ডেমো লগইনের জন্য এই ক্রেডেনশিয়াল ব্যবহার করুন'
            }
        });
    }
    catch (error) {
        console.error('Get demo credentials error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'ক্রেডেনশিয়াল পাওয়া যায়নি'
        });
    }
};
