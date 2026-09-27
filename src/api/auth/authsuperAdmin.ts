import type { AuthUser, LoginRequestDto, RegisterRequestDto } from "../../types/auth";
import { AlertSwal } from "../../utils/errorSwal";
import apiClient from "../client";

function normalizeAuthUser(u: Record<string, unknown>): AuthUser | null {
  const _id = (u._id ?? u.id) as unknown;
  if (!(typeof _id === 'string' || typeof _id === 'number')) return null;
  if (
    typeof u.phone !== 'string' ||
    typeof u.fullName !== 'string' ||

    typeof u.role !== 'string'
  ) {
    return null;
  }
  const modeluser = u.modeluser;
  if (
    modeluser !== 'super' 

  ) {
    return null;
  }
  return { ...(u as unknown as AuthUser), _id } as AuthUser;
}

function extractUser(payload: unknown): AuthUser | null {
  if (payload && typeof payload === 'object') {
    const u = normalizeAuthUser(payload as Record<string, unknown>);
    if (u) return u;
  }
  if (!payload || typeof payload !== 'object') return null;
  const anyP = payload as Record<string, unknown>;
  const direct = anyP.user;
  if (direct && typeof direct === 'object') {
    const u = normalizeAuthUser(direct as Record<string, unknown>);
    if (u) return u;
  }
  const nested = (anyP.data as unknown) ?? null;
  if (nested && typeof nested === 'object') {
    const u = normalizeAuthUser(nested as Record<string, unknown>);
    if (u) return u;
  }
  return null;
}

export async function register(data: RegisterRequestDto): Promise<void> {
  await apiClient.post('/super/register', data);
}



export async function login(data: LoginRequestDto): Promise<AuthUser> {

  


  
  const res = await apiClient.post('/super/login', {
    phone: data.phone,
    password: data.password,
  });
  



  const fromLogin = extractUser(res.data);
  if (fromLogin) return fromLogin;
  return me();
}

/** POST /auth/therapist/logout */
export async function logout(): Promise<void> {
  await apiClient.post('/super/logout');
}

/** POST /auth/therapist/refresh */
export async function  refresh(): Promise<void> {
  await apiClient.post('/super/refresh');
}


export async function changePassWithPassword(oldPassword:string, newPassword:string) {
  try {
     const res=await apiClient.patch('/super/newpass',{oldPassword, newPassword});
     if(res.data.success==true){
      logout()
       AlertSwal.succes("رمز عبور با موفقیت تغییر یافت! لطفا مجدد وارد شوید!").then((x)=>{
       window.location.href = '/login';
            })
      return res.data
     }else {
          AlertSwal.backEndError(null,"خطا در تغییر رمز عبور")
     }
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در تغییر رمز عبور")
    throw error
  }
 
}

/** GET /auth/therapist/me */
export async function me(): Promise<AuthUser> {
  const res = await apiClient.get<AuthUser>('/super/me');
  const u = res.data as unknown as Record<string, unknown>;
  const normalized = normalizeAuthUser(u);
  if (normalized) return normalized;
  // last resort: trust backend shape
  return res.data;
}