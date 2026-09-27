import * as yup from "yup";
import { AdminRole } from "../types/clinicDetails";

export const createAdminSchema = yup.object({
  firstName: yup
    .string()
    .required("نام الزامی است")
    .min(2, "حداقل ۲ کاراکتر")
    .max(50, "حداکثر ۵۰ کاراکتر"),

  lastName: yup
    .string()
    .required("نام خانوادگی الزامی است")
    .min(2, "حداقل ۲ کاراکتر")
    .max(50, "حداکثر ۵۰ کاراکتر"),

  phone: yup
    .string()
    .required("شماره موبایل الزامی است")
    .matches(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09123456789)"),

  email: yup
    .string()
    .required("ایمیل الزامی است")
    .email("فرمت ایمیل صحیح نیست"),

  password: yup
    .string()
    .required("رمز عبور الزامی است")
    .min(6, "حداقل ۶ کاراکتر"),

  role: yup
    .string()
    .oneOf(AdminRole, "نقش معتبر نیست")
    .required("نقش الزامی است"),
});

export const editAdminSchema = createAdminSchema.shape({
  password: yup.string().notRequired(),
});