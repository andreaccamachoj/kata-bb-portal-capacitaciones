import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  invalidateQueries?: string[];
}

export function useMutationWithAuth<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries = [],
}: MutationConfig<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: [query] });
      });

      // Ejecutar callback personalizado
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      // Ejecutar callback personalizado
      onError?.(error);
    },
  });
}