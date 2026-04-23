import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Zap, Target, BarChart3, Shield, LayoutDashboard } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import useAuthStore from '../hooks/useAuthStore'

const Landing = () => {
  const { user } = useAuthStore()

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: 'Power of Streaks',
      description: 'Build unstoppable momentum with our visual streak tracking system. Stay motivated by seeing your progress grow day after day.'
    },
    {
      icon: <Target className="w-6 h-6 text-primary-500" />,
      title: 'Goal Oriented',
      description: 'Set clear objectives and break them down into daily routines. HabitFlow helps you stay focused on what truly matters for your growth.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
      title: 'Smart Analytics',
      description: 'Deep dive into your behavior with beautiful, interactive charts. Understand your patterns and identify where you can improve.'
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      title: 'Privacy First',
      description: 'Your habits are personal. We use bank-grade encryption to ensure your data stays private and accessible only to you.'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">HabitFlow</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-primary-500 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-[-5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full border border-primary-100 dark:border-primary-800">
              Trusted by 50,000+ users worldwide
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400">
              Transform your life <br /> 
              <span className="text-primary-500">one habit at a time.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Build better routines, track your progress visually, and achieve your goals with the most beautiful habit tracker on the web.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto flex items-center gap-2 group">
                {user ? "Go to Dashboard" : "Start Your Journey"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-secondary px-8 py-4 text-lg w-full sm:w-auto"
              >
                Learn How it Works
              </button>
            </div>
          </motion.div>

          {/* App Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 relative px-4 group"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-primary-500/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden glass border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-white dark:bg-slate-900/50 backdrop-blur-3xl">
              {/* Browser Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                </div>
                <div className="h-5 w-64 bg-slate-200 dark:bg-slate-700/50 rounded-lg mx-auto flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">https://habitflow.io/dashboard</span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-6 grid grid-cols-12 gap-6 h-full overflow-hidden">
                {/* Sidebar Mockup */}
                <div className="col-span-3 space-y-4 text-left">
                  <div className="p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
                    <div className="h-4 w-20 bg-primary-500/40 rounded-md mb-2" />
                    <div className="h-2 w-full bg-primary-500/20 rounded-full" />
                  </div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
                       <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
                    </div>
                  ))}
                </div>

                {/* Main Content Mockup */}
                <div className="col-span-9 space-y-6 text-left">
                  {/* Replacement for Stats Row: Consistency Heatmap & Focus */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-7 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-1 flex justify-between">
                        <span>Activity History</span>
                        <span className="text-emerald-500 font-bold">COMPLETED</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {[...Array(28)].map((_, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + (i * 0.01) }}
                            className={`h-3 rounded-[2px] ${
                              i % 3 === 0 ? 'bg-primary-500 shadow-sm shadow-primary-500/20' : 
                              i % 7 === 1 ? 'bg-primary-400/60' : 
                              i % 5 === 2 ? 'bg-primary-300/30' : 
                              'bg-slate-200 dark:bg-slate-700/50'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="col-span-5 flex flex-col gap-3">
                      <div className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Quick Insights</div>
                        <div className="flex flex-wrap gap-1.5">
                           {['Health', 'Focus', 'Zen'].map(s => (
                             <span key={s} className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 text-[8px] font-bold border border-primary-500/20">{s}</span>
                           ))}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-3 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-orange-500/20">
                         <div>
                            <div className="text-[8px] font-bold opacity-80 uppercase">Active Streak</div>
                            <div className="text-sm font-black leading-none">24 DAYS</div>
                         </div>
                         <Zap className="w-5 h-5 fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Habit Cards Mockup */}
                  <div className="space-y-3">
                    {[
                      { title: 'Morning Meditation', sub: '10 mins everyday', progress: 'W T F S S', completed: true },
                      { title: 'Read Technical Blogs', sub: '3 articles weekly', progress: 'M W F', completed: false }
                    ].map((h, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/20 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                               <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                               <div className="font-bold text-sm text-slate-900 dark:text-white">{h.title}</div>
                               <div className="text-[11px] text-slate-500 font-medium">{h.sub}</div>
                            </div>
                         </div>
                         <div className="flex gap-1.5 items-center">
                            {h.progress.split(' ').map((d, j) => (
                              <div key={j} className="w-6 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400">
                                {d}
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                  </div>

                  {/* Graph Mockup */}
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group/graph">
                     <div className="absolute top-0 right-0 p-4 opacity-40">
                        <BarChart3 className="w-24 h-24 text-primary-500/20" />
                     </div>
                     <div className="relative z-10">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-4">Activity Insights</div>
                        <div className="flex items-end gap-2 h-20">
                           {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85].map((h, i) => (
                             <motion.div 
                                key={i} 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: 0.5 + (i * 0.05) }}
                                className="flex-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-sm opacity-60 group-hover/graph:opacity-100 transition-opacity" 
                              />
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-slate-600 dark:text-slate-400">HabitFlow provides the tools and insights necessary to build lasting changes.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto p-12 rounded-3xl bg-slate-900 dark:bg-primary-600 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to change your life?</h2>
          <p className="text-slate-300 dark:text-primary-50 mb-10 text-lg relative z-10">
            Join thousands of others who are building better versions of themselves every single day.
          </p>
          <Link to={user ? "/dashboard" : "/register"} className="btn bg-white text-slate-900 hover:bg-slate-100 px-10 py-4 text-lg font-bold relative z-10">
            {user ? "Go to Dashboard" : "Start Your Journey Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">HabitFlow</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 HabitFlow. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-primary-500 transition-colors">Twitter</a>
            <a href="#" className="text-slate-500 hover:text-primary-500 transition-colors">GitHub</a>
            <a href="#" className="text-slate-500 hover:text-primary-500 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing

