// components/assessment/AssessmentTemplateCreateForm.tsx

import {
  useFieldArray,
  useForm,
  Controller,
  type SubmitHandler,
} from "react-hook-form";
import {
  useAssessmentTemplate,
  useCreateAssessmentTemplate,
  useUpdateAssessmentTemplate,
} from "../../hooks/assessmentTemplate";
import type {
  AssessmentTemplateFormInput,
  AssessmentQuestionType,
  AssessmentTemplate,
} from "../../services/assessmentTemplate";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

const QUESTION_TYPES: { label: string; value: AssessmentQuestionType }[] = [
  { label: "تک‌گزینه‌ای", value: "single-choice" },
  { label: "چندگزینه‌ای", value: "multiple-choice" },
  { label: "عددی", value: "number" },
  { label: "متنی", value: "text" },
  { label: "بولی / بله-خیر", value: "boolean" },
];

// تعریف گزینه‌های پیش‌فرض برای سوالات Boolean در بالای فایل یا داخل کامپوننت
const DEFAULT_BOOLEAN_OPTIONS = [
  { key: "true", label: "بله", value: "true", score: 1, order: 0 },
  { key: "false", label: "خیر", value: "false", score: 0, order: 1 },
];

const SCORING_METHODS = [
  { label: "جمع ساده", value: "sum" },
  { label: "جمع وزن‌دار", value: "weighted-sum" },
  { label: "میانگین", value: "average" },
  { label: "بدون امتیازدهی", value: "none" },
] as const;

const SEVERITIES = [
  { label: "نرمال", value: "normal" },
  { label: "خفیف", value: "mild" },
  { label: "متوسط", value: "moderate" },
  { label: "شدید", value: "severe" },
  { label: "بحرانی", value: "critical" },
] as const;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-ا-یآؤئپچژکگ]/g, "")
    .replace(/\-\-+/g, "-");
}

function defaultQuestion(index: number) {
  return {
    key: `question_${index + 1}`,
    title: "",
    description: "",
    type: "single-choice" as AssessmentQuestionType,
    required: true,
    order: index,
    options: [
      {
        key: "option_1",
        label: "گزینه ۱",
        value: "option_1",
        score: 0,
        order: 0,
      },
    ],
    validation: {
      min: null,
      max: null,
      minLength: null,
      maxLength: null,
    },
    weight: 1,
  };
}

const initialValues: AssessmentTemplateFormInput = {
  title: "",
  slug: "",
  code: "",
  description: "",
  category: "",
  instructions: "",
  isPrivate: false,
  questions: [defaultQuestion(0)],
  scoreRanges: [],
  scoring: {
    enabled: true,
    method: "sum",
    minScore: 0,
    maxScore: null,
  },
  version: 1,
  status: "draft",
  isActive: true,
};

