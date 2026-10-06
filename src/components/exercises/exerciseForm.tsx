import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type {
  CreateExerciseDTO,
  ExerciseFileType,

  TherapyDomain,
  UpdateExerciseDTO,
} from "../../types/exercises";
import {
  DomainSubdomainMap,
  FILE_TYPES,
  THERAPY_DOMAINS,
} from "../../types/exercises";
import { useCreateExercise, useFindExerciseById, useUpdateExercise } from "../../hooks/exercise";
import { uploadFileToServer } from "../../services/upload";
import { data, useParams } from "react-router-dom";
import VoiceRecorderButton from "../util.componenet/ViceRecorder";
import toast from "react-hot-toast";

interface ExerciseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface LocalSelectedFile {
  file: File;
  fileType: ExerciseFileType;
}

type ExerciseFormValues = {
  title: string;
  description: string;
  category?: string;
  domains: {
    domain: TherapyDomain;
    subdomains: string[];
  }[];
  files: {
    fileURLs?: string;
    fileType?: ExerciseFileType;
  }[];
  private?: boolean;
  forPatient?: boolean;
};

const domainLabels: Record<TherapyDomain, string> = {
  speech: "گفتاردرمانی",
  sensory: "حسی",
  cognitive: "ذهنی / شناختی",
  perceptual_motor: "درکی - حرکتی",
  physical: "جسمی",
  education: "آموزش",
};

const fileTypeLabels: Record<ExerciseFileType, string> = {
  image: "تصویر",
  video: "ویدیو",
  audio: "صوت / پادکست",
  pdf: "فایل PDF",
  document: "سند / فایل متنی",
  other: "سایر"
};

export default function ExerciseForm({
  onSuccess,
  onCancel,
}: ExerciseFormProps) {
  const { id } = useParams();

  // صدا زدن اصولی هوک React Query بدون نقض قوانین هوک‌ها
  const { data: initialData, isLoading: isLoadingData } = useFindExerciseById(id || "", {
    enabled: !!id,
  });

  const isEditMode = Boolean(id && initialData);

  const [selectedFiles, setSelectedFiles] = useState<LocalSelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: createExercise, isPending: isCreating } = useCreateExercise();
  const { mutateAsync: updateExercise, isPending: isUpdating } = useUpdateExercise();
const [recordingAudio, setRecordingAudio] = useState(false);
const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);
const audioStreamRef = useRef<MediaStream | null>(null);


  const defaultValues = useMemo<ExerciseFormValues>(
    () => ({
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      domains:
        initialData?.domains?.length
          ? initialData.domains
          : [
              {
                domain: "speech",
                subdomains: [],
              },
            ],
      files: initialData?.files || [],
      private: initialData?.private || false,
      forPatient: initialData?.forPatient || true,
    }),
    [initialData],
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    defaultValues,
  });

  // افکت برای اعمال داده‌ها به فرم به محض لود شدن اطلاعات از سرور
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        domains: initialData.domains?.length
          ? initialData.domains
          : [{ domain: "speech", subdomains: [] }],
        files: initialData.files || [],
        private: initialData.private || false,
        forPatient: initialData.forPatient || true,
      });
    }
  }, [initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "domains",
  });

  const formDomains = watch("domains");
  const existingFiles = watch("files");

  const isPending = isCreating || isUpdating || isUploading;

  const addNewDomain = () => {
    append({
      domain: "speech",
      subdomains: [],
    });
  };
const startAudioRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStreamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

      const file = new File(
        [blob],
        `voice-${Date.now()}.webm`,
        { type: "audio/webm" },
      );

      setSelectedFiles((prev) => [
        ...prev,
        {
          file,
          fileType: "audio",
        },
      ]);

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }

      audioChunksRef.current = [];
    };

    recorder.start();
    setAudioRecorder(recorder);
    setRecordingAudio(true);
  } catch (error) {
    console.error("خطا در شروع ضبط صدا:", error);
    alert("دسترسی به میکروفون ممکن نیست.");
  }
};

