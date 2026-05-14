import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../config/prisma.js'; // আপনার ফোল্ডার স্ট্রাকচার অনুযায়ী পাথটি চেক করুন
import dotenv from 'dotenv';
dotenv.config();
export class AuthService {
    // ১. রেজিস্ট্রেশন সার্ভিস
    static async register(email, password, name) {
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email))
            throw new Error('সঠিক ইমেইল ঠিকানা দিন');
        if (password.length < 6)
            throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser)
            throw new Error('এই ইমেইলে ইতিমধ্যে একটি একাউন্ট আছে');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'USER',
                isActive: true,
                userSettings: {
                    create: { currency: 'BDT', theme: 'light' }
                }
            },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        const token = this.generateToken(user.id, user.email, user.role);
        return { user, token };
    }
    // ২. লগইন সার্ভিস
    static async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('ইমেইল বা পাসওয়ার্ড ভুল');
        }
        if (!user.isActive)
            throw new Error('আপনার একাউন্টটি নিষ্ক্রিয় করা হয়েছে');
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        const token = this.generateToken(user.id, user.email, user.role);
        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token
        };
    }
    // ৩. ডেমো লগইন সার্ভিস
    static async demoLogin(role) {
        const demoEmails = {
            admin: 'admin@finnexus.com',
            manager: 'manager@finnexus.com',
            user: 'user@finnexus.com'
        };
        const email = demoEmails[role.toLowerCase()];
        if (!email)
            throw new Error('ভুল রোল নির্বাচন করা হয়েছে');
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error('ডেমো ইউজার পাওয়া যায়নি। দয়া করে Seed রান করুন।');
        const token = this.generateToken(user.id, user.email, user.role);
        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token
        };
    }
    // ৪. প্রোফাইল পাওয়া
    static async getProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                address: true,
                isActive: true,
                createdAt: true
            }
        });
        if (!user)
            throw new Error('ইউজার পাওয়া যায়নি');
        return user;
    }
    // ৫. প্রোফাইল আপডেট
    static async updateProfile(userId, data) {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address
            },
            select: { id: true, email: true, name: true, role: true, phone: true, address: true }
        });
    }
    // ৬. পাসওয়ার্ড পরিবর্তন
    static async changePassword(userId, currentPass, newPass) {
        if (newPass.length < 6)
            throw new Error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('ইউজার পাওয়া যায়নি');
        const isMatch = await bcrypt.compare(currentPass, user.password);
        if (!isMatch)
            throw new Error('বর্তমান পাসওয়ার্ড ভুল');
        const hashedPassword = await bcrypt.hash(newPass, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return { message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে' };
    }
    // ৭. ডেমো ক্রেডেনশিয়াল
    static async getDemoCredentials() {
        return {
            admin: { email: 'admin@finnexus.com', password: 'admin123' },
            manager: { email: 'manager@finnexus.com', password: 'manager123' },
            user: { email: 'user@finnexus.com', password: 'user123' }
        };
    }
    // ৮. টোকেন জেনারেটর (Internal Helper)
    static generateToken(id, email, role) {
        const secret = (process.env.JWT_SECRET || 'finnexus_secret');
        const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
        return jwt.sign({ id, email, role }, secret, { expiresIn: expiresIn });
    }
}
export default AuthService;
