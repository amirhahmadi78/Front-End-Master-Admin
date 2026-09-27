
import apiClient from "../api/client";



import { AlertSwal } from "../utils/errorSwal";

export const GetMyPatients = async () => {
  try {
    const res = await apiClient.get(`/p-t`);
 
    
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت لیست مراجعین شما!");
    throw error;
  }
};


export const patientsForTherapist = async () => {
  try {
    const res = await apiClient.get(`/patients/fortherapist`);
 

    
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا در دریافت لیست مراجعین !");
    throw error;
  }
};
