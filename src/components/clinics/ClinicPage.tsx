import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Building2, Loader2 } from "lucide-react";
import {
  useDeleteClinic,
  useListClinics,
  useToggleClinicActive,
} from "../../hooks/clinics";
import ClinicCard from "./ClinicCard";
import ClinicFormModal from "./ClinicFormModal";
import type { IClinic } from "../../types/clinics";
import { AlertSwal } from "../../utils/errorSwal";


const ClinicsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IClinic | null>(null);

  const { data: clinics = [], isLoading } = useListClinics(
    search ? { search } : undefined
  );
  const deleteMut = useDeleteClinic();
  const toggleMut = useToggleClinicActive();

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (c: IClinic) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleDelete = async (c: IClinic) => {
    const ok = await AlertSwal.doYouWant(
      `آیا از حذف کلینیک «${c.name}» مطمئن هستید؟`
    );
    if (!ok) return;
    deleteMut.mutate(c._id);
  };

  const handleToggle = (c: IClinic) => {
    toggleMut.mutate({ id: c._id, active: !c.active });
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 via-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-200/50">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800">
                مدیریت کلینیک‌ها
              </h1>
              <p className="text-xs text-slate-500">
                ساخت، ویرایش و مدیریت کلینیک‌های سامانه
              </p>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-2xl bg-linear-to-l from-sky-500 via-cyan-500 to-teal-500 px-5! py-2.5! text-sm font-bold text-white shadow-lg shadow-cyan-200/60 transition hover:scale-[1.02] hover:shadow-cyan-300 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            کلینیک جدید
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto! max-w-6xl px-6! py-8!">
        {/* Search */}
        <div className="mb-6! flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نام کلینیک..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3! pl-4! pr-11! text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24! text-slate-400">
            <Loader2 className="mb-3! h-8 w-8 animate-spin text-teal-500" />
            <p className="text-sm">در حال بارگذاری...</p>
          </div>
        ) : clinics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 py-20! text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-sky-100 to-teal-100 text-teal-600">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="mt-4! text-base font-bold text-slate-700">
              هیچ کلینیکی یافت نشد
            </h3>
            <p className="mt-1! text-sm text-slate-500">
              برای شروع، یک کلینیک جدید ایجاد کنید
            </p>
            <button
              onClick={handleCreate}
              className="mt-5! flex items-center gap-2 rounded-xl bg-linear-to-l from-sky-500 to-teal-500 px-5! py-2.5! text-sm font-bold text-white shadow-md shadow-cyan-200/60 transition hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              ایجاد اولین کلینیک
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clinics.map((c) => (
              <ClinicCard
                key={c._id}
                clinic={c}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ClinicFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        initialData={editing}
      />
    </div>
  );
};

export default ClinicsPage;