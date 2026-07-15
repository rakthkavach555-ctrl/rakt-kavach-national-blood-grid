import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useGetHospitalDashboard, useUpdateBloodRequest } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Hospital, Bed, Activity, Droplet, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HospitalDashboard() {
  // Using dummy data structure since we don't have the real hospitalId yet
  const { data, isLoading } = useGetHospitalDashboard(1);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Mock fallback for UI testing
  const hospital = data?.hospital || { name: 'AIIMS Super Speciality Hospital', registrationNumber: 'REG-109283', type: 'GOVERNMENT', totalBeds: 1250, isActive: true };
  const requests = data?.pendingRequests || [
    { id: 1, patientName: 'Rahul Verma', bloodGroup: 'B+', units: 2, urgency: 'URGENT', status: 'PENDING', createdAt: new Date().toISOString() },
    { id: 2, patientName: 'Priya Singh', bloodGroup: 'O-', units: 1, urgency: 'EMERGENCY', status: 'PENDING', createdAt: new Date().toISOString() }
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black glow-text text-primary uppercase tracking-wider">HOSPITAL DESK</h1>
            <p className="font-mono text-muted-foreground">{hospital.name} | REG: {hospital.registrationNumber}</p>
          </div>
          <div className="glass-panel px-3 py-1 flex items-center gap-2 border-primary/30 rounded">
            <Hospital className="text-primary w-4 h-4" />
            <span className="text-xs font-mono text-primary">{hospital.type} FACILITY</span>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center"><Bed className="w-5 h-5 text-muted-foreground" /></div>
            <div>
              <div className="text-2xl font-black font-mono">{hospital.totalBeds}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Total Beds</div>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-primary/30 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-primary/10 to-transparent"></div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30"><Activity className="w-5 h-5 text-primary" /></div>
            <div>
              <div className="text-2xl font-black font-mono text-primary">{requests.length}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Pending Reqs</div>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-secondary/30 flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center border border-secondary/30"><Droplet className="w-5 h-5 text-secondary" /></div>
            <div>
              <div className="text-2xl font-black font-mono text-secondary">42</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Units Available</div>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-destructive/50 flex items-center gap-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/30"><ShieldAlert className="w-5 h-5 text-destructive animate-pulse" /></div>
            <div>
              <div className="text-2xl font-black font-mono text-destructive">1</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Active SOS</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Area: Requests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4">PENDING BLOOD REQUESTS</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b border-primary/20 font-mono text-xs uppercase">
                      <th className="pb-3 font-normal">Patient / ID</th>
                      <th className="pb-3 font-normal">Blood Grp</th>
                      <th className="pb-3 font-normal">Units</th>
                      <th className="pb-3 font-normal">Urgency</th>
                      <th className="pb-3 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req: any) => (
                      <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-foreground">{req.patientName}</div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">ID: {req.id}</div>
                        </td>
                        <td className="py-4">
                          <span className="font-black text-primary bg-primary/10 px-2 py-1 rounded border border-primary/30">{req.bloodGroup}</span>
                        </td>
                        <td className="py-4 font-mono font-bold text-lg">{req.units}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${req.urgency === 'EMERGENCY' ? 'bg-destructive/20 text-destructive border-destructive' : 'bg-orange-500/20 text-orange-500 border-orange-500'}`}>
                            {req.urgency}
                          </span>
                        </td>
                        <td className="py-4 flex justify-end gap-2">
                          <Button size="icon" variant="outline" className="w-8 h-8 rounded-full border-success/50 text-success hover:bg-success/20 hover:text-success"><CheckCircle className="w-4 h-4" /></Button>
                          <Button size="icon" variant="outline" className="w-8 h-8 rounded-full border-destructive/50 text-destructive hover:bg-destructive/20 hover:text-destructive"><XCircle className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground font-mono text-sm">NO PENDING REQUESTS</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                <Droplet className="w-4 h-4" /> INVENTORY SUMMARY
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map((bg, i) => (
                  <div key={i} className={`p-2 rounded border flex justify-between items-center ${i === 2 || i === 6 ? 'bg-destructive/10 border-destructive/30' : 'bg-white/5 border-white/10'}`}>
                    <span className={`font-black ${i === 2 || i === 6 ? 'text-destructive' : 'text-foreground'}`}>{bg}</span>
                    <span className="font-mono text-sm">{i === 2 ? 1 : i === 6 ? 0 : Math.floor(Math.random() * 15) + 2}</span>
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