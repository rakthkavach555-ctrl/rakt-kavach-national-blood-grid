import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: string[];
}

export function ProtectedRoute({ path, component: Component, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Route path={path}>
      {(params) => {
        if (!isAuthenticated) {
          return <Redirect to="/" />;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
          return <Redirect to="/dashboard" />;
        }

        return <Component {...params} />;
      }}
    </Route>
  );
}
