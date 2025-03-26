import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, Loader2 } from "lucide-react";
import { getDurationFolders } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function DurationPage() {
  const [, setLocation] = useLocation();
  const { type } = useParams();
  const { toast } = useToast();

  const { data: folders, isLoading, error } = useQuery({
    queryKey: ['duration-folders'],
    queryFn: getDurationFolders,
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load meditation durations",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/")}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Tilbage
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Vælg Varighed</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : folders?.map((folder) => (
              <Button
                key={folder.duration}
                size="lg"
                className="w-full h-16 text-lg bg-white text-[#384c44] hover:bg-[#384c44] hover:text-white border-2 border-[#384c44] transition-colors"
                onClick={() => setLocation(`/sessions/${type}/${folder.duration}`)}
              >
                <Clock className="w-5 h-5 mr-2" />
                {folder.duration} min
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}