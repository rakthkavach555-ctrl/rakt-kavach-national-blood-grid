import React, { Suspense, lazy } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProtectedRoute } from './components/ProtectedRoute';

// Eager-loaded (critical path)
import LandingPage from './pages/LandingPage';
import DashboardRouter from './pages/DashboardRouter';
import NotFound from '@/pages/not-found';

// Lazy-loaded (code splitting)
const NationalCommandCenter = lazy(() => import('./pages/NationalCommandCenter'));
const StateCommandCenter = lazy(() => import('./pages/StateCommandCenter'));
const DistrictCommandCenter = lazy(() => import('./pages/DistrictCommandCenter'));
const EmergencySOS = lazy(() => import('./pages/EmergencySOS'));
const EmergencyDetail = lazy(() => import('./pages/EmergencyDetail'));
const BloodUnitTracker = lazy(() => import('./pages/BloodUnitTracker'));
const DonorPortal = lazy(() => import('./pages/DonorPortal'));
const DonorRegister = lazy(() => import('./pages/DonorRegister'));
const DonorDonate = lazy(() => import('./pages/DonorDonate'));
const PatientPortal = lazy(() => import('./pages/PatientPortal'));
const HospitalDashboard = lazy(() => import('./pages/HospitalDashboard'));
const BloodBankDashboard = lazy(() => import('./pages/BloodBankDashboard'));
const LaboratoryDashboard = lazy(() => import('./pages/LaboratoryDashboard'));
const AmbulanceDashboard = lazy(() => import('./pages/AmbulanceDashboard'));
const VolunteerPortal = lazy(() => import('./pages/VolunteerPortal'));
const InventorySearch = lazy(() => import('./pages/InventorySearch'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const WhoReadiness = lazy(() => import('./pages/WhoReadiness'));
const GlobalSearch = lazy(() => import('./pages/GlobalSearch'));

const Loader = () => (
  <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-[#009DFF] border-t-transparent animate-spin" />
      <p className="text-[#7EB8D4] font-mono text-sm tracking-widest">INITIALIZING MODULE</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});

function Router() {
  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <ProtectedRoute path="/dashboard" component={DashboardRouter} />
        
        <ProtectedRoute path="/national" component={NationalCommandCenter} allowedRoles={['NATIONAL_ADMIN', 'SUPER_ADMIN', 'STATE_ADMIN']} />
        <ProtectedRoute path="/state/:stateCode" component={StateCommandCenter} />
        <ProtectedRoute path="/district/:districtCode" component={DistrictCommandCenter} />
        
        <ProtectedRoute path="/donor" component={DonorPortal} />
        <ProtectedRoute path="/donor/register" component={DonorRegister} />
        <ProtectedRoute path="/donor/donate" component={DonorDonate} />
        
        <ProtectedRoute path="/patient" component={PatientPortal} />
        <ProtectedRoute path="/hospital" component={HospitalDashboard} />
        <ProtectedRoute path="/blood-bank" component={BloodBankDashboard} />
        <ProtectedRoute path="/laboratory" component={LaboratoryDashboard} />
        <ProtectedRoute path="/ambulance" component={AmbulanceDashboard} />
        <ProtectedRoute path="/volunteer" component={VolunteerPortal} />
        
        <ProtectedRoute path="/emergency" component={EmergencySOS} />
        <ProtectedRoute path="/emergency/:id" component={EmergencyDetail} />
        <ProtectedRoute path="/inventory" component={InventorySearch} />
        <ProtectedRoute path="/blood-units/:id" component={BloodUnitTracker} />
        <ProtectedRoute path="/wallet" component={WalletPage} />
        <ProtectedRoute path="/notifications" component={NotificationsPage} />
        <ProtectedRoute path="/analytics" component={AnalyticsPage} />
        <ProtectedRoute path="/admin" component={AdminPanel} />
        <ProtectedRoute path="/who-readiness" component={WhoReadiness} />
        <ProtectedRoute path="/search" component={GlobalSearch} />
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}