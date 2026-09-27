import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios"; // یا از hook سفارشی خود استفاده کنید
import toast from "react-hot-toast"; // پیشنهاد می‌کنم نصب کنید: npm install react-hot-toast
import { changePassWithPassword } from "../../api/auth/authsuperAdmin";
import { AlertSwal } from "../../utils/errorSwal";


interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Method = "current" | "otp";

export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const { user, logout } = useAuth();
  const [method, setMethod] = useState<Method>("current");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // فرم روش رمز قبلی
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // فرم روش OTP
  const [otpNewPassword, setOtpNewPassword] = useState("");
  const [otpConfirmPassword, setOtpConfirmPassword] = useState("");

  // ریست فرم‌ها هنگام بسته شدن مودال
  const resetForms = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpCode("");
    setOtpNewPassword("");
    setOtpConfirmPassword("");
    setOtpSent(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  // درخواست ارسال کد OTP
  const handleSendOtp = async () => {

    if (!user?.phone) {
      toast.error("شماره موبایل کاربر یافت نشد");
      return;
    }
    setLoading(true);
    try {
      // فرض کنید endpoint: /api/auth/request-otp
      await axios.post("/api/auth/request-otp", { phone: user.phone });
      toast.success("کد تأیید به شماره موبایل شما ارسال شد");
      setOtpSent(true);
    } catch (error) {
      toast.error("خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  };

  // تغییر رمز با رمز قبلی
  const handleChangeWithCurrent = async (e: React.FormEvent) => {
  
   try {
       e.preventDefault();
    if (newPassword !== confirmPassword) {
        handleClose()
      AlertSwal.Error("رمز عبور جدید و تکرار آن مطابقت ندارند");
      return;
    }
    if (newPassword.length < 6) {
      handleClose()
      AlertSwal.Error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
      return;
    }
setLoading(true)
  
      // فرض کنید endpoint: /api/auth/change-password
  await   changePassWithPassword(oldPassword,newPassword)

     setLoading(false)
  handleClose();

   } catch (error) {
    setLoading(false)
  handleClose();
   }finally{
     setLoading(false)
  handleClose();
  
   }
       

    
    

        
    
  
   
  };

  // تغییر رمز با OTP
  const handleChangeWithOtp = async (e: React.FormEvent) => {

    e.preventDefault();
    toast.error("فعلا در دسترس نیست!");
    return 
    if (otpNewPassword !== otpConfirmPassword) {
      toast.error("رمز عبور جدید و تکرار آن مطابقت ندارند");
      return;
    }
    if (otpNewPassword.length < 6) {
      toast.error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
      return;
    }
    if (!otpCode) {
      toast.error("لطفاً کد تأیید را وارد کنید");
      return;
    }
    setLoading(true);
    try {
      // فرض کنید endpoint: /api/auth/verify-otp-and-change-password
      await axios.post("/api/auth/verify-otp-and-change-password", {
        phone: user?.phone,
        otp: otpCode,
        newPassword: otpNewPassword,
      });
      toast.success("رمز عبور با موفقیت تغییر کرد");
      handleClose();
      logout();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در تغییر رمز");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="p-5! fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="p-2! bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in-up">
        {/* دکمه بستن */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
          تغییر رمز عبور
        </h2>

        {/* تب‌ها */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setMethod("current")}
            className={`pb-2 px-4 font-medium transition-all ${
              method === "current"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            رمز فعلی دارم
          </button>
          <button
            onClick={() => setMethod("otp")}
            className={`pb-2 px-4  transition-all ${
              method === "otp"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            رمز یکبار مصرف (OTP)
          </button>
        </div>

        {/* فرم روش رمز قبلی */}
        {method === "current" && (
          <form onSubmit={handleChangeWithCurrent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور فعلی
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور جدید
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تکرار رمز عبور جدید
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
            >
              {loading ? "در حال تغییر..." : "تغییر رمز"}
            </button>
          </form>
        )}

        {/* فرم روش OTP */}
        {method === "otp" && (
          <form onSubmit={handleChangeWithOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                شماره موبایل شما
              </label>
              <input
                type="string"
                value={user?.phone || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded text-gray-600"
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={()=>handleSendOtp}
                disabled={loading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded transition disabled:opacity-50"
              >
                {loading ? "در حال ارسال..." : "ارسال کد یکبارمصرف"}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    کد تأیید
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    disabled={loading}
                    placeholder="کد ۶ رقمی"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={otpNewPassword}
                    onChange={(e) => setOtpNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تکرار رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={otpConfirmPassword}
                    onChange={(e) => setOtpConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "در حال تغییر..." : "تغییر رمز با کد"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};