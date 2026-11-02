/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   storage.js : نظام حفظ التقدم باستخدام LocalStorage
   ============================================================ */

const SAVE_KEY = 'zamalek_legends_save_v1';

/** الشكل الافتراضي لبيانات اللاعب */
export function defaultSave() {
  return {
    version: 1,
    name: '',
    points: 0,
    correct: 0,
    wrong: 0,
    completed: {},        // { [stageId]: { stars, best } }
    unlocked: [1],        // معرفات المراحل المفتوحة
    achievements: [],     // معرفات الشارات المفتوحة
    speedCorrect: 0,      // إجابات صحيحة في تحديات السرعة
    encyReads: [],        // بطاقات الموسوعة المقروءة
    lastStage: 1,         // آخر مرحلة لعبها اللاعب
    sound: true,
    theme: 'light'
  };
}

/** تحميل بيانات اللاعب (مع الدمج الآمن مع الشكل الافتراضي) */
export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return defaultSave();
    // دمج آمن مع القيم الافتراضية لتفادي المفاتيح الناقصة
    return { ...defaultSave(), ...parsed };
  } catch (err) {
    console.warn('تعذر تحميل التقدم المحفوظ، سيبدأ التقدم من جديد.', err);
    return defaultSave();
  }
}

/** حفظ بيانات اللاعب */
export function saveSave(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('تعذر حفظ التقدم (قد تكون مساحة التخزين ممتلئة).', err);
  }
}

/** حذف التقدم بالكامل */
export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.warn('تعذر حذف بيانات التقدم.', err);
  }
}

export const STORAGE_KEY = SAVE_KEY;
