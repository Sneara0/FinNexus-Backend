# 🚀 FinNexus - Smart Financial Goal Tracker

[![Live Demo](https://img.shields.io/badge/Live-Demo-green.svg)](https://your-live-url.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/yourusername/finnexus-backend)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![FinNexus Banner](https://via.placeholder.com/1200x400?text=FinNexus+Smart+Finance+Tracker)

## 📖 Project Overview

**FinNexus** is a modern, full-stack financial goal tracking application that helps users set, track, and achieve their savings goals with AI-powered insights and beautiful visualizations. The application provides an intuitive interface for managing personal finances, tracking expenses, and monitoring progress toward financial milestones.

### 🎯 Key Features

- **Smart Goal Tracking** - Create and manage savings goals with deadlines
- **Real-time Progress** - Visual progress bars and detailed statistics
- **AI-Powered Insights** - Smart recommendations based on spending patterns
- **Transaction Management** - Track income and expenses with categories
- **Budget Planning** - Set monthly budgets across different categories
- **Interactive Dashboard** - Beautiful analytics and visualizations
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Fullscreen Mode** - Immersive experience for focused tracking
- **Dark Theme** - Modern gradient-based UI design

### 🎨 UI Features

- Glassmorphism design with blur effects
- Animated gradients and micro-interactions
- Grid/List view toggle
- Fullscreen mode support
- Responsive layouts for all devices
- Loading states and error handling

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI library with hooks |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Lucide React** | Modern icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API framework |
| **Prisma ORM** | Database ORM |
| **PostgreSQL** | Primary database |
| **bcryptjs** | Password hashing |
| **JWT** | Authentication |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| **Vercel** | Frontend hosting |
| **Render/Railway** | Backend hosting |
| **Git** | Version control |
| **GitHub** | Code repository |

### Development Tools
| Technology | Purpose |
|------------|---------|
| **Zod** | Data validation |
| **tsx** | TypeScript execution |
| **dotenv** | Environment variables |

---

## 🤖 AI Features Explained

### 1. **Smart Goal Recommendations**
The AI analyzes user's spending patterns and income to suggest realistic savings goals. Based on historical data, it recommends:
- Optimal monthly savings amounts
- Realistic goal deadlines
- Category-specific budget adjustments

### 2. **Expense Pattern Recognition**
Machine learning algorithms identify spending patterns and provide insights:
- Unusual spending alerts
- Recurring expense detection
- Seasonal spending trends

### 3. **Budget Optimization**
AI-powered budget suggestions based on:
- Previous months' spending
- Similar user patterns
- Financial goals prioritization

### 4. **Predictive Analytics**
Future predictions for:
- Goal completion dates
- Potential savings shortfalls
- Investment opportunities

### 5. **Smart Notifications**
Contextual alerts using AI:
- "You're on track to save 20% more this month"
- "Consider reducing dining out to meet your goal faster"
- "Great job! You've saved 50% of your target"

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager
- Git

### Step 1: Clone the Repository
```bash
# Install all dependencies
npm install

# Install additional required packages
npm install @prisma/client bcryptjs jsonwebtoken dotenv
npm install -D prisma typescript @types/node tsx
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/finnexus?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Optional: AI Service API Key
AI_SERVICE_API_KEY="your-api-key-if-using-external-ai-service"
