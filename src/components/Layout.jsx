import { Outlet, NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, Plus, LogOut, CheckCircle2 } from 'lucide-react'
import useAuthStore from '../hooks/useAuthStore'
import ThemeToggle from './ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'

const Layout = () => {
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-slate-200 dark:border-slate-800 p-6 sticky top-0 h-screen">
        <Link to="/dashboard" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">HabitFlow</h1>
        </Link>

        <nav className="flex-1 space-y-2">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </NavLink>
        </nav>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
              {user?.name?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-2 text-slate-500">
            <ThemeToggle />
            <button 
              onClick={logout}
              className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass shadow-2xl border-t border-slate-200 dark:border-slate-800 z-50 px-6 py-4 flex items-center justify-around">
        <NavLink to="/dashboard" className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'text-primary-500' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
        </NavLink>
        <ThemeToggle />
        <button onClick={logout} className="p-2 text-slate-400">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default Layout
