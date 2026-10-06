// pages/exercise-sheets/ExerciseSheetListPage.tsx

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useDeleteExerciseSheet,
  useFindExerciseSheets,
} from "../../hooks/exerciseSheet";

import type { IExerciseSheet, TherapyDomain } from "../../types/exerciseSheets";
import {
  DomainSubdomainMap,
  THERAPY_DOMAINS,
  THERAPY_DOMAIN_LABELS,
} from "../../types/exerciseSheets";
import Pagination from "../util.componenet/pagination";
import ExerciseSheetViewModal from "./ExerciseSheetViewModal";
import { AlertSwal } from "../../utils/errorSwal";
import { Globe, Lock, UserCheck, Users, Eye, PlusCircle, Edit3, Trash2 } from "lucide-react";

interface ExerciseSheetListPageProps {
  currentTherapistId: string;
}

type ActiveTab = "createdByMe" | "assignedToMe" | "publicSheets";
type PrivacyFilter = "all" | "public" | "private";

function getFullName(value: IExerciseSheet["createdBy"]) {
  if (!value) return "نامشخص";
  if (typeof value === "string") return value;
  return `${value.firstName || ""} ${value.lastName || ""}`.trim() || "بدون نام";
}

export default function ExerciseSheetListPage({
  currentTherapistId,
}: ExerciseSheetListPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("createdByMe");

  const [page, setPage] = useState(1);
const [searchInput, setSearchInput] = useState("");
const [search, setSearch] = useState("");

  const [selectedDomain, setSelectedDomain] = useState<TherapyDomain | "">("");
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>("");
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>("all");
  const [selectedSheet, setSelectedSheet] = useState<IExerciseSheet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availableSubdomains = useMemo(() => {
    if (!selectedDomain) return [];
    return DomainSubdomainMap[selectedDomain] || [];
  }, [selectedDomain]);

  const query = useMemo(() => {
    const isPrivateParam =
      privacyFilter === "public"
        ? false
        : privacyFilter === "private"
        ? true
        : undefined;

    const baseQuery = {
      search: searchInput || undefined,
      domain: selectedDomain || undefined,
      subdomain: selectedSubdomain || undefined,
      page,
      limit: 10,
      withoutPatient: true,
    };

    // ۱. تب برگه‌های ساخته‌شده توسط خود کاربر
    if (activeTab === "createdByMe") {
      return {
        ...baseQuery,
        isPrivate: isPrivateParam,
        createdBy: currentTherapistId,
      };
    }

    // ۲. تب برگه‌های اختصاص داده شده به این درمانگر
    if (activeTab === "assignedToMe") {
      return {
        ...baseQuery,
        isPrivate: isPrivateParam,
        therapist: currentTherapistId,
      };
    }

    // ۳. تب برگه‌های عمومی سایر همکاران (بدون مراجع، isPrivate: false و خارج از ایجادکننده فعلی)
    return {
      ...baseQuery,
      isPrivate: false,
      excludeCreatedBy: currentTherapistId, // یا notCreatedBy متناسب با فیلتر بک‌اند
    };
  }, [privacyFilter, searchInput, selectedDomain, selectedSubdomain, page, activeTab, currentTherapistId]);

  const { data, isLoading, isFetching } = useFindExerciseSheets(query);
  const deleteMutation = useDeleteExerciseSheet();

  const changeTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TherapyDomain | "";
    setSelectedDomain(value);
    setSelectedSubdomain("");
    setPage(1);
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubdomain(e.target.value);
    setPage(1);
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrivacyFilter(e.target.value as PrivacyFilter);
    setPage(1);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    
    setSearchInput(event.target[0].value)
    setPage(1);
  };

  const handleOpenModal = (sheet: IExerciseSheet) => {
    setSelectedSheet(sheet);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await AlertSwal.doYouWant(
      "آیا از حذف این برگه تمرین اطمینان دارید؟",
    );

    if (!isConfirmed) return;

    await deleteMutation.mutateAsync(id);
  };

  return (
    <section dir="rtl" className="min-h-screen bg-linear-to-b from-sky-50/50 via-white to-emerald-50/40 p-4! pt-16! sm:p-6! sm:pt-20!">
      <div className="mx-auto! max-w-7xl space-y-6!">
        {/* هدر صفحه */}
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-sky-100 bg-white/80 p-6! shadow-sm backdrop-blur-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              برگه‌های تمرین
            </h1>
            <p className="mt-1! text-sm text-slate-500">
              مدیریت، اشتراک‌گذاری و تجویز برنامه‌های تمرینی
            </p>
          </div>

          <Link
            to="/exercise-sheets/create"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-600 to-emerald-600 px-5! py-3! text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-sky-700 hover:to-emerald-700 hover:shadow-md active:scale-[0.99]"
          >
            <PlusCircle className="h-4 w-4" />
            ایجاد برگه تمرین جدید
          </Link>
        </div>

        {/* سوییچر تب‌ها (۳ تب) */}
        <div className="rounded-2xl border border-sky-100 bg-white p-1.5! shadow-sm">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => changeTab("createdByMe")}
              className={`rounded-xl px-4! py-3! text-sm font-semibold transition-all duration-200 ${
                activeTab === "createdByMe"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              برگه‌های تمرینی من
            </button>

            <button
              type="button"
              onClick={() => changeTab("assignedToMe")}
              className={`rounded-xl px-4! py-3! text-sm font-semibold transition-all duration-200 ${
                activeTab === "assignedToMe"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              برگه‌های مشترک‌شده با من
            </button>

            <button
              type="button"
              onClick={() => changeTab("publicSheets")}
              className={`rounded-xl px-4! py-3! text-sm font-semibold transition-all duration-200 ${
                activeTab === "publicSheets"
                  ? "bg-linear-to-r from-teal-600 to-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              کتابخانه برگه‌های عمومی همکاران
            </button>
          </div>
        </div>

        {/* فیلترها و فرم جستجو */}
        <div className="rounded-3xl border border-sky-100 bg-white p-5! shadow-sm space-y-4!">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* سلکتور حیطه */}
            <div>
              <label className="mb-1.5! block text-xs font-medium text-slate-600">حیطه درمانی</label>
              <select
                value={selectedDomain}
                onChange={handleDomainChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4! py-2.5! text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              >
                <option value="">همه حیطه‌ها</option>
                {THERAPY_DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>
                    {THERAPY_DOMAIN_LABELS[domain] || domain}
                  </option>
                ))}
              </select>
            </div>

            {/* سلکتور زیرحیطه */}
            <div>
              <label className="mb-1.5! block text-xs font-medium text-slate-600">زیرحیطه</label>
              <select
                value={selectedSubdomain}
                onChange={handleSubdomainChange}
                disabled={!selectedDomain}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4! py-2.5! text-sm text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              >
                <option value="">
                  {selectedDomain ? "همه زیرحیطه‌ها" : "ابتدا حیطه را انتخاب کنید"}
                </option>
                {availableSubdomains.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* فیلتر حریم خصوصی (در تب عمومی غیرفعال و فیکس است) */}
            <div>
              <label className="mb-1.5! block text-xs font-medium text-slate-600">وضعیت دسترسی</label>
              <select
                value={activeTab === "publicSheets" ? "public" : privacyFilter}
                onChange={handlePrivacyChange}
                disabled={activeTab === "publicSheets"}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4! py-2.5! text-sm text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              >
                {activeTab === "publicSheets" ? (
                  <option value="public">فقط برگه‌های عمومی</option>
                ) : (
                  <>
                    <option value="all">همه وضعیت‌ها (عمومی و خصوصی)</option>
                    <option value="public">فقط برگه‌های عمومی</option>
                    <option value="private">فقط برگه‌های خصوصی</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جست‌وجو در عنوان یا توضیحات برگه..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4! py-2.5! text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="submit"
              className="rounded-2xl bg-sky-600 px-6! py-2.5! text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 active:scale-95"
            >
              جست‌وجو
            </button>
          </form>
        </div>

        {/* محتوای لیست کارت‌ها */}
        {isLoading ? (
          <div className="rounded-3xl border border-sky-100 bg-white p-12! text-center text-sm text-slate-500 shadow-sm">
            در حال دریافت اطلاعات برگه‌های تمرینی...
          </div>
        ) : data?.data.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-12! text-center text-sm text-slate-500 shadow-sm">
            {activeTab === "publicSheets"
              ? "هیچ برگه عمومی از سایر همکاران با این مشخصات یافت نشد."
              : "برگه تمرینی برای نمایش وجود ندارد."}
          </div>
        ) : (
          <>
            <div
              className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${
                isFetching ? "opacity-60 transition-opacity" : ""
              }`}
            >
              {data?.data.map((sheet) => (
                <ExerciseSheetCard
                  key={sheet._id}
                  sheet={sheet}
                  activeTab={activeTab}
                  onDelete={handleDelete}
                  onView={handleOpenModal}
                />
              ))}
            </div>

            <Pagination
              page={data?.page ?? page}
              setPage={setPage}
              totalPages={data?.totalPages ?? 1}
            />
          </>
        )}
      </div>

      {/* مدال مشاهده جزئیات برگه */}
      <ExerciseSheetViewModal
        sheet={selectedSheet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSheet(null);
        }}
      />
    </section>
  );
}

