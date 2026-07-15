import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { motion } from 'framer-motion';
import { ShieldAlert, Droplet, ShieldCheck, Activity, Star, Settings, Check, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('ALL');

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'EMERGENCY_SOS', title: 'SOS: Urgent O- Blood Required', message: 'AIIMS Trauma Center requires 2 units of O- immediately.', time: '10 mins ago', isRead: false, critical: true },
    { id: 2, type: 'ELIGIBILITY_RESTORED', title: 'Eligibility Restored', message: 'It has been 90 days since your last donation. You are now eligible to donate.', time: '2 hours ago', isRead: false, critical: false },
    { id: 3, type: 'DONATION_REMINDER', title: 'Camp Near You', title2: 'Mega Camp at Connaught Place tomorrow.', time: '1 day ago', isRead: true, critical: false },
    { id: 4, type: 'IMPACT_UPDATE', title: 'Your blood saved a life!', message: 'The unit you donated at Rotary BB was transfused today.', time: '3 days ago', isRead: true, critical: false },
    { id: 5, type: 'SYSTEM', title: 'Grid Update', message: 'National Digital Blood Grid scheduled maintenance on Sunday 2 AM.', time: '1 week ago', isRead: true, critical: false },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'CRITICAL') return n.critical;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY_SOS': return <ShieldAlert className="w-5 h-5 text-destructive" />;
      case 'DONATION_REMINDER': return <Droplet className="w-5 h-5 text-primary" />;
      case 'ELIGIBILITY_RESTORED': return <ShieldCheck className="w-5 h-5 text-success" />;
      case 'BLOOD_AVAILABLE': return <Activity className="w-5 h-5 text-secondary" />;
      case 'IMPACT_UPDATE': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'SYSTEM': return <Settings className="w-5 h-5 text-muted-foreground" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full border border-primary/30 flex items-center justify-center relative">
              <Bell className="w-6 h-6 text-primary" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full border-2 border-background flex items-center justify-center text-[10px] font-black text-white">
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black glow-text text-foreground uppercase tracking-wider">COMMS CENTER</h1>
              <p className="font-mono text-muted-foreground">SYSTEM NOTIFICATIONS & ALERTS</p>
            </div>
          </div>
          
          <Button onClick={markAllRead} variant="outline" className="font-mono text-xs h-9 border-primary/30 text-primary hover:bg-primary/10">
            <Check className="w-3 h-3 mr-2" /> MARK ALL READ
          </Button>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-primary/20 min-h-[500px]">
          
          {/* Filters */}
          <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
            {['ALL', 'UNREAD', 'CRITICAL'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${filter === f ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10'}`}
              >
                {f} {f === 'UNREAD' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>NO NOTIFICATIONS FOUND</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border transition-all flex gap-4 ${
                    !n.isRead ? 'bg-primary/5 border-primary/30' : 'bg-white/5 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20'
                  } ${n.critical && !n.isRead ? 'border-destructive/50 bg-destructive/5' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                    n.critical ? 'bg-destructive/10 border-destructive/30' : 'bg-white/5 border-white/10'
                  }`}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold text-sm truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</h4>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-4">{n.time}</span>
                    </div>
                    <p className={`text-sm ${!n.isRead ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>{n.message || n.title2}</p>
                    
                    {n.critical && !n.isRead && (
                      <div className="mt-3">
                        <Button size="sm" className="h-7 text-xs font-mono bg-destructive hover:bg-destructive/80 text-white">VIEW EMERGENCY</Button>
                      </div>
                    )}
                  </div>

                  {!n.isRead && (
                    <button onClick={() => markRead(n.id)} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-muted-foreground hover:bg-white/10 hover:text-primary transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

        </div>

      </motion.div>
    </AppLayout>
  );
}