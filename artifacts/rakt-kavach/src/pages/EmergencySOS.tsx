// स्मार्ट स्टार सॉल्यूशंस - आपातकालीन एसओएस लाइव ग्रिड (Emergency Grid)
import React, { useState } from 'react';
import { useFormatEngine } from '../context/FormatContext';
import { useLiveTracking } from '../hooks/useLiveTracking';
import { AlertOctagon, ShieldAlert, Navigation } from 'lucide-react';

export default function EmergencySOS() {
  const { triggerEmergencySOS } = useFormatEngine();
  const { coordinates, trackingStatus } = useLiveTracking();
  const [selectedGroup, setSelectedGroup] = useState<'A+' | 'B+' | 'O+' | 'AB+' | 'Rare (Bombay Phenotype)'>('O+');
  const [district, setDistrict] = useState('Haryana HQ');
  const [sosTriggered, setSosTriggered] = useState(false);

  const handleSOS = () => {
    triggerEmergencySOS(district, selectedGroup);
    setSosTriggered(true);
    setTimeout(() => setSosTriggered(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050B18] text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-xl bg-[#0B1329] border-2 border-red-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-red-950/60 rounded-full border border-red-500/40 mb-3 animate-pulse">
            <AlertOctagon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-black text-red-500 uppercase tracking-widest">CRITICAL SOS INITIATION PANEL</h1>
          <p className="text-xs text-slate-400 mt-1">गोल्डन ऑवर में जीवन रक्षा के लिए राष्ट्रीय रक्त ग्रिड को तुरंत अलर्ट भेजें</p>
        </div>

        {/* लाइव जीपीएस कोऑर्डिनेट्स सिंक विजेट */}
        <div className="bg-[#111A30] border border-[#1E293B] p-3 rounded-xl mb-5 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Navigation className="w-4 h-4 text-[#009DFF]" />
            <span>जीपीएस स्थिति: {trackingStatus === 'ACTIVE' ? 'कनेक्टेड' : 'सिंक हो रहा है...'}</span>
          </div>
          <span className="font-mono text-emerald-400 font-bold">
            {coordinates ? `${coordinates.latitude.toFixed(4)}° N, ${coordinates.longitude.toFixed(4)}° E` : 'खोज रहे हैं...'}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">रक्त समूह का चयन करें (Required Blood Group)</label>
            <select 
              value={selectedGroup}
              onChange={(e: any) => setSelectedGroup(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#1E293B] focus:border-red-500 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none transition-colors"
            >
              <option value="O+">O+ (यूनिवर्सल)</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="Rare (Bombay Phenotype)">Rare (बॉम्बे फेनोटाइप)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">अस्पताल का जिला/स्थान</label>
            <input 
              type="text" 
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="उदाहरण के लिए: Ambala, Haryana"
              className="w-full bg-[#0F172A] border border-[#1E293B] focus:border-red-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
            />
          </div>

          <button 
            onClick={handleSOS}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl mt-4 tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-5 h-5" /> 
            {sosTriggered ? 'अलर्ट राष्ट्रीय ग्रिड पर भेज दिया गया!' : 'नेशनल ग्रider को SOS भेजें'}
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-500 mt-4">
          सुरक्षा चेतावनी: इस बटन को दबाते ही एआई एल्गोरिथम 50 किमी के दायरे में मौजूद सभी योग्य डोनर्स को रीयल-टाइम आपातकालीन संदेश भेज देता है।
        </p>
      </div>
    </div>
  );
}
