import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";

export const therapistsForTherapist = async () => {
  try {
    const res = await apiClient.get(`/therapists/fortherapist`);
 
    
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت لیست درمانگران !");
    throw error;
  }
};