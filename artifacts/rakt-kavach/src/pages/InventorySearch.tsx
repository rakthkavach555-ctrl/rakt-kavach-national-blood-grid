import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useSearchInventory } from '@workspace/api-client-react';
import { Search, MapPin, Navigation, Droplet, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function InventorySearch() {
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [location, setLocation] = useState<string>('');
  
  // Fake search param to trigger mock data visualization
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const mockResults = [
    { bloodBankName: 'Lions Central Blood Bank', units: 45, distance: 2.4, district: 'South Delhi', contactNumber: '011-23456789' },
    { bloodBankName: 'AIIMS Main Blood Bank', units: 12, distance: 5.1, district: 'New Delhi', contactNumber: '011-26588500' },
    { bloodBankName: 'Apollo Hospital BB', units: 3, distance: 8.7, district: 'South Delhi', contactNumber: '011-29871090' },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        <div className="text-center mb-4">
          <h1 className="text-3xl font-black font-mono tracking-widest text-primary glow-text">GLOBAL INVENTORY SEARCH</h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">Query 10,000+ connected nodes across the national grid</p>
        </div>

        {/* Search Console */}
        <div className="glass-panel p-6 rounded-2xl border border-primary/30 shadow-[0_0_30px_rgba(0,157,255,0.1)]">
          <form onSubmit={handleSearch} className="flex flex-col gap-8">
            
            {/* Blood Group Selector */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-4">Target Payload (Blood Group)</label>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {BLOOD_GROUPS.map(bg => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-black transition-all duration-300 ${
                      bloodGroup === bg 
                        ? 'border-primary text-primary bg-primary/20 scale-110 shadow-[0_0_15px_rgba(0,157,255,0.5)]' 
                        : 'border-white/10 text-muted-foreground bg-white/5 hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Enter Pincode, District, or Hospital Name" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full h-14 pl-12 bg-black/50 border-primary/30 font-mono text-lg text-foreground focus:border-primary focus:ring-primary/50 rounded-xl"
                />
              </div>
              <Button type="submit" className="h-14 px-8 bg-primary hover:bg-primary/80 text-primary-foreground font-black tracking-widest text-lg rounded-xl shadow-[0_0_15px_rgba(0,157,255,0.3)]">
                <Search className="w-5 h-5 mr-2" /> EXECUTE SEARCH
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-mono text-sm tracking-widest text-primary flex items-center gap-2">
                <Layers className="w-4 h-4" /> QUERY RESULTS: {bloodGroup}
              </h2>
              <span className="font-mono text-xs text-muted-foreground">3 nodes found matching criteria</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {mockResults.map((result, idx) => (
                <div key={idx} className="glass-panel p-5 rounded-xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center bg-primary/10 relative">
                      <Droplet className="w-8 h-8 text-primary" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{bloodGroup}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{result.bloodBankName}</h3>
                      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {result.district}</span>
                        <span className="flex items-center gap-1 text-secondary"><Navigation className="w-3 h-3" /> {result.distance} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end border-t border-white/5 pt-4 md:pt-0 md:border-t-0">
                    <div className="text-center px-4 border-r border-white/10">
                      <div className={`text-3xl font-black tabular-nums ${result.units > 10 ? 'text-success glow-text-success' : 'text-destructive glow-text-critical'}`}>
                        {result.units}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Units Avail</div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <Button variant="outline" className="w-full bg-white/5 border-white/10 font-mono text-xs h-8">
                        {result.contactNumber}
                      </Button>
                      <Button className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white font-mono tracking-widest text-xs h-8 transition-all">
                        RESERVE UNIT
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
