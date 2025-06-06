# 🚦 API Rate Limiter (Express + Redis)

A high-performance, production-ready API rate limiter built using **Express.js** and **Redis**, leveraging the **sliding window algorithm** for precise and distributed request throttling.

---
✅ Sliding Window Rate Limiting
Unlike fixed window algorithms that reset at intervals, the sliding window method continuously evaluates requests within a time frame for more accurate limiting.

🔁 Redis-backed
Redis enables shared rate limit tracking across multiple servers, making the system scalable and suitable for distributed deployments.

⚙️ Customizable
Rate limits like request count and time window can be easily configured globally or per route to suit different API requirements.

🛡️ Production Ready
Includes robust error handling, request logging, and clean failure responses to ensure stability in production environments.

📐 Clean Architecture
The codebase follows SOLID principles and separates responsibilities clearly, making it easy to maintain and extend.

---

## 🚀 Quick Start

### ✅ Prerequisites

- Node.js v18 or higher
- Redis installed and running locally

### 🔧 Installation & Running

```bash
# Clone the repository
git clone https://github.com/prajwal9773/API_RATE_LIMITER.git
cd API_RATE_LIMITER

# Install dependencies
npm install<img width="1676" alt="Screenshot 2025-06-06 at 5 21 29 PM" src="https://github.com/user-attachments/assets/f9c05401-2d85-4480-9871-f27b631e6361" />


# Start Redis server if not already running
redis-server

# Start the application in development mode
npm run dev

📡 API Endpoints

