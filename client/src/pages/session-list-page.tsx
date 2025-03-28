'use client';

import { PageTransition } from '@/components/animation/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getMeditationsByDuration } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, Loader2, Music, Play } from 'lucide-react';
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
  const typeIcon = type === 'energy' ? '✨' : '🌙';

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div className="flex items-center mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Button
            variant="ghost"
            className="text-meditation-primary hover:bg-meditation-primary/10 flex items-center gap-2 pl-2"
            onClick={() => setLocation(`/duration/${type}`)}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Tilbage</span>
          </Button>
          <h1 className="text-2xl font-semibold text-meditation-primary ml-2 flex items-center">
            <span className="mr-2">{typeIcon}</span>
            {typeLabel} - {duration} min
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="border-2 border-meditation-primary/10 shadow-sm overflow-hidden">
            <CardHeader className="meditation-header pb-4 rounded-t-md bg-meditation-primary text-white">
              <CardTitle className="text-2xl text-center flex justify-center items-center gap-2">
                <Music className="h-5 w-5" />
                Vælg NSDR-session
              </CardTitle>
              <p className="text-center text-white/80 mt-2">Vælg en meditation der passer til dit behov</p>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[450px] pr-4">
                {isLoading ? (
                  <div className="col-span-2 flex justify-center p-8">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      <Loader2 className="h-8 w-8 animate-spin text-meditation-primary" />
                    </motion.div>
                  </div>
                ) : meditations?.length === 0 ? (
                  <motion.div
                    className="col-span-2 text-center p-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-meditation-secondary mb-4">Ingen sessioner fundet for den valgte varighed</p>
                    <Button variant="outline" onClick={() => setLocation(`/duration/${type}`)} className="mt-2 meditation-button-outline">
                      Vælg en anden varighed
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={container} initial="hidden" animate="show">
                    {meditations?.map((meditation, index) => (
                      <motion.div key={meditation.id} variants={item} custom={index}>
                        <Card
                          className="overflow-hidden border-2 border-meditation-primary/10 hover:border-meditation-primary/40 transition-all duration-300 cursor-pointer hover:shadow-md group"
                          onClick={() => setLocation(`/play/${meditation.id}`)}
                        >
                          <div className="aspect-video bg-meditation-primary/5 relative overflow-hidden">
                            {meditation.imageUrl ? (
                              <img
                                src={meditation.imageUrl || '/placeholder.svg'}
                                alt={meditation.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
                                <img
                                  src={`https://api.dicebear.com/7.x/shapes/svg?seed=${meditation.name}`}
                                  alt={meditation.name}
                                  className="w-16 h-16 opacity-60 transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>
                            )}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center p-4"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Button size="sm" className="bg-meditation-primary hover:bg-meditation-primary/90 text-white">
                                <Play className="w-4 h-4 mr-1" />
                                Afspil
                              </Button>
                            </motion.div>
                          </div>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-meditation-primary truncate">{meditation.name}</h3>
                              <div className="flex items-center text-meditation-secondary text-sm mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{Math.round(meditation.duration / 60)} min</span>
                              </div>
                            </div>
                            <motion.div
                              className="bg-meditation-primary/10 rounded-full p-2 group-hover:bg-meditation-primary transition-colors duration-300"
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                              <Play className="w-4 h-4 text-meditation-primary group-hover:text-white" />
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          className="text-center text-meditation-secondary italic text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Alle meditationer er designet til at hjælpe dig med at finde ro og balance i hverdagen
        </motion.p>
      </div>
    </PageTransition>
  );
}
