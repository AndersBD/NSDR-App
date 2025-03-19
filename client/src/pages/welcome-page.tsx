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
          <div className="absolute inset-0 bg-[#384c44] rounded-full transform -translate-y-4 scale-125 opacity-10" />
          <img
            src="/logo.webp"
            alt="NSDR App Logo"
            className="h-24 mx-auto mb-4 relative z-10"
          />
          <h1 className="text-4xl font-bold text-[#384c44]">
            NSDR App
          </h1>
        </div>

        {/* Welcome Text */}
        <Card className="border-2 border-[#384c44]">
          <CardContent className="p-6 text-center">
            <p className="text-lg text-[#667c73]">
              Velkommen til NSDR App. Vælg den type session, du ønsker at starte.
            </p>
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