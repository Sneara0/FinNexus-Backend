import { prisma } from "../../lib/prisma.js"; // ✅ আপনার সেন্ট্রাল প্রিজমা ক্লায়েন্ট
export class CategoryRuleService {
    // ১. ক্যাটাগরি রুল তৈরি
    static async createRule(userId, data) {
        const keyword = data.keyword.toLowerCase().trim();
        const existingRule = await prisma.categoryRule.findFirst({
            where: {
                userId,
                keyword
            }
        });
        if (existingRule) {
            throw new Error('এই কীওয়ার্ডের জন্য একটি রুল ইতিমধ্যে রয়েছে');
        }
        return await prisma.categoryRule.create({
            data: {
                userId,
                keyword,
                category: data.category,
                type: data.type || 'EXPENSE',
                priority: data.priority || 0,
                isActive: true
            },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });
    }
    // ২. সব রুল পাওয়া
    static async getAllRules(userId, page = 1, limit = 10, isActive) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [rules, total] = await Promise.all([
            prisma.categoryRule.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }),
            prisma.categoryRule.count({ where })
        ]);
        return {
            rules,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    // ৩. নির্দিষ্ট রুল পাওয়া
    static async getRuleById(id, userId) {
        const rule = await prisma.categoryRule.findFirst({
            where: { id, userId },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });
        if (!rule)
            throw new Error('রুল পাওয়া যায়নি');
        return rule;
    }
    // ৪. রুল আপডেট
    static async updateRule(id, userId, data) {
        const existingRule = await CategoryRuleService.getRuleById(id, userId);
        return await prisma.categoryRule.update({
            where: { id },
            data: {
                ...data,
                keyword: data.keyword ? data.keyword.toLowerCase().trim() : existingRule.keyword
            }
        });
    }
    // ৫. রুল ডিলিট
    static async deleteRule(id, userId) {
        await CategoryRuleService.getRuleById(id, userId);
        return await prisma.categoryRule.delete({ where: { id } });
    }
    // ৬. ক্যাটাগরি অটো ডিটেক্ট (AI এর বিকল্প হিসেবে কাজ করবে)
    static async autoDetectCategory(description, userId) {
        if (!description)
            return null;
        const lowerDescription = description.toLowerCase();
        const rules = await prisma.categoryRule.findMany({
            where: { userId, isActive: true },
            orderBy: { priority: 'desc' }
        });
        for (const rule of rules) {
            if (lowerDescription.includes(rule.keyword.toLowerCase())) {
                return {
                    category: rule.category,
                    type: rule.type,
                    ruleId: rule.id,
                    matchedKeyword: rule.keyword
                };
            }
        }
        return null;
    }
    // ৭. বাল্ক ডিলিট
    static async bulkDeleteRules(ruleIds, userId) {
        const result = await prisma.categoryRule.deleteMany({
            where: { id: { in: ruleIds }, userId }
        });
        return result.count;
    }
    // ৮. স্ট্যাটাস টগল (Active/Inactive)
    static async toggleRuleStatus(id, userId) {
        const rule = await CategoryRuleService.getRuleById(id, userId);
        return await prisma.categoryRule.update({
            where: { id },
            data: { isActive: !rule.isActive }
        });
    }
    // ৯. রুল পরিসংখ্যান
    static async getRuleStats(userId) {
        const [total, active, inactive, categories] = await Promise.all([
            prisma.categoryRule.count({ where: { userId } }),
            prisma.categoryRule.count({ where: { userId, isActive: true } }),
            prisma.categoryRule.count({ where: { userId, isActive: false } }),
            prisma.categoryRule.groupBy({
                by: ['category'],
                where: { userId },
                _count: { category: true }
            })
        ]);
        return {
            totalRules: total,
            activeRules: active,
            inactiveRules: inactive,
            categoryDistribution: categories.map((c) => ({
                category: c.category,
                count: c._count.category
            }))
        };
    }
    // ১০. সাজেস্টেড রুল (পুরানো ট্রানজেকশন অ্যানালাইসিস করে রুল সাজেস্ট করবে)
    static async getSuggestedRules(userId) {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        const transactions = await prisma.transaction.findMany({
            where: { userId, date: { gte: last30Days } },
            select: { description: true, category: true }
        });
        const keywordMap = new Map();
        for (const tx of transactions) {
            if (!tx.description)
                continue;
            const words = tx.description.toLowerCase().trim().split(/\s+/); // একাধিক স্পেস হ্যান্ডেল করবে
            for (const word of words) {
                if (word.length > 3) {
                    const key = `${word}|${tx.category}`;
                    keywordMap.set(key, (keywordMap.get(key) || 0) + 1);
                }
            }
        }
        return Array.from(keywordMap.entries())
            .filter(([_, count]) => count >= 3)
            .map(([key, count]) => {
            const [keyword, category] = key.split('|');
            return { keyword, category, frequency: count };
        })
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10);
    }
}
export default CategoryRuleService;
