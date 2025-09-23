# KR Inventory Management System
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://kr-inventory-management-system.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat&logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?style=flat&logo=postgresql)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)

## 📖 Overview

A modern, full-stack inventory management system designed to replace outdated manual tracking methods. Built during my 3-month attachment at Kenya Railways, this application streamlines asset management with a professional, user-friendly interface. This project also serves as my final year capstone project.

## ✨ Key Features

### 🏗️ Modern Tech Stack
- **Next.js 14** - React framework with App Router for optimal performance
- **TypeScript** - Full type safety for better development experience
- **PostgreSQL** - Robust relational database for data integrity
- **Drizzle ORM** - Type-safe database operations
- **Tailwind CSS** - Utility-first styling framework
- **shadcn/ui** - Beautiful, accessible UI components

### 📊 Core Modules
- **📈 Dashboard** - Real-time inventory overview and analytics
- **🏷️ Unique Asset Tracking** - Individual high-value item management
- **📦 Bulk Asset Management** - Mass inventory operations (stationery, tools, etc.)
- **👥 Assignment Tracking** - Asset allocation and user assignments
- **📍 Location Management** - Multi-location inventory control
- **🔐 User Management** - Role-based access control and admin panel
- **🔒 Authentication** - Secure login and authorization system

## 🛠️ System Requirements

### Essential Dependencies
| Software | Version | Purpose | Download Link |
|----------|---------|---------|---------------|
| **Node.js** | 18.0.0+ | JavaScript runtime environment | [nodejs.org](https://nodejs.org) |
| **npm** | 9.0.0+ | Package manager (comes with Node.js) | Included with Node.js |
| **PostgreSQL** | 12.0+ | Database server | [postgresql.org](https://postgresql.org) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com) |

### Optional but Recommended
| Software | Purpose | Download Link |
|----------|---------|---------------|
| **pgAdmin** | PostgreSQL database management GUI | [pgadmin.org](https://www.pgadmin.org) |
| **VS Code** | Code editor with excellent TypeScript support | [code.visualstudio.com](https://code.visualstudio.com) |
| **Insomnia** | API testing and development | [insomnia.rest](https://insomnia.rest/) |

### Development Tools (Auto-installed with npm install)
- **Next.js 14** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **shadcn/ui** - UI component library
- **NextAuth.js** - Authentication library
- **Redux Toolkit** - State management for modals and UI state
- **React Query (TanStack Query)** - Server state management and data fetching
- **React Hook Form** - Form management

## 🚀 Quick Start Guide

### 1️⃣ Clone the Repository
```bash
git clone git@github.com:RichieMuga/KR-inventory-management-system.git
cd KR-inventory-management-system
```

### 2️⃣ Environment Setup
Create your environment configuration file:
```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:
```bash
# Database Configuration
DATABASE_URL="postgres://postgres:postgres@localhost:5432/<your database name>"

# Authentication Configuration
JWT_SECRET="some very super duper secret"
NEXTAUTH_SECRET="nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Password Encryption
SALT_ROUNDS=12 #usually its 12

# Default Admin Account (for initial setup)
ADMIN_PAYROLL_NUMBER="A001"
ADMIN_PASSWORD="SomeSuperDuperAdminPassword"
```

### 3️⃣ Install Dependencies
```bash
npm install
```

### 4️⃣ Database Setup
Set up your PostgreSQL database step by step:
For example:

1. **Create Database** (run in PostgreSQL):
   ```sql
   CREATE DATABASE kr_inventory_db;
   ```

2. **Generate Migrations**:
   ```bash
   npm run db:generate
   ```

3. **Apply Migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Seed Initial Data** (optional but recommended):
   ```bash
   npm run db:seed
   ```

### 5️⃣ Launch the Application
```bash
npm run dev
```

🎉 **Success!** Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Available Scripts

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run dev` | Start development server | Daily development |
| `npm run build` | Create production build | Before deployment |
| `npm run start` | Run production server | After building |
| `npm run db:generate` | Create database migrations | After schema changes |
| `npm run db:migrate` | Apply database changes | Deploy schema updates |
| `npm run db:seed` | Add sample data | Initial setup or testing |
| `npm run lint` | Check code quality | Before committing code |
| `npm run type-check` | Verify TypeScript types | Debugging type issues |

## 🏗️ Project Architecture

```
KR-inventory-management-system/
├── 📁 app/                    # Next.js App Router (main application)
│   ├── 🌐 api/               # Backend API routes
│   ├── 📊 dashboard/         # Dashboard pages & components
│   ├── 🔐 auth/              # Authentication pages
│   ├── 📦 bulkAssetTracking/ # Bulk inventory management
│   ├── 🏷️  uniqueAssets/     # Individual asset tracking
│   ├── 👥 assignments/       # Asset assignment management
│   ├── 📍 locations/         # Location management
│   └── 👤 users/             # User management
├── 🧩 components/            # Reusable React components
│   ├── 📋 assignment/        # Assignment-related components
│   ├── 📦 bulk-assets/       # Bulk asset components
│   ├── 🪟 modals/            # Modal dialogs
│   ├── 📱 ui/                # Base UI components (shadcn/ui)
│   └── 🔍 tracking/          # Asset tracking components
├── 🗄️  db/                   # Database configuration & schema
├── 🎣 hooks/                 # Custom React hooks
├── 📚 lib/                   # Utilities & helper functions
├── 🔄 store/                 # Redux store configuration
├── 🛡️  middleware/           # Next.js middleware (auth, etc.)
├── 🔄 migrations/            # Database migration files
├── 🎨 public/                # Static assets (images, icons)
├── 🤖 scripts/               # Automation scripts (seeding, admin)
├── ⚙️  services/             # Business logic layer
└── 📝 types/                 # TypeScript type definitions
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch


## 👨‍💻 Developer

**Richie Muga**  
🐱 GitHub: [@RichieMuga](https://github.com/RichieMuga)

---

## 🔧 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
sudo service postgresql status
# or on macOS
brew services list | grep postgresql
```

**Port 3000 Already in Use**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
# or use a different port
npm run dev -- -p 3001
```

**Module Not Found**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

**⭐ If this project helped you, please give it a star!**
