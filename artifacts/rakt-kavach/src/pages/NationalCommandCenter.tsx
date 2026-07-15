import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useGetNationalDashboard, useGetNationalAnalytics } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'wouter';
import {
  AreaChart, Area, BarChart, Bar, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { BloodGroupCount } from '@workspace/api-client-react';
import {
  Activity, Droplet, Users, ShieldAlert, Hospital, AlertTriangle,
  Wifi, Building2, HeartPulse, CheckCircle, Clock, MapPin,
  BarChart2, Shield, Zap, Globe, Database, Lock, ArrowUpRight,
} from 'lucide-react';

// Indian number formatter: 1234567 → "12,34,567"
function inFmt(n: number): string {
  const s = Math.round(n).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest   = s.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

const LIVE_FEED = [
  { time: '11:23 AM', text: 'Blood Issued — AIIMS, New Delhi',        type: 'info'    },
  { time: '11:22 AM', text: 'Blood Collected — Jodhpur Blood Bank',   type: 'success' },
  { time: '11:21 AM', text: 'Emergency Request — Civil Hospital, Patna', type: 'critical'},
  { time: '11:20 AM', text: 'Stock Updated — Kolkata Blood Bank',     type: 'info'    },
  { time: '11:19 AM', text: 'Donor Registered — ABHA:12345****',      type: 'success' },
  { time: '11:18 AM', text: 'Consent Granted — Data Sharing Consent', type: 'info'    },
  { time: '11:17 AM', text: 'Emergency Resolved — Apollo Chennai',    type: 'success' },
  { time: '11:16 AM', text: 'Critical SOS — O- shortage in MP Zone 4',type: 'critical'},
];

const TOP_STATES = [
  { name: 'Maharashtra',   units: 25752, bar: 92 },
  { name: 'Uttar Pradesh', units: 21734, bar: 78 },
  { name: 'Karnataka',     units: 17890, bar: 64 },
  { name: 'Tamil Nadu',    units: 15673, bar: 56 },
  { name: 'Gujarat',       units: 14256, bar: 51 },
];

const BLOOD_GROUPS_MASTER = [
  { bg: 'O+',  units: 95117, pct: 39, color: '#FF3B3B', status: 'ADEQUATE' },
  { bg: 'O-',  units: 18692, pct: 8,  color: '#FF6B6B', status: 'LOW'      },
  { bg: 'A+',  units: 48271, pct: 20, color: '#009DFF', status: 'ADEQUATE' },
  { bg: 'A-',  units:  9356, pct: 4,  color: '#00C3FF', status: 'CRITICAL' },
  { bg: 'B+',  units: 37352, pct: 15, color: '#00FFB2', status: 'ADEQUATE' },
  { bg: 'B-',  units:  7153, pct: 3,  color: '#00D4A0', status: 'CRITICAL' },
  { bg: 'AB+', units: 22674, pct: 9,  color: '#A855F7', status: 'LOW'      },
  { bg: 'AB-', units:  7198, pct: 3,  color: '#C084FC', status: 'CRITICAL' },
];

const SUPPLY_DEMAND = Array.from({ length: 24 }, (_, i) => ({
  t: `${i.toString().padStart(2, '0')}:00`,
  supply: 120000 + Math.sin(i / 3) * 30000 + Math.random() * 8000,
  demand: 95000  + Math.cos(i / 4) * 20000 + Math.random() * 6000,
}));

const FORECAST = [
  { d: '16 May', demand: 180000, supply: 160000 },
  { d: '17 May', demand: 195000, supply: 172000 },
  { d: '18 May', demand: 210000, supply: 185000 },
  { d: '19 May', demand: 225000, supply: 200000 },
  { d: '20 May', demand: 198000, supply: 210000 },
  { d: '21 May', demand: 242000, supply: 205000 },
  { d: '22 May', demand: 258000, supply: 215000 },
];

const EMERGENCIES_MAP = [
  { id: 1, sosCode: 'SOS-124', patientName: 'Rahul M', bloodGroup: 'O-', unitsRequired: 3, status: 'ACTIVE',     hospitalName: 'AIIMS Delhi',     lat: 28.567, lng: 77.210 },
  { id: 2, sosCode: 'SOS-123', patientName: 'Priya K', bloodGroup: 'B-', unitsRequired: 2, status: 'DISPATCHED', hospitalName: 'KEM Mumbai',       lat: 19.027, lng: 72.840 },
  { id: 3, sosCode: 'SOS-122', patientName: 'Ayaan S', bloodGroup: 'A-', unitsRequired: 4, status: 'ACTIVE',     hospitalName: 'Apollo Chennai',  lat: 13.063, lng: 80.257 },
  { id: 4, sosCode: 'SOS-121', patientName: 'Meena R', bloodGroup: 'AB-',unitsRequired: 2, status: 'BROADCAST',  hospitalName: 'PGIMER Chandigarh',lat: 30.765, lng: 76.775 },
  { id: 5, sosCode: 'SOS-120', patientName: 'Suresh P', bloodGroup: 'O-',unitsRequired: 5, status: 'ACTIVE',     hospitalName: 'NIMHANS Bengaluru',lat: 12.941, lng: 77.593 },
];

// Blood bank nodes across India
const BLOOD_BANK_NODES = [
  { lat: 28.65, lng: 77.23, units: 8200 },  // Delhi
  { lat: 19.08, lng: 72.88, units: 12000 }, // Mumbai
  { lat: 13.09, lng: 80.28, units: 7800 },  // Chennai
  { lat: 22.57, lng: 88.36, units: 9200 },  // Kolkata
  { lat: 12.97, lng: 77.59, units: 10500 }, // Bengaluru
  { lat: 17.38, lng: 78.49, units: 6400 },  // Hyderabad
  { lat: 23.02, lng: 72.57, units: 5800 },  // Ahmedabad
  { lat: 26.85, lng: 80.95, units: 4200 },  // Lucknow
  { lat: 21.15, lng: 79.09, units: 3900 },  // Nagpur
  { lat: 22.71, lng: 75.86, units: 3100 },  // Indore
  { lat: 18.52, lng: 73.86, units: 7600 },  // Pune
  { lat: 26.91, lng: 75.79, units: 4600 },  // Jaipur
];

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-primary mb-3 flex items-center gap-1.5">{children}</h3>;
}

function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[11px] font-mono text-muted-foreground">{label}</span>
      <span className={`text-[11px] font-mono font-bold ${highlight ? 'text-primary glow-text' : 'text-foreground'}`}>{typeof value === 'number' ? inFmt(value) : value}</span>
    </div>
  );
}

