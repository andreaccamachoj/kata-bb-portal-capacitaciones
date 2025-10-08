/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from '@/lib/api-client';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface FetchOptions<T> {
  resource: string; // Endpoint del recurso
  params?: Record<string, any>; // Parámetros opcionales para la consulta
  queryOptions?: UseQueryOptions<T>; // Opciones adicionales para React Query
}

export function useFetch<T>({ resource, params, queryOptions }: FetchOptions<T>) {
    console.log('useFetch called with:', { resource, params, queryOptions });
  return useQuery<T>({
    queryKey: [resource, params], // La clave de la query incluye el recurso y los parámetros
    queryFn: async () => {
      const { data } = await apiClient.get<T>(resource, { params });
      return data;
    },
    ...queryOptions
  });
}