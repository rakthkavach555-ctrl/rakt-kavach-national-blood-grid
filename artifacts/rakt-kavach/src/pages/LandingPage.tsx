import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore'; // पाथ सही किया
import { MapContainer, TileLayer } from 'react-leaflet';
import { ShieldAlert, Activity, Droplet, User as UserIcon, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input'; // पाथ सही किया
import { Button } from '../components/ui/button'; // पाथ सही किया
import { useToast } from '../components/ui/use-toast'; // पाथ सही किया

// Roles mapped to demo credentials
const DEMO_USERS = [
  { role: 'NATIONAL_ADMIN', email: 'admin@raktkavach.gov.in', label: 'Command Center', icon: Activity, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/50' },
  { role: 'DONOR', email: 'donor@example.com', label: 'Donor Portal', icon: UserIcon, color: 'text-success', bg: 'bg-success/10', border: 'border-success/50' },
  { role: 'HOSPITAL', email: 'aiims@hospital.com', label: 'Hospital Desk', icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/50' },
];

export default function LandingPage() {
  const { login: setAuth } = useAuthStore();
  const { toast } = useToast();
  
  // टूटे हुए पैकेज म्यूटेशन की जगह लोकल स्टेट लोडर
  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Error', description: 'Please select a role or enter email', variant: 'destructive' });
      return;
    }

    setIsPending(true);

    // आपके प्रोजेक्ट का परफेक्ट डेमो ओवरराइड कनेक्शन
    setTimeout(() => {
      const fakeUser = {
        id: 1, 
        email, 
        name: email.split('@')[0].toUpperCase(), 
        role: DEMO_USERS.find(u => u.email === email)?.role || 'DONOR',
        createdAt: new Date().toISOString()
      };
      setAuth(fakeUser as any, 'fake-token', 'fake-refresh');
      setIsPending(false);
      toast({ title: 'Success', description: 'Connected to national grid safely.' });
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full relative bg-background text-foreground overflow-hidden flex flex-col md:flex-row">
      {/* Background Map - Dark Matter */}
      <div className="absolute inset-0 z-0 opacity-40">
        {isMounted && (
          <MapContainer 
            center={[22.5937, 78.9629]} 
            zoom={5} 
            zoomControl={false}
            scrollWheelZoom={false}
            dragging={false}
            className="w-full h-full"
          >
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
            />
          </MapContainer>
        )}
        <div className="absolute inset-0 bg-background/80 mix-blend-multiply pointer-events-none"></div>
        <div className="cyber-grid"></div>
        <div className="scan-line"></div>
      </div>

      {/* Left Content - Branding */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 border-r border-primary/20 glass-panel md:bg-transparent md:backdrop-filter-none">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center glow-border relative overflow-hidden">
              <Droplet className="w-10 h-10 text-primary z-10" />
              <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-primary glow-text">RAKT KAVACH</h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-mono tracking-widest mt-1">National Digital Blood Grid</p>
            </div>
          </div>
          
          <div className="space-y-6 mt-12 text-lg text-foreground/80">
            <p className="leading-relaxed">
              India's unified healthcare command system. Connecting 1.4 billion citizens, donors, hospitals, and ambulances into a single, life-saving intelligence network.
            </p>
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-success glow-text-success"></span>
                <span>Real-time blood inventory tracking across 10,000+ banks</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary glow-text"></span>
                <span>AI-driven predictive supply & demand logistics</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_10px_#FF3B3B]"></span>
                <span className="text-destructive glow-text-critical">Immediate SOS Emergency Dispatch Protocol</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Right Content - Login */}
      <div className="relative z-10 w-full md:w-[500px] lg:w-[600px] flex items-center justify-center p-8 bg-background/50 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md glass-panel p-8 rounded-2xl glow-border"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-mono">SYSTEM ACCESS</h2>
            <Lock className="w-5 h-5 text-primary opacity-50" />
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Select Access Role</label>
              <div className="grid grid-cols-1 gap-3">
                {DEMO_USERS.map((role) => (
                  <button
                    key={role.email}
                    type="button"
                    onClick={() => setEmail(role.email)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      email === role.email 
                        ? `${role.bg} ${role.border} shadow-[0_0_15px_rgba(0,157,255,0.2)]` 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${role.bg} ${role.border}`}>
                      <role.icon className={`w-5 h-5 ${role.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{role.label}</p>
                      <p className="text-xs font-mono text-muted-foreground">{role.role}</p>
                    </div>
                    <div className={`ml-auto w-3 h-3 rounded-full ${email === role.email ? role.bg + ' ' + role.border : 'bg-transparent'}`}></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-primary/20">
              <Button 
                type="submit" 
                disabled={isPending || !email}
                className="w-full h-12 bg-primary hover:bg-primary/80 text-primary-foreground font-bold tracking-widest uppercase font-mono transition-all duration-300 disabled:opacity-50"
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...</>
                ) : (
                  'Initialize Connection'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground font-mono">
              UNAUTHORIZED ACCESS IS PROHIBITED. <br/>ALL ACTIVITIES ARE LOGGED AND MONITORED.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
