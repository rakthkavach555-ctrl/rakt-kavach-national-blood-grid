import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle, Clock, XCircle, Download, Globe, Database, Lock, BarChart2 } from 'lucide-react';

const OVERALL_SCORE = 78.5;

const COMPLIANCE_ITEMS = [
  { label: 'ICD-11 Compatible',    status: 'DONE',     desc: 'International Classification of Diseases v11 codes integrated' },
  { label: 'FHIR R4 Ready',        status: 'DONE',     desc: 'Fast Healthcare Interoperability Resources R4 compliant API' },
  { label: 'ABDM Integrated',      status: 'PROGRESS', desc: 'Ayushman Bharat Digital Mission integration in progress' },
  { label: 'WHO Reporting',        status: 'DONE',     desc: 'WHO Global Blood Safety reporting standards met' },
  { label: 'NDHM Compliant',       status: 'PROGRESS', desc: 'National Digital Health Mission compliance underway' },
  { label: 'HL7 Messaging',        status: 'PLANNED',  desc: 'Health Level 7 messaging protocol — roadmap Q4 2025' },
];

const CHECKLIST: { category: string; icon: React.ElementType; items: { label: string; status: 'done' | 'progress' | 'planned' }[] }[] = [
  {
    category: 'Data Standards',
    icon: Database,
    items: [
      { label: 'ICD-11 Diagnosis Codes', status: 'done' },
      { label: 'SNOMED CT Clinical Terms', status: 'done' },
      { label: 'LOINC Lab Mapping', status: 'done' },
      { label: 'HL7 FHIR R4 Resources', status: 'done' },
      { label: 'Custom National Codes', status: 'done' },
    ],
  },
  {
    category: 'Interoperability',
    icon: Globe,
    items: [
      { label: 'ABDM PHR Integration',  status: 'progress' },
      { label: 'DigiLocker Link',        status: 'progress' },
      { label: 'CoWIN API Bridge',       status: 'planned' },
      { label: 'NHA Gateway APIs',       status: 'progress' },
      { label: 'PMJAY Claims Portal',    status: 'planned' },
    ],
  },
  {
    category: 'Security & Compliance',
    icon: Lock,
    items: [
      { label: 'AES-256 Encryption at Rest',  status: 'done' },
      { label: 'JWT + Refresh Token Auth',     status: 'done' },
      { label: 'Role-Based Access Control',    status: 'done' },
      { label: 'Full Audit Trail Logging',     status: 'done' },
      { label: 'Two-Factor Authentication',    status: 'progress' },
    ],
  },
  {
    category: 'Reporting & Analytics',
    icon: BarChart2,
    items: [
      { label: 'WHO Blood Safety Reports',    status: 'done' },
      { label: 'NACO Quarterly Reports',      status: 'done' },
      { label: 'State-level Dashboards',      status: 'done' },
      { label: 'District-level Reports',      status: 'progress' },
      { label: 'Real-time API Endpoints',     status: 'done' },
    ],
  },
];

