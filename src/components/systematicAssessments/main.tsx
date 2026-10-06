// components/assessment/AssessmentTemplatesPanel.tsx

import { useMemo, useState } from "react";
import {
  useArchiveAssessmentTemplate,
  useDeleteAssessmentTemplate,
  usePublishAssessmentTemplate,
  useAssessmentTemplates,
} from "../../hooks/assessmentTemplate";
import type { AssessmentTemplate } from "../../services/assessmentTemplate";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AlertSwal } from "../../utils/errorSwal";
import { AssessmentTemplateModal } from "./assessmentShowModal";



function statusBadge(status: AssessmentTemplate["status"]) {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    case "draft":
      return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
    case "archived":
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function statusLabel(status: AssessmentTemplate["status"]) {
  switch (status) {
    case "published":
      return "منتشر شده";
    case "draft":
      return "پیش‌نویس";
    case "archived":
      return "بایگانی";
    default:
      return status;
  }
}

function TemplateCard({
  template,
  editable,
  onEdit,
onPublish,
  onDelete,
  setModal
}: {
  template: AssessmentTemplate;
  editable: boolean;
  onEdit?: (template: AssessmentTemplate) => void;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  setModal:Function
}) {

  return (
    <div className="rounded-2xl border-2! border-green-600! bg-white p-4! shadow-sm transition hover:shadow-md">
      <div onClick={()=>setModal(template)} className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {template.title}
            </h3>
            <span
              className={`rounded-full px-2.5! py-1! text-xs font-medium ${statusBadge(template.status)}`}
            >
              {statusLabel(template.status)}
            </span>
            {template.isPrivate && (
              <span className="rounded-full bg-violet-100 px-2.5! py-1! text-xs font-medium text-violet-700 ring-1 ring-violet-200">
                شخصی
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {template.description || "بدون توضیحات"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
          <span>کد: {template.code}</span>
          <span>نسخه: {template.version}</span>
        </div>
      </div>

      <div onClick={()=>setModal(template)} className="mt-4! grid grid-cols-2 gap-3! text-sm sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3!">
          <div className="text-slate-400">دسته</div>
          <div className="mt-1 font-medium text-slate-800">
            {template.category || "—"}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3!">
          <div className="text-slate-400">سوال‌ها</div>
          <div className="mt-1 font-medium text-slate-800">
            {template.questions?.length || 0}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3!">
          <div className="text-slate-400">اسکورینگ</div>
          <div className="mt-1 font-medium text-slate-800">
            {template.scoring?.enabled ? template.scoring.method : "غیرفعال"}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3!">
          <div className="text-slate-400">فعال</div>
          <div className="mt-1 font-medium text-slate-800">
            {template.isActive ? "بله" : "خیر"}
          </div>
        </div>
      </div>

      {editable ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onEdit?.(template._id)}
            className="rounded-xl bg-slate-900 px-4! py-2! text-sm font-medium text-white transition hover:bg-slate-800"
          >
            ویرایش
          </button>

          {template.status !== "published" && (
            <button
              onClick={() => onPublish?.(template._id)}
              className="rounded-xl bg-emerald-600 px-4! py-2! text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              انتشار
            </button>
          )}

          {/* {template.status !== "archived" && (
            <button
              onClick={() => onArchive?.(template._id)}
              className="rounded-xl bg-amber-500 px-4! py-2! text-sm font-medium text-white transition hover:bg-amber-400"
            >
              بایگانی
            </button>
          )} */}

          <button
            onClick={() => onDelete?.(template._id)}
            className="rounded-xl bg-rose-600 px-4! py-2! text-sm font-medium text-white transition hover:bg-rose-500"
          >
            حذف
          </button>
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-500">
          این ارزیابی عمومی است و قابل ویرایش توسط درمانگر نیست.
        </div>
      )}
    </div>
  );
}

export function AssessmentTemplatesPanel() {
  const navigate=useNavigate()
  const currentUserId = useAuth().user?._id;
  const { data, isLoading, isError } = useAssessmentTemplates({ limit: 100 });

  const publishMutation = usePublishAssessmentTemplate();
  const archiveMutation = useArchiveAssessmentTemplate();
  const deleteMutation = useDeleteAssessmentTemplate();

  const templates = data ?? [];
const [templateDetails,setTemplateDetails]=useState(null)
  const onEdit=(id)=>{
      navigate("/systematicassessments/edit/"+id)
  }
  const { publicTemplates, therapistTemplates } = useMemo(() => {
    return {
      publicTemplates: templates.filter((t) => t.createdBy!==currentUserId),
      therapistTemplates: templates.filter(
        (t) => t.createdBy === currentUserId,
      ),
    };
  }, [templates, currentUserId]);

  return (
    <div className="space-y-3! p-2!">
      {/* Header */}
      <div className="rounded-3xl bg-linear-to-l from-slate-900 to-slate-700 p-6! text-white shadow-lg">
        <div className="flex flex-col gap-4! md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">مدیریت ارزیابی‌ها</h2>
            <p className="mt-2! max-w-2xl text-sm text-slate-200">
              ارزیابی‌های عمومی کلینیک در این بخش فقط قابل مشاهده هستند، و
              ارزیابی‌های شخصی درمانگر قابل ایجاد، ویرایش و مدیریت هستند.
            </p>
          </div>

          <button
            onClick={()=>navigate("/systematicassessments/new")}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5! py-3! text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            + ساخت ارزیابی جدید
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8! text-center text-slate-500">
          در حال بارگذاری ارزیابی‌ها...
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4! text-rose-700">
          خطا در دریافت ارزیابی‌ها
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-8!">
          {/* Public */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  ارزیابی‌های عمومی کلینیک
                </h3>
                <p className="text-sm text-slate-500">
                  این ارزیابی‌ها فقط برای مشاهده هستند.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3! py-1! text-sm text-slate-600">
                {publicTemplates.length} مورد
              </span>
            </div>

            {publicTemplates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8! text-center text-slate-500">
                هنوز ارزیابی عمومی ثبت نشده است.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {publicTemplates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    editable={false}
                    setModal={setTemplateDetails}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Therapist */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  ارزیابی‌های اختصاصی شما
                </h3>
                <p className="text-sm text-slate-500">
                  این ارزیابی‌ها قابل مدیریت توسط خود شما هستند.
                </p>
              </div>
              <span className="rounded-full bg-violet-100 px-3! py-1! text-sm text-violet-700">
                {therapistTemplates.length} مورد
              </span>
            </div>

            {therapistTemplates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-violet-300 bg-violet-50 p-8! text-center">
                <p className="text-violet-800">
                  هنوز ارزیابی شخصی ایجاد نکرده‌اید.
                </p>
                <button
              onClick={()=>navigate("/systematicassessments/new")}
                  className="mt-4 rounded-xl bg-violet-600 px-4! py-2! text-sm font-medium text-white transition hover:bg-violet-500"
                >
                  ساخت اولین ارزیابی
                </button>
              </div>
            ) : (
              <div className="grid gap-4! lg:grid-cols-2">
                {therapistTemplates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    editable
                    onEdit={onEdit}
                    onPublish={(id) => publishMutation.mutate(id)}
                    onArchive={(id) => archiveMutation.mutate(id)}
                    onDelete={async (id) => {
                      const { isConfirmed } = await AlertSwal.doYouWant("آیا مایل به حذف این ارزیابی می باشید؟");
                      if (isConfirmed) {
                        deleteMutation.mutate(id);
                      }
                    } } setModal={setTemplateDetails}                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      {(templateDetails&&templateDetails!==null&&templateDetails!==undefined)&&<AssessmentTemplateModal onClose={()=>setTemplateDetails(null)} template={templateDetails}/>}
    </div>
  );
}
