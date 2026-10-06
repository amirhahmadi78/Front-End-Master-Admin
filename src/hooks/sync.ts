import { useMutation } from "@tanstack/react-query";
import { syncClinicLibrary } from "../services/sync";

export const useSyncLibrayClinic = () => {
  return useMutation({
    mutationFn: (clinicId: string) => syncClinicLibrary(clinicId),
  });
};
