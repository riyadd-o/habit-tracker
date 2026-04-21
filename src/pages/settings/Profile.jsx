import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../hooks/useAuthStore'
import { updateProfile, getUserSettings } from '../../services/userService'
import AvatarPicker from '../../components/AvatarPicker'

const Profile = () => {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [isAvatarSaving, setIsAvatarSaving] = useState(false)
  const [isNameUpdating, setIsNameUpdating] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [originalName, setOriginalName] = useState(user?.name || '')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getUserSettings()
        setName(settings.name)
        setOriginalName(settings.name)
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSaveAvatar = async (newAvatarUrl) => {
    if (!name.trim()) return
    
    setIsAvatarSaving(true)
    try {
      const updatedUser = await updateProfile({ name, avatar_url: newAvatarUrl })
      setUser(updatedUser)
      setOriginalName(updatedUser.name)
    } catch (err) {
      console.error(err.message)
    } finally {
      setIsAvatarSaving(false)
    }
  }

  const handleUpdateName = async () => {
    if (!name.trim()) return
    if (name === originalName) return
    
    setIsNameUpdating(true)
    try {
      const updatedUser = await updateProfile({ name, avatar_url: user.avatar_url })
      setUser(updatedUser)
      setOriginalName(updatedUser.name)
    } catch (err) {
      console.error(err.message)
    } finally {
      setIsNameUpdating(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
          <p className="text-slate-500">Customize how you appear in HabitFlow.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Avatar Picker */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold px-1">Choose your Avatar</h3>
          <AvatarPicker 
            currentAvatar={user?.avatar_url} 
            onSave={handleSaveAvatar} 
            isLoading={isAvatarSaving} 
          />
        </div>

        {/* Right Column: Profile Info */}
        <div className="space-y-6">
          <div className="card p-8 space-y-6">
            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-4">Personal Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-sm font-semibold">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="input bg-slate-50 dark:bg-slate-900 cursor-not-allowed"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleUpdateName}
                  disabled={isNameUpdating || !name.trim() || name === originalName}
                  className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isNameUpdating ? 'Saving...' : 'Update Name'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-2">Pro Tip</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Your avatar and username are visible on your dashboard and habits group. Use something unique!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Profile

