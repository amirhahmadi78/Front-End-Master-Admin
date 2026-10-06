import { useMemo, useState } from "react";
import type { IExercise, TherapyDomain } from "../../types/exercises";
import { THERAPY_DOMAINS } from "../../types/exercises";
import { useFindExercises, useDeleteExercise } from "../../hooks/exercise";
import ExerciseViewModal from "./exerciseViewModal";

interface ExerciseManagerPanelProps {
  currentTherapistId: string;
  onCreateExercise: () => void;
  onEditExercise: (exercise: IExercise) => void;
}

interface ExerciseCardProps {
  exercise: IExercise;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const domainLabels: Record<TherapyDomain, string> = {
  speech: "گفتاردرمانی",
  sensory: "حسی",
  cognitive: "ذهنی / شناختی",
  perceptual_motor: "درکی - حرکتی",
  physical: "جسمی",
  education: "آموزش",
};

const getTherapistId = (exercise: IExercise) => {
  
  if (!exercise.therapist) return "";
  if (typeof exercise.therapist === "string") return exercise.therapist;
  return exercise.therapist._id;
};

const getSubdomainAccordionKey = (domain: TherapyDomain, subdomain: string) =>
  `${domain}__${subdomain}`;

export default function ExerciseManagerPanel({
  currentTherapistId,
  onCreateExercise,
  onEditExercise,
}: ExerciseManagerPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<"" | TherapyDomain>("");
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

// مقدار لحظه‌ای که کاربر تایپ می‌کنه (هنوز jستجو نشده)
const [searchDraft, setSearchDraft] = useState("");
  const [openDomains, setOpenDomains] = useState<Record<TherapyDomain, boolean>>({
    speech: false,
    sensory: false,
    cognitive: false,
    perceptual_motor: false,
    physical: false,
    education: false,
  });

  const [openSubdomains, setOpenSubdomains] = useState<Record<string, boolean>>({});

  const { data: exercises = [], isLoading } = useFindExercises({
    search: search || undefined,
    domain: selectedDomain || undefined,
  });

  const { mutate: deleteExercise, isPending: isDeleting } = useDeleteExercise();

  const myExercises = useMemo(() => {
    return exercises.filter(
      (exercise) => getTherapistId(exercise) === currentTherapistId,
    );
  }, [exercises, currentTherapistId]);



  const structuredExercises = useMemo(() => {
    const structure: Record<TherapyDomain, Record<string, IExercise[]>> = {
      speech: {},
      sensory: {},
      cognitive: {},
      perceptual_motor: {},
      physical: {},
      education: {},
    };

    exercises.forEach((exercise) => {
      exercise.domains.forEach((domainItem) => {
        const { domain, subdomains } = domainItem;

        if (!structure[domain]) return;

        if (!subdomains?.length) {
          if (!structure[domain]["سایر"]) {
            structure[domain]["سایر"] = [];
          }

          const exists = structure[domain]["سایر"].some((item) => item._id === exercise._id);
          if (!exists) {
            structure[domain]["سایر"].push(exercise);
          }

          return;
        }

        subdomains.forEach((subdomain) => {
          if (!structure[domain][subdomain]) {
            structure[domain][subdomain] = [];
          }

          const exists = structure[domain][subdomain].some(
            (item) => item._id === exercise._id,
          );

          if (!exists) {
            structure[domain][subdomain].push(exercise);
          }
        });
      });
    });

    return structure;
  }, [exercises]);

  const toggleDomainAccordion = (domain: TherapyDomain) => {
    setOpenDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  const toggleSubdomainAccordion = (domain: TherapyDomain, subdomain: string) => {
    const key = getSubdomainAccordionKey(domain, subdomain);

    setOpenSubdomains((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDelete = (exerciseId: string) => {
    const isConfirmed = window.confirm("امیر اداش، آیا از حذف این تمرین مطمئن هستی؟");
    if (!isConfirmed) return;
    deleteExercise(exerciseId);
  };

  if (isLoading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3!" dir="rtl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
        <p className="text-sm font-medium text-gray-500">
          در حال دسته‌بندی هوشمند تمرین‌ها...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12! pt-10! font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4! rounded-2xl border border-slate-100 bg-white p-6! shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">بانک تمرینات</h2>
          <p className="mt-1! text-sm text-slate-500">
            مدیریت تخصصی تمرین‌ها به تفکیک حیطه و زیرحیطه
          </p>
        </div>

        <button
          onClick={onCreateExercise}
          className="flex items-center justify-center gap-2! rounded-xl bg-sky-600 px-5! py-3! font-semibold text-white shadow-lg shadow-sky-600/20 transition-all hover:bg-sky-700 active:scale-95"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          ایجاد تمرین جدید
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-3! rounded-2xl border border-slate-100 bg-white p-4! shadow-sm md:grid-cols-3">
        <div className="relative md:col-span-2">
    <input
      value={searchDraft}
      onChange={(e) => setSearchDraft(e.target.value)}
      onKeyDown={(e) => {
        // با فشردن Enter هم جستجو انجام بشه
        if (e.key === "Enter") setSearch(searchDraft.trim());
      }}
      placeholder="جستجو در عنوان، توضیحات یا زیرحیطه..."
      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5! pl-4! pr-10! text-sm transition-all focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
    />
    {/* دکمه جستجو به جای آیکون ثابت */}
    <button
      onClick={() => setSearch(searchDraft.trim())}
      title="جستجو"
      className="absolute left-3! top-1/2 -translate-y-1/2 rounded-lg bg-sky-600 p-2! text-white shadow-sm transition-all hover:bg-sky-700 active:scale-90"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value as "" | TherapyDomain)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4! py-2.5! text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        >
          <option value="">همه حیطه‌ها</option>
          {THERAPY_DOMAINS.map((domain) => (
            <option key={domain} value={domain}>
              {domainLabels[domain]}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 p-1!">
        {[
          { key: "all", label: "همه تمرین‌ها" },
          { key: "mine", label: "تمرین‌های من" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "all" | "mine")}
            className={`relative px-6! py-3! text-sm font-bold transition-all ${
              activeTab === tab.key
                ? "text-sky-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-sky-600" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "mine" ? (
          <div className="grid gap-4! md:grid-cols-2">
            {myExercises.length > 0 ? (
              myExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise._id}
                  exercise={exercise}
                  isOwner
                  onEdit={() => onEditExercise(exercise)}
                  onDelete={() => handleDelete(exercise._id)}
                  isDeleting={isDeleting}
                />
              ))
            ) : (
              <p className="col-span-full py-10 text-center text-slate-400">
                تمرینی یافت نشد.
              </p>
            )}
          </div>
        ) : (
          THERAPY_DOMAINS.map((domain) => {
            if (selectedDomain && selectedDomain !== domain) return null;

            const subdomainMap = structuredExercises[domain];
            const subdomainEntries = Object.entries(subdomainMap);
            const hasData = subdomainEntries.length > 0;

            return (
              <div
                key={domain}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Domain Header */}
                <button
                  onClick={() => toggleDomainAccordion(domain)}
                  className={`flex w-full items-center justify-between p-4! transition-colors ${
                    openDomains[domain] ? "bg-sky-50/30" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3!">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-inner">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>

                    <div className="text-right">
                      <h4 className="text-base font-black text-slate-800">
                        {domainLabels[domain]}
                      </h4>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        {subdomainEntries.length} زیرحیطه فعال
                      </p>
                    </div>
                  </div>

                  <svg
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      openDomains[domain] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Domain Body */}
                {openDomains[domain] && (
                  <div className="space-y-4 border-t border-slate-50 p-4!">
                    {!hasData ? (
                      <p className="py-4 text-center text-xs text-slate-400">
                        تمرینی در این حیطه ثبت نشده است.
                      </p>
                    ) : (
                      subdomainEntries.map(([subdomainName, items]) => {
                        const subdomainKey = getSubdomainAccordionKey(
                          domain,
                          subdomainName,
                        );
                        const isSubdomainOpen = !!openSubdomains[subdomainKey];

                        return (
                          <div
                            key={subdomainKey}
                            className="overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/30"
                          >
                            {/* Subdomain Header */}
                            <button
                              onClick={() =>
                                toggleSubdomainAccordion(domain, subdomainName)
                              }
                              className="flex w-full items-center justify-between px-4! py-3! text-right transition-colors hover:bg-emerald-50"
                            >
                              <div className="flex items-center gap-3!">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                <div className="flex flex-col items-start">
                                  <span className="text-sm font-bold text-slate-700">
                                    {subdomainName}
                                  </span>
                                  <span className="text-[11px] text-emerald-700/80">
                                    {items.length} تمرین
                                  </span>
                                </div>
                              </div>

                              <svg
                                className={`h-4 w-4 text-emerald-700 transition-transform ${
                                  isSubdomainOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>

                            {/* Subdomain Body */}
                            {isSubdomainOpen && (
                              <div className="border-t border-emerald-100 bg-white p-4!">
                                <div className="grid gap-4! md:grid-cols-2 lg:grid-cols-2">
                                  {items.map((exercise) => (
                                    <ExerciseCard
                                      key={exercise._id}
                                      exercise={exercise}
                                      isOwner={
                                        getTherapistId(exercise) === currentTherapistId
                                      }
                                      onEdit={() => onEditExercise(exercise)}
                                      onDelete={() => handleDelete(exercise._id)}
                                      isDeleting={isDeleting}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ExerciseCard({
  exercise,
  isOwner,
  onEdit,
  onDelete,
  isDeleting,
}: ExerciseCardProps) {
  const [exerciseModal,setExerciseModal]=useState(false)


  
  return (
    <>
    <div className=" group flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5! shadow-sm transition-all hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/5 active:scale-[0.99]">
      <div onClick={()=>setExerciseModal(true)}>
        <div  className="mb-3! flex items-start justify-between gap-3!">
          <div className="min-w-0 flex-1">
            <h5  className="truncate text-base font-bold text-slate-800 transition-colors group-hover:text-sky-700">
              {exercise.title}
            </h5>
            <p  className="mt-1! line-clamp-2 text-xs leading-relaxed text-slate-500">
              {exercise.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5!">
            {exercise.forPatient && (
              <span  className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5! py-1! text-[10px] font-bold text-emerald-700 shadow-sm">
                برای مراجع
              </span>
            )}
            {!exercise.forPatient && (
              <span  className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5! py-1! text-[10px] font-bold text-emerald-700 shadow-sm">
               فقط برای درمانگران
              </span>
            )}

            {exercise.private &&  (
              <span  className="rounded-lg border border-amber-100 bg-amber-50 px-2.5! py-1! text-[10px] font-bold text-amber-700 shadow-sm">
                خصوصی
              </span>
            )}
            {!exercise.private &&  (
              <span  className="rounded-lg border border-amber-100 bg-amber-50 px-2.5! py-1! text-[10px] font-bold text-amber-700 shadow-sm">
                عمومی
              </span>
            )}
          </div>
        </div>

        {exercise.category && (
          <div  className="mb-3! flex w-fit items-center gap-1.5! rounded-md bg-slate-50 px-2! py-0.5! text-[11px] text-slate-400">
            <span className="font-bold text-slate-500">دسته:</span>
            <span>{exercise.category}</span>
          </div>
        )}
        {exercise?.therapist?.firstName && (
          <div  className="mb-3! flex w-fit items-center gap-1.5! rounded-md bg-slate-50 px-2! py-0.5! text-[11px] text-slate-400">
            <span className="font-bold text-slate-500">درمانگر : </span>
            <span>{exercise.therapist.firstName} {exercise.therapist.lastName}</span>
          </div>
        )}

        {exercise.files && exercise.files.length > 0 && (
          <div  className="mt-3! flex flex-wrap gap-1.5!">
            {exercise.files.map((file, index) => (
              <a
                key={index}
                // href={file.fileURLs}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1! rounded-lg border border-slate-100 bg-slate-50/50 px-2! py-1! text-[10px] font-bold text-sky-600 transition-colors hover:bg-sky-50"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                {file.fileType}
              </a>
            ))}
          </div>
        )}
      </div>

      {isOwner && (
        <div className="mt-4! flex gap-2! border-t border-slate-50 pt-4!  transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1.5! rounded-xl bg-sky-50 py-2! text-[11px] font-black text-sky-700 transition-colors hover:bg-sky-100"
          >
            ویرایش
          </button>

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center justify-center rounded-xl bg-red-50 px-3! py-2! text-[11px] font-black text-red-600 transition-colors hover:bg-red-100 disabled:opacity-30"
          >
            حذف
          </button>
        </div>
      )}
      
    </div>
    {(exerciseModal&&exercise)&&<ExerciseViewModal   exercise={exercise}
  isOpen={exerciseModal}
  onClose={()=>{setExerciseModal(false)}}/>}

</>
  );
}
