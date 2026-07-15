import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useParams } from 'wouter';
import { useGetStateDashboard } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Building, Hospital, Droplet, Users, ShieldAlert, Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StateCommandCenter() {
  const { stateCode } = useParams<{ stateCode: string }>();
  const { data, isLoading, error } = useGetStateDashboard(stateCode || 'DL');

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
          Error loading state dashboard.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial="initial" animate="animate" variants={pageVariants} className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black glow-text text-primary uppercase tracking-wider">{data.stateName} COMMAND CENTER</h1>
            <p className="font-mono text-muted-foreground">STATE CODE: {data.stateCode} | REAL-TIME GRID DATA</p>
          </div>
          <div className="glass-panel px-4 py-2 flex items-center gap-3 border-success/30 rounded-lg">
            <Activity className="text-success animate-pulse w-5 h-5" />
            <span className="text-success font-mono text-sm glow-text-success">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'TOTAL UNITS', value: data.analytics.totalUnits, icon: Droplet, color: 'text-primary', border: 'border-primary/30' },
            { label: 'DONORS', value: data.analytics.donors, icon: Users, color: 'text-secondary', border: 'border-secondary/30' },
            { label: 'HOSPITALS', value: data.analytics.hospitals, icon: Hospital, color: 'text-success', border: 'border-success/30' },
            { label: 'BLOOD BANKS', value: data.analytics.bloodBanks, icon: Building, color: 'text-muted-foreground', border: 'border-white/10' },
            { label: 'EMERGENCIES', value: data.analytics.activeEmergencies, icon: ShieldAlert, color: 'text-destructive', border: 'border-destructive/50 glow-border' },
          ].map((metric, i) => (
            <div key={i} className={`glass-panel p-4 rounded-xl border ${metric.border} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
              <metric.icon className={`w-6 h-6 mb-2 ${metric.color} opacity-80`} />
              <div className={`text-2xl font-black font-mono ${metric.color}`}>{metric.value}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Charts Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Inventory Breakdown */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-6">INVENTORY BY BLOOD GROUP</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.analytics.byBloodGroup}>
                    <XAxis dataKey="bloodGroup" stroke="#7EB8D4" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#7EB8D4" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,157,255,0.1)' }} contentStyle={{ backgroundColor: '#0D1528', borderColor: '#009DFF' }} />
                    <Bar dataKey="units" fill="#009DFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* District Table */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20 overflow-hidden">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4">DISTRICT READINESS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                  <thead>
                    <tr className="text-muted-foreground border-b border-primary/20">
                      <th className="pb-3 font-normal">DISTRICT</th>
                      <th className="pb-3 font-normal text-right">UNITS</th>
                      <th className="pb-3 font-normal text-right">HOSPITALS</th>
                      <th className="pb-3 font-normal text-right">BANKS</th>
                      <th className="pb-3 font-normal text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.districtBreakdown.map((dist, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-bold text-foreground">{dist.stateName}</td>
                        <td className="py-3 text-right text-primary">{dist.totalUnits}</td>
                        <td className="py-3 text-right">{dist.hospitals}</td>
                        <td className="py-3 text-right">{dist.bloodBanks}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-1 rounded text-[10px] ${dist.supplyStatus === 'CRITICAL' ? 'bg-destructive/20 text-destructive border border-destructive' : 'bg-success/20 text-success border border-success'}`}>
                            {dist.supplyStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Map */}
            <div className="glass-panel p-2 rounded-xl border border-primary/20 h-64 relative overflow-hidden">
              <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur px-3 py-1 rounded border border-primary/50 text-xs font-mono text-primary">LIVE MAP</div>
              {/* Dummy Map to satisfy visual requirements - real Leaflet needs proper config */}
              <MapContainer center={[28.6139, 77.2090]} zoom={10} style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 1 }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              </MapContainer>
            </div>

            {/* Active Emergencies */}
            <div className="glass-panel p-6 rounded-xl border border-destructive/30">
              <h3 className="font-mono text-sm tracking-widest text-destructive font-bold mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> ACTIVE EMERGENCIES
              </h3>
              <div className="space-y-3">
                {data.activeEmergencies.map((em, i) => (
                  <div key={i} className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-destructive font-mono text-xs">{em.sosCode}</span>
                      <span className="text-xs font-black bg-destructive text-white px-1.5 rounded">{em.bloodGroup}</span>
                    </div>
                    <div className="text-sm font-medium">{em.hospitalName}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>{em.unitsRequired} Units Required</span>
                      <span className="text-destructive animate-pulse text-[10px]">{em.status}</span>
                    </div>
                  </div>
                ))}
                {data.activeEmergencies.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm font-mono py-4">NO ACTIVE EMERGENCIES</div>
                )}
              </div>
            </div>

          </div>
        </div>

      </motion.div>
    </AppLayout>
  );
}