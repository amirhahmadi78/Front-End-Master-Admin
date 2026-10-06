import { useEffect, useMemo, useState } from "react";

import { useFieldArray, useForm, type FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";

import {
  useCreateExerciseSheet,
  useFindExerciseSheetById,
  useUpdateExerciseSheet,
  useFindExerciseSheets,
} from "../../hooks/exerciseSheet";

import { useFindExercises } from "../../hooks/exercise";

import ExerciseSheetItemsSection from "./ExerciseSheetItemSection";
import {
  DomainSubdomainMap,
  THERAPY_DOMAINS,
  THERAPY_DOMAIN_LABELS,
  type TherapyDomain,
  type IDomainSelection,
} from "../../types/exerciseSheets";
import ExerciseSheetViewModal from "./ExerciseSheetViewModal";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ExerciseFileType = "image" | "audio";

export interface ExerciseSheetAdditionalFile {
  fileURLs: string;
  fileType: ExerciseFileType;
}

export interface ExerciseSheetItemFormValue {
  exercise?: string;
  note?: string;
  additionalFiles?: ExerciseSheetAdditionalFile[];
}

export interface ExerciseSheetFormValues {
  title: string;
  description?: string;
  domains: IDomainSelection[];
  isPublic: boolean;
  items: ExerciseSheetItemFormValue[];
  forPatient: boolean;
}

// -----------------------------------------------------------------------------
// Validation Schema
// -----------------------------------------------------------------------------

const exerciseSheetSchema: yup.ObjectSchema<ExerciseSheetFormValues> =
  yup.object({
    title: yup
      .string()
      .trim()
      .required("عنوان برگه تمرین الزامی است.")
      .min(1, "عنوان برگه تمرین الزامی است.")
      .max(200, "عنوان نباید بیشتر از ۲۰۰ کاراکتر باشد."),

    description: yup
      .string()
      .trim()
      .max(2000, "توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد.")
      .optional(),

    domains: yup
      .array()
      .of(
        yup.object({
          domain: yup
            .mixed<TherapyDomain>()
            .oneOf([...THERAPY_DOMAINS], "حیطه نامعتبر است.")
            .required("حیطه الزامی است."),
          subdomains: yup
            .array()
            .of(yup.string().required())
            .min(1, "حداقل یک زیرحیطه باید انتخاب شود.")
            .required("زیرحیطه الزامی است.")
            .test(
              "valid-subdomains",
              "یک یا چند زیرحیطه با حیطه انتخابی همخوانی ندارند.",
              function (subdomains) {
                const domain = this.parent.domain as TherapyDomain;
                if (!domain || !subdomains) return true;
                const allowed = DomainSubdomainMap[domain] || [];
                return subdomains.every((sub) => allowed.includes(sub));
              },
            ),
        }),
      )
      .min(1, "حداقل یک حیطه باید انتخاب شود.")
      .required("حداقل یک حیطه باید انتخاب شود.")
      .test("unique-domains", "حیطه تکراری مجاز نیست.", (value) => {
        if (!value) return true;
        const domains = value.map((d) => d.domain);
        return new Set(domains).size === domains.length;
      }),

    isPublic: yup.boolean().required(),
    forPatient: yup.boolean().required(),

    items: yup
      .array()
      .of(
        yup.object({
          exercise: yup.string().optional(),

          note: yup
            .string()
            .trim()
            .max(500, "یادداشت نباید بیشتر از ۵۰۰ کاراکتر باشد.")
            .optional(),

          additionalFiles: yup
            .array()
            .of(
              yup.object({
                fileURLs: yup.string().required("URL فایل الزامی است."),

                fileType: yup
                  .mixed<ExerciseFileType>()
                  .oneOf(["image", "audio"])
                  .required("نوع فایل الزامی است."),
              }),
            )
            .required()
            .default([]),
        }),
      )
      .min(1, "حداقل یک آیتم باید اضافه شود.")
      .required("حداقل یک آیتم باید اضافه شود."),
  });

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function ExerciseSheetFormPage({ isNew }: { isNew: boolean }) {
  const [selectedExistingSheetId, setSelectedExistingSheetId] =
    useState<string>("");

  const [existingSheetDomain, setExistingSheetDomain] =
    useState<TherapyDomain | "">("");

  const [existingSheetSubdomain, setExistingSheetSubdomain] =
    useState<string>("");

  const [sheetViewModal, setSheetViewModal] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const { data: existingSheetsResponse } = useFindExerciseSheets({
    limit: 100,
    withoutPatient: true,
  });
  const existingSheets = existingSheetsResponse?.data ?? [];

  const { data: exercises = [] } = useFindExercises();

  const { data: sheet, isLoading: isLoadingSheet } =
    useFindExerciseSheetById(id);

  const createMutation = useCreateExerciseSheet();
  const updateMutation = useUpdateExerciseSheet();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseSheetFormValues>({
    resolver: yupResolver(exerciseSheetSchema),
    defaultValues: {
      title: "",
      description: "",
      domains: [],
      isPublic: false,
      forPatient: true,
      items: [
        {
          exercise: "",
          note: "",
          additionalFiles: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedDomains = watch("domains") || [];

  // ---------------------------------------------------------------------------
  // Fill form in edit mode
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!sheet) return;

    reset({
      title: sheet.title ?? "",
      description: sheet.description ?? "",
      domains: sheet.domains ?? [],
      isPublic: sheet.isPrivate === false,
      forPatient: sheet.forPatient ?? false,

      items: (sheet.items ?? []).map((item) => ({
        exercise:
          typeof item.exercise === "string"
            ? item.exercise
            : (item.exercise?._id ?? ""),

        note: item.note ?? "",
        additionalFiles: (item.additionalFiles ?? []).filter(
          (f): f is ExerciseSheetAdditionalFile =>
            f.fileType === "image" || f.fileType === "audio",
        ),
      })),
    });
  }, [sheet, reset]);

  // ---------------------------------------------------------------------------
  // View
  // ---------------------------------------------------------------------------

  const existingSheetSubdomains =
    existingSheetDomain && DomainSubdomainMap[existingSheetDomain]
      ? DomainSubdomainMap[existingSheetDomain]
      : [];

  const filteredExistingSheets = useMemo(() => {
    return existingSheets.filter((sheet) => {
      const matchesDomain = existingSheetDomain
        ? sheet.domains?.some(
            (item) => item.domain === existingSheetDomain,
          )
        : true;

      const matchesSubdomain = existingSheetSubdomain
        ? sheet.domains?.some(
            (item) =>
              item.domain === existingSheetDomain &&
              item.subdomains?.includes(existingSheetSubdomain),
          )
        : true;

      return matchesDomain && matchesSubdomain;
    });
  }, [existingSheets, existingSheetDomain, existingSheetSubdomain]);

  // ---------------------------------------------------------------------------
  // Domain Toggle Handlers
  // ---------------------------------------------------------------------------

  const handleDomainToggle = (domain: TherapyDomain) => {
    const exists = selectedDomains.some((d) => d.domain === domain);
    if (exists) {
      setValue(
        "domains",
        selectedDomains.filter((d) => d.domain !== domain),
        { shouldValidate: true },
      );
    } else {
      setValue("domains", [...selectedDomains, { domain, subdomains: [] }], {
        shouldValidate: true,
      });
    }
  };

  const handleSubdomainToggle = (domain: TherapyDomain, subdomain: string) => {
    const updated = selectedDomains.map((item) => {
      if (item.domain !== domain) return item;
      const subExists = item.subdomains.includes(subdomain);
      return {
        ...item,
        subdomains: subExists
          ? item.subdomains.filter((s) => s !== subdomain)
          : [...item.subdomains, subdomain],
      };
    });

    setValue("domains", updated, { shouldValidate: true });
  };

  const handleUseExistingSheet = () => {
    if (!selectedExistingSheetId) return;

    const selectedSheet = existingSheets.find(
      (sheet) => sheet._id === selectedExistingSheetId,
    );

    if (!selectedSheet) return;

    reset({
      title: selectedSheet.title ?? "",
      description: selectedSheet.description ?? "",
      domains: selectedSheet.domains ?? [],
      isPublic: selectedSheet.isPrivate === false,
      forPatient: selectedSheet.forPatient ?? true,

      items: (selectedSheet.items ?? []).map((item) => ({
        exercise:
          typeof item.exercise === "string"
            ? item.exercise
            : (item.exercise?._id ?? ""),

        note: item.note ?? "",

        additionalFiles: (item.additionalFiles ?? []).filter(
          (file): file is ExerciseSheetAdditionalFile =>
            file.fileType === "image" || file.fileType === "audio",
        ),
      })),
    });
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const onSubmit = async (values: ExerciseSheetFormValues) => {
    try {
      const items = values.items
        .filter((item) => {
          const hasExercise = Boolean(item.exercise);
          const hasNote = Boolean(item.note?.trim());
          const hasFiles = (item?.additionalFiles?.length ?? 0) > 0;

          return hasExercise || hasNote || hasFiles;
        })
        .map((item) => ({
          ...(item.exercise ? { exercise: item.exercise } : {}),
          ...(item.note?.trim() ? { note: item.note.trim() } : {}),
          additionalFiles: item.additionalFiles ?? [],
        }));

      const payload = {
        title: values.title.trim(),
        domains: values.domains,
        isPrivate: !values.isPublic,
        forPatient: values.forPatient,
        description: values.description?.trim() ? values.description.trim() : "",

        items,
      };

      if (isEditMode && id && !isNew) {
        await updateMutation.mutateAsync({
          id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      navigate(-1);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * اگر اعتبارسنجی yup رد شود، این تابع صدا زده می‌شود.
   * برای دیباگ حیاتی است؛ چون بدون آن، ارورها کاملاً خاموش می‌مانند.
   */
  const onInvalid = (formErrors: FieldErrors<ExerciseSheetFormValues>) => {
    console.error("❌ Form validation failed:", formErrors);
  };

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if ((isEditMode && isLoadingSheet) || (isNew && isLoadingSheet)) {
    return (
      <div dir="rtl" className="p-8! text-center text-slate-600">
        در حال دریافت اطلاعات برگه تمرین...
      </div>
    );
  }

  return (
    <div>
      <section dir="rtl" className="min-h-screen bg-slate-50 pt-15! p-6!">
        <div className="mx-auto! max-w-5xl">
          {/* Header */}
          <div className="mb-6! flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {isEditMode ? "ویرایش برگه تمرین" : "ایجاد برگه تمرین"}
              </h1>
              <p className="mt-1! text-sm text-slate-500">
                تمرین‌ها، حیطه‌ها و توضیحات مورد نیاز بیمار را ثبت کنید.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl bg-blue-500 px-4! py-2! text-sm text-slate-100 transition hover:bg-slate-300"
            >
              بازگشت
            </button>
          </div>

          {/* استفاده از برگه تمرینی موجود */}
          {!isEditMode && (
            <div className="mb-6! rounded-2xl border border-sky-200 bg-sky-50/60 p-5! shadow-sm">
              <div className="mb-4!">
                <h2 className="text-lg font-bold text-sky-700">
                  استفاده از برگه تمرینی موجود
                </h2>

                <p className="mt-1! text-sm text-slate-600">
                  می‌توانی یک برگه تمرینی قبلی را بر اساس حیطه و زیرحیطه
                  انتخاب کنی و اطلاعات آن را وارد فرم کنی.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* حیطه */}
                <div>
                  <label className="mb-2! block text-sm font-medium text-slate-700">
                    حیطه
                  </label>

                  <select
                    value={existingSheetDomain}
                    onChange={(event) => {
                      setExistingSheetDomain(
                        event.target.value as TherapyDomain | "",
                      );
                      setExistingSheetSubdomain("");
                      setSelectedExistingSheetId("");
                    }}
                    className={inputClass}
                  >
                    <option value="">همه حیطه‌ها</option>

                    {THERAPY_DOMAINS.map((domain) => (
                      <option key={domain} value={domain}>
                        {THERAPY_DOMAIN_LABELS[domain] || domain}
                      </option>
                    ))}
                  </select>
                </div>

                {/* زیرحیطه */}
                <div>
                  <label className="mb-2! block text-sm font-medium text-slate-700">
                    زیرحیطه
                  </label>

                  <select
                    value={existingSheetSubdomain}
                    onChange={(event) => {
                      setExistingSheetSubdomain(event.target.value);
                      setSelectedExistingSheetId("");
                    }}
                    disabled={!existingSheetDomain}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                  >
                    <option value="">همه زیرحیطه‌ها</option>

                    {existingSheetSubdomains.map((subdomain) => (
                      <option key={subdomain} value={subdomain}>
                        {subdomain}
                      </option>
                    ))}
                  </select>
                </div>

                {/* انتخاب برگه */}
                <div>
                  <label className="mb-2! block text-sm font-medium text-slate-700">
                    برگه تمرینی
                  </label>

                  <select
                    value={selectedExistingSheetId}
                    onChange={(event) =>
                      setSelectedExistingSheetId(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">انتخاب برگه تمرینی</option>

                    {filteredExistingSheets.map((sheet) => (
                      <option key={sheet._id} value={sheet._id}>
                        {sheet.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4! flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {filteredExistingSheets.length === 0
                    ? "برگه‌ای با این فیلتر پیدا نشد."
                    : `${filteredExistingSheets.length} برگه پیدا شد.`}
                </span>
                <button
                  type="button"
                  onClick={() => setSheetViewModal(true)}
                  disabled={!selectedExistingSheetId}
                  className="rounded-xl bg-green-500 px-5! py-2.5! text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  مشاهده برگه
                </button>
                <button
                  type="button"
                  onClick={handleUseExistingSheet}
                  disabled={!selectedExistingSheetId}
                  className="rounded-xl bg-sky-600 px-5! py-2.5! text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  استفاده از این برگه
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="space-y-6"
          >
            {/* اطلاعات کلی */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6! shadow-sm">
              <h2 className="mb-5! text-lg font-bold text-teal-700">
                اطلاعات کلی
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="عنوان برگه تمرین"
                  error={errors.title?.message}
                >
                  <input
                    {...register("title")}
                    className={inputClass}
                    placeholder="مثلاً برنامه تمرین توجه و تمرکز"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField
                    label="توضیحات"
                    error={errors.description?.message}
                  >
                    <textarea
                      {...register("description")}
                      rows={4}
                      className={inputClass}
                      placeholder="توضیحات کلی درباره نحوه اجرای برنامه"
                    />
                  </FormField>
                </div>

                {/* فیلد دسترسی عمومی */}
                <div className="md:col-span-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4! transition hover:bg-slate-100">
                    <input
                      type="checkbox"
                      {...register("isPublic")}
                      className="mt-0.5 h-4 w-4 rounded accent-teal-600"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-800">
                        برگه تمرین عمومی
                      </span>
                      <p className="mt-0.5 text-xs text-slate-500">
                        با فعال کردن این گزینه، این برگه تمرین برای سایر
                        درمانگران نیز در لیست عمومی قابل مشاهده و استفاده
                        خواهد بود.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4! transition hover:bg-slate-100">
                    <input
                      type="checkbox"
                      {...register("forPatient")}
                      className="mt-0.5 h-4 w-4 rounded accent-teal-600"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-800">
                        نشان دادن تمرینات در پنل مراجع
                      </span>
                      <p className="mt-0.5 text-xs text-slate-500">
                        با فعال کردن این گزینه، این برگه تمرین برای مراجع
                        مربوطه نیز قابل مشاهده خواهد بود.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* حیطه‌ها و زیرحیطه‌های درمانی */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6! shadow-sm">
              <div className="mb-4!">
                <h2 className="text-lg font-bold text-teal-700">
                  حیطه‌ها و زیرحیطه‌های درمانی
                </h2>
                <p className="mt-1! text-sm text-slate-500">
                  حیطه‌های هدف برگه تمرین و زیرحیطه‌های مرتبط با آن را انتخاب
                  کنید.
                </p>
              </div>

              {/* نمایش خطاهای تودرتوی domains */}
              {errors.domains && (
                <div className="mb-4! space-y-1">
                  {Array.isArray(errors.domains)
                    ? errors.domains.map((d, i) =>
                        d ? (
                          <div key={i}>
                            {d.domain?.message && (
                              <p className="text-xs font-medium text-red-500">
                                حیطه #{i + 1}: {d.domain.message}
                              </p>
                            )}
                            {d.subdomains?.message && (
                              <p className="text-xs font-medium text-red-500">
                                حیطه #{i + 1}: {d.subdomains.message}
                              </p>
                            )}
                          </div>
                        ) : null,
                      )
                    : errors.domains.message && (
                        <p className="text-xs font-medium text-red-500">
                          {errors.domains.message}
                        </p>
                      )}
                </div>
              )}

              <div className="space-y-4">
                {THERAPY_DOMAINS.map((domain) => {
                  const isSelected = selectedDomains.some(
                    (d) => d.domain === domain,
                  );
                  const currentSelection = selectedDomains.find(
                    (d) => d.domain === domain,
                  );
                  const availableSubdomains = DomainSubdomainMap[domain] || [];

                  return (
                    <div
                      key={domain}
                      className={`rounded-xl border p-4! transition ${
                        isSelected
                          ? "border-teal-300 bg-teal-50/40"
                          : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <label className="flex cursor-pointer items-center gap-3! select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDomainToggle(domain)}
                          className="h-4 w-4 rounded accent-teal-600"
                        />
                        <span className="font-semibold text-slate-800 text-sm">
                          {THERAPY_DOMAIN_LABELS[domain] || domain}
                        </span>
                      </label>

                      {isSelected && (
                        <div className="mt-4! border-t border-teal-100 pt-3!">
                          <span className="mb-2! block text-xs font-medium text-slate-600">
                            زیرحیطه‌های مرتبط:
                          </span>
                          <div className="flex flex-wrap gap-2!">
                            {availableSubdomains.map((sub) => {
                              const isSubSelected =
                                currentSelection?.subdomains.includes(sub) ??
                                false;
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() =>
                                    handleSubdomainToggle(domain, sub)
                                  }
                                  className={`rounded-lg px-3! py-1.5! text-xs font-medium transition ${
                                    isSubSelected
                                      ? "bg-teal-600 text-white shadow-xs"
                                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                          {currentSelection &&
                            currentSelection.subdomains.length === 0 && (
                              <p className="mt-2! text-xs text-amber-600">
                                * حداقل یک زیرحیطه برای این حیطه انتخاب کنید.
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* آیتم‌های برگه تمرین */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6! shadow-sm">
              <div className="mb-5!">
                <h2 className="text-lg font-bold text-teal-700">
                  آیتم‌های برگه تمرین
                </h2>
                <p className="mt-1! text-sm text-slate-500">
                  برای هر آیتم می‌توانی تمرین انتخاب کنی یا فقط یادداشت، عکس
                  یا وویس اضافه کنی.
                </p>
              </div>

              <ExerciseSheetItemsSection
                fields={fields}
                append={append}
                remove={remove}
                register={register}
                setValue={setValue}
                exercises={exercises}
                control={control}
              />

              {/* نمایش خطاهای تودرتوی items */}
              {errors.items && (
                <div className="mt-3! space-y-1">
                  {Array.isArray(errors.items)
                    ? errors.items.map((itemErr, i) =>
                        itemErr ? (
                          <div key={i}>
                            {itemErr.note?.message && (
                              <p className="text-xs text-red-500">
                                آیتم #{i + 1} (یادداشت): {itemErr.note.message}
                              </p>
                            )}
                            {itemErr.additionalFiles &&
                              Array.isArray(itemErr.additionalFiles) &&
                              itemErr.additionalFiles.map((f, fi) =>
                                f ? (
                                  <p
                                    key={fi}
                                    className="text-xs text-red-500"
                                  >
                                    آیتم #{i + 1} / فایل #{fi + 1}:{" "}
                                    {f.fileURLs?.message ??
                                      f.fileType?.message ??
                                      "خطای نامعتبر در فایل"}
                                  </p>
                                ) : null,
                              )}
                          </div>
                        ) : null,
                      )
                    : errors.items.message && (
                        <p className="text-sm text-red-500">
                          {errors.items.message}
                        </p>
                      )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl bg-slate-200 px-6! py-3! text-sm text-slate-700 transition hover:bg-slate-300"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="rounded-xl bg-teal-600 px-8! py-3! text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "در حال ذخیره..."
                  : isEditMode
                    ? "ذخیره تغییرات"
                    : "ایجاد برگه تمرین"}
              </button>
            </div>
          </form>
        </div>
      </section>
      {sheetViewModal && (
        <ExerciseSheetViewModal
          sheet={existingSheets.find(
            (sheet) => sheet._id === selectedExistingSheetId,
          )}
          isOpen={sheetViewModal}
          onClose={() => setSheetViewModal(false)}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// UI Helpers
// -----------------------------------------------------------------------------

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4! py-3! text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2! block text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}

      {error && <p className="mt-1! text-xs text-red-500">{error}</p>}
    </div>
  );
}