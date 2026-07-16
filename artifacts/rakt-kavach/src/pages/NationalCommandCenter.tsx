// स्मार्ट स्टार सॉल्यूशंस - राष्ट्रीय डिजिटल रक्त सहायता नेटवर्क (मुख्य कमांड सेंटर)
import React, { useEffect, useState } from 'react';
import { useFormatEngine } from '../context/FormatContext';
import { Shield, Activity, Users, AlertTriangle, RefreshCw, Globe } from 'lucide-react';

export default function NationalCommandCenter() {
  const { gridSummary, hospitals, syncWithERaktKosh } = useFormatEngine();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithERaktKosh();
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-[#050B18] text-white p-6 font-sans">
      {/* शीर्ष राष्ट्रीय सुरक्षा हेडर */}
      <header className="border-b border-[#1E293B] pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-wider text-[#009DFF]">रक्त कवच • NATIONAL COMMAND CENTER</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">स्मार्ट स्टार सॉल्यूशंस | संस्थापक: नवदीप कुमार — "एक राष्ट्र • एक रक्त ग्रिड"</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSync}
            className="flex items-center gap-2 bg-[#0F172A] border border-[#1E293B] hover:border-[#009DFF] px-4 py-2 rounded-lg text-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing || gridSummary.eRaktKoshSyncStatus === 'SYNCING' ? 'animate-spin text-[#009DFF]' : ''}`} />
            {gridSummary.eRaktKoshSyncStatus === 'SYNCING' ? 'e-RaktKosh सिंक हो रहा है...' : 'e-RaktKosh लाइव सिंक'}
          </button>
          <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <Globe className="w-4 h-4" /> WHO अनुपालन: सक्रिय
          </div>
        </div>
      </header>

      {/* राष्ट्रीय ग्रिड लाइव सांख्यिकी मेट्रिक्स */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#0B1329] border border-[#1E293B] p-5 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <p className="text-sm font-medium text-slate-400">कुल सक्रिय रक्तदाता</p>
            <Users className="w-5 h-5 text-[#009DFF]" />
          </div>
          <h3 className="text-3xl font-bold tracking-tight">{gridSummary.totalActiveDonors.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-emerald-400 mt-2">↑ लाइव आधार सत्यापित</p>
        </div>

        <div className="bg-[#0B1329] border border-[#1E293B] p-5 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <p className="text-sm font-medium text-slate-400">कनेक्टेड अस्पताल</p>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-3xl font-bold tracking-tight">{gridSummary.totalHospitalsConnected.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-indigo-400 mt-2">ABHA / ABDM इंटीग्रेटेड</p>
        </div>

        <div className="bg-[#0B1329] border border-red-500/20 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <p className="text-sm font-medium text-red-400">सक्रिय क्रिटिकल SOS</p>
            <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
          </div>
          <h3 className="text-3xl font-bold tracking-tight text-red-500">{gridSummary.liveEmergencyAlerts}</h3>
          <p className="text-xs text-red-400 mt-2">गोल्डन ऑवर रिस्पांस सक्रिय</p>
        </div>

        <div className="bg-[#0B1329] border border-[#1E293B] p-5 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <p className="text-sm font-medium text-slate-400">डेटा गोपनीयता ऑडिट</p>
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-emerald-400 tracking-wide mt-2">100% सुरक्षित</h3>
          <p className="text-xs text-slate-500 mt-1">DPDP Act 2023 कम्प्लायंट</p>
        </div>
      </div>

      {/* लाइव इमरजेंसी रिस्पांस फीड */}
      <div className="bg-[#0B1329] border border-[#1E293B] rounded-xl p-6">
        <h2 className="text-lg font-bold tracking-wide mb-4 text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          लाइव राष्ट्रीय रक्त मांग और एआई मिलान ग्रिड
        </h2>

        {hospitals.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-[#1E293B] rounded-xl">
            वर्तमान में पूरे देश में कोई भी क्रिटिकल SOS लंबित नहीं है। राष्ट्रीय रक्त ग्रिड सुरक्षित है।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400">
                  <th className="pb-3 font-semibold">इमरजेंसी ID</th>
                  <th className="pb-3 font-semibold">अस्पताल एवं स्थान</th>
                  <th className="pb-3 font-semibold">रक्त समूह</th>
                  <th className="pb-3 font-semibold">तीव्रता</th>
                  <th className="pb-3 font-semibold text-right">AI मिलान स्कोर</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {hospitals.map((req) => (
                  <tr key={req.requestId} className="hover:bg-[#0F172A]/50 transition-colors">
                    <td className="py-4 font-mono text-[#009DFF]">{req.requestId}</td>
                    <td className="py-4">
                      <div className="font-semibold text-slate-200">{req.hospitalName}</div>
                      <div className="text-xs text-slate-500">ज़िला: {req.districtCode} | राज्य कोड: {req.stateCode}</div>
                    </td>
                    <td className="py-4">
                      <span className="bg-red-950 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        {req.requiredGroup}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-red-500 font-bold animate-pulse">{req.urgencyLevel}</span>
                    </td>
                    <td className="py-4 text-right text-emerald-400 font-mono font-bold">{req.aiMatchScore}% Match</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
