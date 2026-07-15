import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useParams } from 'wouter';
import { useGetDistrictDashboard } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Ambulance, Hospital, Droplet, Building, ShieldAlert } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DistrictCommandCenter() {
  const { districtCode } = useParams<{ districtCode: string }>();
  const { data, isLoading, error } = useGetDistrictDashboard(districtCode || 'DL-01');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="glass-panel p-8 text-center border-destructive/50 text-destructive">
          Error loading district dashboard.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial="initial" animate="animate" variants={pageVariants} className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black glow-text text-secondary uppercase tracking-wider">{data.districtName} DISTRICT COMMAND</h1>
            <p className="font-mono text-muted-foreground">STATE: {data.analytics.stateName} | DISTRICT CODE: {data.districtCode}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'HOSPITALS', value: data.analytics.hospitals, icon: Hospital, color: 'text-primary' },
            { label: 'BLOOD BANKS', value: data.analytics.bloodBanks, icon: Building, color: 'text-secondary' },
            { label: 'AMBULANCES', value: data.ambulances.length, icon: Ambulance, color: 'text-success' },
            { label: 'EMERGENCIES', value: data.analytics.activeEmergencies, icon: ShieldAlert, color: 'text-destructive', border: 'border-destructive/50' },
          ].map((metric, i) => (
            <div key={i} className={`glass-panel p-4 rounded-xl border ${metric.border || 'border-white/10'} flex flex-col items-center justify-center text-center`}>
              <metric.icon className={`w-6 h-6 mb-2 ${metric.color} opacity-80`} />
              <div className={`text-2xl font-black font-mono ${metric.color}`}>{metric.value}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Block Breakdown */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4">BLOCK LEVEL READINESS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                  <thead>
                    <tr className="text-muted-foreground border-b border-primary/20">
                      <th className="pb-3 font-normal">FACILITY NAME</th>
                      <th className="pb-3 font-normal text-right">TYPE</th>
                      <th className="pb-3 font-normal text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hospitals.slice(0, 3).map((h, i) => (
                      <tr key={`h-${i}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-bold text-foreground flex items-center gap-2"><Hospital className="w-4 h-4 text-primary" /> {h.name}</td>
                        <td className="py-3 text-right text-muted-foreground">Hospital</td>
                        <td className="py-3 text-right"><span className="px-2 py-1 rounded text-[10px] bg-success/20 text-success border border-success">ACTIVE</span></td>
                      </tr>
                    ))}
                    {data.bloodBanks.slice(0, 2).map((b, i) => (
                      <tr key={`b-${i}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-bold text-foreground flex items-center gap-2"><Building className="w-4 h-4 text-secondary" /> {b.name}</td>
                        <td className="py-3 text-right text-muted-foreground">Blood Bank</td>
                        <td className="py-3 text-right"><span className="px-2 py-1 rounded text-[10px] bg-success/20 text-success border border-success">ACTIVE</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory by Blood Group */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4">INVENTORY BY GROUP</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {data.analytics.byBloodGroup.map((bg, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${bg.status === 'CRITICAL' ? 'bg-destructive/10 border-destructive/50' : 'bg-primary/5 border-primary/20'}`}>
                    <div className={`text-lg font-black ${bg.status === 'CRITICAL' ? 'text-destructive glow-text-critical' : 'text-foreground'}`}>{bg.bloodGroup}</div>
                    <div className="text-xs font-mono mt-1 text-primary">{bg.units}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            {/* Ambulances */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                <Ambulance className="w-4 h-4" /> AMBULANCE FLEET
              </h3>
              <div className="space-y-3">
                {data.ambulances.map((amb, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold font-mono text-sm">{amb.vehicleNumber}</div>
                      <div className="text-xs text-muted-foreground">{amb.type}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-mono border ${
                      amb.status === 'AVAILABLE' ? 'bg-success/20 text-success border-success/50' :
                      amb.status === 'DISPATCHED' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' :
                      'bg-orange-500/20 text-orange-500 border-orange-500/50'
                    }`}>
                      {amb.status}
                    </div>
                  </div>
                ))}
                {data.ambulances.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">NO AMBULANCES REGISTERED</div>
                )}
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </AppLayout>
  );
}