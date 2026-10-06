// components/exerciseSheets/ExerciseSheetViewModal.tsx
import type { IExerciseSheet } from "../../types/exerciseSheets";
import { THERAPY_DOMAIN_LABELS } from "../../types/exerciseSheets";

interface ExerciseSheetViewModalProps {
  sheet: IExerciseSheet | null;
  isOpen: boolean;
  onClose: () => void;
}

function getFullName(value: any): string {
  if (typeof value === "string") return value;
  return `${value?.firstName || ""} ${value?.lastName || ""}`.trim() || "نامشخص";
}

function getFileLabel(index: number, fileURL?: string) {
  const kind = getMediaKind(fileURL);

  if (kind === "image") return `تصویر ${index + 1}`;
  if (kind === "audio") return `وویس ${index + 1}`;
  if (kind === "video") return `ویدئو ${index + 1}`;
  return `فایل ${index + 1}`;
}


function getFileExtension(url?: string) {
  if(!url){
    return "jpg"
  }
  const cleanUrl = url.split("?")[0].split("#")[0];
  const parts = cleanUrl.split(".");
  if (parts.length < 2) return "";
  return parts.pop()?.toLowerCase() || "";
}

function getMediaKind(fileURL?: string) {
  const ext = getFileExtension(fileURL);

  const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "avif"];
  const audioExtensions = ["mp3", "wav", "ogg", "m4a", "aac", "flac", "webm"];
  const videoExtensions = ["mp4", "webm", "mov", "mkv", "avi", "m4v"];

  if (imageExtensions.includes(ext)) return "image";
  if (audioExtensions.includes(ext)) return "audio";
  if (videoExtensions.includes(ext)) return "video";
  return "other";
}



function RenderMediaFile({
  file,
  label,
}: {
  file: { fileURLs: string; fileType?: string };
  label: string;
}) {
  const mediaKind = getMediaKind(file.fileURLs);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-3! py-2! text-xs font-medium text-slate-600">
        {label}
      </div>

      <div className="p-3!">
        {mediaKind === "image" ? (
          <img
            src={file.fileURLs}
            alt={label}
            className="h-auto w-full rounded-xl object-cover"
          />
        ) : mediaKind === "audio" ? (
          <audio controls className="w-full">
            <source src={file.fileURLs} />
            مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
          </audio>
        ) : mediaKind === "video" ? (
          <video controls className="w-full rounded-xl">
            <source src={file.fileURLs} />
            مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
          </video>
        ) : (
          <a
            href={file.fileURLs}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-sky-700 hover:underline"
          >
            مشاهده فایل
          </a>
        )}
      </div>
    </div>
  );
}



