SmartGym Manager - Frontend
📋 Overview
SmartGym Manager is a full-featured gym management system frontend built with React, TypeScript, and Tailwind CSS. It provides member and admin interfaces for managing gym operations.

🚀 Tech Stack
Technology	Purpose
React 18 + TypeScript	UI Framework
Vite	Build Tool
Tailwind CSS	Styling
Zustand	State Management
React Router v6	Routing
Axios	HTTP Client
i18next	Internationalization
Recharts	Charts & Analytics
Lucide React	Icons
📁 Project Structure
text
frontend/
├── src/
│   ├── components/
│   │   ├── admin/       # Admin dashboard, equipment, bookings, members
│   │   ├── member/      # Member dashboard, profile, bookings, renewal
│   │   ├── auth/        # Login, OTP authentication
│   │   └── common/      # Sidebar, loaders, error boundaries
│   ├── store/           # Zustand state management
│   ├── config/          # Axios, i18n configuration
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript definitions
│   └── utils/           # Helper functions
├── public/
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
⚙️ Installation & Setup
Prerequisites
Node.js v18+

Backend API running (see backend README)

Steps
bash
# 1. Clone repository
git clone https://github.com/yourusername/smartgym-manager.git
cd smartgym-manager/frontend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env

# 4. Update .env with your API URL
# VITE_API_URL=http://localhost:5000

# 5. Start development server
npm run dev

# 6. Build for production
npm run build
📱 Features
Member Portal
Authentication: OTP-based login via email

Dashboard: Membership status, bookings overview

Wellness Services: Book spa services (Fri/Sat only)

Membership Renewal: Request renewal

Profile Management: Update personal details

Booking History: View past and upcoming bookings

Equipment View: Browse gym equipment

Admin Portal
Dashboard: Statistics and charts

Member Management: CRUD operations

Equipment Management: CRUD with image uploads

Booking Management: View and manage all bookings

Renewal Requests: Approve/reject renewals

Admin Management: Manage admin users

Notifications: Send bulk WhatsApp/email

Reports: Analytics and reporting

🔧 Available Scripts
Script	Description
npm run dev	Start development server
npm run build	Build for production
npm run preview	Preview production build
npm run lint	Run ESLint
npm run format	Format code with Prettier
🌐 Internationalization
Supports English and Marathi languages.

To add a new language, update src/config/i18n.ts.

🔌 API Integration
Configuration
API URL is configured via VITE_API_URL environment variable.

Key Endpoints
Endpoint	Purpose
/api/auth/*	Login, OTP, logout
/api/member/*	Member operations
/api/admin/*	Admin operations
/api/equipment/*	Equipment management
/api/bookings/*	Booking management
/api/renewals/*	Renewal management
📦 Deployment
Deploy to Vercel (Recommended)
bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
Set these environment variables in Vercel:

VITE_API_URL: Your backend API URL

Deploy to Netlify
bash
# Build
npm run build

# Deploy the 'dist' folder to Netlify
🐛 Troubleshooting
Issue	Solution
API not responding	Check if backend is running and VITE_API_URL is correct
OTP not received	Check backend email configuration
Images not loading	Verify backend is serving static files
Build fails	Delete node_modules and reinstall
🔒 Security
❌ NEVER commit .env files to Git

Use environment variables for all secrets

JWT tokens stored in HTTP-only cookies

Protected routes for admin sections

🤝 Contributing
bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git commit -m "feat: your feature description"

# Push
git push origin feature/your-feature
📝 License
Proprietary - All rights reserved.

📞 Quick Links
Backend Repository: [Link]

Live Demo: [Link]

Issues: [Link]

Last Updated: June 2026

#### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/smartgym-manager.git
cd smartgym-manager
