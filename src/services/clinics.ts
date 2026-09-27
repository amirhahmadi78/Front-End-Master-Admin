import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";
import type {
  IApiResponse,
  IClinic,
  IClinicQuery,
  ICreateClinicPayload,
  IUpdateClinicPayload,
} from "../types/clinics";

export const getAllClinics = async (
  query?: IClinicQuery
): Promise<IApiResponse<IClinic[]>> => {
  try {
    const res = await apiClient.get<IApiResponse<IClinic[]>>("/clinics", {
      params: query,
    });
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت لیست کلینیک‌ها!");
    throw error;
  }
};

export const getClinicById = async (
  id: string
): Promise<IApiResponse<IClinic>> => {
  try {
    const res = await apiClient.get<IApiResponse<IClinic>>(`/clinics/${id}`);
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت اطلاعات کلینیک!");
    throw error;
  }
};

export const getClinicByDomain = async (
  domain: string
): Promise<IApiResponse<IClinic>> => {
  try {
    const res = await apiClient.get<IApiResponse<IClinic>>(
      `/clinics/domain/${domain}`
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "کلینیکی با این دامنه یافت نشد!");
    throw error;
  }
};

export const createClinic = async (
  payload: ICreateClinicPayload
): Promise<IApiResponse<IClinic>> => {
  try {
    const res = await apiClient.post<IApiResponse<IClinic>>(
      "/clinics",
      payload
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در ایجاد کلینیک جدید!");
    throw error;
  }
};

export const updateClinic = async (
  id: string,
  payload: IUpdateClinicPayload
): Promise<IApiResponse<IClinic>> => {
  try {
    const res = await apiClient.patch<IApiResponse<IClinic>>(
      `/clinics/${id}`,
      payload
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در ویرایش کلینیک!");
    throw error;
  }
};

export const toggleClinicActive = async (
  id: string,
  active: boolean
): Promise<IApiResponse<IClinic>> => {
  try {
    const res = await apiClient.patch<IApiResponse<IClinic>>(
      `/clinics/${id}/toggle-active`,
      { active }
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در تغییر وضعیت کلینیک!");
    throw error;
  }
};

export const deleteClinic = async (
  id: string
): Promise<IApiResponse<null>> => {
  try {
    const res = await apiClient.delete<IApiResponse<null>>(`/clinics/${id}`);
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در حذف کلینیک!");
    throw error;
  }
};