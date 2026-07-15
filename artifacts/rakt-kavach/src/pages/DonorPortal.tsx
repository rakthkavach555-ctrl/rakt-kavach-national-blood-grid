import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useGetDonorDashboard } from '@workspace/api-client-react';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Droplet, Heart, Award, Calendar, Activity, MapPin, ShieldCheck,
  QrCode, Star, Trophy, Zap, CheckCircle, Clock, ArrowRight,
  CreditCard, Share2,
} from 'lucide-react';

// RAKTVEER Reward tiers
const REWARD_TIERS = [
  { id: 'BRONZE',         label: 'Bronze Raktveer',        min: 1,   max: 3,   color: '#CD7F32', icon: '🥉', perks: ['Priority appointment booking', 'Digital donor certificate', 'Community badge'] },
  { id: 'SILVER',         label: 'Silver Raktveer',        min: 4,   max: 6,   color: '#C0C0C0', icon: '🥈', perks: ['All Bronze perks', 'Free health checkup', 'ABHA priority linking', '2x blood credits'] },
  { id: 'GOLD',           label: 'Gold Raktveer',          min: 7,   max: 9,   color: '#FFD700', icon: '🥇', perks: ['All Silver perks', 'Annual health insurance', 'VIP camp access', 'Rare blood priority'] },
  { id: 'NATIONAL_HERO',  label: 'National Hero',          min: 10,  max: 999, color: '#FF3B3B', icon: '🏅', perks: ['All Gold perks', 'Ministry recognition', 'Lifetime health card', 'Emergency blood guarantee'] },
];

function getTier(count: number) {
  return REWARD_TIERS.find(t => count >= t.min && count <= t.max) ?? REWARD_TIERS[0]!;
}

