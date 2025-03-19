import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logo */}
      <header className="w-full bg-primary p-4">
        <div className="container mx-auto flex justify-center">
          <img
            src="/V1 - Symbol - OFFWHITE.webp"
            alt="Trust Culture Logo"
            className="h-16 w-16"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8">
          {/* Welcome Text */}
          <Card className="border-2">
            <CardContent className="p-6 text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">
                NSDR App
              </h1>
              <p className="text-lg text-muted-foreground">
                Velkommen til NSDR App. Vælg den type session, du ønsker at starte.
              </p>
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="grid gap-4">
            <Button
              size="lg"
              className="w-full h-16 text-lg bg-primary hover:bg-primary/90"
              onClick={() => setLocation("/duration/energy")}
            >
              <Sun className="w-6 h-6 mr-2" />
              Energi Boost
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg border-primary text-primary hover:bg-primary/10"
              onClick={() => setLocation("/duration/relaxation")}
            >
              <Moon className="w-6 h-6 mr-2" />
              Afslapning
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}