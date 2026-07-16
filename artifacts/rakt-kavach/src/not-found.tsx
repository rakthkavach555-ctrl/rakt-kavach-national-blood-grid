// स्मार्ट स्टार सॉल्यूशंस - सुरक्षित एरर एवं रूट गार्ड पेज
import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050B18] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-full mb-4 animate-bounce">
        <ShieldAlert className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-4xl font-black text-red-500 tracking-wider">404 - सुरक्षा अलर्ट</h1>
      <p className="text-slate-400 mt-2 max-w-md text-sm">
        अनधिकृत रूट या पेज का पता चला है। राष्ट्रीय सुरक्षा प्रोटोकॉल के तहत यह रास्ता ब्लॉक है।
      </p>
      <a 
        href="#/" 
        className="mt-6 bg-[#0F172A] border border-[#1E293B] hover:border-[#009DFF] px-6 py-2.5 rounded-xl text-sm font-bold text-[#009DFF] transition-all"
      >
        कमांड सेंटर होम पर लौटें
      </a>
    </div>
  );
}
