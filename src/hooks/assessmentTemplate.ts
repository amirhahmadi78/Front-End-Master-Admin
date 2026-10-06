// hooks/useAssessmentTemplates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentTemplateApi, type AssessmentTemplate, type ListParams } from '../services/assessmentTemplate';

const QUERY_KEY = 'assessmentTemplates';
const ONE_QUERY_KEY = 'assessmentTemplate';

export const useAssessmentTemplates = (params: ListParams = {}) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => assessmentTemplateApi.list(params).then(r => r?.data ?? []),
  });

export const useAssessmentTemplate = (id: string) =>
  useQuery({
    queryKey: [ONE_QUERY_KEY, id],
    queryFn: () => assessmentTemplateApi.getById(id).then(r => r.data),
    enabled: !!id,
  });

export const useAssessmentTemplateBySlug = (slug: string) =>
  useQuery({
    queryKey: [QUERY_KEY, 'slug', slug],
    queryFn: () => assessmentTemplateApi.getBySlug(slug).then(r => r.data),
    enabled: !!slug,
  });

// helper: جایگزین کردن یا افزودن آیتم در کش لیست


export const useCreateAssessmentTemplate = () => {

  return useMutation({
    mutationFn: (data: Partial<AssessmentTemplate>) =>
      assessmentTemplateApi.create(data).then(r => r.data),

  });
};

export const useUpdateAssessmentTemplate = () => {

  return useMutation({
    mutationFn: ({ id,data }: { id: string; data: Partial<AssessmentTemplate> }) =>
      assessmentTemplateApi.update(id, data),
   
  });
};

export const usePublishAssessmentTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assessmentTemplateApi.publish(id).then(r => r.data),
   onSuccess:(data)=>{
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    qc.setQueriesData({queryKey:[QUERY_KEY]},    (oldData: unknown)=>{
     if (!oldData) return oldData
     const updated=oldData.map(t=> t._id===data._id? data:t)
      return updated
      
    })

   }
  });
};

export const useArchiveAssessmentTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assessmentTemplateApi.archive(id).then(r => r.data),
     onSuccess:(data)=>{
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    qc.setQueriesData({queryKey:[QUERY_KEY]},    (oldData: unknown)=>{
     if (!oldData) return oldData
     const updated=oldData.filter(t=> t._id!==data._id)
      return updated
      
    })

   }
  });
};

export const useDeleteAssessmentTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assessmentTemplateApi.delete(id).then(() => id),
    onSuccess:(data)=>{
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    qc.setQueriesData({queryKey:[QUERY_KEY]},    (oldData: unknown)=>{
  
      
      
     if (!oldData) return oldData
     const updated=oldData.filter(t=> t._id!==data)
      return updated
      
    })

   }
  });
};
