<p align="center">

![Repo Size](https://img.shields.io/github/repo-size/roshhellwett/projectbillforge?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/roshhellwett/projectbillforge?style=for-the-badge)
![Forks](https://img.shields.io/github/forks/roshhellwett/projectbillforge?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/roshhellwett/projectbillforge?style=for-the-badge)
![Language](https://img.shields.io/github/languages/top/roshhellwett/projectbillforge?style=for-the-badge)

</p>

# PROJECT BILLFORGE

A powerful and streamlined business management utility — designed to simplify invoicing, khata bookkeeping, and customer management for modern Indian businesses. BillForge brings professional automation, making business workflows faster and easier for local vendors and merchants.

## ✨ Key Features

### ⚡ Core Functionality
- **Fast Invoicing**: Generate professional, GST-ready invoices in seconds with a clean, intuitive interface.
- **Digital Khata (Ledger)**: Track daily credit (Udhaar), view transaction history, and manage balances without physical registers.
- **Product Catalog**: Maintain a comprehensive directory of products with pricing and categorization.
- **Customer Management**: Keep track of client payment patterns, contact details, and improve business relations.

### 🔐 Execution & Safety
- **Secure Authentication**: Built with NextAuth.js for robust user session management and security.
- **Data Integrity**: Powered by Drizzle ORM and PostgreSQL (Neon) for reliable and fast data operations.
- **Rate Limiting**: Integrated Upstash Redis rate limiting to ensure application stability and protection.
- **Modern Tech Stack**: Developed with Next.js 15, React 19, and Tailwind CSS for a premium, responsive experience.

## 🛠️ Prerequisites
To run BillForge locally, you will need:
- **Node.js**: Version >= 20.9.0
- **Database**: PostgreSQL (Neon database recommended)
- **Redis**: Upstash Redis for rate limiting and session management
- **Environment Variables**: See `.env.example` for required configuration.

## 🚀 Installation & Usage
BillForge is designed for quick setup. Follow these steps to get started:

```bash
# Clone the repository
git clone https://github.com/roshhellwett/projectbillforge.git
cd projectbillforge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:push

# Start the development server
npm run dev
```

## 📂 Project Structure
```
projectbillforge/
├── app/                  # Next.js App Router (Dashboard, Auth, API)
├── components/           # Reusable UI components (LandingPage, Navigation)
├── drizzle/              # Database schema and migrations
├── lib/                  # Utility functions, database client, and shared logic
├── public/               # Static assets and images
├── drizzle.config.ts     # Drizzle ORM configuration
├── middleware.ts         # Authentication and routing middleware
├── next.config.ts        # Next.js framework configuration
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

© 2026 [Zenith Open Source Projects](https://zenithopensourceprojects.vercel.app/). All Rights Reserved. Zenith is a Open Source Project Idea's by @roshhellwett

## About
A clean, straightforward application for managing your business operations.
[zenithopensourceprojects.vercel.app](https://zenithopensourceprojects.vercel.app)

### Topics
[zenithopensourceprojects](https://github.com/topics/zenithopensourceprojects) | [nextjs](https://github.com/topics/nextjs) | [inventory-management](https://github.com/topics/inventory-management) | [billing-system](https://github.com/topics/billing-system)

### Resources
[Documentation](https://github.com/roshhellwett/projectbillforge#readme) | [License](file:///b:/zenithopensourceprojects/projectbillforge/license) | [Security Policy](file:///b:/zenithopensourceprojects/projectbillforge/security.md)
