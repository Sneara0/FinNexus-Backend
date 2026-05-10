import dotenv from 'dotenv';
import path from 'path';

// .env ফাইল লোড করা
dotenv.config({ path: path.join(process.cwd(), '.env') });

// ইন্টারফেস ডিফাইন
export interface EnvConfig {
  DATABASE_URL: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  GEMINI_API_KEY: string; // কনটেস্টের AI ফিচারের জন্য এটি যোগ করুন
  DEMO_ADMIN_EMAIL?: string; // ডেমো অ্যাডমিনের ইমেইল (ঐচ্ছিক)
  DEMO_ADMIN_PASSWORD?: string; // ডেমো অ্যাডমিনের পাসওয়ার্ড (ঐচ্ছিক)
    DEMO_USER_EMAIL?: string; // ডেমো ইউজারের ইমেইল (ঐচ্ছিক)
  DEMO_USER_PASSWORD?: string; // ডেমো ইউজারের পাসওয়ার্ড (ঐচ্ছিক)
    DEMO_MANAGER_EMAIL?: string; // ডেমো ম্যানেজারের ইমেইল (ঐচ্ছিক)
  DEMO_MANAGER_PASSWORD?: string; // ডেমো ম্যানেজারের পাসওয়ার্ড (ঐচ্ছিক)
}

const _config: EnvConfig = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '', 
  DEMO_ADMIN_EMAIL: process.env.DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD: process.env.DEMO_ADMIN_PASSWORD,
  DEMO_MANAGER_EMAIL: process.env.DEMO_MANAGER_EMAIL,
  DEMO_MANAGER_PASSWORD: process.env.DEMO_MANAGER_PASSWORD,
  DEMO_USER_EMAIL: process.env.DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD: process.env.DEMO_USER_PASSWORD,

};

// ডাটাবেজ ইউআরএল না থাকলে এরর থ্রো করা প্রোডাকশন রেডি অ্যাপের জন্য জরুরি
if (!_config.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing in .env file");
}

export default _config;