import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useGetDonorDashboard } from '@workspace/api-client-react';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import { MapPin, Calendar as CalendarIcon, Clock, ShieldCheck, HeartPulse, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DonorDonate() {
  const { user } = useAuthStore();
  const { data, isLoading } = useGetDonorDashboard(user?.id ?? 0);
  const [selectedCamp, setSelectedCamp] = useState<number | null>(null);

  const mockCamps = [
    { id: 1, name: 'AIIMS Mega Blood Camp', date: 'Oct 24, 2023', time: '09:00 AM - 05:00 PM', location: 'AIIMS Delhi Campus', slots: 42, distance: '2.4 km' },
    { id: 2, name: 'Rotary Club Drive', date: 'Oct 26, 2023', time: '10:00 AM - 02:00 PM', location: 'Community Center, Vasant Kunj', slots: 15, distance: '4.1 km' },
    { id: 3, name: 'Red Cross Mobile Unit', date: 'Oct 28, 2023', time: '08:00 AM - 12:00 PM', location: 'Connaught Place', slots: 8, distance: '6.7 km' },
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black glow-text text-primary uppercase tracking-wider">BOOK DONATION</h1>
          <p className="font-mono text-muted-foreground">SCHEDULE YOUR NEXT LIFE-SAVING APPOINTMENT</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1 space-y-6">
            {/* Eligibility Card */}
            <div className="glass-panel p-6 rounded-xl border border-success/30 bg-success/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl"></div>
              <ShieldCheck className="w-10 h-10 text-success mb-4" />
              <h2 className="text-xl font-black text-success glow-text-success mb-2">ELIGIBLE TO DONATE</h2>
              <p className="text-xs text-muted-foreground font-mono mb-4">Your last donation was over 90 days ago. You are cleared for donation.</p>
              <div className="bg-background/50 border border-success/20 rounded p-3 text-center">
                <span className="text-xs font-mono text-success">HEALTH STATUS: OPTIMAL</span>
              </div>
            </div>

            {/* Health Tips */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                <HeartPulse className="w-4 h-4" /> PRE-DONATION
              </h3>
              <ul className="text-xs text-muted-foreground space-y-3 font-mono">
                <li className="flex gap-2"><span>•</span> Drink extra 16oz of water</li>
                <li className="flex gap-2"><span>•</span> Eat a healthy meal before</li>
                <li className="flex gap-2"><span>•</span> Avoid fatty foods for 24h</li>
                <li className="flex gap-2"><span>•</span> Bring valid ID & ABHA Card</li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {/* Camps List */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-6">NEARBY DRIVES & BANKS</h3>
              
              <div className="space-y-4">
                {mockCamps.map((camp) => (
                  <div 
                    key={camp.id} 
                    onClick={() => setSelectedCamp(camp.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedCamp === camp.id 
                        ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,157,255,0.2)]' 
                        : 'bg-white/5 border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{camp.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-1">
                          <MapPin className="w-3 h-3 text-primary" /> {camp.location} ({camp.distance})
                        </div>
                      </div>
                      <div className="bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded text-[10px] font-mono font-bold">
                        {camp.slots} SLOTS LEFT
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4 text-secondary" />
                        <span>{camp.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span>{camp.time}</span>
                      </div>
                    </div>

                    {selectedCamp === camp.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-primary/20 flex justify-end">
                        <Button className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono flex items-center gap-2">
                          <Droplet className="w-4 h-4" /> CONFIRM APPOINTMENT
                        </Button>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </AppLayout>
  );
}