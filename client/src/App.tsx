import { AppLayout } from '@/components/layout/app-layout';
import { LayoutRoute } from '@/components/layout/layout-route';
import { Toaster } from '@/components/ui/toaster';
import DurationPage from '@/pages/duration-page';
import NotFound from '@/pages/not-found';
import PlaybackPage from '@/pages/playback-page';
import SessionListPage from '@/pages/session-list-page';
import WelcomePage from '@/pages/welcome-page';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { ProtectedRoute } from './components/auth/protected-route';
import { AuthProvider, useAuth } from './lib/auth-context';
import { ClientSessionProvider, useClientSession } from './lib/client-context';
import env from './lib/env-config';
import { queryClient } from './lib/queryClient';
import { validateSession } from './lib/session';
import AdminPage from './pages/admin-page';
import LoginPage from './pages/login-page';
import StatsPage from './pages/stats-page';
import UsersPage from './pages/users-page';

const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

function RouteChangeValidator() {
  const { sessionId, clearSession } = useClientSession();
  const [location, setLocation] = useLocation();

  // Validate session on route change
  useEffect(() => {
    const checkSession = async () => {
      // Skip validation for login page
      if (location === '/login') return;

      // Only validate if we have a session
      if (sessionId) {
        const isValid = await validateSession(sessionId);
        if (!isValid) {
          console.log('Session invalidated on route change, redirecting to login');
          clearSession();
          setLocation('/login');
        }
      }
    };

    checkSession();
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <RouteChangeValidator />
      <AnimatePresence mode="wait">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={WelcomePage} />
          <LayoutRoute layout={AppLayout} path="/login" component={LoginPage} />

          {/* Protected routes */}
          <Route path="/stats">
            <ProtectedRoute>
              <StatsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/users">
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          </Route>

          <Route path="/admin">
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          </Route>

          {/* Regular routes that use the AppLayout */}
          <LayoutRoute layout={AppLayout} path="/duration/:type" component={DurationPage} />
          <LayoutRoute layout={AppLayout} path="/sessions/:type/:duration" component={SessionListPage} />
          <LayoutRoute layout={AppLayout} path="/play/:id" component={PlaybackPage} />
          <LayoutRoute layout={AppLayout} component={NotFound} />
        </Switch>
      </AnimatePresence>
    </>
  );
}

function AppInitializer() {
  const { restoreSession } = useClientSession();
  const { isAuthenticated: isAdminAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Run this effect only once on app startup
  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    const clientId = localStorage.getItem('client_id');
    const deviceId = localStorage.getItem('device_id');

    // Attempt auto-restore only on app initialization
    if (deviceId && (!sessionId || !clientId)) {
      // This will be handled in your restoreSession function that looks up sessions by device ID
      restoreSession();
    }
  }, []); // Empty dependency array means this runs once on mount

  // Keep your existing effect for location-based checks
  useEffect(() => {
    // Perform session check only when appropriate
    const checkSessions = async () => {
      // We're at login page and not authenticated as admin
      if (location.includes('/login') && !isAdminAuthenticated) {
        // First check if we have session data in storage
        const sessionId = localStorage.getItem('sessionId');
        const clientId = localStorage.getItem('client_id');

        if (sessionId && clientId) {
          const restored = await restoreSession();
          if (restored) {
            setLocation('/');
          } else {
            console.log('Session restoration failed - staying on login page');
          }
        } else {
          console.log('No complete session data found in localStorage');
        }
      }
    };

    checkSessions();
  }, [location, isAdminAuthenticated, restoreSession, setLocation]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClientSessionProvider>
          <SessionContextProvider supabaseClient={supabaseClient}>
            <AppInitializer />
            <Router />
            <Toaster />
          </SessionContextProvider>
        </ClientSessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
