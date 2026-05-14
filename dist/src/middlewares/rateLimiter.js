const requests = new Map();
// ========================================
// রেট লিমিট মিডলওয়্যার
// ========================================
export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const record = requests.get(ip);
        // নতুন রেকর্ড বা রিসেট সময় পার হলে
        if (!record || now > record.resetTime) {
            requests.set(ip, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        // লিমিট অতিক্রম করলে
        if (record.count >= maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            return res.status(429).json({
                success: false,
                message: `অনেক বেশি রিকোয়েস্ট করছেন। ${retryAfter} সেকেন্ড পর চেষ্টা করুন।`,
                retryAfter
            });
        }
        // কাউন্ট বাড়ানো
        record.count++;
        next();
    };
};
// ========================================
// স্ট্রিক্ট রেট লিমিট (লগইনের জন্য)
// ========================================
export const strictRateLimiter = rateLimiter(15 * 60 * 1000, 5); // 15 মিনিটে 5 বার
// ========================================
// মিডিয়াম রেট লিমিট (API এর জন্য)
// ========================================
export const mediumRateLimiter = rateLimiter(60 * 1000, 30); // 1 মিনিটে 30 বার
// ========================================
// সফট রেট লিমিট (পাবলিক রাউটের জন্য)
// ========================================
export const softRateLimiter = rateLimiter(60 * 1000, 60); // 1 মিনিটে 60 বার
export default rateLimiter;
