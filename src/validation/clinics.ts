import * as yup from "yup";

export const createClinicSchema = yup.object({
  name: yup
    .string()
    .required("نام کلینیک الزامی است")
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام حداکثر ۱۰۰ کاراکتر"),

  domain: yup
    .array()
    .of(
      yup
        .string()
        .required("دامنه الزامی است")
        // .matches(
        //   /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/,
        //   "دامنه معتبر نیست (مثال: clinic.example.com)"
        // )
    )
    .min(1, "حداقل یک دامنه وارد کنید")
    .required("دامنه الزامی است"),

  mongoName: yup
    .string()
    .required("نام دیتابیس الزامی است")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "فقط حروف، اعداد، _ و - مجاز است"
    )
    .max(64, "حداکثر ۶۴ کاراکتر"),

  mongoURL: yup
    .string()
    .required("آدرس Mongo الزامی است")
    .matches(/^mongodb(\+srv)?:\/\/.+/, "آدرس Mongo معتبر نیست"),

  active: yup.boolean().default(true),
});

export const updateClinicSchema = createClinicSchema.partial();
export const editClinicSchema = createClinicSchema; // برای فرم ویرایش