// स्मार्ट स्टार सॉल्यूशंस - रक्त कवच डोनर न्याय एवं डिजिटल वॉलेट पोर्टल
import React, { useState } from 'react';
import { useFormatEngine } from '../context/FormatContext';
import { Award, Wallet, QrCode, ShieldCheck, Heart } from 'lucide-react';

export default function DonorPortal() {
  const { verifyDonorDonation } = useFormatEngine();
  const [mockDonor, setMockDonor] = useState({
    id: "DK-9045-HR",
    name: "रक्तवीर डोनर",
    abhaId: "12-3456-7890-1234",
    bloodGroup: "O+",
    walletBalance: 2,
    status: "VERIFIED_DONOR"
  });

  const handleSimulateDonation = () => {
    // डिजिटल वॉलेट में 1 यूनिट रक्त सम्मान क्रेडिट जोड़ना
    verifyDonorDonation(mockDonor.id);
    setMockDonor(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + 1
    }));
  };

  return (
    <div className="min-h-screen bg-[#050B18] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl font-bold tracking-wider text-[#009DFF] flex items-center justify-center md:justify-start gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" /> डोनर अधिकार एवं सम्मान पोर्टल
          </h1>
          <p className="text-sm text-slate-400 mt-1">स्मार्ट स्टार सॉल्यूशंस | डोनर को मिलेगा उसका असली अधिकार और न्याय</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* डोनर डिजिटल ब्लड वॉलेट कार्ड */}
          <div className="bg-gradient-to-br from-red-950/50 to-[#0B1329] border border-red-500/20 p-6 rounded-2xl relative overflow-hidden shadow-xl md:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-red-400 font-bold">DIGITAL BLOOD WALLET</p>
                <h3 className="text-xl font-bold text-slate-100 mt-1">{mockDonor.name}</h3>
                <p className="text-xs text-slate-400">ABHA ID: {mockDonor.abhaId}</p>
              </div>
              <Wallet className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-red-500 font-mono">{mockDonor.walletBalance}</span>
              <span className="text-sm text-slate-400 font-medium">यूनिट डिजिटल ब्लड क्रेडिट</span>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" /> संप्रभु राष्ट्रीय सुरक्षा लॉक</span>
              <button 
                onClick={handleSimulateDonation}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
              >
                + डोनेशन टेस्ट सिंक
              </button>
            </div>
          </div>

          {/* क्यूआर कोड आइडेंटिटी ब्लॉक */}
          <div className="bg-[#0B1329] border border-[#1E293B] p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl">
            <div className="p-4 bg-white rounded-xl mb-3">
              <QrCode className="w-24 h-24 text-black" />
            </div>
            <p className="text-xs font-mono text-[#009DFF] mb-1">ID: {mockDonor.id}</p>
            <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
              सत्यापित क्यूआर पहचान पत्र
            </span>
          </div>
        </div>

        {/* डोनर न्याय और अधिकार घोषणापत्र बोर्ड */}
        <div className="bg-[#0B1329] border border-[#1E293B] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#009DFF]" /> आपके अधिकार (Rakt Kavach Donor Rights)
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✓</span> आपके द्वारा दिए गए रक्त की एक-एक बूंद का लाइव डिजिटल ऑडिट ट्रेल रखा जाता है ताकि कोई बिचौलिया इसका व्यापार न कर सके।
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✓</span> आवश्यकता पड़ने पर आपके ब्लड वॉलेट क्रेडिट्स का उपयोग करके आपके परिवार को पूरे भारत में कहीं भी तुरंत प्राथमिकता पर मुफ्त रक्त उपलब्ध कराया जाएगा।
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✓</span> स्मार्ट स्टार सॉल्यूशंस भारत सरकार के डीपीडीपी अधिनियम (DPDP Act) के तहत आपके व्यक्तिगत और मेडिकल डेटा को 100% गुप्त और एन्क्रिप्टेड रखने की गारंटी देता है।
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
