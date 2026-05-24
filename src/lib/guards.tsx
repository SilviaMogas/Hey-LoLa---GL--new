import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { isAdminEmail } from './admin';
import { paths } from './routes';
import { PawLoader } from '../components/PawLoader';

const Loading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <PawLoader size={36} className="text-brand-orange" variant="scattered" />
  </div>
);

/** Requires a signed-in user. Unauthenticated visitors are bounced to
 *  /login with `?from=<original path>` so we can return them after
 *  successful auth. Email verification is checked softly via a banner
 *  in the main layout — unverified users are NOT blocked here so they
 *  can complete onboarding and explore the app immediately. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${paths.login}?from=${from}`} replace />;
  }

  return <>{children}</>;
}

/** Requires an admin user (defined by isAdminEmail). Non-admins land on
 *  the dashboard so they don't get a confusing dead-end. */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${paths.login}?from=${from}`} replace />;
  }

  if (!isAdminEmail(user.email)) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <>{children}</>;
}

/** Inverse of ProtectedRoute: signed-in users are pushed to the dashboard.
 *  Used on /login and /signup so we don't show the auth form to a user
 *  who is already authenticated. Unverified users are allowed through so
 *  they can sign out and try a different account if needed. */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (user && user.emailVerified) {
    return <Navigate to={paths.dashboard} replace />;
  }
  return <>{children}</>;
}
