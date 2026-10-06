import apiClient from "../api/client";

import type {
  CreateExerciseSheetDTO,
  DTOFindExerciseSheets,
  IExerciseSheet,
  IExerciseSheetListResponse,
  UpdateExerciseSheetDTO,
} from "../types/exerciseSheets";

import { AlertSwal } from "../utils/errorSwal";

export const FindExerciseSheets = async (
  query?: DTOFindExerciseSheets,
): Promise<IExerciseSheetListResponse> => {
  try {
    const res = await apiClient.get("/global/exercise-sheets", {
      params: query,
    });

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در دریافت لیست برگه‌های تمرین!",
    );

    throw error;
  }
};

export const FindExerciseSheetById = async (
  id: string,
): Promise<IExerciseSheet> => {
  try {
    const res = await apiClient.get(
      `/global/exercise-sheets/${id}`,
    );

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در دریافت برگه تمرین!",
    );

    throw error;
  }
};

export const PostCreateExerciseSheet = async (
  query: CreateExerciseSheetDTO,
): Promise<IExerciseSheet> => {
  try {
    const res = await apiClient.post(
      "/global/exercise-sheets",
      query,
    );

    AlertSwal.succes(
      "برگه تمرین با موفقیت ایجاد شد!",
    );

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در ایجاد برگه تمرین!",
    );

    throw error;
  }
};

export const PatchUpdateExerciseSheet = async (
  id: string,
  query: UpdateExerciseSheetDTO,
): Promise<IExerciseSheet> => {
  try {
    const res = await apiClient.patch(
      `/global/exercise-sheets/${id}`,
      query,
    );

    AlertSwal.succes(
      "برگه تمرین با موفقیت ویرایش شد!",
    );

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در ویرایش برگه تمرین!",
    );

    throw error;
  }
};

export const DeleteExerciseSheet = async (
  id: string,
): Promise<{ message: string }> => {
  try {
    const res = await apiClient.delete(
      `/global/exercise-sheets/${id}`,
    );

    AlertSwal.succes(
      "برگه تمرین با موفقیت حذف شد!",
    );

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در حذف برگه تمرین!",
    );

    throw error;
  }
};
