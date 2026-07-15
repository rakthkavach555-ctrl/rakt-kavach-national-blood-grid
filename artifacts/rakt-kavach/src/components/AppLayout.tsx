import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuthStore } from '@/stores/authStore';
import { 
  Activity, Map, Droplet, Search, ShieldAlert, User, Hospital, TestTube, Ambulance, LogOut, Bell, Wallet, Settings, BarChart, ShieldCheck, HeartPulse, Menu, X, Users
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  critical?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon: Icon, label, href, badge, critical, onClick }: SidebarItemProps) {
  const [location] = useLocation();
  const isActive = location === href || (href !== '/dashboard' && location.startsWith(href) && href !== '/search');

  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 border border-transparent ${isActive ? 'bg-primary/10 border-primary/30 text-primary glow-text' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
      <Icon className={`w-5 h-5 ${critical && isActive ? 'animate-pulse text-destructive' : ''}`} />
      <span className="font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded-full ${critical ? 'bg-destructive/20 text-destructive border border-destructive/50' : 'bg-primary/20 text-primary border border-primary/50'}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const getNavItems = () => {
    const commonItems = [
      { icon: Activity, label: 'Dashboard', href: '/dashboard' },
      { icon: Bell, label: 'Notifications', href: '/notifications', badge: 3 },
      { icon: Search, label: 'Global Search', href: '/search' },
      { icon: Droplet, label: 'Inventory', href: '/inventory' },
    ];

    switch (user.role) {
      case 'NATIONAL_ADMIN':
      case 'SUPER_ADMIN':
      case 'STATE_ADMIN':
      case 'DISTRICT_ADMIN':
        return [
          { icon: Map, label: 'Command Center', href: user.role === 'NATIONAL_ADMIN' || user.role === 'SUPER_ADMIN' ? '/national' : (user.role === 'STATE_ADMIN' ? '/state/DL' : '/district/DL-01') },
          ...commonItems,
          { icon: BarChart, label: 'Analytics', href: '/analytics' },
          { icon: ShieldAlert, label: 'Emergencies', href: '/emergency', critical: true, badge: 12 },
          { icon: ShieldCheck, label: 'WHO Readiness', href: '/who-readiness' },
          { icon: Settings, label: 'Admin', href: '/admin' },
        ];
      case 'DONOR':
        return [
          { icon: User, label: 'Donor Portal', href: '/donor' },
          { icon: Droplet, label: 'Book Donation', href: '/donor/donate' },
          { icon: Wallet, label: 'Blood Wallet', href: '/wallet' },
          ...commonItems,
        ];
      case 'PATIENT':
        return [
          { icon: HeartPulse, label: 'Patient Portal', href: '/patient' },
          { icon: Wallet, label: 'Blood Wallet', href: '/wallet' },
          ...commonItems,
        ];
      case 'HOSPITAL':
        return [
          { icon: Hospital, label: 'Hospital Desk', href: '/hospital' },
          { icon: ShieldAlert, label: 'Emergency SOS', href: '/emergency', critical: true },
          ...commonItems,
        ];
      case 'BLOOD_BANK':
        return [
          { icon: Droplet, label: 'Blood Bank', href: '/blood-bank' },
          ...commonItems,
        ];
      case 'LABORATORY':
        return [
          { icon: TestTube, label: 'Lab Dashboard', href: '/laboratory' },
          ...commonItems,
        ];
      case 'AMBULANCE':
        return [
          { icon: Ambulance, label: 'Ambulance Comm', href: '/ambulance' },
          { icon: ShieldAlert, label: 'Emergencies', href: '/emergency', critical: true },
          ...commonItems,
        ];
      case 'VOLUNTEER':
        return [
          { icon: User, label: 'Volunteer Portal', href: '/volunteer' },
          ...commonItems,
        ];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="cyber-grid pointer-events-none fixed inset-0 z-0"></div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 glass-panel border-r border-primary/20 flex flex-col fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex`}>
        {/* Logo area */}
        <div className="p-6 border-b border-primary/20 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:glow-border transition-all">
              <Droplet className="w-6 h-6 text-primary group-hover:animate-pulse" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-wider text-primary glow-text">RAKT KAVACH</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">National Blood Grid</p>
            </div>
          </Link>
          <button className="md:hidden text-muted-foreground hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-none">
          {navItems.map((item, idx) => (
            <SidebarItem key={idx} {...item} onClick={() => setIsSidebarOpen(false)} />
          ))}
        </nav>

        {/* User area */}
        <div className="p-4 border-t border-primary/20">
          <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/30">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{user.role.replace('_', ' ')}</p>
            </div>
            <button 
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden h-[100dvh]">
        {/* Top Header */}
        <header className="h-16 glass-panel border-b border-primary/20 flex items-center justify-between px-4 md:px-6 z-20">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-muted-foreground hover:text-primary" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(0,255,178,0.8)]"></div>
              <span className="text-[10px] md:text-xs font-mono text-success glow-text-success uppercase tracking-wider hidden sm:inline-block">Secure Grid Connected</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-secondary bg-secondary/10 border border-secondary/30 px-3 py-1.5 rounded-full hidden sm:flex">
              <Users className="w-3 h-3" />
              <span>Online: <span className="font-bold glow-text">247</span></span>
            </div>
            
            <Link href="/search" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
              <Search className="w-4 h-4" />
            </Link>

            <span className="text-xs font-mono text-muted-foreground hidden lg:inline-block">ID: {user.id.toString().padStart(6, '0')}</span>
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/30 hidden lg:inline-block">
              {new Date().toISOString().split('T')[0]}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <div className="scan-line"></div>
          {children}
        </div>
      </main>
    </div>
  );
}