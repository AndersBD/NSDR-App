import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';
import { useLocation } from 'wouter';

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* App Logo */}
        <div className="text-center relative p-8">
          <div className="absolute inset-0 bg-[#2F4A3E] rounded-lg" />
          <img src="/trustculture-logo.png" alt="NSDR App Logo" className="h-36 mx-auto relative z-10" />
        </div>

        {/* Welcome Text */}
        <Card className="border-2 border-[#384c44]">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-[#384c44] mb-4 text-center">Velkommen til MindSpace</h2>

            <div className="space-y-4 text-[#667c73]">
              <p>
                Trænger du til mere ro, bedre restitution og et større mentalt overskud? MindSpace tilbyder dig effektive og videnskabeligt dokumenterede
                teknikker til afslapning, stresshåndtering og øget mental robusthed.
              </p>

              <div>
                <h3 className="text-lg font-semibold text-[#384c44] mb-2">Sådan bruger du appen:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Vælg session:</strong> Start med at vælge den ønskede type session fra listen nedenfor. Du kan vælge sessioner baseret på varighed,
                    tema eller din aktuelle stemning.
                  </li>
                  <li>
                    <strong>Afspil session:</strong> Når du har valgt en session, tryk på 'Afspil'. Lydfilen begynder at spille automatisk. Læg eller sæt dig
                    godt til rette, luk øjnene og lyt til din MindSpace guide
                  </li>
                  <li>
                    <strong>Automatisk retur:</strong> Sessionen afsluttes automatisk. Vi vil meget gerne have din feedback bagefter!
                  </li>
                </ul>
              </div>

              <p className="text-center font-medium">Vi håber, du finder disse sessioner gavnlige og berigende. God fornøjelse!</p>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="grid gap-4">
          <Button
            size="lg"
            className="w-full h-16 text-lg bg-[#2F4A3E] hover:bg-[#3a5a4b] border-2 border-[#2F4A3E]"
            onClick={() => setLocation('/duration/energy')}
          >
            <Sun className="w-6 h-6 mr-2" />
            Energi Boost
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-2 border-[#384c44] text-[#384c44] hover:bg-[#384c44] hover:text-white"
            onClick={() => setLocation('/duration/relaxation')}
          >
            <Moon className="w-6 h-6 mr-2" />
            Afslapning
          </Button>
        </div>
      </div>
    </div>
  );
}
