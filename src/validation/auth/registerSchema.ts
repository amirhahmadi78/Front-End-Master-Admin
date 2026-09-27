import * as yup from 'yup';
import type { AdminRole } from '../../types/auth';

const THERAPIST_ROLES: AdminRole[] = ["internalManager" , "admin" ,"secretary"];

export const registerSchema = yup.object({
  phone: yup
    .string()
    .required('شماره موبایل الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
  password: yup.string().required('رمز عبور الزامی است').min(6, 'رمز عبور حداقل باید ۶ کاراکتر باشد'),
  confirmPassword: yup
    .string()
    .required('تکرار رمز عبور الزامی است')
    .oneOf([yup.ref('password')], 'تکرار رمز عبور درست نیست'),
  firstName: yup.string().required('نام الزامی است'),
  lastName: yup.string().required('نام خانوادگی الزامی است'),
  role: yup
    .mixed<AdminRole>()
    .oneOf(THERAPIST_ROLES, 'نقش معتبر نیست')
    .required('نقش معتبر نیست'),
  acceptTerms: yup.boolean().oneOf([true], 'پذیرش قوانین الزامی است').required('پذیرش قوانین الزامی است'),
});

