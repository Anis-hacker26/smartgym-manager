# 🏋️ SmartGym Manager - Frontend

> A modern, full-featured gym management system frontend built with React, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Integration](#-api-integration)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

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
