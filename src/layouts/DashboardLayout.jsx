import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Plus, 
  LogOut, 
  CheckCircle2, 
  Settings, 
  BarChart3, 
  ListTodo, 
  User,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react'
import useAuthStore from '../hooks/useAuthStore'
import ThemeToggle from '../components/ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'

const DashboardLayout = () => {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/stats', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 glass border-r border-slate-200 dark:border-slate-800 p-6 sticky top-0 h-screen z-50">
        <Link to="/dashboard" className="flex items-center gap-3 mb-10 px-2 transition-transform active:scale-95">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
            HabitFlow
          </h1>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink 
              key={item.to}
              to={item.to} 
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                ${isActive 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                <span className="font-semibold">{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 opacity-0 transition-all ${location.pathname === item.to ? 'opacity-0' : 'group-hover:opacity-40 group-hover:translate-x-1'}`} />
            </NavLink>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-lg shadow-md overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0].toUpperCase() : user?.email?.[0].toUpperCase() || '?'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <button 
              onClick={logout}
              className="p-2.5 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-500 dark:hover:bg-red-900/20 transition-all group lg:flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:block text-sm font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 glass border-b border-slate-200 dark:border-slate-800 px-6 md:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex-1" />

          <div className="flex items-center gap-3">
             <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 relative transition-all active:scale-95">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
             </button>
             <Link to="/settings" className="md:hidden w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden active:scale-90 transition-transform">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : user?.email?.[0].toUpperCase() || '?'
                )}
             </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-200 dark:border-slate-800 z-50 px-6 py-4 flex items-center justify-around translate-z-0">
        {navItems.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({ isActive }) => `
              p-2.5 rounded-xl transition-all relative
              ${isActive ? 'text-primary-500 bg-primary-500/10' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <item.icon className="w-6 h-6" />
            {location.pathname === item.to && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
              />
            )}
          </NavLink>
        ))}
        <button onClick={logout} className="p-2.5 text-slate-400 hover:text-red-500 transition-all">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>
    </div>
  )
}

export default DashboardLayout
