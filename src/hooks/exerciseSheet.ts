import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  DeleteExerciseSheet,
  FindExerciseSheetById,
  FindExerciseSheets,
  PatchUpdateExerciseSheet,
  PostCreateExerciseSheet,
} from "../services/exerciseSheet";

import type {
  CreateExerciseSheetDTO,
  DTOFindExerciseSheets,
  IExerciseSheet,
  IExerciseSheetListResponse,
  UpdateExerciseSheetDTO,
} from "../types/exerciseSheets";

interface UpdateExerciseSheetMutationPayload {
  id: string;
  data: UpdateExerciseSheetDTO;
}

const exerciseSheetListKey = ["exerciseSheetsList"] as const;

export const useFindExerciseSheets = (
  query?: DTOFindExerciseSheets,
) => {
  return useQuery({
    queryKey: [...exerciseSheetListKey, query],
    queryFn: () => FindExerciseSheets(query),
    placeholderData: (previousData) => previousData,
  });
};

export const useFindExerciseSheetById = (id?: string) => {
  return useQuery({
    queryKey: ["exerciseSheet", id],
    queryFn: () => FindExerciseSheetById(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateExerciseSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExerciseSheetDTO) =>
      PostCreateExerciseSheet(data),

    onSuccess: (data) => {
      queryClient.setQueryData(
        ["exerciseSheet", data._id],
        data,
      );

      queryClient.setQueriesData<IExerciseSheetListResponse>(
        { queryKey: exerciseSheetListKey },
        (oldData) => {
          if (!oldData) return oldData;

          const newData = [data, ...oldData.data];

          return {
            ...oldData,
            data: newData.slice(0, oldData.limit),
            total: oldData.total + 1,
            totalPages: Math.ceil(
              (oldData.total + 1) / oldData.limit,
            ),
          };
        },
      );
    },
  });
};

export const useUpdateExerciseSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: UpdateExerciseSheetMutationPayload) =>
      PatchUpdateExerciseSheet(id, data),

    onSuccess: (data) => {
      queryClient.setQueryData(
        ["exerciseSheet", data._id],
        data,
      );

      queryClient.setQueriesData<IExerciseSheetListResponse>(
        { queryKey: exerciseSheetListKey },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((sheet) =>
              sheet._id === data._id ? data : sheet,
            ),
          };
        },
      );
    },
  });
};

export const useDeleteExerciseSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DeleteExerciseSheet(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: ["exerciseSheet", id],
      });

      queryClient.setQueriesData<IExerciseSheetListResponse>(
        { queryKey: exerciseSheetListKey },
        (oldData) => {
          if (!oldData) return oldData;

          const newData = oldData.data.filter(
            (sheet) => sheet._id !== id,
          );

          return {
            ...oldData,
            data: newData,
            total: Math.max(0, oldData.total - 1),
            totalPages: Math.max(
              1,
              Math.ceil(
                Math.max(0, oldData.total - 1) / oldData.limit,
              ),
            ),
          };
        },
      );
    },
  });
};
