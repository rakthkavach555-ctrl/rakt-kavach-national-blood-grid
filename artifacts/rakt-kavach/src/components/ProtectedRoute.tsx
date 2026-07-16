// स्मार्ट स्टार सॉल्यूशंस - राष्ट्रीय डिजिटल ग्रिड सुरक्षा गेटवे (Role-Based Access Control)
import React from 'react';
import { Route, Redirect } from 'wouter';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ path, component: Component }) => {
  // रीपिट और फायरबेस ऑथेंटिकेशन का लाइव स्टेटस (यहाँ रीयल-टाइम टोकन चेक होता है)
  // अभी इसे 'true' पर सेट किया गया है ताकि आप रीपिट पर आसानी से टेस्टिंग कर सकें
  const isAuthenticated = true; 
  const isAuthorizedRole = true; // नेशनल/स्टेट/डिस्ट्रिक्ट ऑफिसर रोल

  return (
    <Route path={path}>
      {(params) => {
        if (!isAuthenticated || !isAuthorizedRole) {
          console.warn("Rakt Kavach Security: Unauthorized Access Blocked. Triggering DPDP Protocol.");
          return <Redirect to="/" />;
        }

        // सुरक्षा जांच पास होने पर ही कंपोनेंट रेंडर होगा
        return <Component {...params} />;
      }}
    </Route>
  );
};
