import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useRegister, useCreateDonor } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Droplet, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorRegister() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', bloodGroup: 'O+', dateOfBirth: '', gender: 'MALE',
    weight: 60, height: 170, abhaId: '', address: '', state: '', district: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  // Mocks for demonstration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <AppLayout>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto mt-20 glass-panel p-8 rounded-2xl text-center border-success/50">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-success">
            <ShieldCheck className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-black text-success glow-text-success mb-2">REGISTRATION COMPLETE</h2>
          <p className="text-muted-foreground text-sm mb-6">Welcome to the National Digital Blood Grid. Your ABHA ID has been verified.</p>
          <div className="inline-block p-4 border border-primary/30 rounded-xl mb-8 bg-primary/5">
            <div className="text-xs font-mono text-muted-foreground mb-1">BLOOD GROUP</div>
            <div className="text-4xl font-black text-primary glow-text">{formData.bloodGroup}</div>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/donor">
              <Button className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono">GO TO PORTAL</Button>
            </Link>
          </div>
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black glow-text text-primary uppercase tracking-wider">DONOR ENLISTMENT</h1>
          <p className="font-mono text-muted-foreground">JOIN THE NATIONAL BLOOD GRID SECURELY</p>
        </div>

        <form onSubmit={handleRegister} className="glass-panel p-6 md:p-8 rounded-xl border border-primary/30 space-y-8">
          
          {/* Blood Group Selection */}
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Select Blood Group</label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {BLOOD_GROUPS.map((bg) => (
                <div 
                  key={bg} 
                  onClick={() => setFormData({...formData, bloodGroup: bg})}
                  className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    formData.bloodGroup === bg 
                    ? 'bg-primary/20 border-primary text-primary glow-border' 
                    : 'bg-white/5 border-white/10 hover:border-primary/50'
                  }`}
                >
                  <Droplet className={`w-5 h-5 mb-1 ${formData.bloodGroup === bg ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-black">{bg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Full Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">DOB</label>
                  <input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none text-white color-scheme-dark" style={{colorScheme: 'dark'}} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none appearance-none">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Weight (kg)</label>
                  <input type="number" required value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Height (cm)</label>
                  <input type="number" required value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">ABHA ID (Optional)</label>
                <div className="relative">
                  <input type="text" value={formData.abhaId} onChange={e => setFormData({...formData, abhaId: e.target.value})} placeholder="14-digit ABHA Number" className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none font-mono" />
                  <ShieldCheck className="w-4 h-4 absolute right-3 top-3 text-success/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Phone</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none font-mono" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono px-8">ENLIST NOW</Button>
          </div>

        </form>
      </motion.div>
    </AppLayout>
  );
}