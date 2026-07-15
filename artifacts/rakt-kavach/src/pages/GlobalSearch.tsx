import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  useListDonors,
  useListHospitals,
  useListBloodBanks,
  useListBloodUnits,
  useListEmergencies,
  useListAmbulances,
  useListLaboratories,
} from '@workspace/api-client-react';
import {
  Search, User, Hospital, Droplet, QrCode,
  ShieldAlert, Ambulance, TestTube, X, ArrowRight, Zap,
} from 'lucide-react';

type FilterType = 'all' | 'donors' | 'hospitals' | 'blood_banks' | 'blood_units' | 'emergencies' | 'ambulances' | 'laboratories';

const FILTER_TABS: { id: FilterType; label: string; icon: React.ElementType }[] = [
  { id: 'all',          label: 'All',         icon: Search     },
  { id: 'donors',       label: 'Donors',      icon: User       },
  { id: 'hospitals',    label: 'Hospitals',   icon: Hospital   },
  { id: 'blood_banks',  label: 'Blood Banks', icon: Droplet    },
  { id: 'blood_units',  label: 'Blood Units', icon: QrCode     },
  { id: 'emergencies',  label: 'SOS',         icon: ShieldAlert},
  { id: 'ambulances',   label: 'Ambulances',  icon: Ambulance  },
  { id: 'laboratories', label: 'Labs',        icon: TestTube   },
];

const BG_COLORS: Record<string, string> = {
  'A+': '#FF3B3B', 'A-': '#FF6B6B', 'B+': '#00FFB2', 'B-': '#00D4A0',
  'AB+': '#009DFF', 'AB-': '#00C3FF', 'O+': '#FF9900', 'O-': '#FFB347',
};

