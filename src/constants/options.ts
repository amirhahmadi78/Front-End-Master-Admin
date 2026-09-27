export const THERAPIST_ROLES = [
  { value: 'OT', label: 'کاردرمانگر (OT)' },
  { value: 'SLP', label: 'گفتاردرمانگر (SLP)' },
  { value: 'PT', label: 'فیزیوتراپیست (PT)' },
  { value: 'Psychologist', label: 'روانشناس' },
] as const;

export const ASSESSMENT_TYPES = [
  { value: 'ADOS-2', label: 'ADOS-2 (ارزیابی تشخیصی اوتیسم)' },
  { value: 'M-CHAT-R/F', label: 'M-CHAT-R/F (غربالگری اوتیسم)' },
  { value: 'Sensory Profile', label: 'پروفایل حسی' },
  { value: 'Communication Assessment', label: 'ارزیابی ارتباطی' },
  { value: 'Functional Behavior Assessment (FBA)', label: 'ارزیابی رفتاری عملکردی' },
  { value: 'VB-MAPP', label: 'VB-MAPP (برنامه مهارت‌های کلامی)' },
  { value: 'Social Skills Assessment', label: 'ارزیابی مهارت‌های اجتماعی' },
  { value: 'General Assessment', label: 'ارزیابی عمومی' },
  { value: 'Progress Check', label: 'بررسی پیشرفت' },
] as const;

export const DAYS_OF_WEEK = [
  { value: 'Saturday', label: 'شنبه' },
  { value: 'Sunday', label: 'یکشنبه' },
  { value: 'Monday', label: 'دوشنبه' },
  { value: 'Tuesday', label: 'سه‌شنبه' },
  { value: 'Wednesday', label: 'چهارشنبه' },
  { value: 'Thursday', label: 'پنجشنبه' },
  { value: 'Friday', label: 'جمعه' },
] as const;

export const ASSESSMENT_STATUS = {
  pending: { label: 'در انتظار', color: 'gray' },
  'in-progress': { label: 'در حال انجام', color: 'yellow' },
  completed: { label: 'تکمیل شده', color: 'green' },
  cancelled: { label: 'لغو شده', color: 'red' },
} as const;

// ==================== Appointment labels (value EN, label FA) ====================
export const APPOINTMENT_TYPE_LABEL_FA = {
  session: 'جلسه',
  assessment: 'ارزیابی',
  break: 'استراحت',
  online: 'آنلاین',
  lunch: 'ناهار',
} as const;

export const CLINIC_STATUS_LABEL_FA = {
  scheduled: 'برنامه‌ریزی شده',
  'completed-notpaid': 'انجام شده (تسویه نشده)',
  'completed-paid': 'انجام شده (تسویه شده)',
  canceled: 'لغو شده',
  bimeh: 'بیمه',
  absent: 'غایب',
  break: 'استراحت',
} as const;

export const THERAPIST_STATUS_LABEL_FA = {
  scheduled: 'برنامه‌ریزی شده',
  completed: 'انجام شده',
  absent: 'غایب',
} as const;

export const SESSION_TYPE_LABEL_FA = {
  individual: 'فردی',
  group: 'گروهی',
} as const;

// ==================== Persian calendar months ====================
export const PERSIAN_MONTHS = [
  { value: 1, label: 'فروردین' },
  { value: 2, label: 'اردیبهشت' },
  { value: 3, label: 'خرداد' },
  { value: 4, label: 'تیر' },
  { value: 5, label: 'مرداد' },
  { value: 6, label: 'شهریور' },
  { value: 7, label: 'مهر' },
  { value: 8, label: 'آبان' },
  { value: 9, label: 'آذر' },
  { value: 10, label: 'دی' },
  { value: 11, label: 'بهمن' },
  { value: 12, label: 'اسفند' },
] as const;