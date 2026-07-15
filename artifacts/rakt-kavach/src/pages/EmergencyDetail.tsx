import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useParams } from 'wouter';
import { motion } from 'framer-motion';
import { ShieldAlert, MapPin, Ambulance, Hospital, Activity, Clock, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function EmergencyDetail() {
  const { id } = useParams<{ id: string }>();

  // Mocking the emergency data
  const emergency = {
    id: id || 'SOS-9912',
    status: 'DISPATCHED',
    patient: { name: 'Rahul Verma', age: 34, bloodGroup: 'O-', condition: 'Multiple Trauma (RTA)' },
    hospital: { name: 'AIIMS Trauma Center', location: 'New Delhi', distance: '4.2 km' },
    ambulance: { id: 'DL-1C-AA-2345', driver: 'Ramesh K.', eta: '12 mins', status: 'IN_TRANSIT' },
    bloodRequired: 4,
    timeline: [
      { status: 'ACTIVE', time: '10:42 AM', desc: 'SOS Initiated by AIIMS' },
      { status: 'BROADCAST', time: '10:45 AM', desc: 'Alert sent to nearby O- donors & BBs' },
      { status: 'DISPATCHED', time: '10:50 AM', desc: 'Ambulance DL-1C-AA-2345 dispatched with 2 units' },
      { status: 'FULFILLED', time: '', desc: 'Pending' },
      { status: 'RESOLVED', time: '', desc: 'Pending' }
    ]
  };

  const steps = ['ACTIVE', 'BROADCAST', 'DISPATCHED', 'FULFILLED', 'RESOLVED'];
  const currentStepIdx = steps.indexOf(emergency.status);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl mx-auto">
        
        {/* Hero Header */}
        <div className="glass-panel p-8 rounded-2xl border-2 border-destructive/50 relative overflow-hidden bg-destructive/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-destructive flex items-center justify-center bg-background shadow-[0_0_30px_rgba(255,59,59,0.3)]">
              <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono text-destructive font-bold tracking-widest uppercase mb-1">LIVE EMERGENCY PROTOCOL</div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground">{emergency.id}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-destructive text-white px-2 py-0.5 rounded text-xs font-bold font-mono animate-pulse">ACTIVE</span>
                <span className="text-sm font-mono text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" /> Initiated 18m ago</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 bg-background/50 border border-white/10 rounded-xl p-4 text-center min-w-[150px]">
            <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Required</div>
            <div className="text-3xl font-black text-primary glow-text flex items-center justify-center gap-2">
              {emergency.bloodRequired}U <span className="text-destructive">{emergency.patient.bloodGroup}</span>
            </div>
          </div>
        </div>

        {/* Visual Stepper */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20">
          <div className="relative flex justify-between items-center px-4 md:px-10">
            <div className="absolute top-1/2 left-10 right-10 h-1 bg-white/10 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-10 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000" style={{ width: `calc(${(currentStepIdx / (steps.length - 1)) * 100}% - 40px)` }}></div>
            
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isPast ? 'bg-primary border-primary text-primary-foreground' : isCurrent ? 'bg-background border-primary text-primary shadow-[0_0_15px_rgba(0,157,255,0.5)]' : 'bg-background border-white/20 text-muted-foreground'}`}>
                    {isPast ? <Activity className="w-4 h-4" /> : <span className="text-xs font-mono font-bold">{idx + 1}</span>}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Timeline */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-6">PROTOCOL TIMELINE</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:to-transparent">
                {emergency.timeline.map((item, idx) => (
                  <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${!item.time && 'opacity-30'}`}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <div className={`w-2 h-2 rounded-full ${item.time ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 border border-white/10 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold font-mono text-sm text-foreground">{item.status}</span>
                        <span className="text-xs font-mono text-muted-foreground">{item.time || '--:--'}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="glass-panel p-2 rounded-xl border border-primary/20 h-64 relative overflow-hidden">
              <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur px-3 py-1 rounded border border-primary/50 text-xs font-mono text-primary">UNIT DISPATCH TRACKING</div>
              <MapContainer center={[28.6139, 77.2090]} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 1 }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              </MapContainer>
            </div>

          </div>

          <div className="space-y-6">
            
            {/* Patient Info */}
            <div className="glass-panel p-6 rounded-xl border border-white/10 bg-white/5">
              <h3 className="font-mono text-sm tracking-widest text-muted-foreground font-bold mb-4">PATIENT DOSSIER</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground font-mono">Name</div>
                  <div className="font-bold text-lg">{emergency.patient.name} ({emergency.patient.age}y)</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono">Blood Group Required</div>
                  <div className="font-black text-2xl text-destructive glow-text-critical">{emergency.patient.bloodGroup}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono">Medical Condition</div>
                  <div className="text-sm border border-destructive/30 bg-destructive/10 text-destructive/90 p-2 rounded inline-block font-mono mt-1">{emergency.patient.condition}</div>
                </div>
              </div>
            </div>

            {/* Hospital & Ambulance */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <div className="space-y-6">
                <div>
                  <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-2 flex items-center gap-2"><Hospital className="w-4 h-4" /> DESTINATION</h3>
                  <div className="font-bold text-foreground">{emergency.hospital.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {emergency.hospital.location} ({emergency.hospital.distance})</div>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-mono text-sm tracking-widest text-secondary font-bold mb-2 flex items-center gap-2"><Ambulance className="w-4 h-4" /> DISPATCHED UNIT</h3>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold font-mono text-foreground">{emergency.ambulance.id}</div>
                      <div className="text-xs text-muted-foreground mt-1">Driver: {emergency.ambulance.driver}</div>
                    </div>
                    <div className="text-right">
                      <div className="bg-secondary/20 text-secondary border border-secondary/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold mb-1">{emergency.ambulance.status}</div>
                      <div className="text-xs font-mono text-primary">ETA: {emergency.ambulance.eta}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="glass-panel p-6 rounded-xl border border-destructive/50">
              <h3 className="font-mono text-sm tracking-widest text-destructive font-bold mb-4">OVERRIDE CONTROLS</h3>
              <div className="space-y-3">
                <Button className="w-full bg-success hover:bg-success/80 text-success-foreground font-mono">MARK FULFILLED</Button>
                <Button variant="outline" className="w-full border-white/20 text-muted-foreground font-mono">CANCEL PROTOCOL</Button>
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </AppLayout>
  );
}