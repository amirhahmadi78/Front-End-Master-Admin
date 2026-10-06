// services/apiClient/assessmentTemplate.apiClient.ts

import apiClient from '../api/client';
import { AlertSwal } from '../utils/errorSwal';

export type AssessmentQuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'number'
  | 'text'
  | 'boolean';

export interface AssessmentOption {
  _id?: string;
  key: string;
  label: string;
  value: string;
  score?: number;
  order?: number;
}

export interface AssessmentValidation {
  min?: number | null;
  max?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
}

export interface AssessmentQuestion {
  _id?: string;
  key: string;
  title: string;
  description?: string | null;
  type: AssessmentQuestionType;
  required: boolean;
  order: number;
  options: AssessmentOption[];
  validation?: AssessmentValidation;
  weight?: number;
}

export interface AssessmentScoreRange {
  _id?: string;
  title: string;
  description?: string | null;
  minScore: number;
  maxScore: number;
  color?: string | null;
  severity?: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
}

export interface AssessmentTemplateScoring {
  enabled: boolean;
  method: 'sum' | 'weighted-sum' | 'average' | 'none';
  minScore?: number;
  maxScore?: number | null;
}

export interface AssessmentTemplate {
  _id: string;
  title: string;
  slug: string;
  code: string;
  description?: string | null;
  category?: string | null;
  instructions?: string | null;
  isPrivate: boolean;
  questions: AssessmentQuestion[];
  scoreRanges: AssessmentScoreRange[];
  scoring: AssessmentTemplateScoring;
  version: number;
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  createdBy: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentTemplateFormInput {
  title: string;
  slug: string;
  code: string;
  description?: string | null;
  category?: string | null;
  instructions?: string | null;
  isPrivate: boolean;
  questions: AssessmentQuestion[];
  scoreRanges: AssessmentScoreRange[];
  scoring: AssessmentTemplateScoring;
  version?: number;
  status?: 'draft' | 'published' | 'archived';
  isActive?: boolean;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export const assessmentTemplateApi = {
  list: async (params: ListParams) => {
    try {
      const res = await apiClient.get<PaginatedResponse<AssessmentTemplate>>('/global/assessment-templates', { params });
  
      
      return res.data;
    } catch (error) {
      AlertSwal.backEndError(error, "خطا در دریافت لیست ارزیابی های سیستماتیک!");
      throw error; // پرتاب مجدد خطا برای مدیریت در کامپوننت در صورت نیاز
    }
  },

  getById: async (id: string) => {
    try {
      const res = await apiClient.get<AssessmentTemplate>(`/global/assessment-templates/${id}`);
      return res.data;
    } catch (error) {
      AlertSwal.backEndError(error, "خطا در دریافت اطلاعات ارزیابی!");
      throw error;
    }
  },

  getBySlug: async (slug: string) => {
    try {
      const res = await apiClient.get<AssessmentTemplate>(`/global/assessment-templates/slug/${slug}`);
      return res.data;
    } catch (error) {
      AlertSwal.backEndError(error, "خطا در دریافت اطلاعات ارزیابی!");
      throw error;
    }
  },

  create: async (data: AssessmentTemplateFormInput) => {
    try {
      const res = await apiClient.post<AssessmentTemplate>('/global/assessment-templates', data);
      AlertSwal.succes("ارزیابی جدید با موفقیت ساخته شد!");
      return res.data;
    } catch (error) {
      AlertSwal.backEndError(error, "خطا در ساخت ارزیابی جدید!");
      throw error;
    }
  },

  update: async (id: string, data: Partial<AssessmentTemplateFormInput>) => {
    try {
      const res = await apiClient.put<AssessmentTemplate>(`/global/assessment-templates/${id}`, data);
  
      
      AlertSwal.succes("ارزیابی با موفقیت به‌روزرسانی شد!");
      return res.data;
    } catch (error) {
      AlertSwal.backEndError(error, "خطا در به‌روزرسانی ارزیابی!");
      throw error;
    }
  },

  publish: async (id: string) => {
    try {
      const res = await apiClient.patch<AssessmentTemplate>(`/global/assessment-templates/${id}/publish`);
      AlertSwal.succes("ارزیابی با موفقیت منتشر شد!");
      return res.data;
    } catch (error) {
      AlertSwal.backEndError(error, "خطا در انتشار ارزیابی!");
      throw error;
    }
  },

  archive: async (id: string) => {
    try {
      const res = await apiClient.patch<AssessmentTemplate>(`/global/assessment-templates/${id}/archive`);
      AlertSwal.succes("ارزیابی با موفقیت بایگانی شد!");
      return res.data;
    } catch (error) {
      AlertSwal.backEndError(error, "خطا در بایگانی ارزیابی!");
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const res = await apiClient.delete(`/global/assessment-templates/${id}`);
      AlertSwal.succes("ارزیابی با موفقیت حذف شد!");
      return res.data;
    } catch (error) {
      AlertSwal.backEndError(error, "خطا در حذف ارزیابی!");
      throw error;
    }
  },
};
