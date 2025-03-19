import { useQuery } from "@tanstack/react-query";
import { Meditation } from "@shared/schema";
import { AudioPlayer } from "@/components/audio-player";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: meditations, isLoading } = useQuery<Meditation[]>({
    queryKey: ["/api/meditations"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Meditation App</h1>
          {user?.isAdmin && (
            <Button variant="outline" onClick={() => setLocation("/admin")}>
              Admin Panel
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8">
        <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
          <div className="grid gap-4">
            {meditations?.map((meditation) => (
              <Card key={meditation.id}>
                <CardContent className="p-4">
                  <AudioPlayer meditation={meditation} />
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
