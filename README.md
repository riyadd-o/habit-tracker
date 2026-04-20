# HabitFlow - Premium Habit Tracker

A full-featured habit tracking web application built with React, Vite, Tailwind CSS, and Zustand.

## 🚀 Features

- **Authentication**: Secure mock email/password login and signup with session persistence.
- **Dashboard**: Overview of your habits, daily progress stats, and active streaks.
- **Habit Management**: Create, edit, and delete habits with custom frequencies (Daily/Weekly).
- **Advanced Tracking**: 
  - Interactive daily completion toggle.
  - Streak calculation (Current & Longest).
  - Habit-specific activity heatmaps (Last 90 days).
  - Visual analytics charts for consistency tracking.
- **Premium UI/UX**:
  - **Glassmorphism Design**: Modern, clean aesthetic with backdrop blurs.
  - **Dark Mode**: Fully supported with system preference detection.
  - **Animations**: Smooth transitions using Framer Motion.
  - **Responsive**: Mobile-first design that looks great on all devices.
- **Persistence**: All data is stored locally in your browser, making it ready for instant use.

## 🛠️ Tech Stack

- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Dates**: date-fns
- **Notifications**: React Hot Toast

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Locally**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 📂 Project Structure

- `src/components`: Reusable UI components (Layout, HabitCard, etc.)
- `src/pages`: Main application views (Dashboard, Login, Detail)
- `src/hooks`: Custom hooks and stores (useHabitStore, useAuthStore)
- `src/index.css`: Global styles and design system tokens.

## 📄 License

MIT
