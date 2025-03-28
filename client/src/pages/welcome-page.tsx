'use client';

import { PageTransition } from '@/components/animation/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart3, Moon, Sparkles, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimate(true);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          {/* App Logo */}
          <motion.div className="text-center relative p-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="absolute inset-0 bg-meditation-primary rounded-lg shadow-lg" />
            <div className="relative z-10 flex flex-col items-center">
              <img src={`${import.meta.env.BASE_URL}/trustculture-logo.png`} alt="MindSpace Logo" className="h-32 mx-auto mb-3" />
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <Card className="border-2 border-meditation-primary shadow-md">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-meditation-primary mb-6 text-center">Velkommen til MindSpace</h2>

                <div className="space-y-5 text-meditation-secondary">
                  <p className="leading-relaxed">
                    Trænger du til mere ro, bedre restitution og et større mentalt overskud? MindSpace tilbyder dig effektive og videnskabeligt dokumenterede
                    teknikker til afslapning, stresshåndtering og øget mental robusthed.
                  </p>

                  <div className="bg-meditation-primary-light/30 p-5 rounded-lg border border-meditation-primary/20">
                    <h3 className="text-lg font-semibold text-meditation-primary mb-3">Sådan bruger du appen:</h3>
                    <ul className="space-y-3">
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-meditation-primary flex items-center justify-center text-white font-medium">
                          1
                        </div>
                        <div>
                          <strong>Vælg session:</strong> Start med at vælge den ønskede type session fra listen nedenfor. Du kan vælge sessioner baseret på
                          varighed, tema eller din aktuelle stemning.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-meditation-primary flex items-center justify-center text-white font-medium">
                          2
                        </div>
                        <div>
                          <strong>Afspil session:</strong> Når du har valgt en session, tryk på 'Afspil'. Lydfilen begynder at spille automatisk. Læg eller sæt
                          dig godt til rette, luk øjnene og lyt til din MindSpace guide.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-meditation-primary flex items-center justify-center text-white font-medium">
                          3
                        </div>
                        <div>
                          <strong>Automatisk retur:</strong> Sessionen afsluttes automatisk. Vi vil meget gerne have din feedback bagefter!
                        </div>
                      </li>
                    </ul>
                  </div>

                  <p className="text-center font-medium text-meditation-primary italic">
                    Vi håber, du finder disse sessioner gavnlige og berigende. God fornøjelse!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Buttons */}
          <motion.div className="grid gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
            <Button
              size="lg"
              className="w-full h-16 text-lg bg-meditation-primary hover:bg-meditation-primary/80 border-2 border-meditation-primary group transition-all duration-300"
              onClick={() => setLocation('/mindspace/duration/energy')}
            >
              <div className="relative flex items-center">
                <Sun className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:rotate-45" />
                <span>Energi Boost</span>
                <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg border-2 border-meditation-primary text-meditation-primary hover:bg-meditation-primary hover:text-white group transition-all duration-300"
              onClick={() => setLocation('/mindspace/duration/relaxation')}
            >
              <div className="relative flex items-center">
                <Moon className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:rotate-12" />
                <span>Afslapning</span>
              </div>
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
