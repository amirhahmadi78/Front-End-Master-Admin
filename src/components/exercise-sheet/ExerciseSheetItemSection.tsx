import { useState } from "react";
import {
  useWatch,
  type Control,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";

import type { ExerciseSheetFormValues } from "./ExerciseSheetFormPage";

import { uploadFileToServer } from "../../services/upload";
import VoiceRecorderButton from "../util.componenet/ViceRecorder";

interface ExerciseOption {
  _id: string;
  title: string;
  description?: string;
  domains?: {
    domain: string;
    subdomains: string[];
  }[];
}

interface ExerciseSheetItemsSectionProps {
  fields: FieldArrayWithId<ExerciseSheetFormValues, "items", "id">[];

  append: UseFieldArrayAppend<ExerciseSheetFormValues, "items">;

  remove: UseFieldArrayRemove;

  control: Control<ExerciseSheetFormValues>;

  register: UseFormRegister<ExerciseSheetFormValues>;

  setValue: UseFormSetValue<ExerciseSheetFormValues>;

  exercises: ExerciseOption[];
}

type ExerciseFileType = "image" | "audio";

interface ItemPickerState {
  isOpen: boolean;
  domain: string;
  subdomain: string;
  search: string;
}

const DOMAIN_OPTIONS = [
  { value: "speech", label: "گفتار و زبان" },
  { value: "sensory", label: "پردازش حسی" },
  { value: "cognitive", label: "شناختی" },
  { value: "perceptual-motor", label: "ادراکی ـ حرکتی" },
  { value: "physical", label: "جسمانی" },
  { value: "education", label: "آموزشی" },
];

export default function ExerciseSheetItemsSection({
  fields,
  append,
  remove,
  control,
  register,
  setValue,
  exercises,
}: ExerciseSheetItemsSectionProps) {
  /**
   * برخلاف fields، این مقدار با setValue و آپلود فایل به‌روزرسانی می‌شود.
   */
  const watchedItems = useWatch({
    control,
    name: "items",
  });

  const [pickerStates, setPickerStates] = useState<
    Record<string, ItemPickerState>
  >({});

  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  const getPickerState = (fieldId: string): ItemPickerState => {
    return (
      pickerStates[fieldId] ?? {
        isOpen: false,
        domain: "",
        subdomain: "",
        search: "",
      }
    );
  };

  const updatePickerState = (
    fieldId: string,
    changes: Partial<ItemPickerState>,
  ) => {
    setPickerStates((previous) => ({
      ...previous,
      [fieldId]: {
        ...getPickerState(fieldId),
        ...changes,
      },
    }));
  };

  const handleAddNewItem = () => {
    append({
      exercise: "",
      note: "",
      additionalFiles: [],
    });
  };

  const handleRemoveItem = (index: number, fieldId: string) => {
    remove(index);

    setPickerStates((previous) => {
      const next = { ...previous };
      delete next[fieldId];
      return next;
    });
  };

  const handleSelectExercise = (
    index: number,
    fieldId: string,
    exerciseId: string,
  ) => {
    setValue(`items.${index}.exercise`, exerciseId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    updatePickerState(fieldId, {
      isOpen: false,
    });
  };

  const handleClearSelectedExercise = (index: number) => {
    setValue(`items.${index}.exercise`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleFileUpload = async (
    index: number,
    fieldId: string,
    file: File,
    fileType: ExerciseFileType,
  ) => {
    try {
      setUploadingItemId(fieldId);

      const response = await uploadFileToServer(file);

      /**
       * پاسخ سرور ممکن است یکی از این دو شکل باشد:
       *  - string: "https://..."
       *  - object: { message, data: { url, key, ... } }
       * در هر دو حالت مقدار نهایی باید string باشد.
       */
      const url =
        typeof response === "string"
          ? response
          : (response as { data?: { url?: string } })?.data?.url;

      if (!url || typeof url !== "string") {
        throw new Error("آپلود فایل انجام نشد (URL دریافت نشد).");
      }

      const currentFiles = watchedItems?.[index]?.additionalFiles ?? [];

      setValue(
        `items.${index}.additionalFiles`,
        [
          ...currentFiles,
          {
            fileURLs: url,
            fileType,
          },
        ],
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    } catch (error) {
      console.error("خطا در آپلود فایل:", error);
      throw error;
    } finally {
      setUploadingItemId(null);
    }
  };

  const handleRemoveFile = (itemIndex: number, fileIndex: number) => {
    const currentFiles = watchedItems?.[itemIndex]?.additionalFiles ?? [];

    const nextFiles = currentFiles.filter((_, index) => index !== fileIndex);

    setValue(`items.${itemIndex}.additionalFiles`, nextFiles, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-5">
      {/* دکمه افزودن آیتم */}

      <button
        type="button"
        onClick={handleAddNewItem}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50 px-5! py-4! text-sm font-semibold text-teal-700 transition hover:border-teal-400 hover:bg-teal-100"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-lg leading-none text-white">
          +
        </span>
        افزودن آیتم به برگه تمرین
      </button>

      {/* Empty State */}

      {!fields.length && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5! py-10! text-center">
          <p className="font-medium text-slate-600">
            هنوز آیتمی به برگه تمرین اضافه نشده است.
          </p>

          <p className="mt-2! text-sm text-slate-400">
            می‌توانید یک تمرین، توضیح اختصاصی، عکس یا وویس اضافه کنید.
          </p>
        </div>
      )}

      {/* Items */}

      {fields.map((field, index) => {
        const item = watchedItems?.[index];
        const additionalFiles = item?.additionalFiles ?? [];
        const selectedExerciseId = item?.exercise ?? "";

        const selectedExercise = exercises.find(
          (exercise) => exercise._id === selectedExerciseId,
        );

        const pickerState = getPickerState(field.id);

        const availableSubdomains = Array.from(
          new Set(
            exercises.flatMap(
              (exercise) =>
                exercise.domains
                  ?.filter((domain) => domain.domain === pickerState.domain)
                  .flatMap((domain) => domain.subdomains ?? []) ?? [],
            ),
          ),
        );

        const filteredExercises = exercises.filter((exercise) => {
          const searchValue = pickerState.search
            .trim()
            .toLocaleLowerCase("fa-IR");

          const hasMatchingTitle =
            !searchValue ||
            exercise.title.toLocaleLowerCase("fa-IR").includes(searchValue);

          const hasMatchingDomain =
            !pickerState.domain ||
            exercise.domains?.some(
              (domain) => domain.domain === pickerState.domain,
            );

          const hasMatchingSubdomain =
            !pickerState.subdomain ||
            exercise.domains?.some(
              (domain) =>
                domain.domain === pickerState.domain &&
                domain.subdomains?.includes(pickerState.subdomain),
            );

          return hasMatchingTitle && hasMatchingDomain && hasMatchingSubdomain;
        });

        const isUploadingThisItem = uploadingItemId === field.id;

        return (
          <article
            key={field.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Item Header */}

            <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5! py-4!">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  آیتم {index + 1}
                </p>

                <p className="mt-1! text-xs text-slate-500">
                  تمرین، توضیحات و فایل‌های کمکی این بخش
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index, field.id)}
                className="rounded-lg px-2! py-1! text-sm text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
              >
                حذف آیتم
              </button>
            </header>

            <div className="space-y-5 p-5!">
              {/* Exercise picker */}

              <section>
                <div className="mb-2! flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">
                      تمرین
                      <span className="mr-1! font-normal text-slate-400">
                        (اختیاری)
                      </span>
                    </h3>

                    <p className="mt-1! text-xs text-slate-400">
                      می‌توانید این آیتم را بدون اتصال به تمرین کتابخانه هم ثبت
                      کنید.
                    </p>
                  </div>

                  {!selectedExercise && (
                    <button
                      type="button"
                      onClick={() =>
                        updatePickerState(field.id, {
                          isOpen: !pickerState.isOpen,
                        })
                      }
                      className="rounded-xl bg-sky-50 px-3! py-2! text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                    >
                      {pickerState.isOpen
                        ? "بستن انتخاب تمرین"
                        : "انتخاب از کتابخانه تمرین"}
                    </button>
                  )}
                </div>

                {/* تمرین انتخاب‌شده */}

                {selectedExercise && (
                  <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4! py-3!">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-teal-800">
                        {selectedExercise.title}
                      </p>

                      <p className="mt-1! text-xs text-teal-600">
                        تمرین از کتابخانه انتخاب شده است.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClearSelectedExercise(index)}
                      className="mr-3! shrink-0 text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      حذف انتخاب
                    </button>
                  </div>
                )}

                {/* انتخاب‌گر بازشونده تمرین */}

                {pickerState.isOpen && !selectedExercise && (
                  <div className="mt-3! rounded-2xl border border-sky-100 bg-sky-50/50 p-4!">
                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        value={pickerState.domain}
                        onChange={(event) => {
                          updatePickerState(field.id, {
                            domain: event.target.value,
                            subdomain: "",
                          });
                        }}
                        className={inputClass}
                      >
                        <option value="">همه حیطه‌ها</option>

                        {DOMAIN_OPTIONS.map((domain) => (
                          <option key={domain.value} value={domain.value}>
                            {domain.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={pickerState.subdomain}
                        disabled={!pickerState.domain}
                        onChange={(event) => {
                          updatePickerState(field.id, {
                            subdomain: event.target.value,
                          });
                        }}
                        className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                      >
                        <option value="">
                          {pickerState.domain
                            ? "همه زیرحیطه‌ها"
                            : "ابتدا حیطه را انتخاب کنید"}
                        </option>

                        {availableSubdomains.map((subdomain) => (
                          <option key={subdomain} value={subdomain}>
                            {subdomain}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="search"
                      value={pickerState.search}
                      onChange={(event) => {
                        updatePickerState(field.id, {
                          search: event.target.value,
                        });
                      }}
                      placeholder="جستجو در عنوان تمرین‌ها..."
                      className={`${inputClass} mt-3!`}
                    />

                    <div className="mt-3! max-h-64 space-y-2 overflow-y-auto rounded-xl border border-sky-100 bg-white p-2!">
                      {!filteredExercises.length ? (
                        <p className="px-3! py-6! text-center text-sm text-slate-500">
                          تمرینی با این فیلتر پیدا نشد.
                        </p>
                      ) : (
                        filteredExercises.map((exercise) => (
                          <button
                            key={exercise._id}
                            type="button"
                            onClick={() =>
                              handleSelectExercise(
                                index,
                                field.id,
                                exercise._id,
                              )
                            }
                            className="flex w-full items-center justify-between rounded-xl px-3! py-3! text-right transition hover:bg-sky-50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-700">
                                {exercise.title}
                              </p>

                              {!!exercise.domains?.length && (
                                <p className="mt-1! truncate text-xs text-slate-400">
                                  {exercise.domains
                                    .map(
                                      (domain) =>
                                        `${domain.domain}${
                                          domain.subdomains?.length
                                            ? `: ${domain.subdomains.join("، ")}`
                                            : ""
                                        }`,
                                    )
                                    .join(" | ")}
                                </p>
                              )}
                            </div>

                            <span className="mr-3! shrink-0 text-xs font-semibold text-sky-600">
                              انتخاب
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Note */}

              <section>
                <label className="mb-2! block text-sm font-bold text-slate-700">
                  توضیحات و دستور اجرای تمرین
                </label>

                <textarea
                  {...register(`items.${index}.note`)}
                  rows={4}
                  className={inputClass}
                  placeholder="مثلاً روزی دو بار، هر بار ۱۰ دقیقه انجام شود. نکات اجرایی یا توضیح اختصاصی را بنویسید..."
                />
              </section>

              {/* File uploader */}

              <section className="border-t border-slate-100 pt-5!">
                <div className="mb-3!">
                  <h3 className="text-sm font-bold text-slate-700">
                    فایل‌های کمکی
                    <span className="mr-1! font-normal text-slate-400">
                      (اختیاری)
                    </span>
                  </h3>

                  <p className="mt-1! text-xs text-slate-400">
                    برای راهنمای بیمار می‌توانید عکس نمونه یا وویس توضیحی اضافه
                    کنید.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <label
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4! py-2.5! text-sm font-medium transition ${
                      isUploadingThisItem
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                    }`}
                  >
                    <span>🖼️</span>
                    <span>
                      {isUploadingThisItem ? "در حال آپلود..." : "افزودن عکس"}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingThisItem}
                      onChange={async (event) => {
                        const input = event.currentTarget; // ✅ قبل از await بگیر
                        const file = input.files?.[0];
                        if (!file) return;

                        try {
                          await handleFileUpload(
                            index,
                            field.id,
                            file,
                            "image",
                          );
                        } finally {
                          input.value = ""; // ✅ حالا input معتبره
                        }
                      }}
                    />
                  </label>

                  <label
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4! py-2.5! text-sm font-medium transition ${
                      isUploadingThisItem
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    <span>🎙️</span>
                    <span>
                      {isUploadingThisItem ? "در حال آپلود..." : "افزودن وویس"}
                    </span>

                    <VoiceRecorderButton
                      disabled={isUploadingThisItem}
                      onRecorded={async (file) => {
                        await handleFileUpload(index, field.id, file, "audio");
                      }}
                    />
                  </label>
                </div>

                {/* Files list */}

                {!!additionalFiles.length && (
                  <div className="mt-4! grid gap-2 md:grid-cols-2">
                    {additionalFiles.map((file, fileIndex) => (
                      <div
                        key={`${file.fileURLs}-${fileIndex}`}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3! py-2.5!"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="text-base">
                            {file.fileType === "image" ? "🖼️" : "🎙️"}
                          </span>

                          <a
                            href={file.fileURLs}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-sm text-sky-700 hover:underline"
                          >
                            {file.fileType === "image"
                              ? `تصویر ${fileIndex + 1}`
                              : `وویس ${fileIndex + 1}`}
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index, fileIndex)}
                          className="mr-3! shrink-0 text-xs text-rose-500 hover:text-rose-700"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </article>
        );
      })}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4! py-3! text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";