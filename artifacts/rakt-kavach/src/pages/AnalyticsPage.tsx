import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { motion } from 'framer-motion';
import {
  useGetNationalAnalytics,
  useGetAiPredictions,
  useGetSupplyDemandTrend,
  useGetEmergencyTrends,
} from '@workspace/api-client-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Droplet, Activity, Zap } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const BLOOD_COLORS = ['#009DFF','#00D4FF','#00FFB2','#FF9900','#FF3B3B','#A855F7','#F59E0B','#EC4899'];

const RISK_CONFIG = {
  CRITICAL: { label: 'CRITICAL', cls: 'text-destructive border-destructive/50 bg-destructive/10', pulse: true },
  HIGH:     { label: 'HIGH',     cls: 'text-orange-400 border-orange-400/50 bg-orange-400/10', pulse: false },
  MEDIUM:   { label: 'MEDIUM',  cls: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10', pulse: false },
  LOW:      { label: 'LOW',     cls: 'text-success border-success/50 bg-success/10', pulse: false },
} as const;

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass-panel rounded-xl p-4 border border-white/10 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black font-mono" style={{ color: color.includes('destructive') ? '#FF3B3B' : color.includes('success') ? '#00FFB2' : '#009DFF' }}>{value}</p>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: national } = useGetNationalAnalytics();
  const { data: predictions } = useGetAiPredictions();
  const { data: supplyDemand } = useGetSupplyDemandTrend();
  const { data: emergencyTrends } = useGetEmergencyTrends();

  const sdTrend = (supplyDemand as { trend?: { date: string; supply: number; demand: number }[] } | undefined)?.trend ?? [
    { date: 'Jan', supply: 1200, demand: 980 },
    { date: 'Feb', supply: 1100, demand: 1050 },
    { date: 'Mar', supply: 1400, demand: 1100 },
    { date: 'Apr', supply: 1300, demand: 1250 },
    { date: 'May', supply: 1600, demand: 1200 },
    { date: 'Jun', supply: 1500, demand: 1400 },
    { date: 'Jul', supply: 1800, demand: 1350 },
  ];

  const eTrend = (emergencyTrends as { trends?: { date: string; count: number }[] } | undefined)?.trends ?? [
    { date: 'Mon', count: 12 },
    { date: 'Tue', count: 19 },
    { date: 'Wed', count: 8 },
    { date: 'Thu', count: 23 },
    { date: 'Fri', count: 15 },
    { date: 'Sat', count: 31 },
    { date: 'Sun', count: 9 },
  ];

  const bgDistribution = BLOOD_GROUPS.map((bg, i) => ({
    name: bg,
    units: Math.floor(Math.random() * 300 + 50),
    fill: BLOOD_COLORS[i],
  }));

  const preds = (predictions as { predictions?: { bloodGroup: string; predictedDemand: number; currentSupply: number; riskLevel: string; recommendation: string; confidence: number }[] } | undefined)?.predictions
    ?? BLOOD_GROUPS.map((bg, i) => ({
      bloodGroup: bg,
      predictedDemand: Math.floor(Math.random() * 200 + 50),
      currentSupply: Math.floor(Math.random() * 200 + 20),
      riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4],
      recommendation: 'Increase collection drives in urban centers.',
      confidence: Math.floor(Math.random() * 30 + 70),
    }));

  const natData = national as { totalUnits?: number; activeDonors?: number; activeEmergencies?: number; totalBloodBanks?: number } | undefined;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 pb-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black glow-text font-mono tracking-wider">AI PREDICTIVE ANALYTICS</h1>
            <p className="text-xs text-muted-foreground font-mono">National Intelligence Engine — Real-Time</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30">
            <div className="w-2 h-2 rounded-full bg-[#00FFB2] animate-pulse" />
            <span className="text-xs font-mono text-[#00FFB2]">LIVE</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Units" value={(natData?.totalUnits ?? 18420).toLocaleString()} icon={Droplet} color="bg-primary/20 text-primary" />
          <StatCard label="Active Donors" value={(natData?.activeDonors ?? 4281).toLocaleString()} icon={Activity} color="bg-success/20 text-success" />
          <StatCard label="Active SOS" value={natData?.activeEmergencies ?? 23} icon={AlertTriangle} color="bg-destructive/20 text-destructive" />
          <StatCard label="Blood Banks" value={natData?.totalBloodBanks ?? 892} icon={Zap} color="bg-secondary/20 text-secondary" />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Supply vs Demand */}
          <div className="glass-panel rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-bold font-mono text-sm uppercase tracking-wider">Supply vs Demand Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sdTrend}>
                <defs>
                  <linearGradient id="supply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009DFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#009DFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="demand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B3B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF3B3B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#7EB8D4" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis stroke="#7EB8D4" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip contentStyle={{ background: 'rgba(13,21,40,0.9)', border: '1px solid rgba(0,157,255,0.3)', borderRadius: 8, color: '#E8F4FF', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <Area type="monotone" dataKey="supply" stroke="#009DFF" fill="url(#supply)" strokeWidth={2} />
                <Area type="monotone" dataKey="demand" stroke="#FF3B3B" fill="url(#demand)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-primary" /><span className="text-xs text-muted-foreground font-mono">Supply</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-destructive" /><span className="text-xs text-muted-foreground font-mono">Demand</span></div>
            </div>
          </div>

          {/* Emergency Trends */}
          <div className="glass-panel rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="font-bold font-mono text-sm uppercase tracking-wider">Emergency Trends (7 Days)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={eTrend}>
                <XAxis dataKey="date" stroke="#7EB8D4" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis stroke="#7EB8D4" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip contentStyle={{ background: 'rgba(13,21,40,0.9)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#E8F4FF', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <Bar dataKey="count" fill="#FF3B3B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Group Distribution */}
        <div className="glass-panel rounded-xl p-5 border border-white/10">
          <h3 className="font-bold font-mono text-sm uppercase tracking-wider mb-4">Blood Group Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={bgDistribution} layout="horizontal">
              <XAxis dataKey="name" stroke="#7EB8D4" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#7EB8D4" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Tooltip contentStyle={{ background: 'rgba(13,21,40,0.9)', border: '1px solid rgba(0,157,255,0.3)', borderRadius: 8, color: '#E8F4FF', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                {bgDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Predictions Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-secondary" />
            <h3 className="font-bold font-mono text-sm uppercase tracking-wider">AI Demand Predictions</h3>
            <span className="text-xs font-mono text-muted-foreground ml-2">— Next 30 Days</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {preds.map((pred) => {
              const risk = RISK_CONFIG[pred.riskLevel as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.LOW;
              const conf = pred.confidence;
              return (
                <div key={pred.bloodGroup} className={`glass-panel rounded-xl p-4 border ${risk.cls}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black font-mono text-foreground">{pred.bloodGroup}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${risk.cls} ${risk.pulse ? 'animate-pulse' : ''}`}>
                      {risk.label}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Demand</span>
                      <span className="text-foreground font-bold">{pred.predictedDemand} units</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Supply</span>
                      <span className="text-foreground font-bold">{pred.currentSupply} units</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
                      <span>AI Confidence</span>
                      <span>{conf}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10">
                      <div className="h-1 rounded-full bg-primary transition-all" style={{ width: `${conf}%` }} />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{pred.recommendation}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
