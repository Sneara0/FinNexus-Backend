import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
// 1. Import Prisma Client
import { prisma } from '../lib/prisma.js';
// 2. Import Enums from Generated Client
import { TransactionType, TransactionCategory, BudgetPeriod } from '../../generated/prisma/index.js';
dotenv.config();
const DEMO_CREDENTIALS = {
    admin: {
        email: process.env.DEMO_ADMIN_EMAIL || 'admin@finnexus.com',
        password: process.env.DEMO_ADMIN_PASSWORD || 'admin123',
        name: 'Super Admin',
        role: 'ADMIN'
    },
    manager: {
        email: process.env.DEMO_MANAGER_EMAIL || 'manager@finnexus.com',
        password: process.env.DEMO_MANAGER_PASSWORD || 'manager123',
        name: 'Branch Manager',
        role: 'MANAGER'
    },
    user: {
        email: process.env.DEMO_USER_EMAIL || 'user@finnexus.com',
        password: process.env.DEMO_USER_PASSWORD || 'user123',
        name: 'Test User',
        role: 'USER'
    }
};
async function main() {
    console.log('\n🌱 Seeding database started...\n');
    const createdUsers = [];
    // --- Create Users and User Settings ---
    for (const [key, cred] of Object.entries(DEMO_CREDENTIALS)) {
        const hashedPassword = await bcrypt.hash(cred.password, 10);
        // Upsert User (Create or Update if exists)
        const user = await prisma.user.upsert({
            where: { email: cred.email },
            update: {
                password: hashedPassword,
                name: cred.name,
                role: cred.role,
                isActive: true,
            },
            create: {
                email: cred.email,
                password: hashedPassword,
                name: cred.name,
                role: cred.role,
                isActive: true,
                isVerified: true,
                emailVerified: new Date(),
                // Using 'userSettings' as per your schema
                userSettings: {
                    create: {
                        currency: 'BDT',
                        language: 'en', // Changed default language to English
                        theme: 'dark',
                        emailNotifications: true,
                        pushNotifications: true,
                        weeklyReport: true,
                        monthlyBudgetAlert: true
                    }
                }
            }
        });
        console.log(`✅ ${cred.role} User ready: ${cred.email}`);
        createdUsers.push(user);
    }
    const adminUser = createdUsers.find(u => u.role === 'ADMIN');
    if (adminUser) {
        // --- Create Demo Transactions ---
        const existingTxCount = await prisma.transaction.count({ where: { userId: adminUser.id } });
        if (existingTxCount === 0) {
            await prisma.transaction.createMany({
                data: [
                    {
                        userId: adminUser.id,
                        type: TransactionType.INCOME,
                        category: TransactionCategory.SALARY,
                        amount: 150000,
                        description: 'Monthly Salary',
                        date: new Date(),
                        tags: ['salary', 'office']
                    },
                    {
                        userId: adminUser.id,
                        type: TransactionType.EXPENSE,
                        category: TransactionCategory.FOOD,
                        amount: 5000,
                        description: 'Dinner with family',
                        date: new Date(),
                        tags: ['food', 'leisure']
                    }
                ]
            });
            console.log(`✅ Demo transactions created for Admin`);
        }
        // --- Create Demo Budget ---
        const existingBudgetCount = await prisma.budget.count({ where: { userId: adminUser.id } });
        if (existingBudgetCount === 0) {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            await prisma.budget.create({
                data: {
                    userId: adminUser.id,
                    category: TransactionCategory.FOOD,
                    amount: 20000,
                    period: BudgetPeriod.MONTHLY,
                    startDate: startOfMonth,
                    endDate: endOfMonth,
                    alertThreshold: 80,
                    spent: 5000,
                    // 'month' field removed as it was missing from your schema
                }
            });
            console.log(`✅ Budget created for Admin`);
        }
    }
    // Save Demo Credentials to a JSON file for reference
    const demoCredPath = path.join(process.cwd(), 'demo-credentials.json');
    fs.writeFileSync(demoCredPath, JSON.stringify(DEMO_CREDENTIALS, null, 2));
    console.log('\n✨ Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
