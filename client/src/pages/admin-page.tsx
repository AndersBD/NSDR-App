'use client';

import { PageTransition } from '@/components/animation/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { BarChart, ChevronLeft, File, LogOut, Settings, Users } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AdminPage() {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();

  const adminLinks = [
    {
      title: 'Statistik',
      description: 'Se brugsdata og feedback statistik',
      icon: <BarChart className="w-6 h-6" />,
      path: '/mindspace/stats',
      color: 'bg-blue-100 text-blue-700',
      implemented: true,
    },
    {
      title: 'Filstyring',
      description: 'Administrer og upload lyd og billede filer',
      icon: <File className="w-6 h-6" />,
      path: '/mindspace/files',
      color: 'bg-green-100 text-green-700',
      implemented: false,
    },
    {
      title: 'Brugerstyring',
      description: 'Administrer brugere',
      icon: <Users className="w-6 h-6" />,
      path: '/mindspace/users',
      color: 'bg-orange-100 text-orange-700',
      implemented: false,
    },
    {
      title: 'Indstillinger',
      description: 'Konfigurer applikationens indstillinger',
      icon: <Settings className="w-6 h-6" />,
      path: '/mindspace/settings',
      color: 'bg-purple-100 text-purple-700',
      implemented: false,
    },
  ];

  return (
    <PageTransition>
      <div className="p-6 container mx-auto  min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-meditation-primary">Admin Dashboard</h1>
              <p className="text-meditation-secondary">
                Logget ind som: <span className="font-medium">{user?.email}</span>
              </p>
            </div>

            <div className="space-x-3">
              <Button variant="outline" className="text-meditation-primary hover:bg-meditation-primary/10" onClick={() => setLocation(`/mindspace`)}>
                <ChevronLeft className="w-5 h-5" />
                Tilbage
              </Button>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Log ud
              </Button>
            </div>
          </div>

          <Card className="border-2 border-meditation-primary/10 bg-meditation-primary/5">
            <CardHeader>
              <CardTitle className="text-meditation-primary">Velkommen til Admin området</CardTitle>
              <CardDescription>Her kan du administrere applikationen og få adgang til administrative funktioner.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-meditation-secondary">Denne side er beskyttet og kræver login. Kun autoriserede brugere har adgang til dette område.</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminLinks.map((link, index) => (
              <motion.div key={link.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                <Card
                  className="cursor-pointer hover:shadow-md border-2 border-meditation-primary/10 hover:scale-105 transition-all"
                  onClick={() => setLocation(link.path)}
                >
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-full ${link.color} flex items-center justify-center mb-2`}>{link.icon}</div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-meditation-primary">{link.title}</CardTitle>
                      {!link.implemented && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Ikke tilgængelig</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{link.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
