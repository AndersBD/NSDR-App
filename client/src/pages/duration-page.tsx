'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getDurationFolders } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Clock, Loader2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';

export default function DurationPage() {
  const [, setLocation] = useLocation();
  const { type } = useParams();
  const { toast } = useToast();

  const {
    data: folders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['duration-folders'],
    queryFn: getDurationFolders,
  });

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load meditation durations',
      variant: 'destructive',
    });
  }

  const typeLabel = type === 'energy' ? 'Energi Boost' : 'Afslapning';

  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="text-meditation-primary hover:bg-meditation-primary" onClick={() => setLocation('/')}>
          <ChevronLeft className="w-5 h-5 mr-2" />
          Tilbage
        </Button>
        <h1 className="text-2xl font-semibold text-meditation-primary ml-2">{typeLabel}</h1>
      </div>

      <Card className="meditation-card">
        <CardHeader className="meditation-header pb-4 rounded-t-md">
          <CardTitle className="text-2xl text-center ">Vælg Varighed</CardTitle>
          <p className="text-center  mt-2">Hvor lang tid har du til rådighed for din {type === 'energy' ? 'energi' : 'afslapnings'} session?</p>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-meditation-primary" />
            </div>
          ) : (
            folders?.map((folder) => (
              <Button
                key={folder.duration}
                size="lg"
                className="w-full h-16 text-lg bg-white text-meditation-primary hover:bg-meditation-primary/15 border-2 border-meditation-primary transition-all duration-200 hover:shadow-md group"
                onClick={() => setLocation(`/sessions/${type}/${folder.duration}`)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-meditation-primary group-hover:text-meditation-primary" />
                    <span className="font-medium">{folder.duration} min</span>
                  </div>
                  <span className="text-sm text-meditation-secondary group-hover:text-meditation-primary">
                    {folder.duration <= 10 ? 'Kort' : folder.duration <= 20 ? 'Medium' : 'Lang'} session
                  </span>
                </div>
              </Button>
            ))
          )}
        </CardContent>
      </Card>

      <p className="text-center text-meditation-secondary italic text-sm mt-4">Vælg den varighed der passer bedst til din tidsplan og dit behov</p>
    </>
  );
}
