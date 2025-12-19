
import React from 'react';
import { X, Eye, EyeOff, Download, Upload, Trash2, Fingerprint, Moon, Sun, Palette, Globe, RefreshCcw, Bell, Volume2, Smartphone, Lock } from 'lucide-react';
import { AppSettings, CURRENCIES } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: (type: 'all' | 'transactions' | 'assets') => void;
  counts: { transactions: number; assets: number };
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ 
  isOpen, onClose, settings, onUpdateSettings, onExport, onImport, onResetData, counts 
}) => {
  if (!isOpen) return null;

  const themes = [
    { id: 'dark', name: 'Dark', color: 'bg-slate-900' },
    { id: 'midnight', name: 'Midnight', color: 'bg-[#0f172a]' },
    { id: 'ocean', name: 'Ocean', color: 'bg-cyan-900' },
    { id: 'sunset', name: 'Sunset', color: 'bg-orange-900' },
  ];

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      new Notification('WealthFlow', { body: 'Notifications enabled!' });
    }
  };

  const handleResetPin = () => {
     if(window.confirm('Reset PIN to default (1234)?')) {
        onUpdateSettings({ pin: '1234' });
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
       <div className="relative w-full max-w-sm bg-[#0f172a] h-full border-l border-white/10 p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-bold text-white">Settings</h2>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-8">
             
             {/* Security Section */}
             <section>
                <h3 className="text-xs font-bold text-white/40 uppercase mb-4 tracking-wider">Security</h3>
                <div className="bg-[#1e293b] p-4 rounded-xl space-y-4">
                   <div>
                      <label className="text-sm text-white font-medium mb-1 block">Change PIN</label>
                      <div className="flex gap-2">
                         <input 
                           type="text" 
                           value={settings.pin || ''} 
                           onChange={(e) => onUpdateSettings({ pin: e.target.value })}
                           maxLength={4}
                           className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white w-full tracking-[0.5em] text-center font-mono focus:border-indigo-500 outline-none"
                           placeholder="PIN"
                         />
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Enter a 4-digit code. Default: 1234</p>
                   </div>
                   
                   <button 
                     onClick={handleResetPin}
                     className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2"
                   >
                      <RefreshCcw className="w-3 h-3" /> Reset to Default
                   </button>

                   <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <EyeOff className="w-4 h-4 text-indigo-400" />
                         <span className="text-white text-sm font-medium">Privacy Blur</span>
                      </div>
                      <button 
                         onClick={() => onUpdateSettings({ privacyMode: !settings.privacyMode })} 
                         className={`w-10 h-5 rounded-full transition-colors relative ${settings.privacyMode ? 'bg-indigo-600' : 'bg-white/10'}`}
                      >
                         <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.privacyMode ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                   </div>
                </div>
             </section>

             {/* Appearance */}
             <section>
                <h3 className="text-xs font-bold text-white/40 uppercase mb-4 tracking-wider">Appearance</h3>
                
                <div className="mb-4">
                   <div className="flex items-center gap-2 mb-3 text-sm font-medium text-white/80">
                      <Palette className="w-4 h-4 text-indigo-400" /> Theme
                   </div>
                   <div className="grid grid-cols-4 gap-2">
                      {themes.map(t => (
                         <button
                           key={t.id}
                           onClick={() => onUpdateSettings({ theme: t.id as any })}
                           className={`h-10 rounded-lg border-2 transition-all ${t.color} ${settings.theme === t.id ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                           title={t.name}
                         />
                      ))}
                   </div>
                </div>
             </section>
            
            {/* Preferences */}
             <section className="space-y-3">
                <h3 className="text-xs font-bold text-white/40 uppercase mb-4 tracking-wider">Preferences</h3>

                <div className="flex justify-between items-center p-4 bg-[#1e293b] rounded-xl">
                   <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-pink-400" />
                      <span className="text-white font-medium">Sound Effects</span>
                   </div>
                   <button 
                      onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })} 
                      className={`w-10 h-5 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                   >
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                   </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#1e293b] rounded-xl">
                   <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Haptic Feedback</span>
                   </div>
                   <button 
                      onClick={() => onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled })} 
                      className={`w-10 h-5 rounded-full transition-colors relative ${settings.hapticsEnabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                   >
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                   </button>
                </div>

                <button onClick={requestNotifications} className="w-full flex justify-between items-center p-4 bg-[#1e293b] rounded-xl hover:bg-[#334155] transition-colors text-left">
                   <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">Allow Notifications</span>
                   </div>
                </button>
             </section>

             {/* Regional */}
             <section>
                <h3 className="text-xs font-bold text-white/40 uppercase mb-4 tracking-wider">Regional</h3>
                <div className="flex justify-between items-center p-4 bg-[#1e293b] rounded-xl">
                   <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-emerald-400" />
                      <span className="text-white font-medium">Currency</span>
                   </div>
                   <select 
                     value={settings.currency}
                     onChange={(e) => onUpdateSettings({ currency: e.target.value })}
                     className="bg-black/20 text-white text-sm rounded-lg p-2 border border-white/10 outline-none"
                   >
                     {Object.keys(CURRENCIES).map(c => (
                        <option key={c} value={c}>{c} ({CURRENCIES[c as keyof typeof CURRENCIES]})</option>
                     ))}
                   </select>
                </div>
             </section>

             {/* Data Section */}
             <section>
                <h3 className="text-xs font-bold text-white/40 uppercase mb-4 tracking-wider">Data Management</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                   <button onClick={onExport} className="p-4 bg-[#1e293b] hover:bg-[#334155] rounded-xl flex flex-col items-center gap-2 transition-colors">
                      <Download className="w-6 h-6 text-indigo-400" />
                      <span className="text-sm text-white font-medium">Backup</span>
                   </button>
                   
                   <label className="p-4 bg-[#1e293b] hover:bg-[#334155] rounded-xl flex flex-col items-center gap-2 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 text-emerald-400" />
                      <span className="text-sm text-white font-medium">Restore</span>
                      <input type="file" accept=".json" onChange={onImport} className="hidden" />
                   </label>
                </div>
                
                <div className="space-y-2">
                   <button 
                     onClick={() => { if(window.confirm('Delete all transactions?')) onResetData('transactions'); }} 
                     className="w-full p-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl flex items-center justify-between text-white/60 hover:text-white transition-colors text-sm"
                   >
                      <span className="flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Reset Transactions</span>
                      <span className="text-xs opacity-50">{counts.transactions}</span>
                   </button>
                   <button 
                     onClick={() => { if(window.confirm('Delete all assets?')) onResetData('assets'); }} 
                     className="w-full p-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl flex items-center justify-between text-white/60 hover:text-white transition-colors text-sm"
                   >
                      <span className="flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Reset Assets</span>
                      <span className="text-xs opacity-50">{counts.assets}</span>
                   </button>
                   <button 
                     onClick={() => { if(window.confirm('Factory Reset: Delete EVERYTHING?')) onResetData('all'); }} 
                     className="w-full mt-2 p-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl flex items-center justify-center gap-2 text-rose-400 transition-colors"
                   >
                      <Trash2 className="w-5 h-5" />
                      <span>Factory Reset App</span>
                   </button>
                </div>
             </section>
             
             {/* About */}
             <div className="pt-8 border-t border-white/10 text-center">
                <p className="text-white/30 text-xs">WealthFlow AI v2.2 Pro</p>
             </div>
          </div>
       </div>
    </div>
  );
};
