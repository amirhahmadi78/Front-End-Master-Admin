import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClinic,
  deleteClinic,
  getAllClinics,
  getClinicById,
  updateClinic,
  toggleClinicActive,
} from "../services/clinics";
import type {
  IClinic,
  IClinicQuery,
  ICreateClinicPayload,
  IUpdateClinicPayload,
} from "../types/clinics";
import { AlertSwal } from "../utils/errorSwal";

export const CLINICS_KEY = "clinics";

/* -------------------- Queries -------------------- */



/* -------------------- Queries -------------------- */

export const useListClinics = (query?: IClinicQuery) => {
  return useQuery({
    queryKey: [CLINICS_KEY, query],
    queryFn: () => getAllClinics(query),
    initialData: { success: true, data: [] as IClinic[] },
    select: (res) => res.data ?? [],
  });
};

export const useClinicById = (id?: string) => {
  return useQuery({
    queryKey: [CLINICS_KEY, "single", id],
    queryFn: () => getClinicById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
};

/* -------------------- Mutations -------------------- */

export const useCreateClinic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICreateClinicPayload) => createClinic(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLINICS_KEY] });
      AlertSwal.succes("کلینیک جدید با موفقیت ایجاد شد ✅");
    },
  });
};

export const useUpdateClinic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IUpdateClinicPayload;
    }) => updateClinic(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLINICS_KEY] });
      AlertSwal.succes("تغییرات با موفقیت ذخیره شد ✅");
    },
  });
};

export const useToggleClinicActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      toggleClinicActive(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLINICS_KEY] });
      AlertSwal.succes("وضعیت کلینیک بروزرسانی شد");
    },
  });
};

export const useDeleteClinic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClinic(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLINICS_KEY] });
      AlertSwal.succes("کلینیک حذف شد");
    },
  });
};
