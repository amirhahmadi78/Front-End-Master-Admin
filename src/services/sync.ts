import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";



export const syncClinicLibrary = async (clinicId: string) => {
  try {
    // آرگومان دوم body است ({}) و آرگومان سوم config
    const res = await apiClient.post(
      `/sync/${clinicId}/global-library`,
      {},
      { params: { clinicId } } // جهت هماهنگی با req.query میدلور
    );
    AlertSwal.succes("کتابخانه کلینیک مورد نظر با موفقیت بروز رسانی شد.");
    return res.data;
  } catch (error) {
    AlertSwal.backEndError(error, "خطا سینک کتابخانه کلینیک!");
    throw error;
  }
};
