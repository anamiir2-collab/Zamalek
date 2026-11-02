/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   router.js : راوتر بسيط قائم على الهاش (متوافق مع GitHub Pages)
   ============================================================ */

const ROUTES = new Map(); // '#/home' -> renderFn
let currentRoute = null;
const hooks = { before: [], after: [] };

/** تسجيل مسار مع دالة عرض */
export function register(route, renderFn) {
  ROUTES.set(route, renderFn);
}

/** خطاف قبل/بعد التغيير */
export function onBefore(fn) { hooks.before.push(fn); }
export function onAfter(fn) { hooks.after.push(fn); }

/** استخراج المسار الحالي من الهاش */
function parseHash() {
  const h = window.location.hash || '#/home';
  return h.startsWith('#/') ? h : '#/home';
}

/** التنقل إلى مسار */
export function navigate(route) {
  if (window.location.hash === route) {
    handleRoute();
  } else {
    window.location.hash = route;
  }
}

/** معالجة المسار الحالي */
export function handleRoute() {
  let route = parseHash();
  // إزالة أجزاء الاستعلام مثل '#/game/3'
  const base = route.split('?')[0];

  const guarded = hooks.before.every(fn => {
    try { return fn(route) !== false; } catch (e) { console.error(e); return true; }
  });
  if (!guarded) return;

  // مسار غير معروف -> الرئيسية
  const handler = ROUTES.get(base);
  if (!handler) {
    window.location.hash = '#/home';
    return;
  }

  // إخفاء كل الشاشات ثم إظهار المطلوبة
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const map = {
    '#/home': 'screen-home',
    '#/stages': 'screen-stages',
    '#/game': 'screen-game',
    '#/encyclopedia': 'screen-encyclopedia',
    '#/achievements': 'screen-achievements',
    '#/settings': 'screen-settings'
  };
  const screenId = map[base];
  if (screenId) {
    const el = document.getElementById(screenId);
    if (el) el.classList.add('active');
  }

  try {
    handler(route);
  } catch (err) {
    console.error('خطأ أثناء عرض الشاشة:', err);
  }

  currentRoute = route;
  hooks.after.forEach(fn => { try { fn(route); } catch (e) { console.error(e); } });
  window.scrollTo({ top: 0 });
}

/** تشغيل الراوتر */
export function startRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function currentRouteName() { return currentRoute; }
