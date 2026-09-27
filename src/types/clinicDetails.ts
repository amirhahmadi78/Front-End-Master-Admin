
export const AdminRole=["internalManager","Admin","secretary","accountant"] as const
export type AdminRole=(typeof AdminRole)[number]
export interface IClinicAdmin {
  _id: string;
  modeluser: "Admin";
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clinicId: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface IClinicStats {
  mainAdmin: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  } | null;
  adminsCount: number;
  therapistsCount: number;
  patientsCount: number;
}

export interface ICreateAdminPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password?: string;
  role: AdminRole;
}

export interface IUpdateAdminPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  role?: AdminRole;
}

export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}