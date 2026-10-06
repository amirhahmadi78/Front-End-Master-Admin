import React from "react";
import {
  FiX,
  FiFileText,
  FiHash,
  FiTag,
  FiEyeOff,
  FiEye,
  FiActivity,
  FiList,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiLayers,
  FiCpu,
  FiSliders,
  FiCheckSquare,
  FiType,
  FiHash as FiNumberIcon,
} from "react-icons/fi";

type AssessmentQuestionType =
  | "single-choice"
  | "multiple-choice"
  | "number"
  | "text"
  | "boolean";

type AssessmentTemplateStatus = "draft" | "published" | "archived";

interface AssessmentOption {
  _id?: string;
  key: string;
  label: string;
  value: string;
  score?: number;
  order?: number;
}

interface AssessmentQuestion {
  _id?: string;
  key: string;
  title: string;
  description?: string | null;
  type: AssessmentQuestionType;
  required: boolean;
  order: number;
  options: AssessmentOption[];
  validation?: {
    min?: number | null;
    max?: number | null;
    minLength?: number | null;
    maxLength?: number | null;
  };
  weight?: number;
}

interface AssessmentRange {
  _id?: string;
  title: string;
  description?: string | null;
  minScore: number;
  maxScore: number;
  color?: string | null;
  severity?: "normal" | "mild" | "moderate" | "severe" | "critical";
}

export interface PopulatedAssessmentTemplate {
  _id: string;
  isPrivate: boolean;
  title: string;
  slug: string;
  code: string;
  description?: string | null;
  category?: string | null;
  instructions?: string | null;
  questions: AssessmentQuestion[];
  scoreRanges: AssessmentRange[];
  scoring: {
    enabled: boolean;
    method: "sum" | "weighted-sum" | "average" | "none";
    minScore: number;
    maxScore?: number | null;
  };
  version: number;
  status: AssessmentTemplateStatus;
  isActive: boolean;
  createdBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
  } | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AssessmentTemplateModalProps {

  onClose: () => void;
  template: PopulatedAssessmentTemplate | null | undefined;
}

const statusStyles: Record<
  AssessmentTemplateStatus,
  { bg: string; text: string; label: string }
> = {
  draft: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "پیش‌نویس",
  },
  published: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    label: "منتشر شده",
  },
  archived: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    label: "بایگانی شده",
  },
};

const typeStyles: Record<
  AssessmentQuestionType,
  { label: string; icon: React.ReactNode; bg: string; text: string }
