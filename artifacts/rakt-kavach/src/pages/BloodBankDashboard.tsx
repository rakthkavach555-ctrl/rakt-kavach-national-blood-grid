import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useGetBloodBankDashboard } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Building, Droplet, Plus, Package, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BloodBankDashboard() {
  const { data, isLoading } = useGetBloodBankDashboard(1);
  const [showAddForm, setShowAddForm] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Mock data fallback
  const bank = data?.bloodBank || { name: 'Lions Central Blood Bank', licenseNumber: 'DL-BB-492', is24x7: true, isComponentFacility: true };
  const stats = data?.stats || { totalUnits: 342, unitsExpiringSoon: 12, requestsPending: 8 };

  const inventoryMatrix = [
    { bg: 'A+', avail: 45, rsvd: 10, exp: 2 },
    { bg: 'A-', avail: 8, rsvd: 2, exp: 0 },
    { bg: 'B+', avail: 82, rsvd: 15, exp: 5 },
    { bg: 'B-', avail: 4, rsvd: 1, exp: 0 },
    { bg: 'AB+', avail: 24, rsvd: 5, exp: 1 },
    { bg: 'AB-', avail: 2, rsvd: 0, exp: 0 },
    { bg: 'O+', avail: 110, rsvd: 25, exp: 4 },
    { bg: 'O-', avail: 12, rsvd: 8, exp: 0 },
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black glow-text text-secondary uppercase tracking-wider">BLOOD BANK COMMAND</h1>
            <p className="font-mono text-muted-foreground">{bank.name} | LIC: {bank.licenseNumber}</p>
          </div>
          <div className="flex gap-2">
            {bank.is24x7 && <span className="bg-success/20 text-success border border-success/50 px-2 py-1 rounded text-xs font-mono font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> 24x7</span>}
            {bank.isComponentFacility && <span className="bg-primary/20 text-primary border border-primary/50 px-2 py-1 rounded text-xs font-mono font-bold flex items-center gap-1"><Package className="w-3 h-3" /> COMPONENTS</span>}
          </div>
        </div>

        {/* Action Bar */}
        <div className="glass-panel p-4 rounded-xl border border-primary/20 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-black font-mono text-primary">{stats.totalUnits}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Total Inventory</div>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div>
              <div className="text-2xl font-black font-mono text-orange-500">{stats.unitsExpiringSoon}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Expiring &lt;7 Days</div>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono">
            <Plus className="w-4 h-4 mr-2" /> ADD INVENTORY
          </Button>
        </div>

        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel p-6 rounded-xl border border-primary border-t-4">
            <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4">REGISTER NEW UNITS (FROM CAMP/DONOR)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Blood Group</label>
                <select className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none appearance-none">
                  {inventoryMatrix.map(m => <option key={m.bg} value={m.bg}>{m.bg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Units Collected</label>
                <input type="number" min="1" defaultValue="1" className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Collection Date</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none" style={{colorScheme: 'dark'}} />
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-mono">SAVE TO LEDGER</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Matrix */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20">
          <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-6">LIVE INVENTORY MATRIX</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-primary/20 font-mono text-xs uppercase">
                  <th className="pb-3 font-normal pl-4">Blood Group</th>
                  <th className="pb-3 font-normal text-right pr-8">Available (Surplus/Adequate/Low)</th>
                  <th className="pb-3 font-normal text-right pr-8">Reserved</th>
                  <th className="pb-3 font-normal text-right pr-4">Expiring Soon</th>
                </tr>
              </thead>
              <tbody>
                {inventoryMatrix.map((row, i) => {
                  let statusColor = 'text-foreground';
                  let barColor = 'bg-primary';
                  if (row.avail > 50) { statusColor = 'text-secondary'; barColor = 'bg-secondary'; }
                  else if (row.avail >= 20) { statusColor = 'text-success'; barColor = 'bg-success'; }
                  else if (row.avail >= 5) { statusColor = 'text-orange-500'; barColor = 'bg-orange-500'; }
                  else { statusColor = 'text-destructive glow-text-critical'; barColor = 'bg-destructive animate-pulse'; }

                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-4 pl-4">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-lg ${statusColor} ${statusColor.replace('text-', 'border-')}/30`}>
                          {row.bg}
                        </div>
                      </td>
                      <td className="py-4 pr-8 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`font-mono text-2xl font-black ${statusColor}`}>{row.avail}</span>
                          <div className="w-full max-w-[150px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${Math.min(100, (row.avail / 100) * 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-8 text-right font-mono text-muted-foreground text-lg">{row.rsvd}</td>
                      <td className="py-4 pr-4 text-right">
                        {row.exp > 0 ? (
                          <span className="bg-orange-500/20 text-orange-500 border border-orange-500/50 px-3 py-1 rounded-full font-mono text-sm font-bold">
                            {row.exp} Units
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-mono opacity-50">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </motion.div>
    </AppLayout>
  );
}