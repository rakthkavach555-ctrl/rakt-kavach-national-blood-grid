import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { motion } from 'framer-motion';
import { Ambulance, MapPin, Radio, ShieldAlert, Navigation, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function AmbulanceDashboard() {
  // Using dummy data since full hooks aren't provided in the prompt for Active Emergencies
  const ambulances = [
    { id: 1, vehicleNumber: 'DL-1C-AA-2345', type: 'MOBILE_ICU', status: 'AVAILABLE', driverName: 'Ramesh Kumar', location: 'AIIMS Delhi' },
    { id: 2, vehicleNumber: 'DL-1C-AB-8821', type: 'ADVANCED', status: 'DISPATCHED', driverName: 'Suresh Singh', location: 'En route to Fortis' },
    { id: 3, vehicleNumber: 'DL-1C-AC-9102', type: 'BLOOD_TRANSPORT', status: 'IN_TRANSIT', driverName: 'Vikram', location: 'Moving to BB-DL-01' },
    { id: 4, vehicleNumber: 'DL-1C-AD-1100', type: 'BASIC', status: 'AVAILABLE', driverName: 'Rajesh', location: 'Safdarjung Hospital' },
  ];

  const activeEmergencies = [
    { id: 'SOS-8891', patient: 'Unknown (Accident)', hospital: 'AIIMS Trauma', distance: '2.4 km', required: 'Ambulance & 4U O-' }
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black glow-text text-primary uppercase tracking-wider">DISPATCH CONTROL</h1>
            <p className="font-mono text-muted-foreground">LIVE FLEET TRACKING & EMERGENCY DISPATCH</p>
          </div>
          <div className="glass-panel px-4 py-2 border-primary/30 rounded-lg flex items-center gap-3">
            <Radio className="w-5 h-5 text-success animate-pulse" />
            <span className="text-xs font-mono font-bold text-success">FLEET COMM ACTIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Emergencies Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-destructive/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-destructive/5"></div>
              <h3 className="font-mono text-sm tracking-widest text-destructive font-bold mb-4 flex items-center gap-2 relative z-10">
                <ShieldAlert className="w-4 h-4" /> URGENT DISPATCH REQUIRED
              </h3>
              
              <div className="space-y-4 relative z-10">
                {activeEmergencies.map((em, i) => (
                  <div key={i} className="bg-background/80 border border-destructive/30 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold font-mono text-destructive">{em.id}</span>
                      <span className="text-xs font-mono bg-destructive/20 text-destructive px-2 py-0.5 rounded border border-destructive/50 animate-pulse">ACTIVE</span>
                    </div>
                    <div className="text-sm font-bold mb-1">{em.hospital}</div>
                    <div className="text-xs text-muted-foreground mb-3">{em.patient}</div>
                    <div className="text-xs font-mono text-primary flex items-center gap-1 mb-4">
                      <Navigation className="w-3 h-3" /> {em.distance} away
                    </div>
                    <Link href="/emergency">
                      <Button className="w-full bg-destructive hover:bg-destructive/80 text-white font-mono text-xs h-8">
                        ASSIGN AMBULANCE
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4">FLEET METRICS</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-black font-mono text-success">2</div>
                  <div className="text-[10px] uppercase font-mono text-muted-foreground mt-1">Available</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-black font-mono text-orange-500">1</div>
                  <div className="text-[10px] uppercase font-mono text-muted-foreground mt-1">Dispatched</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-black font-mono text-secondary">1</div>
                  <div className="text-[10px] uppercase font-mono text-muted-foreground mt-1">In Transit</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-black font-mono text-foreground">4</div>
                  <div className="text-[10px] uppercase font-mono text-muted-foreground mt-1">Total Fleet</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Fleet View */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Map View */}
            <div className="glass-panel p-2 rounded-xl border border-primary/20 h-64 relative overflow-hidden">
              <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur px-3 py-1 rounded border border-primary/50 text-xs font-mono text-primary flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div> LIVE TRACKING
              </div>
              <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 1 }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              </MapContainer>
            </div>

            {/* Fleet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ambulances.map((amb) => {
                let statusColor = 'text-foreground';
                let borderColor = 'border-white/10';
                if (amb.status === 'AVAILABLE') { statusColor = 'text-success'; borderColor = 'border-success/30'; }
                if (amb.status === 'DISPATCHED') { statusColor = 'text-orange-500'; borderColor = 'border-orange-500/30'; }
                if (amb.status === 'IN_TRANSIT') { statusColor = 'text-secondary'; borderColor = 'border-secondary/30'; }

                return (
                  <div key={amb.id} className={`glass-panel p-4 rounded-xl border ${borderColor} flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Ambulance className={`w-5 h-5 ${statusColor}`} />
                          <span className="font-bold font-mono text-sm">{amb.vehicleNumber}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusColor} ${statusColor.replace('text-', 'bg-')}/10 ${statusColor.replace('text-', 'border-')}/50`}>
                          {amb.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground font-mono flex items-center gap-2 mb-2">
                        <span className="text-primary">{amb.type}</span> | Driver: {amb.driverName}
                      </div>
                      
                      <div className="text-xs font-mono flex items-center gap-1 text-foreground mb-4">
                        <MapPin className="w-3 h-3 text-primary" /> {amb.location}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <select className="bg-background border border-border rounded text-xs font-mono px-2 py-1 flex-1 outline-none focus:border-primary">
                        <option value="AVAILABLE" selected={amb.status === 'AVAILABLE'}>Set Available</option>
                        <option value="DISPATCHED" selected={amb.status === 'DISPATCHED'}>Set Dispatched</option>
                        <option value="IN_TRANSIT" selected={amb.status === 'IN_TRANSIT'}>Set In Transit</option>
                      </select>
                      <Button size="icon" variant="outline" className="h-7 w-7 text-muted-foreground hover:text-primary"><Settings className="w-3 h-3" /></Button>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>

        </div>
      </motion.div>
    </AppLayout>
  );
}