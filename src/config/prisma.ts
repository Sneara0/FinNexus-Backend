import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
// আপনার কাস্টম জেনারেটেড পাথ থেকে PrismaClient ইম্পোর্ট করুন
import { PrismaClient } from '../generated/prisma/index.js';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Prisma v7+ এ কনস্ট্রাকটরে আর্গুমেন্ট পাঠানো জরুরি
export const prisma = new PrismaClient({ adapter });