interface ExerciseSheetCardProps {
  sheet: IExerciseSheet;
  activeTab: ActiveTab;
  onDelete: (id: string) => void;
  onView: (sheet: IExerciseSheet) => void;
}

function ExerciseSheetCard({
  sheet,
  activeTab,
  onDelete,
  onView,
}: ExerciseSheetCardProps) {
  const isPublic = sheet.isPrivate === false;

  const getHeaderAccent = () => {
    if (activeTab === "createdByMe") return "bg-emerald-500";
    if (activeTab === "assignedToMe") return "bg-sky-500";
    return "bg-gradient-to-r from-teal-500 to-sky-500";
  };

  return (
    <article className="flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-md">
      <div>
        {/* نوار رنگی بالای کارت */}
        <div className={`h-2 ${getHeaderAccent()}`} />

        <div className="p-5!">
          <div onClick={() => onView(sheet)} className="cursor-pointer">
            <div className="mb-3! flex flex-col gap-2">
              <h2 className="line-clamp-2 text-base font-bold text-slate-800 transition hover:text-sky-600">
                {sheet.title}
              </h2>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* بج عمومی / خصوصی */}
                {isPublic ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2! py-0.5! text-[11px] font-medium text-emerald-700">
                    <Globe className="h-3 w-3 text-emerald-600" />
                    عمومی
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2! py-0.5! text-[11px] font-medium text-slate-600">
                    <Lock className="h-3 w-3 text-slate-500" />
                    خصوصی
                  </span>
                )}

                {/* بج مراجع */}
                {sheet.forPatient ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2! py-0.5! text-[11px] font-medium text-sky-700">
                    <UserCheck className="h-3 w-3 text-sky-600" />
                    پنل مراجع
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2! py-0.5! text-[11px] font-medium text-slate-500">
                    فقط درمانگر
                  </span>
                )}

                <span className="rounded-full bg-slate-100 px-2.5! py-0.5! text-xs text-slate-600">
                  {sheet.items?.length || 0} تمرین
                </span>
              </div>
            </div>

            {sheet.description && (
              <p className="mb-4! line-clamp-2 text-xs leading-6 text-slate-500">
                {sheet.description}
              </p>
            )}

            {/* نمایش حیطه‌ها و زیرحیطه‌ها */}
            {sheet.domains && sheet.domains.length > 0 && (
              <div className="mb-4! flex flex-wrap gap-1.5">
                {sheet.domains.map((item, index) => (
                  <span
                    key={index}
                    className="rounded-xl border border-sky-100 bg-sky-50/70 px-2.5! py-1! text-[11px] text-sky-800"
                  >
                    <span className="font-semibold">
                      {THERAPY_DOMAIN_LABELS[item.domain] || item.domain}
                    </span>
                    {item.subdomains && item.subdomains.length > 0 && (
                      <span className="text-sky-600">
                        : {item.subdomains.join("، ")}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-4! space-y-1! text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <span>ایجادکننده:</span>
                <span className="font-medium text-slate-700">
                  {getFullName(sheet.createdBy)}
                </span>
              </div>

              <div>
                تاریخ: {sheet.createdAt ? new Date(sheet.createdAt).toLocaleDateString("fa-IR") : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* اکشن‌های پایین کارت */}
      <div className="border-t border-slate-100 p-4! pt-3!">
        <div className="flex flex-wrap gap-2">
          {/* دکمه مشاهده برای همه تب‌ها */}
          <button
            type="button"
            onClick={() => onView(sheet)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3! py-2! text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            <Eye className="h-3.5 w-3.5" />
            مشاهده
          </button>

          {/* تب عمومی یا تب اختصاصی: تجویز برگه تمرین */}
        

          {/* امکان ویرایش فقط برای سازنده برگه */}
          {activeTab === "createdByMe" && (
            <Link
              to={`/exercise-sheets/${sheet._id}/edit`}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3! py-2! text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Edit3 className="h-3.5 w-3.5" />
              ویرایش
            </Link>
          )}

          {/* امکان حذف فقط برای سازنده برگه */}
          {activeTab === "createdByMe" && (
            <button
              type="button"
              onClick={() => onDelete(sheet._id)}
              className="inline-flex items-center justify-center rounded-xl bg-red-50 p-2! text-red-600 transition hover:bg-red-100"
              title="حذف برگه"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}