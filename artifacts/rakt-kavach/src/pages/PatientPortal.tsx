import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { useGetMe, useListBloodRequests } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { HeartPulse, Droplet, Clock, Plus, Activity, Hospital, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PatientPortal() {
  const { user } = useAuthStore();
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Mock data since hooks might not be fully wired in frontend yet
  const requests = [
    { id: 'REQ-8891', hospital: 'AIIMS Trauma Center', units: 2, group: 'O+', urgency: 'URGENT', status: 'PENDING', date: 'Today, 10:42 AM' },
    { id: 'REQ-7742', hospital: 'Fortis Hospital', units: 1, group: 'O+', urgency: 'ROUTINE', status: 'FULFILLED', date: 'Oct 12, 2023' }
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black glow-text text-primary uppercase tracking-wider">PATIENT DESK</h1>
            <p className="font-mono text-muted-foreground">MANAGE REQUESTS & HEALTH CREDITS</p>
          </div>
          <Button onClick={() => setShowRequestForm(!showRequestForm)} className="bg-destructive hover:bg-destructive/80 text-white font-mono flex items-center gap-2">
            <Plus className="w-4 h-4" /> NEW REQUEST
          </Button>
        </div>

        {showRequestForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel p-6 rounded-xl border border-destructive/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-destructive/5"></div>
            <h3 className="font-mono text-sm tracking-widest text-destructive font-bold mb-4 flex items-center gap-2 relative z-10">
              <ShieldAlert className="w-4 h-4" /> RAISE BLOOD REQUEST
            </h3>
            <form className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={(e) => { e.preventDefault(); setShowRequestForm(false); }}>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Hospital</label>
                <select className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-destructive outline-none appearance-none">
                  <option>AIIMS Delhi</option>
                  <option>Fortis Hospital</option>
                  <option>Max Super Speciality</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Units Required</label>
                <input type="number" min="1" max="10" defaultValue="1" className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-destructive outline-none" />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Urgency</label>
                <select className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-destructive outline-none appearance-none">
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent (24-48h)</option>
                  <option value="EMERGENCY">Emergency (Immediate)</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)} className="font-mono">CANCEL</Button>
                <Button type="submit" className="bg-destructive hover:bg-destructive/80 text-white font-mono">SUBMIT REQUEST</Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1 space-y-6">
            {/* Patient Profile */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20 flex flex-col items-center text-center relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full border border-primary flex items-center justify-center mb-4 relative">
                <HeartPulse className="w-8 h-8 text-primary" />
                <div className="absolute -bottom-2 -right-2 bg-background border border-primary rounded-full px-2 py-0.5 text-xs font-black text-primary glow-text">O+</div>
              </div>
              <h2 className="text-xl font-bold">{user?.name || 'Patient'}</h2>
              <p className="text-xs text-muted-foreground font-mono mt-1 mb-4">ABHA: 91-XXXX-XXXX-XXXX</p>
              
              <div className="w-full bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-muted-foreground">Blood Wallet</span>
                <span className="text-sm font-bold text-success">3 Credits</span>
              </div>
              <div className="w-full bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center">
                <span className="text-xs font-mono text-muted-foreground">Family Protected</span>
                <span className="text-sm font-bold text-primary">Yes</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {/* Active Requests */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-6">REQUEST HISTORY</h3>
              
              <div className="space-y-4">
                {requests.map((req, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${req.status === 'PENDING' ? 'bg-primary/5 border-primary/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground text-lg">{req.hospital}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${req.urgency === 'URGENT' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' : 'bg-white/10 text-muted-foreground border border-white/20'}`}>
                            {req.urgency}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-2">
                          <span className="flex items-center gap-1"><Droplet className="w-3 h-3 text-primary" /> {req.units} Units ({req.group})</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {req.date}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded text-xs font-mono font-bold border ${req.status === 'PENDING' ? 'bg-primary/20 text-primary border-primary/50 glow-border' : 'bg-success/20 text-success border-success/50'}`}>
                        {req.status}
                      </div>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="mt-4 pt-4 border-t border-primary/20 relative">
                        <div className="absolute top-0 left-4 bottom-0 w-0.5 bg-primary/20"></div>
                        <div className="space-y-4 pl-8 relative">
                          <div className="relative">
                            <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background"></div>
                            <p className="text-xs font-mono text-primary">Request Verified by Hospital</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-muted border-2 border-background"></div>
                            <p className="text-xs font-mono text-muted-foreground">Searching nearby blood banks...</p>
                          </div>
                        </div>
                      </div>
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