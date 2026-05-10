import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// ১. এনামগুলো ইম্পোর্ট
import { 
  UserRole, 
  TransactionType, 
  TransactionCategory, 
  BudgetPeriod 
} from '../../generated/prisma/index.js';

// ২. প্রিজমা ক্লায়েন্ট ইম্পোর্ট
import { prisma } from '../../config/prisma.js';

dotenv.config();

const DEMO_CREDENTIALS = {
  admin: {
    email: process.env.DEMO_ADMIN_EMAIL || 'admin@finnexus.com',
    password: process.env.DEMO_ADMIN_PASSWORD || 'admin123',
    name: 'Super Admin',
    role: 'ADMIN' as UserRole
  },
  manager: {
    email: process.env.DEMO_MANAGER_EMAIL || 'manager@finnexus.com',
    password: process.env.DEMO_MANAGER_PASSWORD || 'manager123',
    name: 'Branch Manager',
    role: 'MANAGER' as UserRole
  },
  user: {
    email: process.env.DEMO_USER_EMAIL || 'user@finnexus.com',
    password: process.env.DEMO_USER_PASSWORD || 'user123',
    name: 'Test User',
    role: 'USER' as UserRole
  }
};

async function main() {
  console.log('\n🌱 Seeding database started...\n');

  const createdUsers: any[] = [];

  // --- ইউজার এবং ইউজার সেটিংস তৈরি ---
  for (const [key, cred] of Object.entries(DEMO_CREDENTIALS)) {
    const hashedPassword = await bcrypt.hash(cred.password, 10);
    
    // ইউজার তৈরি বা আপডেট (Upsert)
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
        // ✅ 'settings' বদলে 'userSettings' ব্যবহার করা হয়েছে (আপনার স্কিমা অনুযায়ী)
        userSettings: {
          create: {
            currency: 'BDT',
            language: 'bn',
            theme: 'dark',
            emailNotifications: true,
            pushNotifications: true,
            weeklyReport: true,
            monthlyBudgetAlert: true
          }
        }
      }
    });
    
    console.log(`✅ ${cred.role} ইউজার রেডি: ${cred.email}`);
    createdUsers.push(user);
  }

  const adminUser = createdUsers.find(u => u.role === 'ADMIN');
  
  if (adminUser) {
    // --- ডেমো ট্রানজেকশন তৈরি ---
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
      console.log(`✅ অ্যাডমিনের জন্য ডেমো ট্রানজেকশন তৈরি হয়েছে`);
    }

    // --- ডেমো বাজেট তৈরি ---
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
          month: startOfMonth 
        }
      });
      console.log(`✅ অ্যাডমিনের জন্য বাজেট তৈরি হয়েছে`);
    }
  }

  // ডেমো ক্রেডেনশিয়াল ফাইল সেভ করা
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