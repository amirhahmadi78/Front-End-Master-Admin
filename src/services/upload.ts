
import apiClient from "../api/client";
import { AlertSwal } from "../utils/errorSwal";

export const uploadFileToServer = async (file: File): Promise<string> => {
  try {
    
  const formData = new FormData();
  formData.append("file", file); // کلید ارسالی باید 'file' باشد

  const res = await apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // آدرس ذخیره‌شده نهایی روی S3 که بک‌اند برمی‌گرداند
  return res.data
  } catch (error) {
    AlertSwal.backEndError(error,"خطا در اپلود فایل")
    throw error
  }
};
