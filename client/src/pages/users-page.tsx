'use client';

import { ClientsTable } from '@/components/admin/users/clients-table';
import { CreateClientForm } from '@/components/admin/users/create-client-form';
import { SessionsTable } from '@/components/admin/users/sessions-table';
import { PageTransition } from '@/components/animation/page-transition';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientSessions, useClients } from '@/hooks/use-clients';
import { ChevronLeft, Home, Layers, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function UsersPage() {
  const [, setLocation] = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string>('');

  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  const { data: sessions = [], isLoading: isLoadingSessions } = useClientSessions(selectedClientId);

  const handleViewSessions = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
  };

  const handleBackToClients = () => {
    setSelectedClientId(null);
    setSelectedClientName('');
  };

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
              <Button variant="ghost" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={() => setLocation('/admin')}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Tilbage til Dashboard
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin" className="flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/users" className="flex items-center gap-1 text-meditation-primary font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>Brugerstyring</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {selectedClientId && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{selectedClientName}</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-meditation-primary">{selectedClientId ? `Sessions for ${selectedClientName}` : 'Brugerstyring'}</h2>
              {selectedClientId && (
                <Button variant="outline" onClick={handleBackToClients} className="text-meditation-primary hover:bg-meditation-primary/10">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Tilbage til klienter
                </Button>
              )}
            </div>

            {selectedClientId ? (
              <Card className="border-2 border-meditation-primary/10 shadow-sm">
                <CardHeader className="bg-meditation-primary/5 border-b border-meditation-primary/10">
                  <CardTitle className="text-meditation-primary">Aktive sessioner</CardTitle>
                  <CardDescription>Administrer aktive sessioner for denne klient</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <SessionsTable sessions={sessions} isLoading={isLoadingSessions} />
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="clients" className="w-full">
                <TabsList className="w-full max-w-md grid grid-cols-2 mb-6 ">
                  <TabsTrigger value="clients" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Klienter</span>
                  </TabsTrigger>
                  <TabsTrigger value="create" className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Opret ny klient</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="clients">
                  <Card className="border-2 border-meditation-primary/10 shadow-sm ">
                    <CardHeader className="bg-meditation-primary/10 rounded-t-md  border-meditation-primary/10">
                      <CardTitle className="text-meditation-primary">Klienter</CardTitle>
                      <CardDescription>Se og administrer alle registrerede klienter</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ClientsTable clients={clients} isLoading={isLoadingClients} onViewSessions={handleViewSessions} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="create">
                  <CreateClientForm />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
