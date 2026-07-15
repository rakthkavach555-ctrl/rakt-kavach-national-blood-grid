import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { motion } from 'framer-motion';
import { TestTube, Activity, CheckCircle, AlertTriangle, Search, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LaboratoryDashboard() {
  const [activeTab, setActiveTab] = useState('PENDING');

  const pendingTests = [
    { id: 'BU-2023-8891', date: '10:42 AM', source: 'Camp: AIIMS' },
    { id: 'BU-2023-8892', date: '11:15 AM', source: 'Walk-in Donor' },
    { id: 'BU-2023-8893', date: '11:40 AM', source: 'Walk-in Donor' },
  ];

  const testTypes = ['HIV', 'HBV', 'HCV', 'SYPHILIS', 'MALARIA', 'BLOOD_GROUP_CONFIRM'];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black glow-text text-primary uppercase tracking-wider">LABORATORY DESK</h1>
            <p className="font-mono text-muted-foreground">CENTRAL SCREENING FACILITY | DL-LAB-01</p>
          </div>
          <div className="glass-panel px-4 py-2 border-primary/30 rounded-lg flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-mono uppercase">Tests Today</div>
              <div className="text-xl font-black text-foreground">142</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-mono uppercase">Pending</div>
              <div className="text-xl font-black text-orange-500">{pendingTests.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Work Queue */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-primary/20 flex flex-col h-[calc(100vh-200px)]">
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setActiveTab('PENDING')}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded ${activeTab === 'PENDING' ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-white/5 text-muted-foreground border border-transparent'}`}
                >
                  QUEUE ({pendingTests.length})
                </button>
                <button 
                  onClick={() => setActiveTab('COMPLETED')}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded ${activeTab === 'COMPLETED' ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-white/5 text-muted-foreground border border-transparent'}`}
                >
                  RECENT
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input type="text" placeholder="Scan Unit Barcode..." className="w-full bg-background border border-primary/30 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none font-mono" />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-none">
                {activeTab === 'PENDING' && pendingTests.map((test, i) => (
                  <div key={i} className={`p-3 rounded-lg border cursor-pointer transition-colors ${i === 0 ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(0,157,255,0.15)]' : 'bg-white/5 border-white/10 hover:border-primary/50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="font-bold font-mono text-sm text-foreground">{test.id}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{test.date}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TestTube className="w-3 h-3" /> {test.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Test Entry */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl border border-primary/50 flex items-center justify-center">
                    <Microscope className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">ACTIVE SAMPLE</div>
                    <h2 className="text-2xl font-black font-mono text-foreground">{pendingTests[0]?.id || 'SCAN SAMPLE'}</h2>
                  </div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 text-orange-500 px-3 py-1 rounded text-xs font-mono font-bold animate-pulse">
                  TESTING IN PROGRESS
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-mono text-sm tracking-widest text-primary font-bold">MANDATORY TTI SCREENING</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testTypes.slice(0, 5).map((test) => (
                    <div key={test} className="bg-background/50 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                      <span className="font-mono font-bold text-sm">{test}</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs font-mono font-bold rounded border border-success/30 bg-success/10 text-success hover:bg-success/20 transition-colors">NEGATIVE</button>
                        <button className="px-3 py-1 text-xs font-mono font-bold rounded border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">POSITIVE</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4">BLOOD GROUP CONFIRMATION</h3>
                  <div className="flex items-center gap-4">
                    <select className="bg-background/80 border border-primary/30 rounded-lg px-4 py-2 text-sm focus:border-primary outline-none appearance-none font-mono font-bold text-primary w-32">
                      <option value="">Select...</option>
                      <option value="A+">A+</option>
                      <option value="O+">O+</option>
                      <option value="B+">B+</option>
                    </select>
                    <span className="text-xs text-muted-foreground font-mono">Matches donor record: <span className="text-foreground">O+</span></span>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-4">
                  <Button variant="outline" className="font-mono border-destructive/50 text-destructive hover:bg-destructive/10">MARK DISCARD</Button>
                  <Button className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> CERTIFY SAFE
                  </Button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </motion.div>
    </AppLayout>
  );
}