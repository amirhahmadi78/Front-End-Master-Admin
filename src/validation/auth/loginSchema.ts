import * as yup from 'yup';


export const loginSchema = yup.object({
  phone: yup
    .string()
    .required('شماره موبایل الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
  password: yup
    .string()
    .required('رمز عبور الزامی است')
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  
  rememberMe: yup.boolean().optional().default(false),
});