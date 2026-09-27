export interface IClinic {
  _id: string;
  name: string;
  domain: string[];
  mongoName: string;
  mongoURL: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateClinicPayload {
  name: string;
  domain: string[];
  mongoName: string;
  mongoURL: string;
  active?: boolean;
}

export type IUpdateClinicPayload = Partial<ICreateClinicPayload>

export interface IClinicQuery {
  active?: boolean;
  search?: string;
}

export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}