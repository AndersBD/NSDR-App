import { Toaster } from '@/components/ui/toaster';
import DurationPage from '@/pages/duration-page';
import NotFound from '@/pages/not-found';
import PlaybackPage from '@/pages/playback-page';
import SessionListPage from '@/pages/session-list-page';
import WelcomePage from '@/pages/welcome-page';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import env from './lib/env-config';
import { queryClient } from './lib/queryClient';

const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/duration/:type" component={DurationPage} />
      <Route path="/sessions/:type/:duration" component={SessionListPage} />
      <Route path="/play/:id" component={PlaybackPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <Router />
        <Toaster />
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;
