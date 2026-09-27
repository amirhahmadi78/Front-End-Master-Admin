export const DayOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export type DayOfWeek = (typeof DayOfWeek)[number];

export const TherapistRole = ["OT", "SLP", "PT", "Psychologist"] as const;
export type TherapistRole = (typeof TherapistRole)[number];

export const AdminRole = ["internalManager", "admin", "secretary"] as const;
export type AdminRole = (typeof AdminRole)[number];

export const AssessmentStatus = [
  "pending",
  "in-progress",
  "completed",
  "cancelled",
] as const;
export type AssessmentStatus = (typeof AssessmentStatus)[number];

export const AssessmentType = [
  "ADOS-2",
  "M-CHAT-R/F",
  "Sensory Profile",
  "Communication Assessment",
  "Functional Behavior Assessment (FBA)",
  "VB-MAPP",
  "Social Skills Assessment",
  "General Assessment",
  "Progress Check",
  "Custom",
] as const;
export type AssessmentType = (typeof AssessmentType)[number];

export const AppointmentType = [
  "session",
  "assessment",
  "break",
  "online",
  "lunch",
] as const;
export type AppointmentType = (typeof AppointmentType)[number];

export const ClinicAppointmentStatus = [
  "scheduled",
  "completed-notpaid",
  "completed-paid",
  "canceled",
  "bimeh",
  "absent",
  "break",
] as const;
export type ClinicAppointmentStatus = (typeof ClinicAppointmentStatus)[number];

export const TherapistAppointmentStatus = [
  "scheduled",
  "completed",
  "absent",
] as const;
export type TherapistAppointmentStatus =
  (typeof TherapistAppointmentStatus)[number];

export const SessionType = ["individual", "group"] as const;
export type SessionType = (typeof SessionType)[number];

export const ChatSender = ["therapist", "patient"] as const;
export type ChatSender = (typeof ChatSender)[number];

export const TodoDoneStatus = ["todo", "done"] as const;
export type TodoDoneStatus = (typeof TodoDoneStatus)[number];

export const SheetStatus = ["active", "archived"] as const;
export type SheetStatus = (typeof SheetStatus)[number];

export const SheetItemSource = ["library", "custom"] as const;
export type SheetItemSource = (typeof SheetItemSource)[number];

export const AssessmentTemplateOwnerType = [
  "system",
  "therapist",
  "clinic",
] as const;
export type AssessmentTemplateOwnerType =
  (typeof AssessmentTemplateOwnerType)[number];

export const PaymentType = [0,"card", "transfer", "cash", "wallet"] as const;
export type PaymentType = (typeof PaymentType)[number];

export const PaymentTypePatient = ["naghd", "bimeh"] as const;
export type PaymentTypePatient = (typeof PaymentTypePatient)[number];

export const AssessmentItemInputType = [
  "boolean",
  "select",
  "number",
  "text",
] as const;
export type AssessmentItemInputType = (typeof AssessmentItemInputType)[number];

export const StatusLeavesTherapistType = [
  "pending",
  "approved",
  "rejected",
] as const;
export type StatusLeavesTherapistType =
  (typeof StatusLeavesTherapistType)[number];

export const insuranceStatus = ["active", "pending", "expired"] as const;
export type insuranceStatus=(typeof insuranceStatus)[number]


export const insuranceCoverage = ["کاردرمانی", "گفتاردرمانی", "روانشناسی", "فیزیوتراپی"] as const
export type insuranceCoverage=(typeof insuranceCoverage)[number]

export const insurancePaymentType = [
"full",
"partial",
"advance",]
export type insurancePaymentType=(typeof insurancePaymentType)[number]