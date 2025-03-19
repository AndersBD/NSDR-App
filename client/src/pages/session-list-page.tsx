import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Meditation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SessionListPage() {
  const { type, duration } = useParams();
  const [, setLocation] = useLocation();
  const { data: meditations, isLoading } = useQuery<Meditation[]>({
    queryKey: ["/api/meditations"],
  });

  const filteredMeditations = meditations?.filter((meditation) => {
    const durationInMinutes = Math.floor(meditation.duration / 60);
    return durationInMinutes.toString() === duration;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation(`/duration/${type}`)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Tilbage
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Vælg NSDR-session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-center text-muted-foreground">
                    Indlæser sessioner...
                  </p>
                ) : filteredMeditations?.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    Ingen sessioner fundet for den valgte varighed
                  </p>
                ) : (
                  filteredMeditations?.map((meditation) => (
                    <Button
                      key={meditation.id}
                      variant="outline"
                      className="w-full h-16 justify-between"
                      onClick={() => setLocation(`/play/${meditation.id}`)}
                    >
                      <span className="text-lg">{meditation.title}</span>
                      <Play className="w-5 h-5" />
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
