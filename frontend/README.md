# 🏋️ SmartGym Manager - Frontend

> A modern, full-featured gym management system frontend built with React, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)

---

## 📖 Overview

SmartGym Manager provides both **Member** and **Admin** interfaces for managing gym operations including memberships, equipment, bookings, wellness services, and notifications.

- **Member Portal**: OTP login, view equipment, book wellness services, request renewals, manage profile
- **Admin Portal**: Dashboard analytics, member management, equipment CRUD, booking management, renewal approvals, admin management

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Tailwind CSS** | Styling |
| **Zustand** | State Management |
| **React Router v6** | Routing |
| **Axios** | HTTP Client |
| **i18next** | Internationalization |
| **Recharts** | Charts & Analytics |
| **Lucide React** | Icons |
| **React Hot Toast** | Notifications |

---

## ✨ Features

### 👤 Member Portal
- 🔐 **Authentication**: OTP-based login via email
- 📊 **Dashboard**: View membership status, upcoming bookings, quick actions
- 💆 **Wellness Services**: Book spa services (available on Fri/Sat only)
- 🔄 **Membership Renewal**: Submit renewal requests
- 👤 **Profile Management**: Update personal information
- 📅 **Booking History**: View all past and upcoming bookings
- 🏋️ **Equipment View**: Browse available gym equipment with images

### 👑 Admin Portal
- 📊 **Admin Dashboard**: Real-time statistics, charts, and analytics
- 👥 **Member Management**: Add, edit, delete members with search/filter
- 🏋️ **Equipment Management**: Full CRUD with image upload support
- 📅 **Booking Management**: View, filter, and manage all wellness bookings
- 🔄 **Renewal Requests**: Approve or reject membership renewals
- 👤 **Admin Management**: Manage admin users (SUPER_ADMIN only)
- 📧 **Bulk Notifications**: Send WhatsApp/email notifications to members
- 📈 **Reports**: Generate detailed reports and analytics

---

## 📁 Project Structure
frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ManageEquipment.tsx
│   │   │   ├── ManageMembers.tsx
│   │   │   ├── ManageBookings.tsx
│   │   │   ├── ManageAdmins.tsx
│   │   │   ├── RenewalRequests.tsx
│   │   │   ├── Notifications.tsx
│   │   │   └── Reports.tsx
│   │   ├── member/
│   │   │   ├── MemberDashboard.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── RenewMembership.tsx
│   │   │   ├── BookWellness.tsx
│   │   │   ├── MySpaBookings.tsx
│   │   │   └── ViewEquipment.tsx
│   │   ├── auth/
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── MemberLogin.tsx
│   │   │   └── OTPLogin.tsx
│   │   ├── common/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   └── LandingPage.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   └── membershipStore.ts
│   ├── config/
│   │   ├── axios.ts
│   │   └── i18n.ts
│   ├── hooks/
│   │   └── useFormValidation.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── membership.ts
│   │   └── booking.ts
│   ├── utils/
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── App.css
├── public/
│   └── index.html
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md

---

## ⚙️ Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn/pnpm)
- **Backend API**: Running backend server (see backend README)

### Setup Steps

# 1. Clone the repository
git clone https://github.com/yourusername/smartgym-manager.git
cd smartgym-manager/frontend

# 2. Install dependencies
npm install
# or
yarn install

# 3. Create .env file from example
cp .env.example .env

# 4. Start development server
npm run dev
# or
yarn dev

🔒 Security

✅ DO:
Use environment variables for all sensitive data
Store JWT tokens in HTTP-only cookies
Validate all user inputs on forms
Implement proper authentication checks
Use HTTPS in production
Keep dependencies updated

❌ DON'T:
Never commit .env files to Git
Never hardcode API keys or secrets
Never expose sensitive data in console logs
Never trust user input without validation

Security Checklist
.env files added to .gitignore
All API calls use HTTPS in production
Authentication tokens stored securely
CORS configured properly
Input validation implemented
Error messages don't expose sensitive info

🌐 Internationalization (i18n)
Supports English and Marathi languages.

🏷️ Version History
Version   	Date	       Changes
1.0.0	    June 2026   	Initial release
📊 Quick Stats
Lines of Code: ~15,000
Components: 30+
Pages 12+
Languages: 2 (English, Marathi)
API Endpoints: 50+
Made with ❤️ by the SmartGym Team

Last Updated: June 2026

🔥 Pro Tips
Development: Use npm run dev for hot reload
Debugging: Use React DevTools and Redux DevTools
Performance: Use React.memo() for expensive components
Styling: Use Tailwind classes for consistency
State: Use Zustand stores for global state

Happy Coding! 🚀
