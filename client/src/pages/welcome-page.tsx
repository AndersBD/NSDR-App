import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* App Logo */}
        <div className="text-center">
          <img
            src="/Logo.webp"
            alt="NSDR App Logo"
            className="h-24 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent">
            NSDR App
          </h1>
        </div>

        {/* Welcome Text */}
        <Card className="border-2">
          <CardContent className="p-6 text-center">
            <p className="text-lg text-muted-foreground">
              Velkommen til NSDR App. Vælg den type session, du ønsker at starte.
            </p>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="grid gap-4">
          <Button
            size="lg"
            className="w-full h-16 text-lg"
            onClick={() => setLocation("/duration/energy")}
          >
            <Sun className="w-6 h-6 mr-2" />
            Energi Boost
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg"
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