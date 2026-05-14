import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
// কানেকশন পুল তৈরি (Driver Adapter এর জন্য প্রয়োজন)
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
/**
 * Prisma v7.8.0+ এ PrismaClient-এর ভেতর অপশন অবজেক্ট দেওয়া বাধ্যতামূলক।
 * আপনার স্ক্রিনশট অনুযায়ী এখানে adapter পাস করা হয়েছে।
 */
export const prisma = global.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
export const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('✅ ডাটাবেস সফলভাবে সংযুক্ত হয়েছে');
    }
    catch (error) {
        console.error('❌ ডাটাবেস সংযোগ ব্যর্থ:', error);
        process.exit(1);
    }
};
export default prisma;
