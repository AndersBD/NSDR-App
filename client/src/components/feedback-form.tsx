import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { InsertFeedback } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackFormProps {
  meditationId: number;
  onComplete: () => void;
}

const WELLBEING_OPTIONS = [
  { value: -2, label: "Meget værre" },
  { value: -1, label: "Lidt værre" },
  { value: 0, label: "Ingen ændring" },
  { value: 1, label: "Lidt bedre" },
  { value: 2, label: "Meget bedre" },
];

export function FeedbackForm({ meditationId, onComplete }: FeedbackFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const feedbackMutation = useMutation({
    mutationFn: async (wellbeingChange: number) => {
      const feedback: InsertFeedback = {
        meditationId,
        wellbeingChange,
      };
      const res = await apiRequest("POST", "/api/feedback", feedback, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit feedback");
      }
      return res.json();
    },
    onSuccess: () => {
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
            {WELLBEING_OPTIONS.map((option) => (
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