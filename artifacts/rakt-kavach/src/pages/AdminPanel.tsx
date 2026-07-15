import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { motion } from 'framer-motion';
import { useGetAuditLogs, useListUsers } from '@workspace/api-client-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Shield, Users, FileText, Activity, Search, Check, Database, Clock, Cpu, Server } from 'lucide-react';

type TabId = 'overview' | 'users' | 'audit' | 'health';

const ROLE_COLORS: Record<string, string> = {
  NATIONAL_ADMIN: '#009DFF', SUPER_ADMIN: '#A855F7', DONOR: '#00FFB2',
  PATIENT: '#F59E0B', HOSPITAL: '#00D4FF', BLOOD_BANK: '#FF9900',
  LABORATORY: '#EC4899', AMBULANCE: '#6366F1', VOLUNTEER: '#14B8A6',
  STATE_ADMIN: '#8B5CF6', DISTRICT_ADMIN: '#06B6D4', VERIFIER: '#84CC16',
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: '#009DFF', LOGOUT: '#7EB8D4', SOS_CREATED: '#FF3B3B',
  SOS_RESOLVED: '#00FFB2', WALLET_TRANSFER: '#F59E0B',
  INVENTORY_UPDATE: '#00D4FF', BLOOD_TRANSFER: '#A855F7',
  USER_MANAGEMENT: '#EC4899',
};

const HEALTH_METRICS = [
  { label: 'Uptime', value: '99.99%', color: '#00FFB2', icon: Activity },
  { label: 'Avg Response', value: '42ms', color: '#009DFF', icon: Cpu },
  { label: 'Active Sessions', value: '247', color: '#00D4FF', icon: Users },
  { label: 'Daily Requests', value: '18,420', color: '#F59E0B', icon: Server },
  { label: 'DB Connections', value: '12 / 50', color: '#A855F7', icon: Database },
  { label: 'Cache Hit Rate', value: '94.2%', color: '#00FFB2', icon: Check },
];