const MILESTONES = [
  { date: 'Q1 2024', label: 'Core Platform Launch',         done: true },
  { date: 'Q2 2024', label: 'ICD-11 + FHIR Integration',   done: true },
  { date: 'Q3 2024', label: 'National RBAC + Audit Logs',  done: true },
  { date: 'Q1 2025', label: 'WHO Reporting Standards',      done: true },
  { date: 'Q2 2025', label: 'ABDM PHR Integration',         done: false },
  { date: 'Q3 2025', label: 'DigiLocker + NHA Gateway',    done: false },
  { date: 'Q4 2025', label: 'HL7 Messaging + Full NDHM',   done: false },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    DONE:     { label: 'Compliant',    cls: 'text-[#00FFB2] border-[#00FFB2]/40 bg-[#00FFB2]/10', icon: CheckCircle },
    PROGRESS: { label: 'In Progress', cls: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10', icon: Clock },
    PLANNED:  { label: 'Planned',     cls: 'text-muted-foreground border-white/20 bg-white/5', icon: XCircle },
  }[status] ?? { label: status, cls: 'text-muted-foreground border-white/20', icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function CheckIcon({ status }: { status: 'done' | 'progress' | 'planned' }) {
  if (status === 'done')     return <CheckCircle className="w-4 h-4 text-[#00FFB2]" />;
  if (status === 'progress') return <Clock className="w-4 h-4 text-yellow-400" />;
  return <XCircle className="w-4 h-4 text-muted-foreground/50" />;
}

export default function WhoReadiness() {
  const [activeCategory, setActiveCategory] = useState(0);

  // SVG circular progress
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (OVERALL_SCORE / 100) * circ;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 pb-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00FFB2]/20 border border-[#00FFB2]/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#00FFB2]" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-mono tracking-wider" style={{ textShadow: '0 0 10px rgba(0,255,178,0.5)', color: '#00FFB2' }}>
                WHO READINESS MATRIX
              </h1>
              <p className="text-xs text-muted-foreground font-mono">Global Standards Compliance Dashboard — RAKT KAVACH v2.0</p>
            </div>
          </div>
          <button className="sm:ml-auto flex items-center gap-2 px-4 py-2 rounded-lg glass-panel border border-primary/30 text-primary text-sm font-mono hover:bg-primary/10 transition-colors">
            <Download className="w-4 h-4" />
            Export Readiness Report
          </button>
        </div>

        {/* Score + Compliance Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Circular Score */}
          <div className="glass-panel rounded-xl p-6 border border-[#00FFB2]/20 flex flex-col items-center justify-center">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Overall Readiness Score</p>
            <div className="relative">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(0,255,178,0.1)" strokeWidth="12" />
                <circle
                  cx="90" cy="90" r={r} fill="none"
                  stroke="#00FFB2" strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  transform="rotate(-90 90 90)"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,178,0.6))' }}
                />
                <text x="90" y="85" textAnchor="middle" fill="#00FFB2" fontSize="28" fontWeight="900" fontFamily="JetBrains Mono">{OVERALL_SCORE}%</text>
                <text x="90" y="106" textAnchor="middle" fill="#7EB8D4" fontSize="10" fontFamily="JetBrains Mono">COMPLIANT</text>
              </svg>
            </div>
            <div className="flex gap-4 mt-2">
              {[
                { label: 'Passed', value: 12, color: '#00FFB2' },
                { label: 'In Progress', value: 5, color: '#FBBF24' },
                { label: 'Planned', value: 3, color: '#7EB8D4' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="text-lg font-black font-mono" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMPLIANCE_ITEMS.map(item => (
              <div key={item.label} className={`glass-panel rounded-xl p-4 border transition-all ${item.status === 'DONE' ? 'border-[#00FFB2]/20' : item.status === 'PROGRESS' ? 'border-yellow-400/20' : 'border-white/10'}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-bold font-mono text-foreground leading-tight">{item.label}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
          {/* Category tabs */}
          <div className="flex overflow-x-auto border-b border-white/10">
            {CHECKLIST.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(i)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-medium whitespace-nowrap transition-all border-b-2 ${activeCategory === i ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.category}
                </button>
              );
            })}
          </div>
          <div className="p-4 space-y-2">
            {CHECKLIST[activeCategory]!.items.map(item => (
              <div key={item.label} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${item.status === 'done' ? 'bg-[#00FFB2]/5' : item.status === 'progress' ? 'bg-yellow-400/5' : 'bg-white/2'}`}>
                <CheckIcon status={item.status} />
                <span className={`text-sm font-mono ${item.status === 'done' ? 'text-foreground' : item.status === 'progress' ? 'text-yellow-400/80' : 'text-muted-foreground/60 line-through'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="glass-panel rounded-xl p-6 border border-white/10">
          <h3 className="font-bold font-mono text-sm uppercase tracking-wider mb-5">Compliance Roadmap</h3>
          <div className="relative">
            <div className="absolute left-[86px] top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-4">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-muted-foreground w-[80px] text-right shrink-0">{m.date}</span>
                  <div className={`w-3 h-3 rounded-full border-2 shrink-0 relative z-10 ${m.done ? 'bg-[#00FFB2] border-[#00FFB2]' : 'bg-background border-white/20'}`}
                    style={m.done ? { boxShadow: '0 0 6px rgba(0,255,178,0.6)' } : undefined}
                  />
                  <span className={`text-sm font-mono ${m.done ? 'text-foreground' : 'text-muted-foreground'}`}>{m.label}</span>
                  {m.done && <span className="ml-auto text-[10px] font-mono text-[#00FFB2] border border-[#00FFB2]/30 bg-[#00FFB2]/10 px-2 py-0.5 rounded-full">COMPLETE</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