function BloodBadge({ group }: { group: string }) {
  const color = BG_COLORS[group] ?? '#009DFF';
  return (
    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
      style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}>
      {group}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive   = status === 'ACTIVE' || status === 'AVAILABLE' || status === 'DONATED';
  const isCritical = status === 'ACTIVE' || status === 'CRITICAL';
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
      isCritical ? 'text-destructive border-destructive/40 bg-destructive/10 animate-pulse' :
      isActive   ? 'text-[#00FFB2] border-[#00FFB2]/40 bg-[#00FFB2]/10' :
                   'text-muted-foreground border-white/20 bg-white/5'
    }`}>
      {status}
    </span>
  );
}

interface ResultCardProps { href: string; icon: React.ElementType; iconColor: string; children: React.ReactNode }
function ResultCard({ href, icon: Icon, iconColor, children }: ResultCardProps) {
  const [, navigate] = useLocation();
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(href)}
      className="w-full text-left glass-panel rounded-xl p-4 border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
      </div>
    </motion.button>
  );
}

function SectionHeader({ icon: Icon, label, count, color }: { icon: React.ElementType; label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-2">
      <Icon className="w-4 h-4" style={{ color }} />
      <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border ml-1"
        style={{ backgroundColor: `${color}15`, color, borderColor: `${color}30` }}>
        {count}
      </span>
    </div>
  );
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount and "/" shortcut
  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && e.target === document.body) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setQuery('');
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const { data: donorsData,       isLoading: l1 } = useListDonors();
  const { data: hospitalsData,    isLoading: l2 } = useListHospitals();
  const { data: bloodBanksData,   isLoading: l3 } = useListBloodBanks();
  const { data: bloodUnitsData,   isLoading: l4 } = useListBloodUnits();
  const { data: emergenciesData,  isLoading: l5 } = useListEmergencies();
  const { data: ambulancesData,   isLoading: l6 } = useListAmbulances();
  const { data: labsData,         isLoading: l7 } = useListLaboratories();

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6 || l7;
  const q = query.toLowerCase().trim();

  type Donor = { id: number; name?: string; bloodGroup: string; donationCount: number; state?: string; district?: string; eligibilityStatus?: boolean };
  type Hospital = { id: number; name: string; type?: string; totalBeds?: number; state?: string; district?: string };
  type BloodBank = { id: number; name: string; licenseNumber?: string; state?: string; district?: string; is24x7?: boolean };
  type BloodUnit = { id: number; unitCode: string; bloodGroup: string; status: string; currentLocation?: string; expiryDate?: string; qrCode?: string };
  type Emergency = { id: number; sosCode?: string; patientName?: string; bloodGroup: string; status: string; unitsRequired?: number };
  type Ambulance = { id: number; vehicleNumber: string; type?: string; status: string; driverName?: string; state?: string; district?: string };
  type Lab = { id: number; name: string; licenseNumber?: string; state?: string; district?: string };

  const donors      = useMemo(() => ((donorsData as { donors?: Donor[] } | undefined)?.donors ?? []) as Donor[], [donorsData]);
  const hospitals   = useMemo(() => ((hospitalsData as { hospitals?: Hospital[] } | undefined)?.hospitals ?? []) as Hospital[], [hospitalsData]);
  const bloodBanks  = useMemo(() => ((bloodBanksData as { bloodBanks?: BloodBank[] } | undefined)?.bloodBanks ?? []) as BloodBank[], [bloodBanksData]);
  const bloodUnits  = useMemo(() => ((bloodUnitsData as { bloodUnits?: BloodUnit[] } | undefined)?.bloodUnits ?? []) as BloodUnit[], [bloodUnitsData]);
  const emergencies = useMemo(() => ((emergenciesData as { emergencies?: Emergency[] } | undefined)?.emergencies ?? []) as Emergency[], [emergenciesData]);
  const ambulances  = useMemo(() => ((ambulancesData as { ambulances?: Ambulance[] } | undefined)?.ambulances ?? []) as Ambulance[], [ambulancesData]);
  const labs        = useMemo(() => ((labsData as { laboratories?: Lab[] } | undefined)?.laboratories ?? []) as Lab[], [labsData]);

  const filtered = useMemo(() => {
    if (!q) return { donors: [], hospitals: [], bloodBanks: [], bloodUnits: [], emergencies: [], ambulances: [], labs: [] };
    const f = <T extends Record<string, unknown>>(arr: T[], fields: (keyof T)[]) =>
      arr.filter(item => fields.some(f => String(item[f] ?? '').toLowerCase().includes(q)));
    return {
      donors:      f(donors,      ['name', 'bloodGroup', 'state', 'district']),
      hospitals:   f(hospitals,   ['name', 'type', 'state', 'district']),
      bloodBanks:  f(bloodBanks,  ['name', 'licenseNumber', 'state', 'district']),
      bloodUnits:  f(bloodUnits,  ['unitCode', 'bloodGroup', 'status', 'currentLocation', 'qrCode']),
      emergencies: f(emergencies, ['sosCode', 'patientName', 'bloodGroup', 'status']),
      ambulances:  f(ambulances,  ['vehicleNumber', 'driverName', 'state', 'district', 'status']),
      labs:        f(labs,        ['name', 'licenseNumber', 'state', 'district']),
    };
  }, [q, donors, hospitals, bloodBanks, bloodUnits, emergencies, ambulances, labs]);

  const show = (type: FilterType) => filter === 'all' || filter === type;
  const totalResults = Object.values(filtered).reduce((s, a) => s + a.length, 0);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto pb-8">
        {/* Big search input */}
        <div className="relative mb-6">
          <div className="glass-panel rounded-2xl border border-primary/30 glow-border overflow-hidden">
            <div className="flex items-center px-5 gap-4">
              <Search className="w-6 h-6 text-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search donors, hospitals, blood units, emergencies..."
                className="flex-1 h-16 text-xl font-mono bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded border border-white/20 text-[10px] font-mono text-muted-foreground">
                <span>/</span>
              </kbd>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTER_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                  filter === tab.id
                    ? 'bg-primary/20 text-primary border-primary/40 glow-text'
                    : 'text-muted-foreground border-white/10 hover:border-white/20 hover:text-foreground'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* States */}
        {!query && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-muted-foreground font-mono text-sm">Search across all national grid entities</p>
            <p className="text-muted-foreground/50 font-mono text-xs mt-2">Press <kbd className="px-1.5 py-0.5 rounded border border-white/20 text-[10px]">/</kbd> to focus • <kbd className="px-1.5 py-0.5 rounded border border-white/20 text-[10px]">Esc</kbd> to clear</p>
          </div>
        )}

        {query && isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground font-mono text-sm">Searching grid...</p>
          </div>
        )}

        {query && !isLoading && totalResults === 0 && (
          <div className="text-center py-16 glass-panel rounded-xl border border-white/10">
            <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-mono">No results for <span className="text-foreground font-bold">"{query}"</span></p>
            <p className="text-muted-foreground/50 font-mono text-xs mt-1">Try different keywords or check the spelling</p>
          </div>
        )}

        {query && !isLoading && totalResults > 0 && (
          <AnimatePresence mode="wait">
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-4">
                Found <span className="text-primary font-bold">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} for <span className="text-foreground font-bold">"{query}"</span>
              </p>

              {/* Donors */}
              {show('donors') && filtered.donors.length > 0 && (
                <>
                  <SectionHeader icon={User} label="Donors" count={filtered.donors.length} color="#009DFF" />
                  {filtered.donors.map(d => (
                    <ResultCard key={d.id} href={`/donor`} icon={User} iconColor="bg-primary/20 text-primary border-primary/30">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-mono">{d.name ?? `Donor #${d.id}`}</span>
                        <BloodBadge group={d.bloodGroup} />
                        <StatusBadge status={d.eligibilityStatus ? 'ELIGIBLE' : 'INACTIVE'} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{d.donationCount} donations • {d.district ?? '—'}, {d.state ?? '—'}</p>
                    </ResultCard>
                  ))}
                </>
              )}

              {/* Hospitals */}
              {show('hospitals') && filtered.hospitals.length > 0 && (
                <>
                  <SectionHeader icon={Hospital} label="Hospitals" count={filtered.hospitals.length} color="#00D4FF" />
                  {filtered.hospitals.map(h => (
                    <ResultCard key={h.id} href={`/hospital`} icon={Hospital} iconColor="bg-secondary/20 text-secondary border-secondary/30">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-mono">{h.name}</span>
                        {h.type && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border text-secondary border-secondary/30 bg-secondary/10">{h.type}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{h.totalBeds ?? '—'} beds • {h.district ?? '—'}, {h.state ?? '—'}</p>
                    </ResultCard>
                  ))}
                </>
              )}

              {/* Blood Banks */}
              {show('blood_banks') && filtered.bloodBanks.length > 0 && (
                <>
                  <SectionHeader icon={Droplet} label="Blood Banks" count={filtered.bloodBanks.length} color="#FF9900" />
                  {filtered.bloodBanks.map(b => (
                    <ResultCard key={b.id} href={`/blood-bank`} icon={Droplet} iconColor="bg-orange-400/20 text-orange-400 border-orange-400/30">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-mono">{b.name}</span>
                        {b.is24x7 && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border text-[#00FFB2] border-[#00FFB2]/30 bg-[#00FFB2]/10">24×7</span>}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">License: {b.licenseNumber ?? '—'} • {b.district ?? '—'}, {b.state ?? '—'}</p>
                    </ResultCard>
                  ))}
                </>
              )}

              {/* Blood Units */}
              {show('blood_units') && filtered.bloodUnits.length > 0 && (
                <>
                  <SectionHeader icon={QrCode} label="Blood Units" count={filtered.bloodUnits.length} color="#A855F7" />
                  {filtered.bloodUnits.map(u => (
                    <ResultCard key={u.id} href={`/blood-units/${u.id}`} icon={QrCode} iconColor="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-mono">{u.unitCode}</span>
                        <BloodBadge group={u.bloodGroup} />
                        <StatusBadge status={u.status} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">Location: {u.currentLocation ?? '—'} • Expires: {u.expiryDate ?? '—'}</p>
                    </ResultCard>
                  ))}
                </>
              )}

              {/* Emergencies */}
              {show('emergencies') && filtered.emergencies.length > 0 && (
                <>
                  <SectionHeader icon={ShieldAlert} label="SOS Emergencies" count={filtered.emergencies.length} color="#FF3B3B" />
                  {filtered.emergencies.map(e => (
                    <ResultCard key={e.id} href={`/emergency/${e.id}`} icon={ShieldAlert} iconColor="bg-destructive/20 text-destructive border-destructive/30">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-mono">{e.sosCode ?? `SOS-${e.id}`}</span>
                        <BloodBadge group={e.bloodGroup} />
                        <StatusBadge status={e.status} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{e.patientName ?? 'Unknown Patient'} • {e.unitsRequired ?? '?'} units required</p>
                    </ResultCard>
                  ))}
                </>
              )}

              {/* Ambulances */}
              {show('ambulances') && filtered.ambulances.length > 0 && (
                <>
                  <SectionHeader icon={Ambulance} label="Ambulances" count={filtered.ambulances.length} color="#6366F1" />
                  {filtered.ambulances.map(a => (
                    <ResultCard key={a.id} href={`/ambulance`} icon={Ambulance} iconColor="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-mono">{a.vehicleNumber}</span>
                        {a.type && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border text-muted-foreground border-white/20">{a.type}</span>}
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">Driver: {a.driverName ?? '—'} • {a.district ?? '—'}, {a.state ?? '—'}</p>
                    </ResultCard>
                  ))}
                </>
              )}

              {/* Labs */}
              {show('laboratories') && filtered.labs.length > 0 && (
                <>
                  <SectionHeader icon={TestTube} label="Laboratories" count={filtered.labs.length} color="#EC4899" />
                  {filtered.labs.map(l => (
                    <ResultCard key={l.id} href={`/laboratory`} icon={TestTube} iconColor="bg-pink-500/20 text-pink-400 border-pink-500/30">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-mono">{l.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">License: {l.licenseNumber ?? '—'} • {l.district ?? '—'}, {l.state ?? '—'}</p>
                    </ResultCard>
                  ))}
                </>
              )}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </AppLayout>
  );
}
