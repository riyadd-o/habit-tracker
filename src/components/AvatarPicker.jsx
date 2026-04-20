import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ruby',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Finn',
];

const AvatarPicker = ({ currentAvatar, onSave, isLoading }) => {
  const [selected, setSelected] = useState(currentAvatar || AVATAR_OPTIONS[0]);

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
      <div className="p-8 space-y-8">
        {/* Preview Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <motion.img
              key={selected}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selected}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-inner object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Preview</p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-4 gap-4">
          {AVATAR_OPTIONS.map((url, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelected(url)}
              className={`relative rounded-xl overflow-hidden transition-all aspect-square border-2 ${
                selected === url 
                  ? 'ring-2 ring-blue-500 border-transparent scale-105 z-10' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-blue-200'
              }`}
            >
              <img src={url} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
              {selected === url && (
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                  <div className="bg-blue-500 rounded-full p-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Action Section */}
        <div className="pt-4">
          <button
            onClick={() => onSave(selected)}
            disabled={isLoading || selected === currentAvatar}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isLoading || selected === currentAvatar
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving Avatar...</span>
              </>
            ) : (
              'Save Avatar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPicker;
