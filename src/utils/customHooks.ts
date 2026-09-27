import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";

class ReactQueryService {
  // ----------- 1) GET QUERY -----------
  GetQuery<TData, TError = unknown>(
    KEY: QueryKey,
    FN: () => Promise<TData>,
    OTHERS: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> = {}
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery<TData, TError>({
      queryKey: KEY,
      queryFn: FN,
      ...OTHERS,
    });
  }

  // ----------- 2) MUTATION -----------
  GetMutation<TData, TVariables = void, TError = unknown>(
    FN: (vars: TVariables) => Promise<TData>,
    OTHERS: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn"> = {}
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation<TData, TError, TVariables>({
      mutationFn: FN,
      ...OTHERS,
    });
  }
}

export const QueryService = new ReactQueryService();
