import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import { Heart, Users, MapPin, Calendar, Award, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VolunteerPortal() {
  const { user } = useAuthStore();
  const [showRegister, setShowRegister] = useState(false);

  const mockCampaigns = [
    { id: 1, name: 'AIIMS Mega Blood Donation Drive', date: 'Oct 24, 2023', location: 'New Delhi', status: 'RECRUITING', roles: ['Registration Desk', 'Donor Care'] },
    { id: 2, name: 'Rotary Club Emergency Camp', date: 'Oct 26, 2023', location: 'Gurugram', status: 'RECRUITING', roles: ['Crowd Control'] },
    { id: 3, name: 'Red Cross College Drive', date: 'Oct 28, 2023', location: 'North Campus', status: 'FULL', roles: ['Logistics'] }
  ];

  const leaderboard = [
    { rank: 1, name: 'Arjun P.', events: 24, points: 1200 },
    { rank: 2, name: 'Sneha M.', events: 19, points: 950 },
    { rank: 3, name: 'Vikram S.', events: 15, points: 750 },
    { rank: 4, name: 'Rahul K.', events: 12, points: 600 },
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black glow-text text-primary uppercase tracking-wider">VOLUNTEER FORCE</h1>
            <p className="font-mono text-muted-foreground">POWERING THE NATIONAL DIGITAL BLOOD GRID</p>
          </div>
          {!showRegister && (
            <Button onClick={() => setShowRegister(true)} className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono">
              BECOME A VOLUNTEER
            </Button>
          )}
        </div>

        {showRegister && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel p-6 rounded-xl border border-primary/50 relative overflow-hidden mb-6">
            <div className="absolute inset-0 bg-primary/5"></div>
            <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4 relative z-10">REGISTER AS VOLUNTEER</h3>
            
            <form className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={(e) => { e.preventDefault(); setShowRegister(false); }}>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">State</label>
                <select className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none">
                  <option>Delhi</option>
                  <option>Haryana</option>
                  <option>Uttar Pradesh</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">District</label>
                <select className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none">
                  <option>New Delhi</option>
                  <option>South Delhi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Availability</label>
                <select className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none">
                  <option>Weekends</option>
                  <option>Emergency Only</option>
                  <option>Part Time</option>
                  <option>Full Time</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {['Event Management', 'Medical Background', 'Crowd Control', 'Logistics', 'Social Media', 'Donor Counseling'].map((skill) => (
                    <label key={skill} className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-full text-xs font-mono cursor-pointer hover:border-primary/50">
                      <input type="checkbox" className="accent-primary" /> {skill}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setShowRegister(false)} className="font-mono">CANCEL</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono">SUBMIT APPLICATION</Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Profile & Leaderboard */}
          <div className="md:col-span-1 space-y-6">
            
            <div className="glass-panel p-6 rounded-xl border border-secondary/30 relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-secondary/20 to-transparent"></div>
              <div className="w-20 h-20 bg-secondary/10 rounded-full border-2 border-secondary flex items-center justify-center mb-4 relative z-10 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-xl font-bold relative z-10">{user?.name || 'Volunteer'}</h2>
              <div className="inline-flex items-center gap-1 bg-secondary/10 border border-secondary/30 text-secondary px-2 py-0.5 rounded text-[10px] font-mono font-bold mt-1 mb-4">
                <Star className="w-3 h-3" /> ACTIVE VOLUNTEER
              </div>
              
              <div className="w-full grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-xl font-black font-mono">12</div>
                  <div className="text-[9px] text-muted-foreground font-mono uppercase mt-1">Events</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-xl font-black font-mono text-secondary">600</div>
                  <div className="text-[9px] text-muted-foreground font-mono uppercase mt-1">Points</div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4" /> LEADERBOARD
              </h3>
              <div className="space-y-3">
                {leaderboard.map((l) => (
                  <div key={l.rank} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-black ${l.rank === 1 ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]' : l.rank === 2 ? 'bg-gray-300 text-black' : l.rank === 3 ? 'bg-orange-700 text-white' : 'bg-white/10 text-muted-foreground'}`}>
                        {l.rank}
                      </div>
                      <span className="font-bold text-sm">{l.name}</span>
                    </div>
                    <span className="text-xs font-mono text-secondary">{l.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Active Campaigns */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-sm tracking-widest text-primary font-bold">UPCOMING CAMPAIGNS</h3>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-2 text-muted-foreground" />
                  <input type="text" placeholder="Search location..." className="bg-background/50 border border-white/10 rounded pl-7 pr-2 py-1 text-xs font-mono outline-none focus:border-primary w-40" />
                </div>
              </div>
              
              <div className="space-y-4">
                {mockCampaigns.map((camp) => (
                  <div key={camp.id} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{camp.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> {camp.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {camp.date}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${camp.status === 'RECRUITING' ? 'bg-success/10 text-success border-success/30' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                        {camp.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-2">
                        {camp.roles.map(r => (
                          <span key={r} className="bg-background px-2 py-1 rounded text-[10px] font-mono border border-border text-muted-foreground">{r}</span>
                        ))}
                      </div>
                      <Button variant={camp.status === 'RECRUITING' ? 'default' : 'outline'} disabled={camp.status === 'FULL'} size="sm" className="font-mono text-xs h-8">
                        {camp.status === 'FULL' ? 'FULL' : 'VOLUNTEER'}
                      </Button>
                    </div>
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