const stopAudioRecording = () => {
  if (!audioRecorder) return;

  audioRecorder.stop();
  setAudioRecorder(null);
  setRecordingAudio(false);
};
useEffect(() => {
  return () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };
}, []);

  const onSelectFiles = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: ExerciseFileType,
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setSelectedFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        fileType,
      })),
    ]);

    event.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index: number) => {
    const nextFiles = [...(existingFiles || [])];
    nextFiles.splice(index, 1);
    setValue("files", nextFiles);
  };

  const toggleSubdomain = (
    domainIndex: number,
    subdomain: string,
    checked: boolean,
  ) => {
    const current = formDomains?.[domainIndex]?.subdomains || [];

    if (checked) {
      setValue(`domains.${domainIndex}.subdomains`, [...current, subdomain]);
      return;
    }

    setValue(
      `domains.${domainIndex}.subdomains`,
      current.filter((item) => item !== subdomain),
    );
  };

  const onSubmit = async (values: ExerciseFormValues) => {
    try {
      setIsUploading(true);

      const uploadedFiles = await Promise.all(
        selectedFiles.map(async (item) => {
          const url = await uploadFileToServer(item.file);
          return {
            fileURLs: url.data.url,
            fileType: item.fileType,
          };
        }),
      );

      const finalFiles = [...(values.files || []), ...uploadedFiles];
  console.log(finalFiles);
      const normalizedDomains = values.domains.map((item) => ({
        domain: item.domain,
        subdomains: Array.from(new Set(item.subdomains)),
      }));

      if (isEditMode && initialData?._id) {
        const payload: UpdateExerciseDTO = {
          title: values.title,
          description: values.description,
          category: values.category || undefined,
          domains: normalizedDomains,
          files: finalFiles,
          private: values.private,
          forPatient: values.forPatient,
        };

        await updateExercise({
          id: initialData._id,
          data: payload,
        });
      
        
      } else {
        const payload: CreateExerciseDTO = {
          title: values.title,
          description: values.description,
          category: values.category || undefined,
          domains: normalizedDomains,
          files: finalFiles,
          private: values.private,
          forPatient: values.forPatient,
        };

        await createExercise(payload);
      }

      onSuccess?.();
    }catch (err) {
  console.error(err);
  toast.error("ذخیره انجام نشد. دوباره تلاش کنید.");  // یا هر مکانیزم نمایش خطا
} finally {
      setIsUploading(false);
    }
  };

  if (id && isLoadingData) {
    return (
      <div className=" flex h-64 items-center justify-center rounded-2xl border border-slate-100 bg-white" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-xs font-bold text-slate-500">در حال دریافت اطلاعات تمرین...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 rounded-2xl border border-slate-100 bg-white p-6! shadow-lg font-sans" dir="rtl">
      {/* Form Header */}
      <div className="pt-10! flex items-center justify-between border-b border-slate-100 pb-4!">
        <div>
          <h2 className="text-xl font-black text-slate-800">
            {isEditMode ? "ویرایش تمرین توانبخشی" : "ایجاد تمرین جدید"}
          </h2>
          <p className="mt-1! text-xs text-slate-500">
            اطلاعات تمرین، دسته‌بندی‌ها و فایل‌های مرتبط را در این بخش مدیریت کنید.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4! py-2! text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            انصراف
          </button>
        )}
      </div>

      {/* Main Info */}
      <div className="grid gap-5! md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5! block text-xs font-black text-slate-700">عنوان تمرین <span className="text-red-500">*</span></label>
          <input
            {...register("title", { required: "وارد کردن عنوان تمرین الزامی است" })}
            className={`w-full rounded-xl border bg-slate-50/50 px-4! py-2.5! text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500/15" : "border-slate-200 focus:border-sky-500 focus:ring-sky-500/15"
            }`}
            placeholder="مثال: تمرین تفکیک صداهای خیشومی"
          />
          {errors.title && (
            <p className="mt-1.5! text-xs font-semibold text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5! block text-xs font-black text-slate-700">توضیحات و شیوه اجرا <span className="text-red-500">*</span></label>
          <textarea
            {...register("description", { required: "وارد کردن توضیحات تمرین الزامی است" })}
            rows={4}
            className={`w-full rounded-xl border bg-slate-50/50 px-4! py-2.5! text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500/15" : "border-slate-200 focus:border-sky-500 focus:ring-sky-500/15"
            }`}
            placeholder="نحوه انجام تمرین، تعداد تکرار و نکات مهم برای مراجع یا کاردرمانگر..."
          />
          {errors.description && (
            <p className="mt-1.5! text-xs font-semibold text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5! block text-xs font-black text-slate-700">دسته‌بندی کلی</label>
          <input
            {...register("category")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4! py-2.5! text-sm focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/15 transition-all"
            placeholder="مثلا: تمرین در منزل، تمرینات ادراکی"
          />
        </div>

        {/* Options (Private / For Patient) */}
        <div className="flex flex-wrap items-center gap-6! md:pt-6!">
          <label className="flex cursor-pointer items-center gap-3.5! rounded-xl border border-slate-100 bg-slate-50/40 px-4! py-3! transition-all hover:bg-slate-50 select-none">
            <input
              type="checkbox"
              {...register("private")}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/20"
            />
            <div className="text-right">
              <span className="block text-xs font-black text-slate-800">تمرین خصوصی</span>
              <span className="block text-[10px] text-slate-400">فقط برای شما قابل نمایش و استفاده باشد</span>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3.5! rounded-xl border border-slate-100 bg-slate-50/40 px-4! py-3! transition-all hover:bg-slate-50 select-none">
            <input
              type="checkbox"
              {...register("forPatient")}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
            />
            <div className="text-right">
              <span className="block text-xs font-black text-slate-800">اشتراک با مراجع</span>
              <span className="block text-[10px] text-slate-400">این تمرین قابلیت ارائه به مراجع دارد</span>
            </div>
          </label>
        </div>
      </div>

      {/* Domains & Subdomains Section */}
      <section className="space-y-4! rounded-2xl border border-slate-100 bg-slate-50/30 p-5!">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">حیطه‌ها و زیرحیطه‌های هدف</h3>
            <p className="text-[10px] text-slate-400">تمرین خود را به حیطه‌های درمانی تخصصی متصل کنید.</p>
          </div>
          <button
            type="button"
            onClick={addNewDomain}
            className="flex items-center gap-1.5! rounded-xl bg-sky-600 px-4! py-2! text-xs font-bold text-white shadow-md shadow-sky-600/10 hover:bg-sky-700 active:scale-95 transition-all"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            افزودن حیطه
          </button>
        </div>

        <div className="space-y-4!">
          {fields.map((field, index) => {
            const selectedDomain = formDomains?.[index]?.domain || "speech";
            const availableSubdomains = DomainSubdomainMap[selectedDomain] || [];
            const selectedSubdomains = formDomains?.[index]?.subdomains || [];

            return (
              <div key={field.id} className="relative rounded-2xl border border-slate-100 bg-white p-5! shadow-sm transition-all hover:border-slate-200">
                <div className="mb-4! flex flex-col gap-3! sm:flex-row sm:items-center sm:justify-between">
                  <div className="w-full max-w-xs">
                    <label className="mb-1.5! block text-xs font-bold text-slate-600">انتخاب حیطه درمانی</label>
                    <select
                      {...register(`domains.${index}.domain` as const, {
                        onChange: () => {
                          setValue(`domains.${index}.subdomains`, []);
                        },
                      })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3! py-2! text-xs focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                    >
                      {THERAPY_DOMAINS.map((domain) => (
                        <option key={domain} value={domain}>
                          {domainLabels[domain]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-4! sm:mt-0! flex items-center gap-1! rounded-lg bg-red-50 px-3! py-2! text-[11px] font-bold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-7v6m5-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      حذف این حیطه
                    </button>
                  )}
                </div>

                <div>
                  <p className="mb-2.5! text-xs font-bold text-slate-600">انتخاب زیرحیطه‌ها</p>
                  {availableSubdomains.length > 0 ? (
                    <div className="grid gap-2.5! sm:grid-cols-2 md:grid-cols-3">
                      {availableSubdomains.map((subdomain) => {
                        const checked = selectedSubdomains.includes(subdomain);
                        return (
                          <label
                            key={subdomain}
                            className={`flex cursor-pointer items-center gap-2.5! rounded-xl border p-2.5! transition-all select-none ${
                              checked
                                ? "border-emerald-200 bg-emerald-50/40 text-emerald-950 font-bold"
                                : "border-slate-100 bg-slate-50/30 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                toggleSubdomain(index, subdomain, e.target.checked)
                              }
                              className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                            />
                            <span className="text-xs">{subdomain}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">هیچ زیرحیطه‌ای برای این بخش تعریف نشده است.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Files Section */}
      <section className="space-y-4! rounded-2xl border border-slate-100 bg-slate-50/30 p-5!">
        <div>
          <h3 className="text-sm font-black text-slate-800">فایل‌های پیوست تمرین</h3>
          <p className="text-[10px] text-slate-400">می‌توانید اسناد، تصاویر، ویدیوها یا پادکست‌های مربوطه را آپلود کنید.</p>
        </div>

        <div className="grid gap-4! sm:grid-cols-2">
        {FILE_TYPES.map((fileType) => (
  <div key={fileType} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4! transition-all hover:border-sky-300 hover:shadow-sm">
    <div className="flex items-center justify-between mb-2!">
      <label className="block text-xs font-bold text-slate-700">
        فایل {fileTypeLabels[fileType]}
      </label>
      <span className="text-[9px] font-bold text-sky-600 uppercase bg-sky-50 px-2! py-0.5! rounded-md">{fileType}</span>
    </div>

  {fileType === "audio" ? (
  <div className="space-y-3!">
    <input
      type="file"
      accept="audio/*"
      onChange={(e) => onSelectFiles(e, fileType)}
      className="w-full text-xs text-slate-500 file:mr-0! file:ml-4! file:rounded-lg file:border-0 file:bg-slate-100 file:px-3! file:py-1.5! file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-200 file:transition-colors cursor-pointer"
    />

    <VoiceRecorderButton
      disabled={isPending}
      onRecorded={(file) =>
        setSelectedFiles((prev) => [
          ...prev,
          { file, fileType: "audio" },
        ])
      }
    />
  </div>
) : (
  <input
    type="file"
    onChange={(e) => onSelectFiles(e, fileType)}
    className="w-full text-xs text-slate-500 file:mr-0! file:ml-4! file:rounded-lg file:border-0 file:bg-slate-100 file:px-3! file:py-1.5! file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-200 file:transition-colors cursor-pointer"
  />
)}

  </div>
))}

        </div>

        {/* Existing Saved Files */}
        {!!existingFiles?.length && (
          <div className="rounded-xl bg-white p-4! border border-slate-100">
            <p className="mb-2.5! text-xs font-bold text-slate-700 flex items-center gap-1.5!">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              فایل‌های ذخیره‌شده روی سرور ({existingFiles.length})
            </p>
            <div className="space-y-2!">
              {existingFiles.map((file, index) => (
                <div
                  key={`${file.fileURLs}-${index}`}
                  className="flex items-center justify-between gap-3! rounded-xl border border-slate-100 bg-slate-50/40 p-2.5!"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800">{fileTypeLabels[file.fileType || 'document'] || file.fileType}</p>
                    <a
                      href={file.fileURLs}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-[10px] text-sky-600 hover:underline mt-0.5!"
                    >
                      {file.fileURLs}
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExistingFile(index)}
                    className="shrink-0 rounded-lg bg-red-50 px-2.5! py-1.5! text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    حذف فایل
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Newly Selected Local Files */}
        {!!selectedFiles.length && (
          <div className="rounded-xl bg-white p-4! border border-slate-100">
            <p className="mb-2.5! text-xs font-bold text-slate-700 flex items-center gap-1.5!">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              فایل‌های جدید (آماده آپلود و ذخیره‌سازی)
            </p>
            <div className="space-y-2!">
              {selectedFiles.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="flex items-center justify-between gap-3! rounded-xl border border-slate-100 bg-slate-50/40 p-2.5!"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{item.file.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5!">
                      نوع پیش‌فرض: {fileTypeLabels[item.fileType] || item.fileType} • {(item.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="shrink-0 rounded-lg bg-red-50 px-2.5! py-1.5! text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    انصراف
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3! border-t border-slate-100 pt-5!">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5! py-2.5! text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 transition-colors"
          >
            انصراف
          </button>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2! rounded-xl bg-emerald-600 px-6! py-2.5! text-xs font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 disabled:opacity-50 active:scale-95 transition-all"
        >
          {isPending && (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {isPending
            ? "در حال پردازش و آپلود..."
            : isEditMode
              ? "ذخیره تغییرات تمرین"
              : "ثبت و ایجاد تمرین"}
        </button>
      </div>
    </form>
  );
}
