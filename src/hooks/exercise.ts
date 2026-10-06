import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  DeleteExercise,
  FindExerciseById,
  FindExercises,
  PatchUpdateExercise,
  PostCreateExercise,
} from "../services/exercise";

import type {
  CreateExerciseDTO,
  DTOFindExercises,
  IExercise,
  UpdateExerciseDTO,
} from "../types/exercises";

interface UpdateExerciseMutationPayload {
  id: string;
  data: UpdateExerciseDTO;
}

export const useFindExercises = (
  query?: DTOFindExercises,
) => {
  return useQuery({
    queryKey: ["exerciseslist", query],
    queryFn: () => FindExercises(query),
    initialData: [],
  });
};

export const useFindExerciseById = (
id?: string, p0?: { enabled: boolean; },
) => {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: () => FindExerciseById(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      query: CreateExerciseDTO,
    ) => PostCreateExercise(query),

    onSuccess: (data) => {
      queryClient.setQueriesData<IExercise[]>(
        {
          queryKey: ["exerciseslist"],
        },
        (oldData) => {
          if (!oldData) {
            return [data];
          }

          return [data, ...oldData];
        },
      );
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: UpdateExerciseMutationPayload) =>
      PatchUpdateExercise(id, data),

    onSuccess: (data) => {
      queryClient.setQueryData<IExercise>(
        ["exercise", data._id],
        data,
      );

      queryClient.setQueriesData<IExercise[]>(
        {
          queryKey: ["exerciseslist"],
        },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return oldData.map((exercise) =>
            exercise._id === data._id
              ? data
              : exercise,
          );
        },
      );
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      DeleteExercise(id),

    onSuccess: (_, deletedId) => {
      queryClient.setQueriesData<IExercise[]>(
        {
          queryKey: ["exerciseslist"],
        },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return oldData.filter(
            (exercise) =>
              exercise._id !== deletedId,
          );
        },
      );

      queryClient.removeQueries({
        queryKey: ["exercise", deletedId],
      });
    },
  });
};
