import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Save,
  Building2,
  Globe,
  Database,
  Link2,
} from "lucide-react";
import { createClinicSchema } from "../../validation/clinics";
import type {
  IClinic,
  ICreateClinicPayload,
} from "../../types/clinics";
import { useCreateClinic, useUpdateClinic } from "../../hooks/clinics";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: IClinic | null;
}

type FormValues = ICreateClinicPayload;

const ClinicFormModal: React.FC<Props> = ({ open, onClose, initialData }) => {
  const isEdit = !!initialData;
  const createMut = useCreateClinic();
  const updateMut = useUpdateClinic();

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(createClinicSchema) as any,
    defaultValues: {
      name: "",
      domain: [""],
      mongoName: "",
      mongoURL: "",
      active: true,
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "domain" as never,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          domain: initialData.domain.length ? initialData.domain : [""],
          mongoName: initialData.mongoName,
          mongoURL: initialData.mongoURL,
          active: initialData.active,
        });
      } else {
        reset({
          name: "",
          domain: [""],
          mongoName: "",
          mongoURL: "",
          active: true,
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload: ICreateClinicPayload = {
      ...values,
      domain: values.domain.map((d) => d.trim()).filter(Boolean),
    };

    try {
      if (isEdit && initialData) {
        await updateMut.mutateAsync({ id: initialData._id, payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      onClose();
    } catch {

      
      /* errors already toasted */
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
        {/* backdrop */}
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
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEdit ? "ویرایش کلینیک" : "ایجاد کلینیک جدید"}
                </h2>
                <p className="text-xs text-white/80">
                  {isEdit
                    ? "اطلاعات کلینیک را بروزرسانی کنید"
                    : "اطلاعات کلینیک را وارد کنید"}
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
            {/* name */}
            <div>
              <label className="mb-2! flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Building2 className="h-4 w-4 text-teal-500" />
                نام کلینیک
              </label>
              <input
                {...register("name")}
                placeholder="مثلاً کلینیک سلامت مهر"
                className={`w-full rounded-xl border bg-slate-50 px-4! py-3! text-sm outline-none transition focus:bg-white focus:ring-4 ${
                  errors.name
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                }`}
              />
              {errors.name && (
                <p className="mt-1! text-xs text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* domain dynamic */}
            <div>
              <div className="mb-2! flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Globe className="h-4 w-4 text-teal-500" />
                  دامنه‌ها
                </label>
                <button
                  type="button"
                  onClick={() => append("" as never)}
                  className="flex items-center gap-1 rounded-lg bg-sky-50 px-3! py-1.5! text-xs font-medium text-sky-600 transition hover:bg-sky-100"
                >
                  <Plus className="h-3.5 w-3.5" /> افزودن دامنه
                </button>
              </div>

              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        {...register(`domain.${idx}` as const)}
                        placeholder="clinic.example.com"
                        dir="ltr"
                        className={`w-full rounded-xl border bg-slate-50 px-4! py-3! text-sm outline-none transition focus:bg-white focus:ring-4 ${
                          (errors.domain as any)?.[idx]
                            ? "border-red-300 focus:ring-red-100"
                            : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"
                        }`}
                      />
                      {(errors.domain as any)?.[idx] && (
                        <p className="mt-1! text-xs text-red-500">
                          {(errors.domain as any)[idx]?.message}
                        </p>
                      )}
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="rounded-xl border border-red-100 bg-red-50 p-3! text-red-500 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* mongoName */}
            <div>
              <label className="mb-2! flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Database className="h-4 w-4 text-teal-500" />
                نام دیتابیس (mongoName)
              </label>
              <input
                {...register("mongoName")}
                placeholder="clinic_mehr_db"
                dir="ltr"
                className={`w-full rounded-xl border bg-slate-50 px-4! py-3! text-sm outline-none transition focus:bg-white focus:ring-4 ${
                  errors.mongoName
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                }`}
              />
              {errors.mongoName && (
                <p className="mt-1! text-xs text-red-500">
                  {errors.mongoName.message}
                </p>
              )}
            </div>

            {/* mongoURL */}
            <div>
              <label className="mb-2! flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Link2 className="h-4 w-4 text-teal-500" />
                آدرس اتصال Mongo (mongoURL)
              </label>
              <input
                {...register("mongoURL")}
                placeholder="mongodb://localhost:27017/clinic_mehr_db"
                dir="ltr"
                className={`w-full rounded-xl border bg-slate-50 px-4! py-3! text-sm outline-none transition focus:bg-white focus:ring-4 ${
                  errors.mongoURL
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                }`}
              />
              {errors.mongoURL && (
                <p className="mt-1! text-xs text-red-500">
                  {errors.mongoURL.message}
                </p>
              )}
            </div>

            {/* active */}
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4! py-3!">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      وضعیت کلینیک
                    </p>
                    <p className="text-xs text-slate-500">
                      کلینیک فعال برای کاربران قابل استفاده است
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative h-7 w-12 rounded-full transition ${
                      field.value ? "bg-teal-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        field.value ? "right-1" : "right-6"
                      }`}
                    />
                  </button>
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
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-linear-to-l from-sky-500 via-cyan-500 to-teal-500 px-6! py-2.5! text-sm font-bold text-white shadow-lg shadow-cyan-200/60 transition hover:shadow-cyan-300 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isEdit ? "ذخیره تغییرات" : "ایجاد کلینیک"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClinicFormModal;