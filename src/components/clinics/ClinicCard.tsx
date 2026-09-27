import { Building2, Globe, Database, Pencil, Trash2, Power, Train, Settings } from "lucide-react";
import { motion } from "framer-motion";
import type { IClinic } from "../../types/clinics";
import { useNavigate } from "react-router-dom";

interface Props {
  clinic: IClinic;
  onEdit: (c: IClinic) => void;
  onDelete: (c: IClinic) => void;
  onToggle: (c: IClinic) => void;
}

const ClinicCard: React.FC<Props> = ({ clinic, onEdit, onDelete, onToggle }) => {
  const navigate=useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5! shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-100/60"
    >
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-l from-sky-400 via-cyan-400 to-teal-400" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-50 to-teal-50 text-teal-600 ring-1 ring-teal-100">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {clinic.name}
            </h3>
            <span
              className={`mt-1! inline-flex items-center gap-1 rounded-full px-2.5! py-0.5! text-[11px] font-bold ${
                clinic.active
                  ? "bg-teal-50 text-teal-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  clinic.active ? "bg-teal-500" : "bg-slate-400"
                }`}
              />
              {clinic.active ? "فعال" : "غیرفعال"}
            </span>
          </div>
        </div>

        <button
          onClick={() => onToggle(clinic)}
          title={clinic.active ? "غیرفعال کردن" : "فعال کردن"}
          className={`rounded-xl p-2! transition ${
            clinic.active
              ? "bg-teal-50 text-teal-600 hover:bg-teal-100"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <Power className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4! space-y-2 text-sm">
        <div className="flex items-start gap-2 text-slate-600">
          <Globe className="mt-0.5! h-4 w-4 shrink-0 text-sky-500" />
          <div className="flex flex-wrap gap-1" dir="ltr">
            {clinic.domain.map((d) => (
              <span
                key={d}
                className="rounded-md bg-sky-50 px-2! py-0.5! text-xs text-sky-700"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Database className="h-4 w-4 shrink-0 text-teal-500" />
          <span dir="ltr" className="truncate text-xs">
            {clinic.mongoName}
          </span>
        </div>
      </div>

      <div className="mt-5! flex items-center gap-2 border-t border-slate-100 pt-4!">
        <button
          onClick={() => onEdit(clinic)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-50 py-2! text-xs font-semibold text-sky-600 transition hover:bg-sky-100"
        >
          <Pencil className="h-3.5 w-3.5" /> ویرایش
        </button>
        <button
          onClick={() => onDelete(clinic)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2! text-xs font-semibold text-red-500 transition hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" /> حذف
        </button>
         <button
          onClick={()=> navigate(`/clinics/${clinic._id}`)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-50 py-2! text-xs font-semibold text-green-600 transition hover:bg-green-100"
        >
          <Settings  className="h-3.5 w-3.5" /> مدیریت
        </button>
      </div>

      
    </motion.div>
  );
};

export default ClinicCard;