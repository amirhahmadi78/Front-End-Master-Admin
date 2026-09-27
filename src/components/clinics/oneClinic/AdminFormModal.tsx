import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  UserPlus,
  UserCog,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { createAdminSchema, editAdminSchema } from "../../../validation/admin.schema";
import type {
  IClinicAdmin,
  ICreateAdminPayload,
  AdminRole,
} from "../../../types/clinicDetails";
import {
  useCreateClinicAdmin,
  useUpdateClinicAdmin,
} from "../../../hooks/clinicDetails";

interface Props {
  open: boolean;
  onClose: () => void;
  clinicId: string;
  initialData?: IClinicAdmin | null;
}

type FormValues = ICreateAdminPayload;


const ROLE_LABELS: Record<AdminRole, string> = {
  Admin: "مدیر کل",
  internalManager: "مدیر داخلی",
  secretary: "منشی",
  accountant: "حسابدار",
};

const AdminFormModal: React.FC<Props> = ({
  open,
  onClose,
  clinicId,
  initialData,
}) => {
  const isEdit = !!initialData;
  const createMut = useCreateClinicAdmin(clinicId);
  const updateMut = useUpdateClinicAdmin(clinicId);

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(
      isEdit ? editAdminSchema : createAdminSchema
    ) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      role: "Admin",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          phone: initialData.phone,
          email: initialData.email,
          password: "",
          role: initialData.role,
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          password: "",
          role: "Admin",
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && initialData) {
        const { password, ...rest } = values;
        await updateMut.mutateAsync({
          adminId: initialData._id,
          payload: rest,
        });
      } else {
        await createMut.mutateAsync(values);
      }
      onClose();
    } catch {
      /* toast already shown */
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4!"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="relative bg-linear-to-l from-sky-500 via-cyan-500 to-teal-500 px-6! py-5!">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                {isEdit ? (
                  <UserCog className="h-6 w-6" />
                ) : (
                  <UserPlus className="h-6 w-6" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEdit ? "ویرایش مدیر" : "ثبت مدیر جدید"}
                </h2>
                <p className="text-xs text-white/80">
                  {isEdit
                    ? "اطلاعات مدیر را بروزرسانی کنید"
                    : "اطلاعات مدیر را وارد کنید"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute left-4 top-4 rounded-full p-2! text-white/90 transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-[70vh] space-y-5 overflow-y-auto px-6! py-6!"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2! block text-sm font-semibold text-slate-700">
                  نام
                </label>
                <input
                  {...register("firstName")}
                  className={`w-full rounded-xl border bg-slate-50 px-4! py-3! text-sm outline-none transition focus:bg-white focus:ring-4 ${
                    errors.firstName
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1! text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2! block text-sm font-semibold text-slate-700">
                  نام خانوادگی
                </label>
                <input
                  {...register("lastName")}
                  className={`w-full rounded-xl border bg-slate-50 px-4! py-3! text-sm outline-none transition focus:bg-white focus:ring-4 ${
                    errors.lastName
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1! text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2! flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Phone className="h-4 w-4 text-teal-500" />
                شماره موبایل
              </label>
              <input
                {...register("phone")}
                placeholder="09123456789"
                dir="ltr"
                className={`w-full rounded-xl border bg-slate-50 px-4! py-3! text-sm outline-none transition focus:bg-white focus:ring-4 ${
                  errors.phone
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                }`}
              />
              {errors.phone && (
                <p className="mt-1! text-xs text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2! flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Mail className="h-4 w-4 text-teal-500" />
                ایمیل
              </label>
              <input
                {...register("email")}
                placeholder="admin@clinic.com"
                dir="ltr"
                className={`w-full rounded-xl border bg-slate-50 px-4! py-3! text-sm outline-none transition focus:bg-white focus:ring-4 ${
                  errors.email
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                }`}
              />
              {errors.email && (
                <p className="mt-1! text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {!isEdit && (
              <div>
                <label className="mb-2! flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Lock className="h-4 w-4 text-teal-500" />
                  رمز عبور
                </label>
                <input
                  {...register("password")}
                  type="password"
                  dir="ltr"
                  className={`w-full rounded-xl border bg-slate-50 px-4! py-3! text-sm outline-none transition focus:bg-white focus:ring-4 ${
                    errors.password
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1! text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}

            {/* Role */}
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div>
                  <label className="mb-2! flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ShieldCheck className="h-4 w-4 text-teal-500" />
                    نقش
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => field.onChange(r)}
                        className={`rounded-xl border px-3! py-3! text-sm font-semibold transition ${
                          field.value === r
                            ? "border-teal-400 bg-linear-to-l from-sky-50 to-teal-50 text-teal-700 ring-2 ring-teal-100"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-teal-200"
                        }`}
                      >
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6! py-4!">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5! py-2.5! text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={createMut.isPending || updateMut.isPending}
              className="flex items-center gap-2 rounded-xl bg-linear-to-l from-sky-500 via-cyan-500 to-teal-500 px-6! py-2.5! text-sm font-bold text-white shadow-lg shadow-cyan-200/60 transition hover:shadow-cyan-300 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isEdit ? "ذخیره تغییرات" : "ثبت مدیر"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminFormModal;