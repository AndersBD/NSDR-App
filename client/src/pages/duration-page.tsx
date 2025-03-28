'use client';

import { PageTransition } from '@/components/animation/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getDurationFolders } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, Loader2, Timer } from 'lucide-react';
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
  const typeIcon = type === 'energy' ? '✨' : '🌙';

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <PageTransition>
      <div className="space-y-6 ">
        <motion.div className="flex items-center mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Button
            variant="ghost"
            className="text-meditation-primary hover:bg-meditation-primary/10 flex items-center gap-2 pl-2"
            onClick={() => setLocation('/')}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Tilbage</span>
          </Button>
          <h1 className="text-2xl font-semibold text-meditation-primary ml-2 flex items-center">
            <span className="mr-2">{typeIcon}</span>
            {typeLabel}
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="border-2 border-meditation-primary/10 shadow-sm overflow-hidden ">
            <CardHeader className="bg-meditation-primary pb-4">
              <CardTitle className="text-2xl text-center text-gray-100 flex justify-center items-center gap-2">
                <Timer className="h-5 w-5" />
                Vælg Varighed
              </CardTitle>
              <p className="text-center text-gray-100 mt-2">
                Hvor lang tid har du til rådighed for din {type === 'energy' ? 'energi' : 'afslapnings'} session?
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 max-h-[calc(100vh-300px)] min-h-[400px] overflow-auto">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-meditation-primary" />
                </div>
              ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">
                  {folders?.map((folder, index) => (
                    <motion.div key={folder.duration} variants={item} custom={index}>
                      <Button
                        size="lg"
                        className="w-full h-16 text-lg bg-white text-meditation-primary hover:bg-meditation-primary/10 border-2 border-meditation-primary/80 transition-all duration-300 hover:shadow-md group rounded-xl"
                        onClick={() => setLocation(`/sessions/${type}/${folder.duration}`)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <div className="bg-meditation-primary/10 p-2 rounded-full mr-3 group-hover:bg-meditation-primary/20 transition-colors duration-300">
                              <Clock className="w-5 h-5 text-meditation-primary" />
                            </div>
                            <span className="font-medium">{folder.duration} min</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-meditation-secondary group-hover:text-meditation-primary transition-colors duration-300">
                              {folder.duration <= 10 ? 'Kort' : folder.duration <= 20 ? 'Medium' : 'Lang'} session
                            </span>
                            <motion.div
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={{ x: -5 }}
                              whileHover={{ x: 0 }}
                            >
                              <ChevronLeft className="w-4 h-4 rotate-180 text-meditation-primary" />
                            </motion.div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          className="text-center text-meditation-secondary italic text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Vælg den varighed der passer bedst til din tidsplan og dit behov
        </motion.p>
      </div>
    </PageTransition>
  );
}
