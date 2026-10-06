
import { useState, useMemo, useEffect } from "react";
import ExerciseViewModal from "../exercises/exerciseViewModal";

// ---------- ترجمه حیطه‌ها به فارسی ----------
const domainMapping: Record<string, string> = {
  speech: "گفتار",
  sensory: "حسی",
  physical: "جسمی",
  cognitive: "شناختی",
     perceptual_motor:"درکی حرکتی",
  education:"آموزش",
  // هر حیطه جدید را اینجا اضافه کنید
};

function translateDomain(domain: string): string {
  return domainMapping[domain] || domain;
}

// ---------- تایپ‌ها ----------
export interface Exercise {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  domains?: {
    domain: string;
    subdomains: string[];
  }[];
  files?: {
    fileURLs: string;
    fileType?: string;
    _id?: string;
  }[];
  forPatient?: boolean;
  private?: boolean;
  // سایر فیلدها در صورت نیاز
}

interface ExerciseSelectorProps {
  value: string;
  onChange: (value: string) => void;
  exercises: Exercise[];
  placeholder?: string;
  isDisabled?: boolean;
}

type TreeNode = {
  type: 'domain' | 'subdomain' | 'exercise';
  label: string;
  value?: string;
  children?: TreeNode[];
  count?: number;
  exerciseData?: Exercise; // برای دسترسی به داده‌های کامل تمرین
};

// ---------- ساخت درخت ----------
function buildTree(exercises: Exercise[]): TreeNode[] {
  const domainMap: Record<string, Record<string, Exercise[]>> = {};

  exercises.forEach((ex) => {
    if (ex.domains && ex.domains.length > 0) {
      ex.domains.forEach((d) => {
        const domainKey = d.domain || "بدون حیطه";
        const domainLabel = translateDomain(domainKey);
        if (!domainMap[domainLabel]) domainMap[domainLabel] = {};

        if (d.subdomains && d.subdomains.length > 0) {
          d.subdomains.forEach((sub) => {
            if (!domainMap[domainLabel][sub]) domainMap[domainLabel][sub] = [];
            domainMap[domainLabel][sub].push(ex);
          });
        } else {
          const sub = "بدون زیرحیطه";
          if (!domainMap[domainLabel][sub]) domainMap[domainLabel][sub] = [];
          domainMap[domainLabel][sub].push(ex);
        }
      });
    } else {
      const domainLabel = "بدون حیطه";
      const sub = "بدون زیرحیطه";
      if (!domainMap[domainLabel]) domainMap[domainLabel] = {};
      if (!domainMap[domainLabel][sub]) domainMap[domainLabel][sub] = [];
      domainMap[domainLabel][sub].push(ex);
    }
  });

  const tree: TreeNode[] = Object.keys(domainMap).map((domain) => {
    const subdomains = domainMap[domain];
    let totalCount = 0;
    const children = Object.keys(subdomains).map((sub) => {
      const exercisesList = subdomains[sub];
      totalCount += exercisesList.length;
      return {
        type: 'subdomain' as const,
        label: sub,
        count: exercisesList.length,
        children: exercisesList.map((ex) => ({
          type: 'exercise' as const,
          label: ex.title,
          value: ex._id,
          exerciseData: ex, // ذخیره داده‌های کامل برای مودال
        })),
      };
    });
    return {
      type: 'domain' as const,
      label: domain,
      count: totalCount,
      children,
    };
  });

  return tree;
}

