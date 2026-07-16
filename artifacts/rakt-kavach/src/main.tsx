// स्मार्ट स्टार सॉल्यूशंस - रक्त कवच बूटस्ट्रैप और रूट रेंडरिंग इंजन
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { FormatProvider } from './context/FormatContext.tsx';
import './index.css';

// रीपिट के रूट डोम (DOM) एलिमेंट को कैप्चर करना
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Fatal Error: Root target container not found. Check index.html architecture.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* पूरे भारत के लाइव डेटा 100 फ़ॉर्मेट्स को ऐप के साथ बाइंड करना */}
    <FormatProvider>
      <App />
    </FormatProvider>
  </React.StrictMode>
);
