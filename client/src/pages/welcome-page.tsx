import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* App Logo */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-primary rounded-full transform -translate-y-4 scale-125" />
          <img
            src="/logo.webp"
            alt="NSDR App Logo"
            className="h-24 mx-auto mb-4 relative z-10"
          />
          <h1 className="text-4xl font-bold text-white relative z-10 mb-8">
            Mindful NSDR by TrustCulture
          </h1>
        </div>

        {/* Welcome Text */}
        <Card className="border-2 border-[#384c44]">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-[#384c44] mb-4 text-center">Velkommen til NSDR App</h2>
            
            <div className="space-y-4 text-[#667c73]">
              <p>
                Vores app er designet til at guide dig gennem forskellige lydbaserede sessioner, der hjælper med afslapning og mental klarhed. Her kan du vælge mellem forskellige typer sessioner tilpasset dine behov. Hver session er omhyggeligt sammensat for at fremme dyb afspænding og forbedre din mentale velvære.
              </p>

              <div>
                <h3 className="text-lg font-semibold text-[#384c44] mb-2">Sådan bruger du appen:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Vælg session:</strong> Start med at vælge den ønskede type session fra listen nedenfor. Du kan vælge sessioner baseret på varighed, tema eller din aktuelle stemning.</li>
                  <li><strong>Afspil session:</strong> Når du har valgt en session, tryk på 'Afspil'. Lydfilen begynder at spille automatisk. Læn dig tilbage, luk øjnene, og lad lydene lede dig.</li>
                  <li><strong>Automatisk retur:</strong> Efter sessionen afsluttes automatisk, vil appen bringe dig tilbage til denne hovedmenu, så du nemt kan vælge en ny session eller gentage processen efter behov.</li>
                </ul>
              </div>

              <p className="text-center font-medium">
                Vi håber, du finder disse sessioner gavnlige og berigende. God fornøjelse!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="grid gap-4">
          <Button
            size="lg"
            className="w-full h-16 text-lg bg-[#384c44] hover:bg-[#667c73] border-2 border-[#384c44]"
            onClick={() => setLocation("/duration/energy")}
          >
            <Sun className="w-6 h-6 mr-2" />
            Energi Boost
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-2 border-[#384c44] text-[#384c44] hover:bg-[#384c44] hover:text-white"
            onClick={() => setLocation("/duration/relaxation")}
          >
            <Moon className="w-6 h-6 mr-2" />
            Afslapning
          </Button>
        </div>
      </div>
    </div>
  );
}