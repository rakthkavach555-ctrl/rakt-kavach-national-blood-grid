import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useGetActiveEmergencies, useCreateEmergency } from '@workspace/api-client-react';
import { Activity, ShieldAlert, MapPin, Ambulance, Hospital, Clock, Phone, AlertTriangle, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'wouter';
import { useToast } from '@/components/ui/use-toast';

export default function EmergencySOS() {
  const { data, isLoading } = useGetActiveEmergencies();
  const createEmergency = useCreateEmergency();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    unitsRequired: 1,
    hospitalId: 1, // Demo value
    contactNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmergency.mutate({
      data: formData as any
    }, {
      onSuccess: () => {
        toast({ title: 'SOS Broadcasted', description: 'Emergency grid activated.', variant: 'destructive' });
        setOpen(false);
      }
    });
  };

  const emergencies = data?.emergencies || [
    { id: 1, sosCode: 'SOS-8891', patientName: 'Rahul T', bloodGroup: 'O-', unitsRequired: 3, status: 'ACTIVE', hospitalName: 'AIIMS Trauma Center', contactNumber: '+91 9876543210', createdAt: new Date().toISOString() },
    { id: 2, sosCode: 'SOS-8892', patientName: 'Priya K', bloodGroup: 'AB+', unitsRequired: 5, status: 'DISPATCHED', hospitalName: 'KEM Hospital', ambulanceNumber: 'MH-01-AB-1234', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, sosCode: 'SOS-8893', patientName: 'Unknown (Accident)', bloodGroup: 'O+', unitsRequired: 10, status: 'ACTIVE', hospitalName: 'Apollo Main', contactNumber: 'Police ER', createdAt: new Date(Date.now() - 1800000).toISOString() },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header Action */}
        <div className="glass-panel border-destructive p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden glow-border shadow-[0_0_30px_rgba(255,59,59,0.1)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-full bg-destructive/20 border border-destructive/50 flex items-center justify-center critical-pulse">
              <ShieldAlert className="w-10 h-10 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-destructive glow-text-critical tracking-wider">EMERGENCY SOS GRID</h1>
              <p className="text-muted-foreground font-mono mt-2">National Rapid Response Protocol Activated</p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-16 px-12 bg-destructive hover:bg-destructive/80 text-white font-black text-xl tracking-widest shadow-[0_0_20px_rgba(255,59,59,0.5)] critical-pulse rounded-xl border border-white/20">
                INITIATE SOS
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-panel border-destructive/50 bg-[#050B18]/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-destructive glow-text-critical flex items-center gap-2">
                  <AlertTriangle /> EMERGENCY PROTOCOL
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4 font-mono">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Patient Name</label>
                    <Input className="bg-black/50 border-primary/30" required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Contact Number</label>
                    <Input className="bg-black/50 border-primary/30" required value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Blood Group</label>
                    <Select onValueChange={(val) => setFormData({...formData, bloodGroup: val})}>
                      <SelectTrigger className="bg-black/50 border-primary/30 text-primary font-bold">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0D1528] border-primary/30 text-primary">
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Units Required</label>
                    <Input type="number" min="1" className="bg-black/50 border-primary/30 text-primary font-bold" required value={formData.unitsRequired} onChange={e => setFormData({...formData, unitsRequired: parseInt(e.target.value)})} />
                  </div>
                </div>
                <Button type="submit" disabled={createEmergency.isPending} className="w-full h-14 bg-destructive hover:bg-destructive/80 text-white font-black tracking-widest text-lg mt-4">
                  {createEmergency.isPending ? 'BROADCASTING...' : 'BROADCAST SOS'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active List */}
        <div>
          <h2 className="text-sm font-mono tracking-widest text-primary mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> LIVE EMERGENCY FEED
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencies.map((em) => (
              <div key={em.id} className="glass-panel rounded-xl border border-border p-0 overflow-hidden group hover:border-primary/50 transition-colors">
                <div className={`h-2 w-full ${em.status === 'ACTIVE' ? 'bg-destructive shadow-[0_0_10px_#FF3B3B]' : 'bg-secondary'} transition-all`} />
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-mono text-muted-foreground block mb-1">ID: {em.sosCode}</span>
                      <h3 className="font-bold text-lg">{em.patientName}</h3>
                    </div>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-xl ${em.status === 'ACTIVE' ? 'border-destructive text-destructive glow-text-critical bg-destructive/10' : 'border-secondary text-secondary bg-secondary/10'}`}>
                      {em.bloodGroup}
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-3">
                      <Droplet className="w-4 h-4 text-primary" />
                      <span className="text-foreground">{em.unitsRequired} Units Required</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hospital className="w-4 h-4 text-primary" />
                      <span className="text-foreground truncate">{em.hospitalName}</span>
                    </div>
                    {em.ambulanceNumber ? (
                      <div className="flex items-center gap-3 text-secondary">
                        <Ambulance className="w-4 h-4" />
                        <span>En route: {em.ambulanceNumber}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-destructive">
                        <Clock className="w-4 h-4" />
                        <span className="glow-text-critical">Awaiting Dispatch</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/emergency/${em.id}`} className="block">
                    <Button variant="outline" className="w-full bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-white font-mono tracking-widest uppercase transition-all">
                      TRACK UNIT
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