> = {
  "single-choice": {
    label: "تک‌انتخابی",
    icon: <FiCheckSquare />,
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  "multiple-choice": {
    label: "چندانتخابی",
    icon: <FiLayers />,
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  boolean: {
    label: "بله / خیر",
    icon: <FiCheckCircle />,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  number: {
    label: "عددی",
    icon: <FiNumberIcon />,
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  text: {
    label: "متنی",
    icon: <FiType />,
    bg: "bg-slate-50",
    text: "text-slate-700",
  },
};

const severityLabel: Record<string, string> = {
  normal: "نرمال",
  mild: "خفیف",
  moderate: "متوسط",
  severe: "شدید",
  critical: "بحرانی",
};
export const AssessmentTemplateModal: React.FC<AssessmentTemplateModalProps> = ({

  onClose,
  template,
}) => {
  if ( !template) return null;

  const statusInfo = statusStyles[template.status];
  const publishedDate = template.publishedAt
    ? new Date(template.publishedAt).toLocaleDateString("fa-IR")
    : "ثبت نشده";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4! overflow-hidden" dir="rtl">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6! border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3!">
            <div className="p-2.5! bg-rose-50 text-rose-600 rounded-2xl">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">نمایش تمپلیت ارزیابی</h2>
              <p className="text-xs text-slate-500 mt-1!">
                {template.title} | نسخه {template.version}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2! text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6! space-y-6!">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4!">
            <div className="p-4! bg-slate-50 rounded-2xl border border-slate-100 space-y-3!">
              <span className="text-xs font-bold text-slate-400 block border-b border-slate-200 pb-1.5!">
                اطلاعات اصلی
              </span>
              <div className="flex items-center gap-2! text-sm text-slate-700">
                <FiHash className="text-slate-400 shrink-0" />
                <span className="font-semibold">کد:</span> <span>{template.code}</span>
              </div>
              <div className="flex items-center gap-2! text-sm text-slate-700">
                <FiTag className="text-slate-400 shrink-0" />
                <span className="font-semibold">Slug:</span> <span>{template.slug}</span>
              </div>
              <div className="flex items-center gap-2! text-sm text-slate-700">
                <FiCalendar className="text-slate-400 shrink-0" />
                <span className="font-semibold">تاریخ انتشار:</span> <span>{publishedDate}</span>
              </div>
            </div>

            <div className="p-4! bg-slate-50 rounded-2xl border border-slate-100 space-y-3!">
              <span className="text-xs font-bold text-slate-400 block border-b border-slate-200 pb-1.5!">
                وضعیت
              </span>
              <div className="flex items-center gap-2! text-sm text-slate-700">
                <span
                  className={`px-2.5! py-0.5! rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-2! text-sm text-slate-700">
                {template.isPrivate ? (
                  <>
                    <FiEyeOff className="text-slate-400 shrink-0" />
                    <span>خصوصی</span>
                  </>
                ) : (
                  <>
                    <FiEye className="text-slate-400 shrink-0" />
                    <span>عمومی</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2! text-sm text-slate-700">
                <FiActivity className="text-slate-400 shrink-0" />
                <span>{template.isActive ? "فعال" : "غیرفعال"}</span>
              </div>
            </div>

            <div className="p-4! bg-slate-50 rounded-2xl border border-slate-100 space-y-3!">
              <span className="text-xs font-bold text-slate-400 block border-b border-slate-200 pb-1.5!">
                ساختار امتیازدهی
              </span>
              <div className="flex items-center gap-2! text-sm text-slate-700">
                <FiSliders className="text-slate-400 shrink-0" />
                <span>روش: {template.scoring.method}</span>
              </div>
              <div className="flex items-center gap-2! text-sm text-slate-700">
                <FiCpu className="text-slate-400 shrink-0" />
                <span>فعال: {template.scoring.enabled ? "بله" : "خیر"}</span>
              </div>
              <div className="flex items-center gap-2! text-sm text-slate-700">
                <FiAlertCircle className="text-slate-400 shrink-0" />
                <span>
                  بازه: {template.scoring.minScore} تا {template.scoring.maxScore ?? "∞"}
                </span>
              </div>
            </div>
          </div>

          {/* Description & Category */}
          {(template.description || template.category) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4!">
              <div className="md:col-span-2 p-5! bg-white rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-2!">توضیحات تمپلیت</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {template.description || "بدون توضیح"}
                </p>
              </div>
              <div className="p-5! bg-white rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-2!">دسته‌بندی</h3>
                <p className="text-sm text-slate-600">{template.category || "تعریف نشده"}</p>
              </div>
            </div>
          )}

          {/* Questions Section */}
          <div className="space-y-4!">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2! border-b border-slate-100 pb-2!">
              <FiList className="text-rose-500" />
              لیست سوالات ارزیابی
              <span className="text-xs font-normal text-slate-500">
                ({template.questions?.length} مورد)
              </span>
            </h3>

            <div className="space-y-4!">
              {template.questions?.map((question, idx) => {
                const info = typeStyles[question.type];
                return (
                  <div
                    key={question.key}
                    className="p-4! bg-slate-50/60 border border-slate-100 rounded-2xl"
                  >
                    <div className="flex items-start justify-between gap-4!">
                      <div className="flex items-start gap-3!">
                        <span className="bg-slate-200 text-slate-700 w-6! h-6! rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5!">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{question.title}</h4>
                          <div className="flex flex-wrap items-center gap-2! mt-2!">
                            <span
                              className={`inline-flex items-center gap-1.5! px-2.5! py-1! rounded-full text-xs font-semibold ${info.bg} ${info.text}`}
                            >
                              {info.icon} {info.label}
                            </span>
                            <span className="px-2.5! py-1! rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                              {question.required ? "اجباری" : "اختیاری"}
                            </span>
                            <span className="px-2.5! py-1! rounded-full text-xs font-semibold bg-white border border-slate-100 text-slate-500 italic">
                              Key: {question.key}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Options if choice-based */}
                    {["single-choice", "multiple-choice", "boolean"].includes(question.type) && (
                      <div className="mt-4! grid grid-cols-1 md:grid-cols-2 gap-2!">
                        {question.options?.map((opt) => (
                          <div
                            key={opt.key}
                            className="flex items-center justify-between p-2.5! bg-white border border-slate-100 rounded-xl"
                          >
                            <span className="text-xs font-medium text-slate-700">{opt.label}</span>
                            <span className="text-[10px] font-bold px-2! py-0.5! bg-rose-50 text-rose-600 rounded-md border border-rose-100">
                              Score: {opt.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ranges Section */}
          <div className="space-y-4!">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2! border-b border-slate-100 pb-2!">
              <FiActivity className="text-emerald-500" />
              تفسیر بازه‌های امتیازی
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3!">
              {template.scoreRanges?.map((range) => (
                <div
                  key={range.title}
                  className="p-4! bg-white border border-slate-100 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{range.title}</h4>
                    <p className="text-xs text-slate-500 mt-1!">
                      محدوده: {range.minScore} تا {range.maxScore}
                    </p>
                  </div>
                  <span className="px-3! py-1! rounded-full text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100">
                    {severityLabel[range.severity || "normal"]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4! border-t border-slate-100 bg-slate-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-8! py-2.5! bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};

