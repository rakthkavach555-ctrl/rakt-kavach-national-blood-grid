// स्मार्ट स्टार सॉल्यूशंस - रक्त कवच राष्ट्रीय डिजिटल ग्रिड सुरक्षा कॉन्फ़िगरेशन
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// रीयल-टाइम नेशनल आर्किटेक्चर के लिए पर्यावरण वेरिएबल्स (Environment Variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "MOCK_NATIONAL_KEY_SECURE",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "rakt-kavach"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rakt-kavach",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "rakt-kavach"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:00000000:web:00000000"
};

// फायरबेस ऐप का प्रारंभिकरण (Initialization)
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * भारत सरकार के DPDP अधिनियम (Digital Personal Data Protection Act) के अनुपालन के लिए 
 * डोनर की लाइव सहमति (Live Consent) को डिजिटल रूप से रिकॉर्ड करने का सॉवरेन फंक्शन।
 */
export async function logDonorConsent(donorId: string, abhaId: string, consentGranted: boolean) {
  const consentRef = doc(collection(db, 'national_dpdp_consent_logs'), donorId);
  return await setDoc(consentRef, {
    abhaId,
    consentGranted,
    timestamp: new Date().toISOString(),
    auditStatus: 'VERIFIED_BY_SMART_STAR_SOLUTIONS',
    complianceSchema: 'DPDP_ACT_COMPLIANT'
  }, { merge: true });
}

export default app;