function QrCard({ code }: { code: string }) {
  const dots: { x: number; y: number }[] = [];
  for (let i = 0; i < code.length; i++) {
    const ch = code.charCodeAt(i);
    const row = Math.floor(i / 6);
    const col = i % 6;
    if (ch % 2 === 0) dots.push({ x: col * 10 + 5, y: row * 10 + 5 });
  }
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="rounded">
      <rect width="96" height="96" fill="rgba(0,10,20,0.8)" rx="4" />
      {/* Corners */}
      <rect x="4"  y="4"  width="20" height="20" rx="2" fill="none" stroke="#009DFF" strokeWidth="2" />
      <rect x="7"  y="7"  width="14" height="14" rx="1" fill="#009DFF" opacity="0.5" />
      <rect x="72" y="4"  width="20" height="20" rx="2" fill="none" stroke="#009DFF" strokeWidth="2" />
      <rect x="75" y="7"  width="14" height="14" rx="1" fill="#009DFF" opacity="0.5" />
      <rect x="4"  y="72" width="20" height="20" rx="2" fill="none" stroke="#009DFF" strokeWidth="2" />
      <rect x="7"  y="75" width="14" height="14" rx="1" fill="#009DFF" opacity="0.5" />
      {/* Data */}
      {dots.map((d, i) => <rect key={i} x={28 + d.x} y={28 + d.y} width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.8" />)}
      <rect x="36" y="36" width="24" height="24" rx="2" fill="rgba(0,157,255,0.1)" stroke="#009DFF" strokeWidth="1" />
      <text x="48" y="51" textAnchor="middle" fill="#009DFF" fontSize="8" fontFamily="monospace" fontWeight="bold">RK</text>
    </svg>
  );
}

export default function DonorPortal() {
  const { user } = useAuthStore();
  const { data, isLoading } = useGetDonorDashboard(user?.id ?? 0);

  const impactStats = data?.impactStats ?? { livesImpacted: 12, totalUnits: 4, donationStreak: 2, rewardPoints: 1250 };
  const wallet      = data?.wallet;
  const donor = data?.donor ?? {
    name: user?.name ?? 'Arjun Sharma',
    bloodGroup: 'O+',
    abhaId: '12-3456-7890-1234',
    eligibilityStatus: true,
    state: 'Delhi',
    district: 'South Delhi',
    donationCount: 4,
  };
  const recentDonations = data?.recentDonations ?? [
    { id: 1, donatedAt: '2023-08-15T10:00:00Z', bloodBankName: 'Lions Blood Bank',    units: 1, impactMessage: '3 lives saved' },
    { id: 2, donatedAt: '2023-02-10T09:30:00Z', bloodBankName: 'AIIMS Delhi',          units: 1, impactMessage: '3 lives saved' },
    { id: 3, donatedAt: '2022-09-05T11:00:00Z', bloodBankName: 'Red Cross Delhi',      units: 1, impactMessage: '3 lives saved' },
    { id: 4, donatedAt: '2022-03-12T08:45:00Z', bloodBankName: 'Rotary Blood Bank',    units: 1, impactMessage: '3 lives saved' },
  ];
  const eligibility = data?.eligibilityStatus ?? { eligible: true, reason: 'You are eligible to donate', nextEligibleDate: null, daysSinceLastDonation: 120 };

  const donationCount = donor.donationCount ?? recentDonations.length;
  const tier          = getTier(donationCount);
  const nextTier      = REWARD_TIERS[REWARD_TIERS.findIndex(t => t.id === tier.id) + 1];
  const abhaId        = donor.abhaId ?? '12-3456-7890-1234';
  const walletId      = wallet?.qrCode ?? `RK-DWL-${String(donor.name).slice(0,3).toUpperCase()}-${String(user?.id ?? 1).padStart(4,'0')}`;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto space-y-5 pb-8">

        {/* ─── IMPACT HERO ─── */}
        <div className="glass-panel rounded-2xl border border-[#00FFB2]/30 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FFB2]/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Lives saved */}
            <div className="text-center md:text-left">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] mb-1">Direct Impact</p>
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-[#00FFB2] animate-pulse hidden md:block" />
                <span className="text-6xl md:text-7xl font-black text-[#00FFB2] glow-text-success tabular-nums leading-none">{impactStats.livesImpacted}</span>
              </div>
              <p className="text-xl font-light text-foreground mt-1">Lives Saved</p>
            </div>

            <div className="hidden md:block w-px h-20 bg-white/10" />

            {/* Tier badge */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl border-2" style={{ borderColor: tier.color, backgroundColor: `${tier.color}15`, boxShadow: `0 0 20px ${tier.color}30` }}>
                {tier.icon}
              </div>
              <p className="text-sm font-black font-mono" style={{ color: tier.color }}>{tier.label.toUpperCase()}</p>
              {nextTier && (
                <p className="text-[10px] font-mono text-muted-foreground">{nextTier.min - donationCount} donations to {nextTier.label}</p>
              )}
            </div>

            <div className="hidden md:block w-px h-20 bg-white/10" />

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              {[
                { icon: Droplet,   label: 'Units Donated',    value: donationCount,            color: '#009DFF' },
                { icon: Award,     label: 'Reward Points',    value: impactStats.rewardPoints,  color: '#F59E0B' },
                { icon: Activity,  label: 'Donation Streak',  value: impactStats.donationStreak, color: '#00FFB2' },
                { icon: CreditCard,label: 'Blood Credits',    value: wallet?.bloodCredits ?? 3,  color: '#A855F7' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="glass-panel rounded-xl border border-white/10 p-3 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                    <p className="text-xl font-black font-mono tabular-nums" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── THREE-COLUMN GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* ── DIGITAL DONOR CARD (col 1) ── */}
          <div className="space-y-4">
            {/* ABHA Digital Card */}
            <div className="glass-panel rounded-2xl border border-primary/30 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-primary">AB</span>
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">ABHA Digital Donor Card</p>
                  </div>
                  <p className="font-bold text-base">{donor.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">ABHA: {abhaId}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{donor.district}, {donor.state}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-black"
                    style={{ borderColor: '#FF3B3B', color: '#FF3B3B', backgroundColor: 'rgba(255,59,59,0.1)', boxShadow: '0 0 12px rgba(255,59,59,0.2)' }}>
                    {donor.bloodGroup}
                  </div>
                  <p className="text-[8px] font-mono text-muted-foreground">BLOOD TYPE</p>
                </div>
              </div>

              {/* QR */}
              <div className="flex justify-center my-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <QrCard code={walletId} />
              </div>

              {/* Eligibility */}
              <div className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 font-mono text-xs font-bold ${eligibility.eligible ? 'bg-[#00FFB2]/10 border-[#00FFB2]/30 text-[#00FFB2]' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
                {eligibility.eligible ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {eligibility.eligible ? 'ELIGIBLE TO DONATE' : `INELIGIBLE — ${90 - (eligibility.daysSinceLastDonation ?? 0)}d remaining`}
              </div>

              {/* Share / Book */}
              <div className="flex gap-2 mt-3">
                <Link href="/donor/donate" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-mono font-bold hover:bg-primary/30 transition-colors">
                  <Calendar className="w-3.5 h-3.5" /> Book Donation
                </Link>
                <button className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Wallet summary */}
            <div className="glass-panel rounded-xl border border-[#A855F7]/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A855F7]">Blood Wallet</p>
                <Link href="/wallet" className="text-[9px] font-mono text-primary hover:underline flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Blood',    value: wallet?.bloodCredits     ?? 3, color: '#FF3B3B' },
                  { label: 'Donation', value: wallet?.donationCredits  ?? 1250, color: '#009DFF' },
                  { label: 'Emergency',value: wallet?.emergencyCredits ?? 1, color: '#00FFB2' },
                ].map(w => (
                  <div key={w.label} className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                    <p className="text-base font-black font-mono" style={{ color: w.color }}>{w.value}</p>
                    <p className="text-[8px] font-mono text-muted-foreground">{w.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RAKTVEER REWARDS (col 2) ── */}
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl border border-primary/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-[#FFD700]" />
                <div>
                  <h3 className="font-bold font-mono text-sm tracking-wider">RAKTVEER REWARDS</h3>
                  <p className="text-[9px] font-mono text-muted-foreground">Recognizing India's life-savers</p>
                </div>
              </div>

              {/* Progress to next tier */}
              {nextTier && (
                <div className="mb-4 p-3 rounded-xl border border-white/10 bg-white/3">
                  <div className="flex justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-muted-foreground">Progress to {nextTier.label}</span>
                    <span className="font-bold" style={{ color: nextTier.color }}>{donationCount} / {nextTier.min}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (donationCount / nextTier.min) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: nextTier.color, boxShadow: `0 0 6px ${nextTier.color}60` }}
                    />
                  </div>
                </div>
              )}

              {/* Tier cards */}
              <div className="space-y-2">
                {REWARD_TIERS.map((t, i) => {
                  const isActive  = t.id === tier.id;
                  const isPassed  = REWARD_TIERS.indexOf(tier) > i;
                  return (
                    <div key={t.id} className={`rounded-xl border p-3 transition-all ${isActive ? 'border-opacity-60' : isPassed ? 'opacity-50 border-white/10' : 'border-white/10 opacity-40'}`}
                      style={isActive ? { borderColor: t.color, backgroundColor: `${t.color}08`, boxShadow: `0 0 12px ${t.color}20` } : {}}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{t.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold font-mono" style={{ color: isActive || isPassed ? t.color : undefined }}>{t.label}</p>
                            {isActive && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full border font-bold" style={{ color: t.color, borderColor: t.color, backgroundColor: `${t.color}15` }}>YOUR RANK</span>}
                            {isPassed && <CheckCircle className="w-3 h-3 text-[#00FFB2]" />}
                          </div>
                          <p className="text-[9px] font-mono text-muted-foreground">{t.min}–{t.max === 999 ? '∞' : t.max} donations</p>
                        </div>
                      </div>
                      {isActive && (
                        <div className="mt-2 space-y-0.5">
                          {t.perks.map(p => (
                            <div key={p} className="flex items-center gap-1.5">
                              <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" style={{ color: t.color }} />
                              <span className="text-[9px] font-mono text-muted-foreground">{p}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── DONATION HISTORY + UPCOMING (col 3) ── */}
          <div className="space-y-4">
            {/* Donation history */}
            <div className="glass-panel rounded-2xl border border-white/10 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono font-bold text-sm tracking-wider uppercase text-primary">Donation History</h3>
                <span className="text-[10px] font-mono text-muted-foreground">{donationCount} total</span>
              </div>
              <div className="space-y-3">
                {recentDonations.slice(0, 4).map((don, i) => (
                  <div key={don.id} className="flex gap-3 items-start group">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <Droplet className="w-3.5 h-3.5 text-primary" />
                      </div>
                      {i < recentDonations.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1 h-3" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-foreground leading-tight">{don.bloodBankName}</p>
                        <span className="text-[10px] font-mono text-[#00FFB2] font-bold ml-2">+{don.units} unit</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(don.donatedAt).toLocaleDateString('en-IN')}</div>
                        <div className="flex items-center gap-1 text-[#00FFB2]"><Heart className="w-3 h-3" />{don.impactMessage}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/donor/donate" className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground text-xs font-mono hover:border-primary/30 hover:text-primary transition-colors">
                <Calendar className="w-3.5 h-3.5" /> Book Next Donation <ArrowRight className="w-3 h-3 ml-auto" />
              </Link>
            </div>

            {/* Health tips */}
            <div className="glass-panel rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider">Donor Health Tips</h3>
              </div>
              <div className="space-y-2">
                {[
                  'Stay hydrated — drink 2–3 glasses of water before donation',
                  'Eat a nutritious iron-rich meal 2 hours before',
                  'Avoid strenuous exercise 24h post-donation',
                  'Rest for 10 minutes after donating',
                  'Maintain 90-day gap between whole blood donations',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[8px] font-bold text-[#F59E0B]">{i + 1}</span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming camp */}
            <div className="glass-panel rounded-xl border border-[#00FFB2]/20 p-4 bg-[#00FFB2]/5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#00FFB2]" />
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#00FFB2]">Upcoming Camp</h3>
              </div>
              <p className="text-sm font-bold">National Blood Donation Camp</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">City Hospital Grounds, {donor.district ?? 'Delhi'}</p>
              <p className="text-[10px] font-mono text-primary mt-0.5">
                {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <Link href="/donor/donate" className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-[#00FFB2]/20 border border-[#00FFB2]/30 text-[#00FFB2] text-xs font-mono font-bold hover:bg-[#00FFB2]/30 transition-colors">
                BOOK SLOT <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
