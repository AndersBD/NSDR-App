import { feedbackService, SubmitFeedbackParams } from '@/services/feedbackService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useFeedback() {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: feedbackService.getFeedback,
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitFeedbackParams) => feedbackService.submitFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}
