import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import WelcomePage from "@/pages/welcome-page";
import DurationPage from "@/pages/duration-page";
import SessionListPage from "@/pages/session-list-page";
import PlaybackPage from "@/pages/playback-page";
import NotFound from "@/pages/not-found";
import env from './lib/env-config';

const supabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_KEY
);

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