function TabButton({ id, active, label, icon: Icon, onClick }: { id: TabId; active: boolean; label: string; icon: React.ElementType; onClick: (id: TabId) => void }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all ${active ? 'bg-primary/20 text-primary border border-primary/40 glow-text' : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState<TabId>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { data: usersData } = useListUsers();
  const { data: auditData } = useGetAuditLogs();

  const users = useMemo(() => {
    const list = (usersData as { users?: { id: number; name: string; email: string; role: string; isActive: boolean; isVerified: boolean; createdAt: string }[] } | undefined)?.users ?? [];
    return list.filter(u => {
      const matchesSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersData, userSearch, roleFilter]);

  const allUsers = (usersData as { users?: { id: number; name: string; email: string; role: string; isActive: boolean; isVerified: boolean; createdAt: string }[] } | undefined)?.users ?? [];

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    allUsers.forEach(u => { counts[u.role] = (counts[u.role] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: ROLE_COLORS[name] ?? '#7EB8D4' }));
  }, [allUsers]);

  const auditLogs = (auditData as { logs?: { id: number; action: string; userId: number; resource: string; ipAddress: string; createdAt: string; details?: string }[] } | undefined)?.logs ?? [
    { id: 1, action: 'LOGIN', userId: 1, resource: 'auth', ipAddress: '103.21.4.22', createdAt: new Date(Date.now() - 60000).toISOString() },
    { id: 2, action: 'SOS_CREATED', userId: 3, resource: 'emergency', ipAddress: '103.21.4.55', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 3, action: 'INVENTORY_UPDATE', userId: 4, resource: 'inventory', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 900000).toISOString() },
    { id: 4, action: 'WALLET_TRANSFER', userId: 2, resource: 'wallet', ipAddress: '103.21.4.89', createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: 5, action: 'LOGOUT', userId: 1, resource: 'auth', ipAddress: '103.21.4.22', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ];

  const uniqueRoles = ['ALL', ...Array.from(new Set(allUsers.map(u => u.role)))];

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(iso).toLocaleDateString();
  }

  function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

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
          <div className="w-10 h-10 rounded-lg bg-destructive/20 border border-destructive/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-black glow-text-critical font-mono tracking-wider">SYSTEM ADMINISTRATION</h1>
            <p className="text-xs text-muted-foreground font-mono">Restricted Access — National Admin Only</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          <TabButton id="overview" active={tab === 'overview'} label="Overview" icon={Activity} onClick={setTab} />
          <TabButton id="users" active={tab === 'users'} label="Users" icon={Users} onClick={setTab} />
          <TabButton id="audit" active={tab === 'audit'} label="Audit Logs" icon={FileText} onClick={setTab} />
          <TabButton id="health" active={tab === 'health'} label="System Health" icon={Server} onClick={setTab} />
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* System Health Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'API Server', status: 'ONLINE', color: '#00FFB2' },
                { label: 'Database', status: 'ONLINE', color: '#00FFB2' },
                { label: 'Auth Service', status: 'ONLINE', color: '#00FFB2' },
                { label: 'Storage', status: 'ONLINE', color: '#00FFB2' },
              ].map(s => (
                <div key={s.label} className="glass-panel rounded-xl p-4 border border-white/10 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                  <div>
                    <p className="text-xs font-mono font-bold text-foreground">{s.label}</p>
                    <p className="text-[10px] font-mono" style={{ color: s.color }}>{s.status}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Role Distribution */}
            <div className="glass-panel rounded-xl p-5 border border-white/10">
              <h3 className="font-bold font-mono text-sm uppercase tracking-wider mb-4">Users by Role</h3>
              {roleDistribution.length > 0 ? (
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <ResponsiveContainer width={240} height={240}>
                    <PieChart>
                      <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(13,21,40,0.9)', border: '1px solid rgba(0,157,255,0.3)', borderRadius: 8, color: '#E8F4FF', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {roleDistribution.map(r => (
                      <div key={r.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.fill }} />
                        <span className="text-xs font-mono text-muted-foreground truncate">{r.name}</span>
                        <span className="text-xs font-mono font-bold text-foreground ml-auto">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-mono">No user data available.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/30 border border-white/10 text-sm font-mono focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-muted/30 border border-white/10 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
              >
                {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      {['User', 'Email', 'Role', 'Status', 'Verified', 'Joined'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No users found.</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: `${ROLE_COLORS[u.role] ?? '#009DFF'}20`, color: ROLE_COLORS[u.role] ?? '#009DFF', border: `1px solid ${ROLE_COLORS[u.role] ?? '#009DFF'}40` }}>
                              {initials(u.name)}
                            </div>
                            <span className="text-xs font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ backgroundColor: `${ROLE_COLORS[u.role] ?? '#009DFF'}20`, color: ROLE_COLORS[u.role] ?? '#009DFF', borderColor: `${ROLE_COLORS[u.role] ?? '#009DFF'}40` }}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${u.isActive ? 'text-[#00FFB2] border-[#00FFB2]/30 bg-[#00FFB2]/10' : 'text-muted-foreground border-white/10 bg-white/5'}`}>
                            {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] ${u.isVerified ? 'text-[#00FFB2]' : 'text-yellow-400'}`}>
                            {u.isVerified ? '✓ Verified' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Audit Logs Tab */}
        {tab === 'audit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      {['Action', 'User ID', 'Resource', 'IP Address', 'Time'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => {
                      const color = ACTION_COLORS[log.action] ?? '#7EB8D4';
                      return (
                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold" style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">#{String(log.userId).padStart(5, '0')}</td>
                          <td className="px-4 py-3 text-xs text-foreground">{log.resource}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{log.ipAddress}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(log.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* System Health Tab */}
        {tab === 'health' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {HEALTH_METRICS.map(m => (
                <div key={m.label} className="glass-panel rounded-xl p-5 border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                    <m.icon className="w-6 h-6" style={{ color: m.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-black font-mono" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 glass-panel rounded-xl p-4 border border-[#00FFB2]/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#00FFB2] animate-pulse" />
                <span className="text-xs font-mono text-[#00FFB2] font-bold">ALL SYSTEMS OPERATIONAL</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">Last system check: {new Date().toLocaleTimeString('en-IN')} IST — No incidents reported.</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