export function AssessmentTemplateCreateForm({
  
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const createMutation = useCreateAssessmentTemplate();
  const updateMutation = useUpdateAssessmentTemplate();
  const { id } = useParams();

  const { data: initialData } = useAssessmentTemplate(id || "");

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssessmentTemplateFormInput>({
    defaultValues: initialValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (initialData && initialData !== undefined && initialData !== null) {
      reset(initialData);
    }
  }, [initialData, reset]);
const navigate=useNavigate()
  const scoringEnabled = watch("scoring.enabled");
  const templateTitle = watch("title");
  const templateCode = watch("code");
  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const questionsWatch = watch("questions");

  function generateCodeFromTitle(title: string) {
    const base =
      slugify(title)
        .replace(/-/g, "")
        .replace(/[^\wآ-ی]/g, "")
        .toUpperCase()
        .slice(0, 8) || "ASM";

    const uniquePart = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${base}-${uniquePart}`;
  }

  const handleAutoCode = () => {
    if (!templateTitle?.trim()) return;
    setValue("code", generateCodeFromTitle(templateTitle), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (templateTitle?.trim()) {
      setValue("slug", slugify(templateTitle), { shouldDirty: true });
      if (!templateCode) {
        setValue("code", generateCodeFromTitle(templateTitle), {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }, [templateTitle, setValue]);

  // افکت برای پر کردن خودکار گزینه‌ها زمانی که نوع سوال بولی (boolean) می‌شود
  useEffect(() => {
    if (!questionsWatch) return;

    questionsWatch.forEach((q, index) => {
      if (q.type === "boolean") {
        const hasCorrectOptions =
          q.options &&
          q.options.length === 2 &&
          q.options.some((o) => o.value === "true") &&
          q.options.some((o) => o.value === "false");

        if (!hasCorrectOptions) {
          setValue(`questions.${index}.options`, DEFAULT_BOOLEAN_OPTIONS, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }
    });
  }, [questionsWatch, setValue]);

  const {
    fields: rangeFields,
    append: appendRange,
    remove: removeRange,
  } = useFieldArray({
    control,
    name: "scoreRanges",
  });

  const isChoiceQuestion = (type: AssessmentQuestionType) =>
    ["single-choice", "multiple-choice", "boolean"].includes(type);

  const handleAutoSlug = () => {
    if (templateTitle) {
      setValue("slug", slugify(templateTitle), { shouldDirty: true });
    }
  };

  const handleAutoFill = () => {
    if (templateTitle) {
      setValue("slug", slugify(templateTitle), { shouldDirty: true });
      if (!watch("code")) {
        setValue("code", generateCodeFromTitle(templateTitle), {
          shouldDirty: true,
        });
      }
    }
  };

  useEffect(() => {
    handleAutoFill();
  }, [watch("title")]);

  const onSubmit: SubmitHandler<AssessmentTemplateFormInput> = async (data) => {
    try {
      const payload: AssessmentTemplateFormInput = {
      ...data,
      questions: data.questions.map((q, qIndex) => {
        // برای سوالاتی که نوع عددی یا متنی دارند، مقدار گزینه‌ها نباید فرستاده شود تا خطای دیتابیس رخ ندهد
        const isChoice = [
          "single-choice",
          "multiple-choice",
          "boolean",
        ].includes(q.type);
        return {
          ...q,
          order: qIndex,
          options: isChoice
            ? (q.options || []).map((o, oIndex) => ({
                ...o,
                order: oIndex,
              }))
            : [], // خالی کردن گزینه‌ها برای سوالات غیر گزینه‌ای
          validation: {
            min: q.type === "number" ? (q.validation?.min ?? null) : null,
            max: q.type === "number" ? (q.validation?.max ?? null) : null,
            minLength:
              q.type === "text" ? (q.validation?.minLength ?? null) : null,
            maxLength:
              q.type === "text" ? (q.validation?.maxLength ?? null) : null,
          },
        };
      }),
      scoreRanges: (data.scoreRanges || []).map((r) => ({
        ...r,
      })),
    };
    if (id) {
     
      await updateMutation.mutateAsync({id,data:payload});
          navigate("/systematicassessments")
  
    } else {
      await createMutation.mutateAsync(payload);
          navigate("/systematicassessments")

    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log("it Is Error");
      

    }
    
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-2!">
      {/* Header */}
      <div className="rounded-3xl bg-linear-to-l from-violet-600 to-indigo-600 p-6! text-white shadow-lg">
        <h2 className="text-2xl font-bold">ساخت ارزیابی جدید</h2>
        <p className="mt-2! max-w-3xl text-sm text-violet-100">
          از این فرم برای ساخت یک قالب ارزیابی ساختارمند با سوالات داینامیک،
          امتیازدهی و بازهای تفسیر استفاده کن.
        </p>
      </div>

      {/* Basic Info */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4! shadow-sm md:p-6!">
        <h3 className="text-lg font-bold text-slate-900">اطلاعات پایه</h3>

        <div className="mt-4! grid gap-4! md:grid-cols-2">
          <div>
            <label className="mb-2! block text-sm font-medium text-slate-700">
              عنوان
            </label>
            <input
              {...register("title", { required: "عنوان الزامی است" })}
              className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
              placeholder="مثلاً: ارزیابی عملکرد دست"
            />
            {errors.title && (
              <p className="mt-1! text-sm text-rose-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div hidden>
            <label className="mb-2! block text-sm font-medium text-slate-700">
              نام رسمی ارزیابی
            </label>
            <div className="flex gap-2">
              <input
                {...register("slug", { required: "اسلاگ الزامی است" })}
                className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
                placeholder="hand-function-assessment"
              />
              <button
                type="button"
                onClick={handleAutoSlug}
                className="rounded-xl bg-slate-900 px-4! py-3! text-sm font-medium text-white transition hover:bg-slate-800"
              >
                تولید
              </button>
            </div>
            {errors.slug && (
              <p className="mt-1! text-sm text-rose-600">
                {errors.slug.message}
              </p>
            )}
          </div>

          {/* کد */}
          <div hidden>
            <label className="mb-2! block text-sm font-medium text-slate-700">
              کد
            </label>
            <div className="flex gap-2">
              <input
                {...register("code", { required: "کد الزامی است" })}
                className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
                placeholder="ASM-XXXXX"
                disabled
                hidden
              />
              <button
                type="button"
                onClick={handleAutoCode}
                className="rounded-xl bg-slate-900 px-4! py-3! text-sm font-medium text-white transition hover:bg-slate-800"
              >
                تولید
              </button>
            </div>
            {errors.code && (
              <p className="mt-1! text-sm text-rose-600">
                {errors.code.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2! block text-sm font-medium text-slate-700">
              دسته‌بندی
            </label>
            <input
              {...register("category")}
              className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
              placeholder="کاردرمانی، گفتاردرمانی، ..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2! block text-sm font-medium text-slate-700">
              توضیحات
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
              placeholder="توضیح کوتاه درباره ارزیابی..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2! block text-sm font-medium text-slate-700">
              راهنمای اجرا
            </label>
            <textarea
              {...register("instructions")}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
              placeholder="مثلاً: این ارزیابی توسط درمانگر تکمیل شود..."
            />
          </div>

          <div className="flex items-center gap-3! md:col-span-2">
            <Controller
              control={control}
              name="isPrivate"
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`flex items-center gap-3! rounded-2xl px-4! py-3! text-sm font-medium transition ${
                    field.value
                      ? "bg-violet-100 text-violet-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <span
                    className={`h-5 w-10 rounded-full transition ${
                      field.value ? "bg-violet-600" : "bg-slate-400"
                    } relative`}
                  >
                    <span
                      className={`absolute top-0.5! h-4 w-4 rounded-full bg-white transition ${
                        field.value ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </span>
                  {field.value ? "خصوصی برای درمانگر" : "عمومی کلینیک"}
                </button>
              )}
            />
          </div>
        </div>
      </section>

      {/* Scoring */}
      {/* <section className="rounded-2xl border border-slate-200 bg-white p-4! shadow-sm md:p-6!">
        <div className="flex items-center justify-between gap-4!">
          <h3 className="text-lg font-bold text-slate-900">امتیازدهی</h3>
          <Controller
            control={control}
            name="scoring.enabled"
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={`rounded-full px-4! py-2! text-sm font-medium transition ${
                  field.value
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {field.value ? "فعال" : "غیرفعال"}
              </button>
            )}
          />
        </div>

        {scoringEnabled && (
          <div className="mt-4! grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2! block text-sm font-medium text-slate-700">
                روش امتیازدهی
              </label>
              <select
                {...register("scoring.method")}
                className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
              >
                {SCORING_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2! block text-sm font-medium text-slate-700">
                حداقل امتیاز
              </label>
              <input
                type="number"
                step="1"
                {...register("scoring.minScore", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2! block text-sm font-medium text-slate-700">
                حداکثر امتیاز
              </label>
              <input
                type="number"
                step="1"
                {...register("scoring.maxScore", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
              />
            </div>
          </div>
        )}
      </section> */}

      {/* Questions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4! shadow-sm md:p-6!">
        <div className="flex flex-col gap-4! sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-slate-900">سوال‌ها</h3>
        
        </div>

        <div className="mt-4! space-y-5">
          {questionFields.map((field, index) => {
            const questionType = watch(`questions.${index}.type`);
            const options = watch(`questions.${index}.options`) || [];

            return (
              <div
                key={field.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4!"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-semibold text-slate-900">
                    سوال {index + 1}
                  </h4>

                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="rounded-xl bg-rose-100 px-3! py-2! text-sm font-medium text-rose-700 transition hover:bg-rose-200"
                  >
                    حذف
                  </button>
                </div>

                <div className="mt-4! grid gap-4! md:grid-cols-2">
                  <div hidden>
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      کلید سوال
                    </label>
                    <input
                      {...register(`questions.${index}.key`, {
                        required: "کلید سوال الزامی است",
                      })}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
                      placeholder={`question_${index + 1}`}
                    />
                    {errors.questions?.[index]?.key && (
                      <p className="mt-1! text-sm text-rose-600">
                        {errors.questions[index]?.key?.message}
                      </p>
                    )}
                  </div>

                  <div hidden>
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      ترتیب
                    </label>
                    <input
                      type="number"
                      {...register(`questions.${index}.order`, {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      عنوان سوال
                    </label>
                    <input
                      {...register(`questions.${index}.title`, {
                        required: "عنوان سوال الزامی است",
                      })}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
                      placeholder="مثلاً: آیا بیمار در گرفتن اشیا مشکل دارد؟"
                    />
                    {errors.questions?.[index]?.title && (
                      <p className="mt-1! text-sm text-rose-600">
                        {errors.questions[index]?.title?.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      توضیح
                    </label>
                    <textarea
                      {...register(`questions.${index}.description`)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
                      placeholder="توضیح تکمیلی..."
                    />
                  </div>

                  <div>
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      نوع سوال
                    </label>
                    <select
                      {...register(`questions.${index}.type`, {
                        required: true,
                        onChange: (e) => {
                          const nextType = e.target
                            .value as AssessmentQuestionType;
                          if (nextType === "number") {
                            setValue(
                              `questions.${index}.validation.minLength`,
                              null,
                            );
                            setValue(
                              `questions.${index}.validation.maxLength`,
                              null,
                            );
                            setValue(`questions.${index}.options`, []);
                          } else if (nextType === "text") {
                            setValue(`questions.${index}.validation.min`, null);
                            setValue(`questions.${index}.validation.max`, null);
                            setValue(`questions.${index}.options`, []);
                          } else if (nextType === "boolean") {
                            setValue(`questions.${index}.validation.min`, null);
                            setValue(`questions.${index}.validation.max`, null);
                            setValue(
                              `questions.${index}.validation.minLength`,
                              null,
                            );
                            setValue(
                              `questions.${index}.validation.maxLength`,
                              null,
                            );
                            setValue(
                              `questions.${index}.options`,
                              DEFAULT_BOOLEAN_OPTIONS,
                            );
                          } else {
                            setValue(`questions.${index}.validation.min`, null);
                            setValue(`questions.${index}.validation.max`, null);
                            setValue(
                              `questions.${index}.validation.minLength`,
                              null,
                            );
                            setValue(
                              `questions.${index}.validation.maxLength`,
                              null,
                            );
                          }
                        },
                      })}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
                    >
                      {QUESTION_TYPES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div hidden>
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      وزن سوال
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register(`questions.${index}.weight`, {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none transition focus:border-violet-500"
                    />
                  </div>

                  <div className="flex items-center gap-3!">
                    <Controller
                      control={control}
                      name={`questions.${index}.required`}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`rounded-xl px-4! py-3! text-sm font-medium transition ${
                            field.value
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {field.value ? "الزامی" : "اختیاری"}
                        </button>
                      )}
                    />
                  </div>

                  {/* Validation */}
                  <div className="md:col-span-2">
                    {questionType === "number" && (
                      <div>
                        <h5 className="mb-3! text-sm font-semibold text-slate-800">
                          اعتبارسنجی (عددی)
                        </h5>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2! block text-xs font-medium text-slate-600">
                              حداقل
                            </label>
                            <input
                              type="number"
                              {...register(
                                `questions.${index}.validation.min`,
                                { valueAsNumber: true },
                              )}
                              className="w-full rounded-xl border border-slate-300 px-3! py-2! outline-none focus:border-violet-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2! block text-xs font-medium text-slate-600">
                              حداکثر
                            </label>
                            <input
                              type="number"
                              {...register(
                                `questions.${index}.validation.max`,
                                { valueAsNumber: true },
                              )}
                              className="w-full rounded-xl border border-slate-300 px-3! py-2! outline-none focus:border-violet-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {questionType === "text" && (
                      <div>
                        <h5 className="mb-3! text-sm font-semibold text-slate-800">
                          اعتبارسنجی (متنی)
                        </h5>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2! block text-xs font-medium text-slate-600">
                              حداقل طول
                            </label>
                            <input
                              type="number"
                              {...register(
                                `questions.${index}.validation.minLength`,
                                { valueAsNumber: true },
                              )}
                              className="w-full rounded-xl border border-slate-300 px-3! py-2! outline-none focus:border-violet-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2! block text-xs font-medium text-slate-600">
                              حداکثر طول
                            </label>
                            <input
                              type="number"
                              {...register(
                                `questions.${index}.validation.maxLength`,
                                { valueAsNumber: true },
                              )}
                              className="w-full rounded-xl border border-slate-300 px-3! py-2! outline-none focus:border-violet-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  {isChoiceQuestion(questionType) && (
                    <div className="md:col-span-2">
                      <div className="mb-3! flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-slate-800">
                          {questionType === "boolean"
                            ? "گزینه‌های پیش‌فرض (بولی)"
                            : "گزینه‌ها"}
                        </h5>
                        {questionType !== "boolean" && (
                          <button
                            type="button"
                            onClick={() => {
                              const current =
                                watch(`questions.${index}.options`) || [];
                              setValue(
                                `questions.${index}.options`,
                                [
                                  ...current,
                                  {
                                    key: `option_${current.length + 1}`,
                                    label: `گزینه ${current.length + 1}`,
                                    value: `option_${current.length + 1}`,
                                    score: 0,
                                    order: current.length,
                                  },
                                ],
                                { shouldDirty: true },
                              );
                            }}
                            className="rounded-lg bg-slate-900 px-3! py-2! text-xs font-medium text-white"
                          >
                            + افزودن گزینه
                          </button>
                        )}
                      </div>

                      {questionType === "boolean" ? (
                        <div className="grid gap-3! rounded-xl border border-slate-200 bg-slate-100 p-3! md:grid-cols-2">
                          {/* گزینه اول: بله */}
                          <div className="flex justify-between items-center bg-white p-3! rounded-lg border border-slate-200">
                            <span className="text-sm font-medium text-slate-700">
                              گزینه اول: بله (True)
                            </span>
                            <div className="flex items-center gap-2">
                              {/* فیلدهای مخفی برای ارسال مقادیر مورد نیاز بک‌اند */}
                              <input
                                type="hidden"
                                value="true"
                                {...register(
                                  `questions.${index}.options.0.key`,
                                )}
                              />
                              <input
                                type="hidden"
                                value="بله"
                                {...register(
                                  `questions.${index}.options.0.label`,
                                )}
                              />
                              <input
                                type="hidden"
                                value="true"
                                {...register(
                                  `questions.${index}.options.0.value`,
                                )}
                              />
                              <label className="text-xs text-slate-500">
                                امتیاز:
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                {...register(
                                  `questions.${index}.options.0.score`,
                                  { valueAsNumber: true },
                                )}
                                className="w-16 rounded-md border border-slate-300 px-2! py-1! text-sm outline-none text-center"
                              />
                            </div>
                          </div>
                          {/* گزینه دوم: خیر */}
                          <div className="flex justify-between items-center bg-white p-3! rounded-lg border border-slate-200">
                            <span className="text-sm font-medium text-slate-700">
                              گزینه دوم: خیر (False)
                            </span>
                            <div className="flex items-center gap-2">
                              {/* فیلدهای مخفی برای ارسال مقادیر مورد نیاز بک‌اند */}
                              <input
                                type="hidden"
                                value="false"
                                {...register(
                                  `questions.${index}.options.1.key`,
                                )}
                              />
                              <input
                                type="hidden"
                                value="خیر"
                                {...register(
                                  `questions.${index}.options.1.label`,
                                )}
                              />
                              <input
                                type="hidden"
                                value="false"
                                {...register(
                                  `questions.${index}.options.1.value`,
                                )}
                              />
                              <label className="text-xs text-slate-500">
                                امتیاز:
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                {...register(
                                  `questions.${index}.options.1.score`,
                                  { valueAsNumber: true },
                                )}
                                className="w-16 rounded-md border border-slate-300 px-2! py-1! text-sm outline-none text-center"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // رندر معمولی گزینه‌ها برای single-choice و multiple-choice
                        <div className="space-y-3">
                          {options.map((option, optIndex) => (
                            <div
                              key={`${option.key}-${optIndex}`}
                              className="grid gap-3! rounded-xl border border-slate-200 bg-white p-3! md:grid-cols-4"
                            >
                              <div hidden>
                                <label className="mb-1! block text-xs text-slate-600">
                                  کلید
                                </label>
                                <input
                                  {...register(
                                    `questions.${index}.options.${optIndex}.key`,
                                    { required: true },
                                  )}
                                  className="w-full rounded-lg border border-slate-300 px-3! py-2! text-sm outline-none"
                                />
                              </div>
                              <div>
                                <label className="mb-1! block text-xs text-slate-600">
                                  برچسب
                                </label>
                                <input
                                  {...register(
                                    `questions.${index}.options.${optIndex}.label`,
                                    { required: true },
                                  )}
                                  className="w-full rounded-lg border border-slate-300 px-3! py-2! text-sm outline-none"
                                />
                              </div>
                              <div>
                                <label className="mb-1! block text-xs text-slate-600">
                                  مقدار
                                </label>
                                <input
                                  {...register(
                                    `questions.${index}.options.${optIndex}.value`,
                                    { required: true },
                                  )}
                                  className="w-full rounded-lg border border-slate-300 px-3! py-2! text-sm outline-none"
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <div className="flex-1">
                                  <label className="mb-1! block text-xs text-slate-600">
                                    امتیاز
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    {...register(
                                      `questions.${index}.options.${optIndex}.score`,
                                      { valueAsNumber: true },
                                    )}
                                    className="w-full rounded-lg border border-slate-300 px-3! py-2! text-sm outline-none"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current =
                                      watch(`questions.${index}.options`) || [];
                                    const next = current.filter(
                                      (_, i) => i !== optIndex,
                                    );
                                    setValue(
                                      `questions.${index}.options`,
                                      next,
                                      { shouldDirty: true },
                                    );
                                  }}
                                  className="rounded-lg bg-rose-100 px-3! py-2! text-xs font-medium text-rose-700"
                                >
                                  حذف
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
            <button
            type="button"
            onClick={() =>
              appendQuestion(defaultQuestion(questionFields.length))
            }
            className="rounded-xl bg-violet-600 px-4! py-2! m-2! text-sm font-medium text-white transition hover:bg-violet-500"
          >
            + افزودن سوال
          </button>
        </div>
      </section>

      {/* Score ranges */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4! shadow-sm md:p-6!">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            بازه‌های تفسیر امتیاز
          </h3>
          <button
            type="button"
            onClick={() =>
              appendRange({
                title: "",
                description: "",
                minScore: 0,
                maxScore: 0,
                color: "#64748b",
                severity: "normal",
              })
            }
            className="rounded-xl bg-slate-900 px-4! py-2! text-sm font-medium text-white transition hover:bg-slate-800"
          >
            + افزودن بازه
          </button>
        </div>

        <div className="mt-4! space-y-4">
          {rangeFields.length === 0 ? (
            <p className="text-sm text-slate-500">
              هنوز بازه‌ای تعریف نشده است.
            </p>
          ) : (
            rangeFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4!"
              >
                <div className="mb-3! flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">
                    بازه {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeRange(index)}
                    className="rounded-lg bg-rose-100 px-3! py-2! text-xs font-medium text-rose-700"
                  >
                    حذف
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      عنوان
                    </label>
                    <input
                      {...register(`scoreRanges.${index}.title`, {
                        required: true,
                      })}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="مثلاً: وضعیت خفیف"
                    />
                  </div>

                  <div>
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      شدت
                    </label>
                    <select
                      {...register(`scoreRanges.${index}.severity`)}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none"
                    >
                      {SEVERITIES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      حداقل امتیاز
                    </label>
                    <input
                      type="number"
                      {...register(`scoreRanges.${index}.minScore`, {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      حداکثر امتیاز
                    </label>
                    <input
                      type="number"
                      {...register(`scoreRanges.${index}.maxScore`, {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      توضیح
                    </label>
                    <textarea
                      {...register(`scoreRanges.${index}.description`)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2! block text-sm font-medium text-slate-700">
                      رنگ
                    </label>
                    <input
                      {...register(`scoreRanges.${index}.color`)}
                      className="w-full rounded-xl border border-slate-300 px-4! py-3! outline-none"
                      placeholder="#22c55e"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={()=>navigate("/systematicassessments")}
          className="rounded-xl border border-slate-300 bg-white px-5! py-3! text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          انصراف
        </button>

        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending}
          className="rounded-xl bg-violet-600 px-5! py-3! text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting || createMutation.isPending
            ? "در حال ذخیره..."
            : "ثبت ارزیابی"}
        </button>
      </div>
    </form>
  );
}
