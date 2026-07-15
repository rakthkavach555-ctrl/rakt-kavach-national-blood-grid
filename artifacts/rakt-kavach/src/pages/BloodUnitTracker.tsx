import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useGetBloodUnitTimeline, useGetBloodUnit } from '@workspace/api-client-react';
import { useParams } from 'wouter';
import { motion } from 'framer-motion';
import {
  Droplet, CheckCircle2, Circle, ArrowDown, MapPin, Clock,
  Fingerprint, QrCode, FlaskConical, Hospital, User, Calendar,
  ShieldCheck, AlertTriangle,
} from 'lucide-react';

const STAGES = [
  { id: 'DONATED',       label: 'Donated',      desc: 'Blood collected from donor',          icon: User        },
  { id: 'COLLECTED',     label: 'Collected',    desc: 'Unit secured in collection bag',      icon: Droplet     },
  { id: 'TESTING',       label: 'Lab Testing',  desc: 'TTI & infectious disease screening',  icon: FlaskConical},
  { id: 'LAB_VALIDATION',label: 'Validated',    desc: 'Lab-cleared for clinical use',        icon: ShieldCheck },
  { id: 'STORAGE',       label: 'Cold Storage', desc: 'Stored in blood bank at 2–6 °C',     icon: MapPin      },
  { id: 'RESERVED',      label: 'Reserved',     desc: 'Assigned to matched patient',         icon: User        },
  { id: 'DISPATCHED',    label: 'Dispatched',   desc: 'Leaving blood bank facility',         icon: Droplet     },
  { id: 'IN_TRANSIT',    label: 'In Transit',   desc: 'Ambulance / courier transport',       icon: AlertTriangle},
  { id: 'AT_HOSPITAL',   label: 'At Hospital',  desc: 'Received at destination hospital',    icon: Hospital    },
  { id: 'TRANSFUSED',    label: 'Transfused',   desc: '✓ Life saved — unit fulfilled',       icon: CheckCircle2},
];

const BG_COLORS: Record<string, string> = {
  'A+': '#FF3B3B', 'A-': '#FF6B6B', 'B+': '#00FFB2', 'B-': '#00D4A0',
  'AB+': '#009DFF', 'AB-': '#00C3FF', 'O+': '#FF9900', 'O-': '#FFB347',
};

function InfoRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider shrink-0">{label}</span>
      <span className={`text-xs font-bold text-right ${mono ? 'font-mono' : ''} text-foreground`}>{value || '—'}</span>
    </div>
  );
}

// Minimal QR-like SVG placeholder rendered from unit code
function QrDisplay({ code }: { code: string }) {
  // Deterministic dot grid from code chars
  const dots: { x: number; y: number }[] = [];
  for (let i = 0; i < code.length; i++) {
    const ch = code.charCodeAt(i);
    const row = Math.floor(i / 5);
    const col = i % 5;
    if (ch % 2 === 0) dots.push({ x: col * 12 + 6, y: row * 12 + 6 });
  }
  return (
    <div className="glass-panel rounded-xl p-4 border border-primary/30 flex flex-col items-center gap-2">
      <QrCode className="w-5 h-5 text-primary mb-1" />
      <svg width="80" height="80" viewBox="0 0 80 80" className="rounded">
        <rect width="80" height="80" fill="rgba(0,10,20,0.8)" />
        {/* Corner squares */}
        <rect x="4" y="4" width="18" height="18" rx="2" fill="none" stroke="#009DFF" strokeWidth="2" />
        <rect x="7" y="7" width="12" height="12" rx="1" fill="#009DFF" opacity="0.6" />
        <rect x="58" y="4" width="18" height="18" rx="2" fill="none" stroke="#009DFF" strokeWidth="2" />
        <rect x="61" y="7" width="12" height="12" rx="1" fill="#009DFF" opacity="0.6" />
        <rect x="4" y="58" width="18" height="18" rx="2" fill="none" stroke="#009DFF" strokeWidth="2" />
        <rect x="7" y="61" width="12" height="12" rx="1" fill="#009DFF" opacity="0.6" />
        {/* Data dots */}
        {dots.map((d, i) => (
          <rect key={i} x={24 + d.x} y={24 + d.y} width="5" height="5" rx="1" fill="#00D4FF" opacity="0.8" />
        ))}
        <rect x="30" y="30" width="20" height="20" rx="2" fill="rgba(0,157,255,0.15)" stroke="#009DFF" strokeWidth="1" />
        <text x="40" y="44" textAnchor="middle" fill="#009DFF" fontSize="8" fontFamily="monospace">RK</text>
      </svg>
      <p className="text-[9px] font-mono text-muted-foreground text-center break-all max-w-[100px]">{code}</p>
    </div>
  );
}

