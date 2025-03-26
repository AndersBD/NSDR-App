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

  // Filter meditations based on duration
  const filteredMeditations = meditations?.filter((meditation) => {
    const durationInMinutes = Math.floor(meditation.duration / 60);
    return durationInMinutes.toString() === duration &&
           !meditation.fileName.includes('emptyFolderPlaceholder');
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
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
              <div className="grid grid-cols-2 gap-4">
                {isLoading ? (
                  <p className="text-center text-muted-foreground col-span-2">
                    Indlæser sessioner...
                  </p>
                ) : filteredMeditations?.length === 0 ? (
                  <p className="text-center text-muted-foreground col-span-2">
                    Ingen sessioner fundet for den valgte varighed
                  </p>
                ) : (
                  filteredMeditations?.map((meditation) => (
                    <Card
                      key={meditation.id}
                      className="overflow-hidden hover:border-[#384c44] transition-colors cursor-pointer"
                      onClick={() => setLocation(`/play/${meditation.id}`)}
                    >
                      <div className="aspect-video bg-[#384c44]/10 flex items-center justify-center">
                        <img
                          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${meditation.title}`}
                          alt={meditation.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4 flex items-center justify-between">
                        <h3 className="font-medium text-[#384c44]">
                          {meditation.title}
                        </h3>
                        <Play className="w-5 h-5 text-[#384c44]" />
                      </CardContent>
                    </Card>
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