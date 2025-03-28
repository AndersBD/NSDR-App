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
import { Route, Switch } from 'wouter';
import { ProtectedRoute } from './components/auth/protected-route';
import { AuthProvider } from './lib/auth-context';
import env from './lib/env-config';
import { queryClient } from './lib/queryClient';
import AdminPage from './pages/admin-page';
import LoginPage from './pages/login-page';
import StatsPage from './pages/stats-page';

const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        {/* Public routes */}
        <Route path="/mindspace" component={WelcomePage} />
        {/* <Route path="/mindspace/login" component={LoginPage} /> */}
        <LayoutRoute layout={AppLayout} path="/mindspace/login" component={LoginPage} />

        {/* Protected routes */}
        <Route path="/mindspace/stats">
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        </Route>

        <Route path="/mindspace/admin">
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        </Route>

        {/* Regular routes that use the AppLayout */}
        <LayoutRoute layout={AppLayout} path="/mindspace/duration/:type" component={DurationPage} />
        <LayoutRoute layout={AppLayout} path="/mindspace/sessions/:type/:duration" component={SessionListPage} />
        <LayoutRoute layout={AppLayout} path="/mindspace/play/:id" component={PlaybackPage} />
        <LayoutRoute layout={AppLayout} component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionContextProvider supabaseClient={supabaseClient}>
          <Router />
          <Toaster />
        </SessionContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