export default function BloodUnitTracker() {
  const params = useParams();
  const unitId = parseInt(params['id'] ?? '1');

  const { data: unitData, isLoading: loadingUnit } = useGetBloodUnit(unitId);
  const { data: timelineData, isLoading: loadingTimeline } = useGetBloodUnitTimeline(unitId);

  const timeline = (timelineData as { timeline?: { status: string; timestamp?: string; location: string; notes?: string }[] } | undefined)?.timeline ?? [
    { status: 'DONATED',        location: 'Lions Blood Bank, Delhi',          timestamp: '2023-10-25T08:30:00Z' },
    { status: 'COLLECTED',      location: 'Lions Blood Bank, Delhi',          timestamp: '2023-10-25T08:45:00Z' },
    { status: 'TESTING',        location: 'Central Lab — Wing B',             timestamp: '2023-10-25T11:00:00Z' },
    { status: 'LAB_VALIDATION', location: 'Central Lab — Verified',           timestamp: '2023-10-25T15:30:00Z' },
    { status: 'STORAGE',        location: 'Lions Blood Bank — Vault B, Tray 4',timestamp: '2023-10-25T16:00:00Z' },
    { status: 'RESERVED',       location: 'System Auto-Assign — AIIMS Delhi', timestamp: '2023-10-26T09:15:00Z' },
    { status: 'DISPATCHED',     location: 'Lions Blood Bank Dispatch Bay',    timestamp: '2023-10-26T09:30:00Z' },
    { status: 'IN_TRANSIT',     location: 'Ambulance MH-01-1234',             timestamp: '2023-10-26T09:45:00Z' },
  ];

  const unit = unitData as {
    id?: number; unitCode?: string; qrCode?: string; bloodGroup?: string; status?: string;
    donorId?: number; collectionDate?: string; expiryDate?: string;
    currentLocation?: string; bloodBankId?: number; hospitalId?: number;
    labVerificationStatus?: string;
  } | undefined;

  const unitCode           = unit?.unitCode        ?? 'UNIT-B892-X4';
  const bloodGroup         = unit?.bloodGroup      ?? 'O-';
  const qrCode             = unit?.qrCode          ?? unitCode;
  const currentStatus      = timeline[timeline.length - 1]?.status ?? 'IN_TRANSIT';
  const labStatus          = unit?.labVerificationStatus ?? 'VERIFIED';
  const collectionDate     = unit?.collectionDate  ?? '2023-10-25';
  const expiryDate         = unit?.expiryDate      ?? '2023-11-25';
  const currentLocation    = unit?.currentLocation ?? timeline[timeline.length - 1]?.location ?? '—';
  const bgColor            = BG_COLORS[bloodGroup] ?? '#009DFF';
  const currentIndex       = STAGES.findIndex(s => s.id === currentStatus);
  const progressPct        = currentIndex >= 0 ? (currentIndex / (STAGES.length - 1)) * 100 : 0;

  const isLoading = loadingUnit || loadingTimeline;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground font-mono text-sm">Loading unit chain of custody…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto space-y-6 pb-8"
      >
        {/* Header */}
        <div className="glass-panel rounded-2xl border border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl border border-primary/50 bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Blood Unit ID</p>
                <h1 className="text-2xl font-black font-mono tracking-widest glow-text">{unitCode}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-mono text-primary">LIVE TRACKING ACTIVE</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Blood group badge */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-black shadow-lg"
                  style={{ borderColor: bgColor, color: bgColor, backgroundColor: `${bgColor}15`, boxShadow: `0 0 16px ${bgColor}30` }}>
                  {bloodGroup}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">BLOOD TYPE</p>
              </div>
              {/* QR Code */}
              <QrDisplay code={qrCode} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-4">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
              <span>DONATED</span>
              <span className="text-primary">{currentStatus.replace('_', ' ')} ({Math.round(progressPct)}%)</span>
              <span>TRANSFUSED</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(to right, #009DFF, ${bgColor})`, boxShadow: `0 0 8px ${bgColor}60` }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 glass-panel rounded-xl border border-white/10 p-6">
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-primary mb-6">
              CHAIN OF CUSTODY — LIFECYCLE
            </h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-2 bottom-2 w-px bg-white/10">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${progressPct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                  className="w-full bg-primary"
                  style={{ boxShadow: '0 0 4px rgba(0,157,255,0.5)' }}
                />
              </div>
              <div className="space-y-5">
                {STAGES.map((stage, idx) => {
                  const event = timeline.find(t => t.status === stage.id);
                  const isCompleted = idx <= currentIndex;
                  const isCurrent   = idx === currentIndex;
                  const Icon = stage.icon;
                  return (
                    <div
                      key={stage.id}
                      className={`flex gap-5 items-start transition-all duration-300 ${!isCompleted ? 'opacity-30' : 'opacity-100'}`}
                    >
                      {/* Node */}
                      <div className="relative z-10 flex-shrink-0 mt-0.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          isCurrent   ? 'border-primary bg-primary/20 shadow-[0_0_12px_rgba(0,157,255,0.5)]' :
                          isCompleted ? 'border-primary bg-primary' :
                                        'border-white/20 bg-background'
                        }`}>
                          {isCompleted && !isCurrent
                            ? <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                            : isCurrent
                              ? <ArrowDown className="w-5 h-5 text-primary animate-bounce" />
                              : <Circle className="w-4 h-4 text-muted-foreground/30" />
                          }
                        </div>
                      </div>
                      {/* Content */}
                      <div className={`flex-1 pb-4 ${idx < STAGES.length - 1 ? 'border-b border-white/5' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h3 className={`font-bold font-mono text-sm tracking-wide ${isCurrent ? 'text-primary glow-text' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {stage.label}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{stage.desc}</p>
                          </div>
                          {event && (
                            <div className="text-xs font-mono bg-white/5 border border-white/10 rounded-lg p-2.5 shrink-0">
                              <div className="flex items-center gap-1.5 text-primary mb-1">
                                <Clock className="w-3 h-3" />
                                {event.timestamp ? new Date(event.timestamp).toLocaleString('en-IN') : '—'}
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                              {event.notes && (
                                <p className="text-muted-foreground/70 mt-1 text-[10px]">{event.notes}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Unit Details Sidebar */}
          <div className="space-y-4">
            {/* Core unit info */}
            <div className="glass-panel rounded-xl border border-white/10 p-4">
              <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-primary mb-3">Unit Details</h3>
              <InfoRow label="Unit Code"         value={unitCode} />
              <InfoRow label="Blood Group"       value={bloodGroup} />
              <InfoRow label="Collection Date"   value={collectionDate} />
              <InfoRow label="Expiry Date"       value={expiryDate} />
              <InfoRow label="Current Location"  value={currentLocation} />
              <InfoRow label="Lab Verification"  value={labStatus} />
              <InfoRow label="Status"            value={currentStatus.replace(/_/g, ' ')} />
            </div>

            {/* QR Code large display */}
            <div className="glass-panel rounded-xl border border-primary/20 p-4">
              <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-primary mb-3">QR Traceability</h3>
              <div className="flex justify-center">
                <QrDisplay code={qrCode} />
              </div>
              <p className="text-[10px] text-muted-foreground font-mono text-center mt-2">
                Scan to verify authenticity
              </p>
            </div>

            {/* Lifecycle summary */}
            <div className="glass-panel rounded-xl border border-white/10 p-4">
              <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-primary mb-3">Lifecycle Summary</h3>
              <div className="space-y-2">
                {[
                  { label: 'Steps Completed', value: `${Math.max(0, currentIndex + 1)} / ${STAGES.length}` },
                  { label: 'Events Logged',   value: String(timeline.length) },
                  { label: 'Days in System',  value: collectionDate ? `${Math.floor((Date.now() - new Date(collectionDate).getTime()) / 86400000)}d` : '—' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="text-foreground font-bold">{r.value}</span>
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
