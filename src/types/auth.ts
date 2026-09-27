
export type AdminRole = "internalManager"|"admin"|"secretary"

export interface LoginFormData {
  phone: string;
  password: string;
  role: TherapistRole;
  rememberMe: boolean;
}

export interface AuthUser {
  /** Primary user id used across frontend code. */
  _id: string ;
  /** Backward-compat for some endpoints (optional). */
  id?: string | number;
  // مطابق بک‌اند: نوع مدل کاربر
  modeluser: 'Therapist' 

  // مطابق بک‌اند: نقش (برای درمانگر نقش حرفه‌ای مثل OT/SLP/...)
  role: TherapistRole | string;

  fullName: string;
  
  phone: string;

  username?: string;
}

export type LoginRequestDto = {
  phone: string;
  password: string;
};


export const TherapistRole = ["super"] as const;
export type TherapistRole = (typeof TherapistRole)[number];
// برای فرم ثبت‌نام (منطبق با RegisterRequestDto بک‌اند)
export interface RegisterRequestDto {
  phone: string;
  password: string;
  fullName: string;

  role: TherapistRole;
}

// فرم ثبت‌نام در فرانت (فیلدهای کمکی فقط برای UI)
export interface RegisterFormData extends RegisterRequestDto {
  confirmPassword: string;
  acceptTerms: boolean;
}
