// utils/upsertInList.ts

/**
 * یک آیتم را در آرایه به‌روزرسانی می‌کند اگر وجود دارد،
 * در غیر این صورت آن را به لیست اضافه می‌کند (insert-or-update)
 *
 * @param list آرایه فعلی
 * @param item آیتم جدید/به‌روزشده
 * @param getId تابعی که شناسه یکتای هر آیتم را برمی‌گرداند
 * @param position محل درج آیتم جدید در صورت insert ('start' | 'end')
 */
export function upsertInList<T>(
  list: T[],
  item: T,
  getId: (item: T) => string,
  position: 'start' | 'end' = 'start',
): T[] {
  const itemId = getId(item);
  const index = list.findIndex((existing) => getId(existing) === itemId);

  // حالت ۱: آیتم از قبل وجود دارد → جایگزین کن
  if (index !== -1) {
    const updated = [...list];
    updated[index] = item;
    return updated;
  }

  // حالت ۲: آیتم جدید است → اضافه کن
  return position === 'start' ? [item, ...list] : [...list, item];
}