// ---------- کامپوننت اصلی ----------
export default function ExerciseSelector({
  value,
  onChange,
  exercises,
  placeholder = "انتخاب تمرین",
  isDisabled,
}: ExerciseSelectorProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedExerciseForView, setSelectedExerciseForView] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const treeData = useMemo(() => buildTree(exercises), [exercises]);

  // 🔍 باز کردن خودکار مسیر تمرین انتخاب‌شده (برای ویرایش)
  useEffect(() => {
    if (!value || treeData.length === 0) return;

    const findPath = (nodes: TreeNode[], currentPath: string): string | null => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const path = `${currentPath}-${i}`;
        if (node.type === 'exercise' && node.value === value) {
          return path;
        }
        if (node.children) {
          const childPath = findPath(node.children, path);
          if (childPath) return childPath;
        }
      }
      return null;
    };

    const fullPath = findPath(treeData, 'root');
    if (fullPath) {
      const parts = fullPath.split('-').slice(1);
      let current = 'root';
      const parents: string[] = [];
      for (let i = 0; i < parts.length - 1; i++) {
        current += `-${parts[i]}`;
        parents.push(current);
      }
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        parents.forEach((p) => newSet.add(p));
        return newSet;
      });
    }
  }, [value, treeData]);

  const toggleNode = (path: string) => {
    if (isDisabled) return;
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) newSet.delete(path);
      else newSet.add(path);
      return newSet;
    });
  };

  // باز کردن مودال با داده‌های تمرین
  const handleViewExercise = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation(); // جلوگیری از انتخاب شدن تمرین
    setSelectedExerciseForView(exercise);
    setIsModalOpen(true);
  };

  // رندر بازگشتی
  const renderNode = (node: TreeNode, path: string, depth: number) => {
    const isExpanded = expandedNodes.has(path);
    const isLeaf = node.type === 'exercise';
    const isSelected = isLeaf && node.value === value;

    const bgColor =
      depth === 0 ? 'bg-blue-50 hover:bg-blue-100' :
      depth === 1 ? 'bg-indigo-50 hover:bg-indigo-100' :
      'hover:bg-slate-100';

    const borderColor =
      depth === 0 ? 'border-blue-200' :
      depth === 1 ? 'border-indigo-200' :
      'border-slate-200';

    return (
      <div key={path} className="mb-1!">
        <div
          className={`flex items-center gap-2 p-2.5! rounded-xl cursor-pointer transition-all duration-150 
            ${bgColor} border ${borderColor} 
            ${isSelected ? 'ring-2 ring-teal-400 bg-teal-50 border-teal-300' : ''} 
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => {
            if (isDisabled) return;
            if (isLeaf) {
              onChange(node.value || '');
            } else {
              toggleNode(path);
            }
          }}
          style={{ marginRight: depth * 16 }}
        >
          <span className="w-6 text-center text-slate-500 text-sm">
            {!isLeaf ? (isExpanded ? '📂' : '📁') : '📄'}
          </span>
          <span className="text-sm font-medium text-slate-700 flex-1">
            {node.label}
          </span>
          {node.count !== undefined && (
            <span className="text-xs text-slate-400 bg-white/70 px-2! py-0.5! rounded-full">
              {node.count}
            </span>
          )}
          {isSelected && (
            <span className="text-teal-600 text-xs bg-teal-100 px-2.5! py-0.5! rounded-full font-bold">
              ✓ انتخاب شده
            </span>
          )}
          {/* دکمه مشاهده برای گره‌های تمرین */}
          {isLeaf && node.exerciseData && (
            <button
              onClick={(e) => handleViewExercise(node.exerciseData!, e)}
              className="text-slate-400 hover:text-sky-600 transition-colors p-1! rounded-full hover:bg-sky-50"
              title="مشاهده تمرین"
              disabled={isDisabled}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>
        {!isLeaf && isExpanded && node.children && (
          <div className="mr-4! pr-2! border-r-2 border-slate-200/70 mt-1!">
            {node.children.map((child, index) =>
              renderNode(child, `${path}-${index}`, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // پیدا کردن نام تمرین انتخاب‌شده برای نمایش در هدر
  const selectedExercise = exercises.find((ex) => ex._id === value);

  return (
    <div className="relative w-full">
      {/* هدر نمایش مقدار انتخاب‌شده */}
      {value && selectedExercise ? (
        <div className="text-sm text-teal-700 p-3! bg-teal-50 border border-teal-200 rounded-t-xl flex items-center gap-2">
          <span>✅</span>
          <span className="font-medium">تمرین انتخاب‌شده:</span>
          <span className="font-bold">{selectedExercise.title}</span>
        </div>
      ) : (
        <div className="text-sm text-slate-400 p-3! border-b border-slate-200 bg-slate-50 rounded-t-xl">
          {placeholder}
        </div>
      )}

      {/* محفظه درخت با اسکرول */}
      <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-b-xl bg-white p-3! shadow-sm">
        {treeData.length === 0 ? (
          <div className="text-sm text-slate-500 p-4! text-center">
            🏷️ تمرینی برای نمایش وجود ندارد.
          </div>
        ) : (
          treeData.map((node, index) => renderNode(node, `root-${index}`, 0))
        )}
      </div>

      {/* مودال نمایش تمرین */}
      {selectedExerciseForView && (
        <ExerciseViewModal
          exercise={selectedExerciseForView}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
