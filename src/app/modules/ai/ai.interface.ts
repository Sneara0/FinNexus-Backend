// AI চ্যাট রেসপন্সের স্ট্রাকচার
export interface IAIChatResponse {
  sessionId: string;
  response: string;
  chat?: {
    id: string;
    role: 'user' | 'model';
    content: string;
    createdAt: Date;
  };
}

// ফাইন্যান্সিয়াল এনালাইসিস রেজাল্ট
export interface IFinancialAnalysis {
  summary: string;
  spendingHabits: string[];
  savingsPotential: string;
  alerts: string[];
  score: number; // ১-১০০ এর মধ্যে একটি হেলথ স্কোর
}

// বাজেট রিকমেন্ডেশন
export interface IBudgetRecommendation {
  category: string;
  suggestedAmount: number;
  currentAmount: number;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// সার্ভিস মেথডগুলোর জন্য প্যারামিটার টাইপ
export interface ITransactionData {
  category: string;
  amount: number;
  date?: Date;
}