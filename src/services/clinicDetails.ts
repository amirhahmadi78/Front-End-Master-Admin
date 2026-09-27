import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";
import type {
  IApiResponse,
  IClinicAdmin,
  IClinicStats,
  ICreateAdminPayload,
  IUpdateAdminPayload,
} from "../types/clinicDetails";

/* ⚠️ همه‌ی ریکوئست‌ها clinicId رو به‌عنوان query می‌فرستن
   تا بک‌اند بتونه دیتابیس همون کلینیک رو resolve کنه */

export const getClinicStats = async (
  clinicId: string
): Promise<IApiResponse<IClinicStats>> => {
  try {
    const res = await apiClient.get<IApiResponse<IClinicStats>>(
      `/clinicadmin/${clinicId}/stats`,
      { params: { clinicId } }
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت آمار کلینیک!");
    throw error;
  }
};

export const getClinicAdmins = async (
  clinicId: string
): Promise<IApiResponse<IClinicAdmin[]>> => {
  try {
    const res = await apiClient.get<IApiResponse<IClinicAdmin[]>>(
      `/clinicadmin/${clinicId}/admins`,
      { params: { clinicId } }
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت لیست مدیران!");
    throw error;
  }
};

export const createClinicAdmin = async (
  clinicId: string,
  payload: ICreateAdminPayload
): Promise<IApiResponse<IClinicAdmin>> => {
  try {
    const res = await apiClient.post<IApiResponse<IClinicAdmin>>(
      `/clinicadmin/${clinicId}/admins`,
      payload,
      { params: { clinicId } }
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در ثبت مدیر جدید!");
    throw error;
  }
};

export const updateClinicAdmin = async (
  clinicId: string,
  adminId: string,
  payload: IUpdateAdminPayload
): Promise<IApiResponse<IClinicAdmin>> => {
  try {
    const res = await apiClient.patch<IApiResponse<IClinicAdmin>>(
      `/clinicadmin/${clinicId}/admins/${adminId}`,
      payload,
      { params: { clinicId } }
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در ویرایش مدیر!");
    throw error;
  }
};

export const deleteClinicAdmin = async (
  clinicId: string,
  adminId: string
): Promise<IApiResponse<null>> => {
  try {
    const res = await apiClient.delete<IApiResponse<null>>(
      `/clinicadmin/${clinicId}/admins/${adminId}`,
      { params: { clinicId } }
    );
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در حذف مدیر!");
    throw error;
  }
};