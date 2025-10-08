import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';

interface QueryConfig<TData> {
  url: string;
  queryKey: string[];
  select?: (data: any) => TData;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number | boolean;
  onError?: (error: Error) => void;
}

export function useQueryWithAuth<TData>({
  url,
  queryKey,
  select,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutos por defecto
  cacheTime = 10 * 60 * 1000, // 10 minutos por defecto
  retry = 1,
  onError,
}: QueryConfig<TData>) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get(url);
      return response.data;
    },
    select,
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry,
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar los datos.',
        variant: 'destructive',
      });
      onError?.(error);
    },
  });
}