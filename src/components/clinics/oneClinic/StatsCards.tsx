import { motion } from "framer-motion";
import { ShieldCheck, Users, HeartHandshake, Crown } from "lucide-react";
import type { IClinicStats } from "../../../types/clinicDetails";

interface Props {
  stats?: IClinicStats;
  isLoading: boolean;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  linear: string;
  delay: number;
}> = ({ icon, label, value, linear, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
  >
    <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-l ${linear}`} />
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-slate-800">{value}</p>
      </div>
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${linear} text-white shadow-lg`}
      >
        {icon}
      </div>
    </div>
  </motion.div>
);

const StatsCards: React.FC<Props> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main admin banner */}
      {stats.mainAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-linear-to-l from-amber-50 to-orange-50 p-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-200/60">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700">
              ادمین اصلی کلینیک
            </p>
            <p className="text-sm font-bold text-slate-800">
              {stats.mainAdmin.firstName} {stats.mainAdmin.lastName}
            </p>
            <p className="text-xs text-slate-500" dir="ltr">
              {stats.mainAdmin.phone} • {stats.mainAdmin.email}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4  sm:grid-cols-3">
        <StatCard
          icon={<ShieldCheck className="h-7 w-7" />}
          label="تعداد ادمین‌ها"
          value={stats.adminsCount}
          linear="from-sky-400 to-cyan-400"
          delay={0.05}
        />
        <StatCard
          icon={<HeartHandshake className=" h-7 w-7" />}
          label={"تعداد تراپیست‌ها"}
          value={stats.therapistsCount}
          linear="from-teal-400 to-emerald-400"
          delay={0.1}
        />
        <StatCard
          icon={<Users className="h-7 w-7" />}
          label="تعداد مراجعین"
          value={stats.patientsCount}
          linear="from-cyan-400 to-sky-400"
          delay={0.15}
        />
      </div>
    </div>
  );
};

export default StatsCards;