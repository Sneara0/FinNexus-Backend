import dotenv from 'dotenv';
import path from 'path';
// .env ফাইল লোড করা
dotenv.config({ path: path.join(process.cwd(), '.env') });
const _config = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
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
