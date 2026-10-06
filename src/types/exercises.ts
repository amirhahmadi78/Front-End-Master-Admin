export const THERAPY_DOMAINS = [
  "speech",
  "sensory",
  "cognitive",
  "perceptual_motor",
  "physical",
  "education",
] as const;

export type TherapyDomain = (typeof THERAPY_DOMAINS)[number];

export const FILE_TYPES = [
  "video",
  "pdf",
  "image",
  "document",
  "audio",
  "other",

] as const;

export type ExerciseFileType = (typeof FILE_TYPES)[number];

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

export interface IDomainSelection {
  domain: TherapyDomain;
  subdomains: string[];
}

export interface IExerciseFile {
  _id?: string;
  fileURLs?: string;
  fileType?: ExerciseFileType;
}

export interface ITherapistSummary {
  _id: string;
  name?: string;
  familyName?: string;
  fullName?: string;
}

export interface IExercise {
  _id: string;
  title: string;
  description: string;
  category?: string;

  domains: IDomainSelection[];

  files?: IExerciseFile[];

  therapist:
    | string
    | ITherapistSummary
    | null;

  private: boolean;
  forPatient: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseDTO {
  title: string;
  description: string;
  category?: string;
  domains: IDomainSelection[];
  files?: IExerciseFile[];
  private?: boolean;
  forPatient?: boolean;
}

export interface UpdateExerciseDTO {
  title?: string;
  description?: string;
  category?: string | null;
  domains?: IDomainSelection[];
  files?: IExerciseFile[];
  private?: boolean;
  forPatient?: boolean;
}

export interface DTOFindExercises {
  domain?: TherapyDomain;
  subdomain?: string;
  therapist?: string;
  forPatient?: boolean;
  search?: string;
}

export interface ExerciseListResponse {
  data: IExercise[];
  total?: number;
  page?: number;
  limit?: number;
}
