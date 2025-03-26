import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createFeedback, getWellbeingOptions } from "@/lib/supabase";

interface FeedbackFormProps {
  meditationId: number;
  onComplete: () => void;
}

export function FeedbackForm({ meditationId, onComplete }: FeedbackFormProps) {
  const { toast } = useToast();

  // Fetch wellbeing options from the database
  const { data: wellbeingOptions, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['/api/wellbeing-options'],
    queryFn: getWellbeingOptions
  });

  const feedbackMutation = useMutation({
    mutationFn: async (wellbeingChange: number) => {
      return await createFeedback({
        storage_object_id: meditationId, // Now expecting a storage object UUID
        wellbeing_change: wellbeingChange,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoadingOptions) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#384c44]">
            Hvordan har din mentale trivsel ændret sig efter NSDR-meditationen sammenlignet med før sessionen?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {wellbeingOptions?.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                className="h-16 text-lg border-2 border-[#384c44] text-[#384c44] hover:bg-[#384c44] hover:text-white"
                onClick={() => feedbackMutation.mutate(option.value)}
                disabled={feedbackMutation.isPending}
              >
                {feedbackMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}