export default function NationalCommandCenter() {
  const { data: dashboard } = useGetNationalDashboard();
  const now = useNow();
  const [feedIdx, setFeedIdx] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    const t = setInterval(() => setFeedIdx(i => (i + 1) % LIVE_FEED.length), 3000);
    return () => clearInterval(t);
  }, []);

  const stats = dashboard?.stats;

  const totalUnits      = stats?.totalBloodUnits      ?? 245813;
  const activeDonors    = stats?.activeDonors          ?? 23686654;
  const bloodBanks      = stats?.bloodBanks            ?? 2738;
  const hospitals       = stats?.registeredHospitals   ?? 25316;
  const activeEmerg     = stats?.activeEmergencies     ?? 124;
  const totalDonations  = stats?.totalDonations        ?? 18354;
  const livesImpacted   = stats?.livesImpacted         ?? 15732;

  const bgData = dashboard?.inventorySummary?.byBloodGroup?.map((b: { bloodGroup: string; units: number; status: string }, i: number) => ({
    bg: b.bloodGroup,
    units: b.units,
    pct: Math.round(b.units / totalUnits * 100),
    color: BLOOD_GROUPS_MASTER[i]?.color ?? '#009DFF',
    status: b.status,
  })) ?? BLOOD_GROUPS_MASTER;

  if (!isMounted) return null;

  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <AppLayout>
      <div className="flex flex-col gap-3 pb-4 text-[#E8F4FF]">

        {/* ─── TOP HEADER ─── */}
        <div className="glass-panel rounded-xl border border-primary/20 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider glow-text font-mono">RAKT KAVACH</h1>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">National Digital Health Shield — National Operations Dashboard</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-mono text-muted-foreground">{dateStr}</p>
              <p className="text-sm font-mono font-bold text-primary glow-text tabular-nums">{timeStr} IST</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00FFB2]/10 border border-[#00FFB2]/30">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] animate-pulse" />
              <span className="text-[10px] font-mono text-[#00FFB2] font-bold">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </div>

        {/* ─── METRICS BAR ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { label: 'TOTAL BLOOD UNITS (LIVE)',  value: inFmt(totalUnits),     icon: Droplet,    color: '#FF3B3B', sub: 'Units in grid'     },
            { label: 'UNITS COLLECTED TODAY',     value: inFmt(totalDonations), icon: Activity,   color: '#009DFF', sub: 'Fresh collections' },
            { label: 'UNITS ISSUED TODAY',        value: inFmt(livesImpacted),  icon: ArrowUpRight,color:'#00FFB2', sub: 'Dispatched today'  },
            { label: 'ACTIVE DONORS',             value: inFmt(activeDonors),   icon: Users,      color: '#00D4FF', sub: 'Registered donors'  },
            { label: 'BLOOD BANKS',               value: inFmt(bloodBanks),     icon: Building2,  color: '#A855F7', sub: 'Grid nodes'         },
            { label: 'HOSPITALS CONNECTED',       value: inFmt(hospitals),      icon: Hospital,   color: '#009DFF', sub: 'Hospital nodes'     },
            { label: 'STATES / UTs',              value: '36 / 8',              icon: MapPin,     color: '#F59E0B', sub: 'National coverage'  },
          ].map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="glass-panel rounded-xl border border-white/10 p-3 flex flex-col gap-1 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider leading-tight">{m.label}</p>
                  <Icon className="w-3 h-3 flex-shrink-0" style={{ color: m.color }} />
                </div>
                <p className="text-lg font-black font-mono tabular-nums leading-none" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[8px] text-muted-foreground font-mono">{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ─── MAIN 3-COLUMN LAYOUT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-3">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-3">

            {/* Villages & Clinics */}
            <div className="glass-panel rounded-xl border border-primary/20 p-3">
              <PanelTitle><Wifi className="w-3 h-3" /> VILLAGES &amp; CLINICS</PanelTitle>
              <p className="text-[9px] font-mono text-muted-foreground mb-2 uppercase tracking-widest">Remote Connectivity</p>
              <StatRow label="Connected Villages"   value="2,15,234" highlight />
              <StatRow label="Health Sub-Centers"   value="28,456"   />
              <StatRow label="PHCs Connected"       value="12,845"   />
              <StatRow label="Last Sync"            value="11:23:45 AM" />
            </div>

            {/* Donor Profiles */}
            <div className="glass-panel rounded-xl border border-primary/20 p-3">
              <PanelTitle><Users className="w-3 h-3" /> DONOR PROFILES</PanelTitle>
              <p className="text-[9px] font-mono text-muted-foreground mb-2 uppercase tracking-widest">ABHA ID Integration</p>
              <StatRow label="Total Donors"         value={activeDonors}    highlight />
              <StatRow label="ABHA Linked"          value="2,21,05,673"     />
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-[11px] font-mono text-muted-foreground">ABHA Coverage</span>
                <span className="text-[11px] font-mono font-bold text-[#00FFB2]">93.3%</span>
              </div>
              <StatRow label="Voluntary Donors"     value="1,67,34,890"     />
              <StatRow label="Repeat Donors"        value="1,24,78,652"     />
              <Link href="/search" className="mt-3 block text-center text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/30 rounded-lg py-1.5 hover:bg-primary/20 transition-colors">
                SEARCH DONOR
              </Link>
            </div>

            {/* Hospitals & Blood Banks */}
            <div className="glass-panel rounded-xl border border-primary/20 p-3">
              <PanelTitle><Hospital className="w-3 h-3" /> HOSPITALS &amp; BLOOD BANKS</PanelTitle>
              <p className="text-[9px] font-mono text-muted-foreground mb-2 uppercase tracking-widest">Real-Time Stock Feeds</p>
              <StatRow label="Blood Banks"          value={inFmt(bloodBanks)} />
              <StatRow label="Hospital Nodes"       value={inFmt(hospitals)}  highlight />
              <StatRow label="Live Stock Updates"   value="98.7%"     />
              <StatRow label="Avg Response Time"    value="1.8 sec"   />
              <Link href="/inventory" className="mt-3 block text-center text-[10px] font-mono font-bold text-secondary bg-secondary/10 border border-secondary/30 rounded-lg py-1.5 hover:bg-secondary/20 transition-colors">
                VIEW ALL INSTITUTIONS
              </Link>
            </div>

          </div>

          {/* ── CENTER ── */}
          <div className="flex flex-col gap-3">

            {/* Blood Group Inventory + Map */}
            <div className="glass-panel rounded-xl border border-primary/20 overflow-hidden" style={{ minHeight: 340 }}>
              <div className="flex flex-col md:flex-row h-full">

                {/* Inventory table */}
                <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-white/10 p-3 flex flex-col">
                  <PanelTitle><Droplet className="w-3 h-3" /> BLOOD GROUP INVENTORY (LIVE)</PanelTitle>
                  <div className="flex-1 space-y-1">
                    <div className="grid grid-cols-3 text-[9px] font-mono text-muted-foreground uppercase mb-1 px-1">
                      <span></span><span>TYPE</span><span className="text-right">UNITS</span>
                    </div>
                    {bgData.map((b: { bg: string; units: number; color: string; status: string; pct?: number }) => (
                      <div key={b.bg} className={`grid grid-cols-3 items-center py-1 px-1 rounded text-[11px] font-mono ${b.status === 'CRITICAL' ? 'bg-destructive/5' : ''}`}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                        <span className="font-bold" style={{ color: b.color }}>{b.bg}</span>
                        <span className="text-right font-bold text-foreground">{inFmt(b.units)}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 mt-2 pt-2 grid grid-cols-3 text-[11px] font-mono font-bold">
                      <span className="text-muted-foreground col-span-2">TOTAL</span>
                      <span className="text-right text-primary">{inFmt(totalUnits)}</span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="flex-1 relative" style={{ minHeight: 280 }}>
                  <div className="absolute top-2 left-2 z-[400] bg-background/90 backdrop-blur border border-primary/30 px-2 py-1 rounded-lg pointer-events-none">
                    <p className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest">National Operations Dashboard</p>
                    <p className="text-[9px] font-mono text-muted-foreground">36 States  8 UTs</p>
                  </div>
                  <MapContainer center={[22.59, 78.96]} zoom={4} className="w-full h-full" zoomControl={false} style={{ minHeight: 280 }}>
                    <TileLayer url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png" attribution="" />
                    {/* Blood bank nodes — green */}
                    {BLOOD_BANK_NODES.map((n, i) => (
                      <CircleMarker key={`bb-${i}`} center={[n.lat, n.lng]} radius={5} color="#00FFB2" fillColor="#00FFB2" fillOpacity={0.5} weight={1}>
                        <Popup><span className="font-mono text-xs">Blood Bank • {inFmt(n.units)} units</span></Popup>
                      </CircleMarker>
                    ))}
                    {/* SOS emergencies — red pulsing */}
                    {EMERGENCIES_MAP.map(em => (
                      <CircleMarker key={`em-${em.id}`} center={[em.lat, em.lng]} radius={em.status === 'ACTIVE' ? 8 : 5} color="#FF3B3B" fillColor="#FF3B3B" fillOpacity={0.7} weight={2}>
                        <Popup>
                          <div className="font-mono text-xs space-y-0.5">
                            <p className="font-bold text-red-500">{em.sosCode}</p>
                            <p>{em.patientName} • {em.bloodGroup}</p>
                            <p>{em.hospitalName}</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Requests (Live) + Supply/Demand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Requests */}
              <div className="glass-panel rounded-xl border border-primary/20 p-3">
                <PanelTitle><ShieldAlert className="w-3 h-3" /> REQUESTS (LIVE)</PanelTitle>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'TOTAL',     value: '6,753', color: '#009DFF', bg: 'bg-primary/10'    },
                    { label: 'URGENT',    value: '1,234', color: '#FF3B3B', bg: 'bg-destructive/10'},
                    { label: 'PENDING',   value: '2,045', color: '#F59E0B', bg: 'bg-yellow-400/10' },
                    { label: 'FULFILLED', value: '3,474', color: '#00FFB2', bg: 'bg-[#00FFB2]/10'  },
                  ].map(r => (
                    <div key={r.label} className={`${r.bg} rounded-lg p-2.5 border border-white/10`}>
                      <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">{r.label}</p>
                      <p className="text-lg font-black font-mono tabular-nums" style={{ color: r.color }}>{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supply/Demand micro chart */}
              <div className="glass-panel rounded-xl border border-primary/20 p-3">
                <PanelTitle><BarChart2 className="w-3 h-3" /> SUPPLY / DEMAND PULSE</PanelTitle>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={SUPPLY_DEMAND.filter((_, i) => i % 3 === 0)}>
                    <XAxis dataKey="t" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: 'rgba(13,21,40,0.9)', border: '1px solid rgba(0,157,255,0.3)', fontSize: 10, fontFamily: 'JetBrains Mono' }} formatter={(v: number) => inFmt(v)} />
                    <Line type="monotone" dataKey="supply" stroke="#00FFB2" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="demand" stroke="#FF3B3B" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-3 mt-1">
                  <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#00FFB2]" /><span className="text-[9px] font-mono text-muted-foreground">Supply</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-destructive" /><span className="text-[9px] font-mono text-muted-foreground">Demand</span></div>
                </div>
              </div>
            </div>

            {/* Blood Demand Forecast */}
            <div className="glass-panel rounded-xl border border-primary/20 p-3">
              <PanelTitle><BarChart2 className="w-3 h-3" /> BLOOD DEMAND FORECAST (NEXT 7 DAYS)</PanelTitle>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={FORECAST}>
                  <defs>
                    <linearGradient id="fDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#FF3B3B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF3B3B" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="fSupply" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#009DFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#009DFF" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#7EB8D4' }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: 'rgba(13,21,40,0.9)', border: '1px solid rgba(0,157,255,0.3)', fontSize: 10, fontFamily: 'JetBrains Mono' }} formatter={(v: number) => inFmt(v)} />
                  <Area type="monotone" dataKey="demand" stroke="#FF3B3B" fill="url(#fDemand)" strokeWidth={1.5} name="Predicted Demand" />
                  <Area type="monotone" dataKey="supply" stroke="#009DFF" fill="url(#fSupply)" strokeWidth={1.5} name="Available Supply"  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4">
                <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-destructive" /><span className="text-[9px] font-mono text-muted-foreground">Predicted Demand</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-primary" /><span className="text-[9px] font-mono text-muted-foreground">Available Supply</span></div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-3">

            {/* Live Activity Feed */}
            <div className="glass-panel rounded-xl border border-primary/20 p-3">
              <PanelTitle><Activity className="w-3 h-3" /> LIVE ACTIVITY FEED</PanelTitle>
              <div className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {LIVE_FEED.slice(0, 6).map((f, i) => (
                    <motion.div key={`${f.time}-${i}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2">
                      <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">{f.time}</span>
                      <div className={`w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${f.type === 'critical' ? 'bg-destructive animate-pulse' : f.type === 'success' ? 'bg-[#00FFB2]' : 'bg-primary'}`} />
                      <p className={`text-[10px] font-mono leading-tight ${f.type === 'critical' ? 'text-destructive' : f.type === 'success' ? 'text-[#00FFB2]' : 'text-foreground'}`}>{f.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <Link href="/notifications" className="mt-2 block text-center text-[9px] font-mono text-primary hover:underline">VIEW ALL ACTIVITY</Link>
            </div>

            {/* Emergency Response SOS Pipeline */}
            <div className="glass-panel rounded-xl border border-destructive/30 p-3 bg-destructive/5">
              <PanelTitle><ShieldAlert className="w-3 h-3 text-destructive" /> EMERGENCY RESPONSE</PanelTitle>
              <p className="text-[9px] font-mono text-muted-foreground mb-2 uppercase tracking-widest">SOS Pipeline</p>
              {[
                { label: 'Active Alerts', value: activeEmerg, color: '#FF3B3B', pulse: true  },
                { label: 'High Priority', value: 38,          color: '#FF9900', pulse: false },
                { label: 'En Route',      value: 26,          color: '#009DFF', pulse: false },
                { label: 'Resolved (Today)', value: 112,      color: '#00FFB2', pulse: false },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-[11px] font-mono text-muted-foreground">{r.label}</span>
                  <span className={`text-[11px] font-mono font-bold ${r.pulse ? 'animate-pulse' : ''}`} style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
              <Link href="/emergency" className="mt-2 block text-center text-[9px] font-mono font-bold text-destructive bg-destructive/10 border border-destructive/30 rounded py-1 hover:bg-destructive/20 transition-colors">
                VIEW LIVE ALERTS
              </Link>
            </div>

            {/* Inventory Health Status */}
            <div className="glass-panel rounded-xl border border-primary/20 p-3">
              <PanelTitle><CheckCircle className="w-3 h-3" /> INVENTORY HEALTH</PanelTitle>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative flex-shrink-0">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(0,157,255,0.1)" strokeWidth="6" />
                    <circle cx="30" cy="30" r="24" fill="none" stroke="#00FFB2" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${78 * 1.508} ${100 * 1.508}`} transform="rotate(-90 30 30)"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,178,0.6))' }} />
                    <text x="30" y="34" textAnchor="middle" fill="#00FFB2" fontSize="12" fontWeight="900" fontFamily="JetBrains Mono">78%</text>
                  </svg>
                </div>
                <div className="space-y-1 flex-1">
                  {[
                    { l: 'Optimal',   v: '78%', c: '#00FFB2' },
                    { l: 'Moderate',  v: '16%', c: '#F59E0B' },
                    { l: 'Low',       v: '6%',  c: '#FF3B3B' },
                  ].map(r => (
                    <div key={r.l} className="flex justify-between">
                      <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.c }} /><span className="text-[10px] font-mono text-muted-foreground">{r.l}</span></div>
                      <span className="text-[10px] font-mono font-bold" style={{ color: r.c }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top States by Stock */}
            <div className="glass-panel rounded-xl border border-primary/20 p-3">
              <PanelTitle><BarChart2 className="w-3 h-3" /> TOP STATES BY STOCK</PanelTitle>
              <div className="space-y-2">
                {TOP_STATES.map((s, i) => (
                  <div key={s.name}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[10px] font-mono text-foreground">{s.name}</span>
                      <span className="text-[10px] font-mono font-bold text-primary">{inFmt(s.units)}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.bar}%` }} transition={{ delay: i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full bg-primary" style={{ boxShadow: '0 0 4px rgba(0,157,255,0.5)' }} />
                    </div>
                  </div>
                ))}
                <Link href="/analytics" className="block text-center text-[9px] font-mono text-primary hover:underline mt-1">VIEW DETAILED REPORT</Link>
              </div>
            </div>

            {/* Data Flow & Consent */}
            <div className="glass-panel rounded-xl border border-primary/20 p-3">
              <PanelTitle><Lock className="w-3 h-3" /> DATA FLOW &amp; CONSENT</PanelTitle>
              <p className="text-[9px] font-mono text-muted-foreground mb-2">Consent-Based Exchange</p>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="text-[9px] font-mono text-center text-muted-foreground px-2 py-1 bg-white/5 rounded border border-white/10">Data Provider</div>
                <div className="flex-1 h-px border-t border-dashed border-primary/40" />
                <div className="text-[9px] font-mono text-center text-primary px-2 py-1 bg-primary/10 rounded border border-primary/30">Consent Manager</div>
                <div className="flex-1 h-px border-t border-dashed border-primary/40" />
                <div className="text-[9px] font-mono text-center text-muted-foreground px-2 py-1 bg-white/5 rounded border border-white/10">Data Consumer</div>
              </div>
              {[
                { l: 'Explicit Consent', v: 'Active' },
                { l: 'Purpose Bound',   v: 'Active' },
                { l: 'Revocable',       v: 'Active' },
                { l: 'Audit Logged',    v: 'Active' },
              ].map(r => (
                <div key={r.l} className="flex justify-between py-0.5">
                  <div className="flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5 text-[#00FFB2]" /><span className="text-[9px] font-mono text-muted-foreground">{r.l}</span></div>
                  <span className="text-[9px] font-mono text-[#00FFB2]">{r.v}</span>
                </div>
              ))}
            </div>

            {/* APIs & Standards */}
            <div className="glass-panel rounded-xl border border-primary/20 p-3">
              <PanelTitle><Globe className="w-3 h-3" /> APIs &amp; STANDARDS</PanelTitle>
              <StatRow label="FHIR Standard"  value="R4"      highlight />
              <StatRow label="API Gateway"    value="Active"  />
              <StatRow label="Active APIs"    value="128"     />
              <StatRow label="Avg. Latency"   value="120 ms"  />
              <button className="mt-2 w-full text-center text-[9px] font-mono text-primary bg-primary/10 border border-primary/30 rounded py-1 hover:bg-primary/20 transition-colors">
                VIEW API DOCUMENTATION
              </button>
            </div>

          </div>
        </div>

        {/* ─── INTEROPERABILITY & STANDARDS ─── */}
        <div className="glass-panel rounded-xl border border-primary/20 p-4">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-center text-muted-foreground mb-4">INTEROPERABILITY &amp; STANDARDS</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: 'ABHA',       sub: 'Digital Health ID',        color: '#009DFF', icon: '🪪' },
              { name: 'ABDM',       sub: 'Health Data Exchange',      color: '#00D4FF', icon: '🔗' },
              { name: 'FHIR R4',    sub: 'R4 Standard',              color: '#FF3B3B', icon: '🔥' },
              { name: 'e-RaktKosh', sub: 'National Blood Grid',       color: '#A855F7', icon: '🩸' },
              { name: 'NDHM',       sub: 'National Digital Health Mission', color: '#00FFB2', icon: '🏥' },
            ].map(item => (
              <div key={item.name} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/3 hover:border-primary/30 transition-all">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <div className="text-center">
                  <p className="text-xs font-black font-mono" style={{ color: item.color }}>{item.name}</p>
                  <p className="text-[9px] text-muted-foreground font-mono leading-tight mt-0.5">{item.sub}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] animate-pulse" />
                  <span className="text-[8px] font-mono text-[#00FFB2]">ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── COMPLIANCE FOOTER ─── */}
        <div className="glass-panel rounded-xl border border-white/10 px-4 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'ABDM Compliant',      value: 'Yes',     color: '#00FFB2', icon: Shield    },
              { label: 'e-RaktKosh Integrated', value: 'Yes',   color: '#00FFB2', icon: Droplet   },
              { label: 'ISO 27001 Certified', value: 'Yes',     color: '#00FFB2', icon: Shield    },
              { label: 'Data Encrypted',      value: 'AES-256', color: '#009DFF', icon: Lock      },
              { label: 'Audit Trails',        value: 'Enabled', color: '#00FFB2', icon: Database  },
              { label: 'Uptime',              value: '99.98%',  color: '#00FFB2', icon: Activity  },
              { label: 'Role Based Access',   value: 'Enabled', color: '#009DFF', icon: Shield    },
              { label: 'End-to-End Encryption', value: 'Enabled', color: '#00FFB2', icon: Lock   },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 flex-shrink-0" style={{ color: c.color }} />
                  <div>
                    <p className="text-[8px] font-mono text-muted-foreground uppercase leading-tight">{c.label}</p>
                    <p className="text-[9px] font-mono font-bold" style={{ color: c.color }}>{c.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
