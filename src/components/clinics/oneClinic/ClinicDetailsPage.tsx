import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Loader2,
  UserX,
} from "lucide-react";
import {
  useClinicAdmins,
  useClinicStats,
  useDeleteClinicAdmin,
} from "../../../hooks/clinicDetails";
import { useClinicById } from "../../../hooks/clinics";
import StatsCards from "./StatsCards";
import AdminFormModal from "./AdminFormModal";
import type { IClinicAdmin, AdminRole } from "../../../types/clinicDetails";
import { AlertSwal } from "../../../utils/errorSwal";
import { FaSync } from "react-icons/fa";
import { useSyncLibrayClinic } from "../../../hooks/sync";

const ROLE_LABELS: Record<AdminRole, string> = {
  Admin: "مدیر کل",
  internalManager: "مدیر داخلی",
  secretary: "منشی",
  accountant: "حسابدار",
};

const ROLE_COLORS: Record<AdminRole, string> = {
    Admin: "bg-sky-50 text-sky-600",
  internalManager:"bg-teal-50 text-teal-600",
  secretary: "bg-amber-50 text-amber-600",
  accountant:  "bg-green-50 text-green-600",

};

const ClinicDetailPage: React.FC = () => {
  const { id: clinicId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
const {mutateAsync:SyncLibrary}= useSyncLibrayClinic()
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IClinicAdmin | null>(null);

  const { data: clinic } = useClinicById(clinicId);
  const { data: stats, isLoading: statsLoading } = useClinicStats(clinicId);
  const { data: admins = [], isLoading: adminsLoading } =
    useClinicAdmins(clinicId);
  const deleteMut = useDeleteClinicAdmin(clinicId);

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (a: IClinicAdmin) => {
    setEditing(a);
    setModalOpen(true);
  };



  const handleDelete = async (a: IClinicAdmin) => {
    const ok = await AlertSwal.doYouWant(
      `آیا از حذف مدیر «${a.firstName} ${a.lastName}» مطمئن هستید؟`,
    );
    if (!ok) return;
    deleteMut.mutate(a._id);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-br from-sky-50 via-white to-teal-50"
    >
      {/* Header */}
      <div className="border-b border-slate-100 bg-white/70 backdrop-blur-md">
        <div className="mx-auto! flex max-w-6xl items-center justify-between px-6! py-4!">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/clinics")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800">
                {clinic?.name ?? "جزئیات کلینیک"}
              </h1>
              <p className="text-xs text-slate-500">
                مدیریت آمار و مدیران این کلینیک
              </p>
            </div>
          </div>

          <button
           onClick={async()=>{
           const res= await AlertSwal.doYouWant("آیا میخواهید تمام تمرینات و ارزیابی ها به این کلینیک سینک شود؟")
           if (res.isConfirmed){
    
            
       SyncLibrary(clinicId)}}
           }
     

            className="flex items-center gap-2 rounded-2xl bg-linear-to-l from-sky-500 via-cyan-500 to-teal-500 px-5! py-2.5! text-sm font-bold text-white shadow-lg shadow-cyan-200/60 transition hover:scale-[1.02] active:scale-95"
          >
            <FaSync className="h-4 w-4" />
سینک کتابخانه          </button>
            <button
                  onClick={handleCreate}
            className="flex items-center gap-2 rounded-2xl bg-linear-to-l from-sky-500 via-cyan-500 to-teal-500 px-5! py-2.5! text-sm font-bold text-white shadow-lg shadow-cyan-200/60 transition hover:scale-[1.02] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            ثبت مدیر
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto! max-w-6xl space-y-8 px-6! py-8!">
        {/* Stats */}
        <section>
          <h2 className="mb-4! text-sm font-bold text-slate-700">
            آمار کلینیک
          </h2>
          <StatsCards stats={stats} isLoading={statsLoading} />
        </section>

        {/* Admins */}
        <section>
          <div className="mb-4! flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-500" />
              <h2 className="text-sm font-bold text-slate-700">
                مدیران کلینیک
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5! py-0.5! text-xs font-bold text-slate-600">
                {admins.length}
              </span>
            </div>
          </div>

          {adminsLoading ? (
            <div className="flex flex-col items-center justify-center py-16! text-slate-400">
              <Loader2 className="mb-3! h-7 w-7 animate-spin text-teal-500" />
              <p className="text-sm">در حال بارگذاری مدیران...</p>
            </div>
          ) : admins.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 py-16! text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-sky-100 to-teal-100 text-teal-600">
                <UserX className="h-8 w-8" />
              </div>
              <h3 className="mt-4! text-base font-bold text-slate-700">
                هیچ مدیری ثبت نشده
              </h3>
              <p className="mt-1! text-sm text-slate-500">
                برای شروع، اولین مدیر را اضافه کنید
              </p>
              <button
                onClick={handleCreate}
                className="mt-5! flex items-center gap-2 rounded-xl bg-linear-to-l from-sky-500 to-teal-500 px-5! py-2.5! text-sm font-bold text-white shadow-md shadow-cyan-200/60 transition hover:scale-105"
              >
                <Plus className="h-4 w-4" /> ثبت مدیر
              </button>
            </motion.div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4! py-3! text-right font-semibold">
                      نام
                    </th>
                    <th className="px-4! py-3! text-right font-semibold">
                      شماره موبایل
                    </th>
                    <th className="px-4! py-3! text-right font-semibold">
                      ایمیل
                    </th>
                    <th className="px-4! py-3! text-right font-semibold">
                      نقش
                    </th>
                    <th className="px-4! py-3! text-center font-semibold">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((a) => (
                    <tr key={a._id} className="transition hover:bg-slate-50/60">
                      <td className="px-4! py-3! font-medium text-slate-800">
                        {a.firstName} {a.lastName}
                      </td>
                      <td className="px-4! py-3! text-slate-600" dir="ltr">
                        {a.phone}
                      </td>
                      <td className="px-4! py-3! text-slate-600" dir="ltr">
                        {a.email}
                      </td>
                      <td className="px-4! py-3!">
                        <span
                          className={`inline-block rounded-full px-3! py-1! text-xs font-bold ${
                            ROLE_COLORS[a.role]
                          }`}
                        >
                          {ROLE_LABELS[a.role]}
                        </span>
                      </td>
                      <td className="px-4! py-3!">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(a)}
                            className="rounded-lg bg-sky-50 p-2! text-sky-600 transition hover:bg-sky-100"
                            title="ویرایش"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(a)}
                            className="rounded-lg bg-red-50 p-2! text-red-500 transition hover:bg-red-100"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <AdminFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        clinicId={clinicId}
        initialData={editing}
      />
    </div>
  );
};

export default ClinicDetailPage;
