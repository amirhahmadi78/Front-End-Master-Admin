// ───────────────────────────────────────────────
// File Types & Constants
// ───────────────────────────────────────────────
export const EXERCISE_SHEET_FILE_TYPES = [
  "video",
  "audio",
  "pdf",
  "image",
  "document",
  "other",
] as const;

export type ExerciseSheetFileType =
  (typeof EXERCISE_SHEET_FILE_TYPES)[number];

export interface IExerciseSheetFile {
  fileURLs?: string;
  fileType?: ExerciseSheetFileType;
}

// ───────────────────────────────────────────────
// Therapy Domains & Subdomains
// ───────────────────────────────────────────────
export const THERAPY_DOMAINS = [
  "speech",
  "sensory",
  "cognitive",
  "perceptual_motor",
  "physical",
  "education",
] as const;

export type TherapyDomain = (typeof THERAPY_DOMAINS)[number];

export interface IDomainSelection {
  domain: TherapyDomain;
  subdomains: string[];
}

export const DomainSubdomainMap: Record<TherapyDomain, string[]> = {
  speech: [
    "تولید و تلفظ",
    "ناروانی و لکنت",
    "زبان دریافتی",
    "زبان بیانی",
    "کاربردشناسی",
    "مهارت‌های دهانی-حرکتی و بلع",
    "صوت و حنجره",
    "توجه و تمرکز",
    "حافظه",
    "عملکردهای اجرایی",
    "مهار و کنترل تکانه",
  ],
  sensory: [
    "حس لامسه",
    "حس عمقی",
    "حس تعادلی",
    "حس بینایی",
    "حس شنوایی",
    "درون‌حسی",
    "تعدیل و تنظیم حسی",
  ],
  cognitive: [
    "توجه و تمرکز",
    "حافظه",
    "عملکردهای اجرایی",
    "مهار و کنترل تکانه",
    "ادراک و تفکر منطقی",
    "شناخت اجتماعی و هیجانی",
  ],
  perceptual_motor: [
    "برنامه‌ریزی حرکتی",
    "هماهنگی دوطرفه",
    "تصویر بدنی و جهت‌یابی فضایی",
    "هماهنگی چشم و دست یا پا",
    "مهارت‌های پیش‌نوشتاری و دست‌خط",
    "توجه و تمرکز",
    "حافظه",
    "عملکردهای اجرایی",
    "مهار و کنترل تکانه",
  ],
  physical: [
    "مهارت‌های حرکتی درشت",
    "مهارت‌های حرکتی ظریف",
    "تعادل",
    "قدرت، استقامت و دامنه حرکتی",
    "الگوهای حرکتی و راه رفتن",
    "واکنش‌های پاسچرال و رفلکس‌ها",
    "توانبخشی بزرگسال",
  ],
  education: [
    "مهارت‌های پیش‌دبستانی",
    "پیش‌نیازهای ریاضی و محاسبات",
    "آگاهی واجی و مهارت‌های خواندن",
    "نوشتن و دیکته",
    "مهارت‌های یادگیری و مطالعه",
  ],
};

export const THERAPY_DOMAIN_LABELS: Record<TherapyDomain, string> = {
  speech: "گفتار و زبان",
  sensory: "حسی",
  cognitive: "شناختی",
  perceptual_motor: "ادراکی - حرکتی",
  physical: "جسمی و حرکتی",
  education: "آموزشی و یادگیری",
};

// ───────────────────────────────────────────────
// Relations / Populated Interfaces
// ───────────────────────────────────────────────
export interface IExerciseSheetExercise {
  _id: string;
  title: string;
  description?: string;
  files?: IExerciseSheetFile[];
  domains?: IDomainSelection[];
}

export interface IExerciseSheetTherapist {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface IExerciseSheetPatient {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface IExerciseSheetItem {
  _id: string;
  exercise: string | IExerciseSheetExercise;
  note?: string;
  additionalFiles?: IExerciseSheetFile[];
}

// ───────────────────────────────────────────────
// Main ExerciseSheet Entity
// ───────────────────────────────────────────────
export interface IExerciseSheet {
  _id: string;
  title: string;
  description?: string;
  domains: IDomainSelection[];
  coverFile?: IExerciseSheetFile;
  items: IExerciseSheetItem[];

  createdBy: string | IExerciseSheetTherapist;
  therapists: Array<string | IExerciseSheetTherapist>;
  patient?: string | IExerciseSheetPatient;

  createdAt: string;
  updatedAt: string;
  isPrivate:boolean
  forPatient:boolean
    active:boolean
}

// ───────────────────────────────────────────────
// DTOs & Mutations
// ───────────────────────────────────────────────
export interface IExerciseSheetItemDTO {
  exercise: string;
  note?: string;
  additionalFiles?: IExerciseSheetFile[];
}

export interface CreateExerciseSheetDTO {
  title: string;
  description?: string;
  domains: IDomainSelection[];
  coverFile?: IExerciseSheetFile;
  items: IExerciseSheetItemDTO[];
  therapists?: string[];
  patient?: string;
  isPrivate:boolean
    forPatient:boolean
     active:boolean
}

export interface UpdateExerciseSheetDTO {
  title?: string;
  description?: string;
  domains?: IDomainSelection[];
  coverFile?: IExerciseSheetFile;
  items?: IExerciseSheetItemDTO[];
  therapists?: string[];
  patient?: string;
  isPrivate:boolean
    forPatient:boolean
     active:boolean
}

export interface DTOFindExerciseSheets {
  search?: string;
  therapist?: string;
  patient?: string;
  createdBy?: string;
  domain?: TherapyDomain | TherapyDomain[];
  subdomain?: string | string[];
  page?: number;
  limit?: number;
  isPrivate?:boolean
    forPatient?:boolean
      withoutPatient?: boolean;
       active:boolean
}

export interface IExerciseSheetListResponse {
  data: IExerciseSheet[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
    forPatient?:boolean
}
