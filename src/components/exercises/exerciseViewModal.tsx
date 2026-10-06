import type { IExercise } from "../../types/exercises";

interface ExerciseViewModalProps {
  exercise: IExercise;
  isOpen: boolean;
  onClose: () => void;
}

// تابع هوشمند برای تشخیص نوع فایل از روی URL
const getFileTypeByUrl = (url: string) => {
  const extension = url?.split('.')?.pop()?.toLowerCase();
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg','heic'];
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac','m4a'];
  const pdfExtensions = ['pdf'];

  if (extension && imageExtensions.includes(extension)) return 'image';
  if (extension && videoExtensions.includes(extension)) return 'video';
  if (extension && audioExtensions.includes(extension)) return 'audio';
  if (extension && pdfExtensions.includes(extension)) return 'pdf';
  return 'document';
};

export default function ExerciseViewModal({ exercise, isOpen, onClose }: ExerciseViewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={()=>onClose()} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6! py-4!">
          <div>
            <h3 className="text-lg font-black text-slate-800">{exercise.title}</h3>
            {exercise.category && (
               <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2! py-0.5! rounded-md mt-1! inline-block">
                {exercise.category}
               </span>
            )}
          </div>
          <button 
            onClick={()=>onClose()}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6! space-y-6!">
          
          {/* Quick Info Badges */}
          <div className="flex flex-wrap gap-2!">
            <div className={`flex items-center gap-1.5! rounded-full px-3! py-1! text-[10px] font-black border ${exercise.forPatient ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
               <span className={`h-1.5 w-1.5 rounded-full ${exercise.forPatient ? 'bg-emerald-500' : 'bg-slate-400'}`} />
               {exercise.forPatient ? "مشاهده توسط مراجع فعال" : "عدم نمایش برای مراجع"}
            </div>
            
            {exercise.private && (
              <div className="flex items-center gap-1.5! rounded-full bg-amber-50 px-3! py-1! text-[10px] font-black text-amber-700 border border-amber-100">
                🔒 تمرین شخصی
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="space-y-2!">
            <h4 className="text-xs font-black text-slate-400 flex items-center gap-2!">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
              شرح و دستورالعمل تمرین
            </h4>
            <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-5! rounded-2xl border border-slate-100 whitespace-pre-line">
              {exercise.description}
            </div>
          </div>

          {/* Domains - Visual Layout */}
          <div className="space-y-3!">
            <h4 className="text-xs font-black text-slate-400 flex items-center gap-2!">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              حیطه‌های توانبخشی هدف
            </h4>
            <div className="grid gap-3! sm:grid-cols-2">
              {exercise?.domains?.map((d, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-4! shadow-sm">
                  <span className="text-[11px] font-black text-sky-700 mb-2.5! block border-b border-sky-50 pb-1.5!">
                    حیطه: {d.domain}
                  </span>
                  <div className="flex flex-wrap gap-1.5!">
                    {d.subdomains.map((sub, i) => (
                      <span key={i} className="rounded-lg bg-emerald-50/60 px-2.5! py-1! text-[10px] font-bold text-emerald-800 border border-emerald-100/50">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Media Section */}
          {exercise.files && exercise.files.length > 0 && (
            <div className="space-y-3!">
              <h4 className="text-xs font-black text-slate-400 flex items-center gap-2!">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                رسانه‌ها و فایل‌های ضمیمه
              </h4>
              <div className="grid gap-4! sm:grid-cols-2">
                {exercise.files.map((file, i) => (
                  <SmartFileRenderer key={i} url={file.fileURLs} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-4! flex justify-end">
          <button 
            onClick={onClose}
            className="rounded-xl bg-white border border-slate-200 px-6! py-2! text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
}

// کامپوننت رندرینگ هوشمند بر اساس پسوند فایل
function SmartFileRenderer({ url }: { url: string }) {
  const detectedType = getFileTypeByUrl(url);

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-sky-300 hover:shadow-md">
      {/* Media Preview Area */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {detectedType === 'image' && (
          <img src={url} alt="exercise media" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        )}

        {detectedType === 'video' && (
          <video controls className="h-full w-full bg-black">
            <source src={url} />
          </video>
        )}
{detectedType === 'audio' && (
  <div className="flex flex-col items-center gap-3! p-4! w-full">
    <div className="rounded-full bg-sky-100 p-4! text-sky-600">
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </div>
    
    {/* عرض رو با w-full کامل می‌کنی و با max-w-xs یا max-w-[250px] محدودش می‌کنی تا شکیل باشه */}
    <audio controls className="h-10 w-full max-w-xs focus:outline-hidden">
      <source src={url} />
      مرورگر شما از پخش مستقیم فایل صوتی پشتیبانی نمی‌کند.
    </audio>
  </div>
)}
        {(detectedType === 'pdf' || detectedType === 'document') && (
          <div className="flex flex-col items-center gap-2!">
             <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
             <span className="text-[10px] font-bold text-slate-400 uppercase">{url?.split('.')?.pop()} FILE</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3! flex items-center justify-between bg-white">
        <span className="text-[10px] font-black text-slate-500 uppercase">
            {detectedType}
        </span>
        <a 
          href={url} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-1.5! rounded-lg bg-sky-50 px-3! py-1.5! text-[10px] font-bold text-sky-700 hover:bg-sky-600 hover:text-white transition-all"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          دریافت فایل
        </a>
      </div>
    </div>
  );
}
