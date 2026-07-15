import React from 'react';
import { Redirect } from 'wouter';
import { useAuthStore } from '@/stores/authStore';
import { AppLayout } from '@/components/AppLayout';

export default function DashboardRouter() {
  const { user } = useAuthStore();

  if (!user) return <Redirect to="/" />;

  // Redirect to role-specific dashboard
  switch (user.role) {
    case 'NATIONAL_ADMIN':
    case 'SUPER_ADMIN':
      return <Redirect to="/national" />;
    case 'DONOR':
      return <Redirect to="/donor" />;
    case 'HOSPITAL':
      return <Redirect to="/hospital" />;
    case 'PATIENT':
      return <Redirect to="/patient" />;
    case 'BLOOD_BANK':
      return <Redirect to="/blood-bank" />;
    case 'LABORATORY':
      return <Redirect to="/laboratory" />;
    case 'AMBULANCE':
      return <Redirect to="/ambulance" />;
    default:
      // Fallback dashboard component inside AppLayout
      return (
        <AppLayout>
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-mono text-primary glow-text">Awaiting Command...</h1>
          </div>
        </AppLayout>
      );
  }
}