export default function ExerciseSheetViewModal({
  sheet,
  isOpen,
  onClose,
}: ExerciseSheetViewModalProps) {
  if (!isOpen || !sheet) return null;

  const isPublic = sheet.isPrivate === false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4! font-sans" dir="rtl">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-100 bg-white px-6! py-4!">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex-col items-center gap-3">
                <h3 className="truncate text-xl font-black text-slate-800">
                  {sheet.title}
                </h3>

                {/* بج وضعیت دسترسی برگه */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5! py-1! text-xs font-semibold ${
                    isPublic
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {isPublic ? (
                    <>
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      عمومی
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      خصوصی
                    </>
                  )}
         
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5! py-1! text-xs font-semibold ${
                    isPublic
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
{sheet.forPatient &&sheet?.patient ? (
                    <>
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                     فعال و قابل مشاهده توسط مراجع
                    </>
                  ):sheet?.patient ? (
                    <>
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                     غیر فعال و غیر قابل مشاهده توسط مراجع
                    </>
                  ): sheet.forPatient?(
                    <>
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      قابل ارائه به مراجع
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      فقط برای درمانگران
                    </>
                  )}
                </span>
                         
              </div>

              <div className="mt-2! flex flex-wrap gap-2 text-xs text-slate-500">
                {sheet.patient && (
                  <span className="rounded-full bg-slate-100 px-3! py-1!">
                    بیمار:{" "}
                    <span className="font-medium text-slate-700">
                      {getFullName(sheet.patient)}
                    </span>
                  </span>
                )}

                <span className="rounded-full bg-slate-100 px-3! py-1!">
                  ایجاد کننده:{" "}
                  <span className="font-medium text-slate-700">
                    {getFullName(sheet.createdBy)}
                  </span>
                </span>

                <span className="rounded-full bg-slate-100 px-3! py-1!">
                  تاریخ:{" "}
                  <span className="font-medium text-slate-700">
                    {new Date(sheet.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2! text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6! space-y-6">
          {/* حیطه‌ها و زیرحیطه‌های برگه تمرین */}
          {sheet.domains && sheet.domains.length > 0 && (
            <section>
              <h4 className="mb-2! text-xs font-black text-slate-400">
                حیطه‌ها و زیرحیطه‌های هدف برگه
              </h4>
              <div className="flex flex-wrap gap-2">
                {sheet.domains.map((item, dIdx) => (
                  <div
                    key={dIdx}
                    className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/60 px-3! py-1.5! text-xs text-teal-800"
                  >
                    <span className="font-bold">
                      {THERAPY_DOMAIN_LABELS[item.domain] || item.domain}
                    </span>
                    {item.subdomains && item.subdomains.length > 0 && (
                      <span className="text-teal-600">
                        : {item.subdomains.join("، ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sheet.description && (
            <section>
              <h4 className="mb-2! text-xs font-black text-slate-400">
                توضیحات برگه
              </h4>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4! text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {sheet.description}
              </div>
            </section>
          )}

          <section>
            <h4 className="mb-3! text-xs font-black text-slate-400">
              آیتم‌های برگه ({sheet.items.length})
            </h4>

            <div className="space-y-5">
              {sheet.items.map((item, index) => {
                const exercise =
                  typeof item.exercise === "string" ? null : item.exercise;

                return (
                  <article
                    key={item._id?.toString() || index}
                    className="overflow-hidden rounded-2xl border border-green-300 bg-white shadow-sm"
                  >
                    <div className="border-b border-slate-100 bg-slate-50 px-4! py-3!">
                      <p className="text-sm font-bold text-slate-800">
                        آیتم {index + 1}
                      </p>
                    </div>

                    <div className="space-y-5 p-4!">
                      {/* exercise default files */}
                      {exercise && (
                        <section className="space-y-4">
                          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4!">
                            <h5 className="text-sm font-bold text-sky-800">
                              {exercise.title}
                            </h5>

                            {exercise.description && (
                              <p className="mt-2! whitespace-pre-line text-sm leading-relaxed text-slate-700">
                                {exercise.description}
                              </p>
                            )}
                          </div>

                          {exercise.files && exercise.files.length > 0 && (
                            <div>
                              <h6 className="mb-2! text-xs font-black text-slate-400">
                                فایل‌های پیش‌فرض تمرین
                              </h6>

                              <div className="grid gap-3 md:grid-cols-2">
                                {exercise.files.map((file, fileIndex) => (
                                  <RenderMediaFile
                                    key={`${file.fileURLs}-${fileIndex}`}
                                    file={file}
                                    label={getFileLabel(fileIndex, file.fileURLs)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {!!exercise.domains?.length && (
                            <div className="flex flex-wrap gap-2">
                              {exercise.domains.map((domain, domainIndex) => (
                                <span
                                  key={domainIndex}
                                  className="rounded-full border border-slate-200 bg-slate-50 px-3! py-1! text-xs text-slate-600"
                                >
                                  {domain.domain}
                                  {domain.subdomains?.length
                                    ? ` | ${domain.subdomains.join("، ")}`
                                    : ""}
                                </span>
                              ))}
                            </div>
                          )}
                        </section>
                      )}

                      {/* item note */}
                      {item.note && (
                        <section>
                          <h6 className="mb-2! text-xs font-black text-slate-400">
                            توضیحات آیتم
                          </h6>
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4! text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                            {item.note}
                          </div>
                        </section>
                      )}

                      {/* therapist added files */}
                      {item.additionalFiles && item.additionalFiles.length > 0 && (
                        <section>
                          <h6 className="mb-2! text-xs font-black text-slate-400">
                            فایل‌های اضافه‌شده توسط درمانگر
                          </h6>

                          <div className="grid gap-3 md:grid-cols-2">
                            {item.additionalFiles.map((file, fileIndex) => (
                              <RenderMediaFile
                                key={`${file.fileURLs}-${fileIndex}`}
                                file={file}
                                label={getFileLabel(fileIndex, file.fileType)}
                              />
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 p-4! flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-6! py-2! text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
