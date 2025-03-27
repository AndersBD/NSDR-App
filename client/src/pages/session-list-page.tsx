'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getMeditationsByDuration } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Clock, Loader2, Play } from 'lucide-react';
import { useLocation, useParams } from 'wouter';

export default function SessionListPage() {
  const { type, duration } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    data: meditations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['meditations', duration],
    queryFn: () => getMeditationsByDuration(`${duration} minutter`),
  });

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load meditation sessions',
      variant: 'destructive',
    });
  }

  const typeLabel = type === 'energy' ? 'Energi Boost' : 'Afslapning';

  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="text-meditation-primary hover:bg-meditation-primary/20" onClick={() => setLocation(`/duration/${type}`)}>
          <ChevronLeft className="w-5 h-5 mr-2" />
          Tilbage
        </Button>
        <h1 className="text-2xl font-semibold text-meditation-primary ml-2">
          {typeLabel} - {duration} min
        </h1>
      </div>

      <Card className="meditation-card overflow-hidden">
        <CardHeader className="meditation-header pb-4 rounded-t-md">
          <CardTitle className="text-2xl text-center ">Vælg NSDR-session</CardTitle>
          <p className="text-center  mt-2">Vælg en meditation der passer til dit behov</p>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[450px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-2 flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-meditation-primary" />
                </div>
              ) : meditations?.length === 0 ? (
                <div className="col-span-2 text-center p-8">
                  <p className="text-meditation-secondary">Ingen sessioner fundet for den valgte varighed</p>
                  <Button variant="outline" onClick={() => setLocation(`/duration/${type}`)} className="mt-4 meditation-button-outline">
                    Vælg en anden varighed
                  </Button>
                </div>
              ) : (
                meditations?.map((meditation) => (
                  <Card
                    key={meditation.id}
                    className="overflow-hidden border border-meditation-primary/20 hover:border-meditation-primary transition-all duration-200 cursor-pointer hover:shadow-md group"
                    onClick={() => setLocation(`/play/${meditation.id}`)}
                  >
                    <div className="aspect-video bg-meditation-primary/5 relative overflow-hidden">
                      {meditation.imageUrl ? (
                        <img
                          src={meditation.imageUrl || '/placeholder.svg'}
                          alt={meditation.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
                          <img
                            src={`https://api.dicebear.com/7.x/shapes/svg?seed=${meditation.name}`}
                            alt={meditation.name}
                            className="w-16 h-16 opacity-60 transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <Button size="sm" className="meditation-button">
                          <Play className="w-4 h-4 mr-1" />
                          Afspil
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-meditation-primary truncate">{meditation.name}</h3>
                        <div className="flex items-center text-meditation-secondary text-sm mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{Math.round(meditation.duration / 60)} min</span>
                        </div>
                      </div>
                      <div className="bg-meditation-primary/10 rounded-full p-2 group-hover:bg-meditation-primary transition-colors duration-200">
                        <Play className="w-4 h-4 text-meditation-primary group-hover:text-white" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <p className="text-center text-meditation-secondary italic text-sm mt-4">
        Alle meditationer er designet til at hjælpe dig med at finde ro og balance i hverdagen
      </p>
    </>
  );
}
