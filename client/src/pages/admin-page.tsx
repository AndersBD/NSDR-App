'use client';

import { PageTransition } from '@/components/animation/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { BarChart, File, Home, LogOut, Settings, Shield, Users } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AdminPage() {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();

  const adminLinks = [
    {
      title: 'Brugerstyring',
      description: 'Administrer klienter og deres sessioner',
      icon: <Users className="w-6 h-6" />,
      path: '/users',
      color: 'bg-orange-100 text-orange-700',
      implemented: true,
    },
    {
      title: 'Statistik',
      description: 'Se brugsdata og feedback statistik',
      icon: <BarChart className="w-6 h-6" />,
      path: '/stats',
      color: 'bg-blue-100 text-blue-700',
      implemented: true,
    },
    {
      title: 'Filstyring',
      description: 'Administrer og upload lyd og billede filer',
      icon: <File className="w-6 h-6" />,
      path: '/files',
      color: 'bg-green-100 text-green-700',
      implemented: false,
    },
    {
      title: 'Indstillinger',
      description: 'Konfigurer applikationens indstillinger',
      icon: <Settings className="w-6 h-6" />,
      path: '/settings',
      color: 'bg-purple-100 text-purple-700',
      implemented: false,
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-meditation-primary text-white py-4 shadow-md">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <h1 className="text-xl font-bold">MindSpace Admin</h1>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm opacity-90">{user?.email}</span>
                <Button variant="ghost" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log ud
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-meditation-primary">Dashboard</h2>
              <Button variant="outline" className="text-meditation-primary hover:bg-meditation-primary/10" onClick={() => setLocation(`/`)}>
                <Home className="w-4 h-4 mr-2" />
                Tilbage til forside
              </Button>
            </div>

            <Card className="border-2 border-meditation-primary/10 bg-meditation-primary/5 overflow-hidden">
              <CardHeader className="bg-meditation-primary/10 border-b border-meditation-primary/10">
                <CardTitle className="text-meditation-primary">Velkommen til Admin området</CardTitle>
                <CardDescription>Her kan du administrere applikationen og få adgang til administrative funktioner.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-meditation-secondary">
                  Denne side er beskyttet og kræver login. Kun autoriserede brugere har adgang til dette område. Vælg en af funktionerne nedenfor for at komme i
                  gang.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminLinks.map((link, index) => (
                <motion.div key={link.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                  <Card
                    className={`h-full cursor-pointer hover:shadow-md border-2 border-meditation-primary/10 hover:border-meditation-primary/30 transition-all ${!link.implemented ? 'opacity-70' : ''}`}
                    onClick={() => link.implemented && setLocation(link.path)}
                  >
                    <CardHeader className="pb-2 space-y-4">
                      <div className={`w-12 h-12 rounded-full ${link.color} flex items-center justify-center`}>{link.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-meditation-primary text-lg">{link.title}</CardTitle>
                          {!link.implemented && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Kommer snart</span>}
                        </div>
                        <CardDescription className="mt-1">{link.description}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
