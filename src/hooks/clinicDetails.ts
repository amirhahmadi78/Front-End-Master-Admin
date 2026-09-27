import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClinicAdmin,
  deleteClinicAdmin,
  getClinicAdmins,
  getClinicStats,
  updateClinicAdmin,
} from "../services/clinicDetails";
import type {
  IClinicAdmin,
  
  ICreateAdminPayload,
  IUpdateAdminPayload,
} from "../types/clinicDetails";
import { AlertSwal } from "../utils/errorSwal";

export const CLINIC_DETAIL_KEY = "clinic-detail";

/* -------------------- Queries -------------------- */

export const useClinicStats = (clinicId?: string) => {
  return useQuery({
    queryKey: [CLINIC_DETAIL_KEY, "stats", clinicId],
    queryFn: () => getClinicStats(clinicId!),
    enabled: !!clinicId,
    select: (res) => res.data,
  });
};

export const useClinicAdmins = (clinicId?: string) => {
  return useQuery({
    queryKey: [CLINIC_DETAIL_KEY, "admins", clinicId],
    queryFn: () => getClinicAdmins(clinicId!),
    enabled: !!clinicId,
    select: (res) => res.data ?? [],
    initialData: { success: true, data: [] as IClinicAdmin[] },
  });
};

/* -------------------- Mutations -------------------- */

export const useCreateClinicAdmin = (clinicId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICreateAdminPayload) =>
      createClinicAdmin(clinicId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLINIC_DETAIL_KEY, "admins", clinicId] });
      qc.invalidateQueries({ queryKey: [CLINIC_DETAIL_KEY, "stats", clinicId] });
      AlertSwal.succes("مدیر جدید با موفقیت ثبت شد ✅");
    },
  });
};

export const useUpdateClinicAdmin = (clinicId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      adminId,
      payload,
    }: {
      adminId: string;
      payload: IUpdateAdminPayload;
    }) => updateClinicAdmin(clinicId, adminId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLINIC_DETAIL_KEY, "admins", clinicId] });
      AlertSwal.succes("تغییرات مدیر ذخیره شد ✅");
    },
  });
};

export const useDeleteClinicAdmin = (clinicId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adminId: string) => deleteClinicAdmin(clinicId, adminId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLINIC_DETAIL_KEY, "admins", clinicId] });
      qc.invalidateQueries({ queryKey: [CLINIC_DETAIL_KEY, "stats", clinicId] });
      AlertSwal.succes("مدیر حذف شد");
    },
  });
};