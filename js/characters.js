/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   characters.js : الشخصيات الكرتونية الأصلية + جمل الحوار
   ------------------------------------------------------------
   كل الرسوم SVG أصلية مرسومة خصيصًا للعبة (لا شخصيات محمية
   بحقوق ملكية). الشخصيات ترافق اللاعب في كل قسم.
   ============================================================ */

/** أداة عشوائية آمنة للجمل */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ---------- رسوم الشخصيات (SVG أصلية) ---------- */

/** زملكاوي الصغير: فتى مرح يحب الاكتشاف */
function zakiSVG() {
  return `<svg viewBox="0 0 120 130" role="img" aria-label="زملكاوي الصغير" class="char-svg">
  <ellipse cx="60" cy="122" rx="34" ry="6" fill="rgba(0,0,0,.10)"/>
  <path d="M32 122 L38 86 Q60 78 82 86 L88 122 Z" fill="#ffffff" stroke="#23262b" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M32 122 L35 106 Q60 99 85 106 L88 122 Z" fill="#d32f2f" opacity=".92"/>
  <path d="M38 86 Q60 76 82 86" fill="none" stroke="#d32f2f" stroke-width="4"/>
  <circle cx="22" cy="96" r="9" fill="#ffffff" stroke="#23262b" stroke-width="3"/>
  <circle cx="98" cy="96" r="9" fill="#ffffff" stroke="#23262b" stroke-width="3"/>
  <circle cx="60" cy="48" r="26" fill="#ffe0c2" stroke="#23262b" stroke-width="3.5"/>
  <path d="M34 44 Q36 20 60 18 Q84 20 86 44 Q74 30 60 30 Q46 30 34 44 Z" fill="#4a2f23"/>
  <rect x="42" y="6" width="36" height="12" rx="6" fill="#d32f2f" stroke="#23262b" stroke-width="3"/>
  <circle cx="51" cy="50" r="3.2" fill="#23262b"/>
  <circle cx="69" cy="50" r="3.2" fill="#23262b"/>
  <path d="M52 60 Q60 68 68 60" fill="none" stroke="#23262b" stroke-width="3" stroke-linecap="round"/>
  <circle cx="44" cy="58" r="4" fill="#ffb3ab" opacity=".8"/>
  <circle cx="76" cy="58" r="4" fill="#ffb3ab" opacity=".8"/>
  <text x="88" y="20" font-size="14">⭐</text>
</svg>`;
}

/** زملكاوية الصغيرة: بنت ذكية ومتحمسة تقدم التلميحات */
function ziziSVG() {
  return `<svg viewBox="0 0 120 130" role="img" aria-label="زملكاوية الصغيرة" class="char-svg">
  <ellipse cx="60" cy="122" rx="32" ry="6" fill="rgba(0,0,0,.10)"/>
  <path d="M34 122 L39 88 Q60 80 81 88 L86 122 Z" fill="#ffffff" stroke="#23262b" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M34 122 L37 108 Q60 101 83 108 L86 122 Z" fill="#d32f2f" opacity=".92"/>
  <circle cx="60" cy="48" r="26" fill="#ffe3c9" stroke="#23262b" stroke-width="3.5"/>
  <path d="M34 46 Q34 16 60 16 Q86 16 86 46 Q80 34 60 34 Q40 34 34 46 Z" fill="#5a3825"/>
  <circle cx="30" cy="58" r="10" fill="#5a3825" stroke="#23262b" stroke-width="3"/>
  <circle cx="90" cy="58" r="10" fill="#5a3825" stroke="#23262b" stroke-width="3"/>
  <circle cx="30" cy="46" r="5" fill="#d32f2f"/>
  <circle cx="90" cy="46" r="5" fill="#d32f2f"/>
  <circle cx="51" cy="50" r="3.2" fill="#23262b"/>
  <circle cx="69" cy="50" r="3.2" fill="#23262b"/>
  <path d="M52 59 Q60 67 68 59" fill="none" stroke="#23262b" stroke-width="3" stroke-linecap="round"/>
  <circle cx="44" cy="58" r="4" fill="#ffb3ab" opacity=".8"/>
  <circle cx="76" cy="58" r="4" fill="#ffb3ab" opacity=".8"/>
  <text x="6" y="24" font-size="13">💡</text>
</svg>`;
}

/** الكابتن: لاعب خبير يشجع ويشرح القواعد */
function captainSVG() {
  return `<svg viewBox="0 0 120 130" role="img" aria-label="الكابتن" class="char-svg">
  <ellipse cx="60" cy="122" rx="36" ry="6" fill="rgba(0,0,0,.10)"/>
  <path d="M28 122 L36 84 Q60 74 84 84 L92 122 Z" fill="#ffffff" stroke="#23262b" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M28 122 L32 104 Q60 96 88 104 L92 122 Z" fill="#d32f2f" opacity=".92"/>
  <rect x="50" y="88" width="20" height="7" rx="2" fill="#d9a413" stroke="#23262b" stroke-width="2.5"/>
  <circle cx="18" cy="98" r="10" fill="#ffe0c2" stroke="#23262b" stroke-width="3"/>
  <circle cx="102" cy="98" r="10" fill="#ffe0c2" stroke="#23262b" stroke-width="3"/>
  <circle cx="60" cy="46" r="27" fill="#ffe0c2" stroke="#23262b" stroke-width="3.5"/>
  <path d="M33 40 Q36 16 60 15 Q84 16 87 40 Q74 28 60 28 Q46 28 33 40 Z" fill="#2b2b2b"/>
  <rect x="52" y="2" width="16" height="10" rx="5" fill="#ffffff" stroke="#23262b" stroke-width="3"/>
  <circle cx="51" cy="48" r="3.2" fill="#23262b"/>
  <circle cx="69" cy="48" r="3.2" fill="#23262b"/>
  <path d="M50 58 Q60 66 70 58" fill="none" stroke="#23262b" stroke-width="3" stroke-linecap="round"/>
  <path d="M46 55 q-4 1 -6 -1 M74 55 q4 1 6 -1" stroke="#23262b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <text x="96" y="22" font-size="14">⚽</text>
</svg>`;
}

/** الحكيم الأبيض: شيخ حكيم يقدم معلومة تاريخية بعد الأسئلة */
function sageSVG() {
  return `<svg viewBox="0 0 120 130" role="img" aria-label="الحكيم الأبيض" class="char-svg">
  <ellipse cx="60" cy="122" rx="36" ry="6" fill="rgba(0,0,0,.10)"/>
  <path d="M26 122 L34 82 Q60 72 86 82 L94 122 Z" fill="#f2f4f8" stroke="#23262b" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M52 84 h16 v10 h-16 z" fill="#d32f2f" stroke="#23262b" stroke-width="2.5"/>
  <circle cx="60" cy="46" r="27" fill="#ffe3cc" stroke="#23262b" stroke-width="3.5"/>
  <path d="M34 40 Q40 14 60 14 Q80 14 86 40 Q86 26 60 26 Q34 26 34 40 Z" fill="#e8eaee" stroke="#23262b" stroke-width="3"/>
  <path d="M44 56 Q60 84 76 56 Q70 74 60 74 Q50 74 44 56 Z" fill="#ffffff" stroke="#23262b" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="51" cy="47" r="6.5" fill="none" stroke="#23262b" stroke-width="2.8"/>
  <circle cx="69" cy="47" r="6.5" fill="none" stroke="#23262b" stroke-width="2.8"/>
  <path d="M57.5 47 h5" stroke="#23262b" stroke-width="2.8"/>
  <circle cx="51" cy="48" r="2" fill="#23262b"/>
  <circle cx="69" cy="48" r="2" fill="#23262b"/>
  <path d="M54 64 Q60 68 66 64" fill="none" stroke="#23262b" stroke-width="2.8" stroke-linecap="round"/>
  <text x="2" y="22" font-size="15">📜</text>
</svg>`;
}

/** تعريف الشخصيات */
export const CHARACTERS = {
  zaki: {
    id: 'zaki', name: 'زملكاوي الصغير', role: 'رفيق المغامرة المرح',
    color: '#FFB37E', draw: zakiSVG
  },
  zizi: {
    id: 'zizi', name: 'زملكاوية الصغيرة', role: 'صاحبة التلميحات الذكية',
    color: '#F78FB3', draw: ziziSVG
  },
  captain: {
    id: 'captain', name: 'الكابتن', role: 'قائد الفريق المشجّع',
    color: '#E53935', draw: captainSVG
  },
  sage: {
    id: 'sage', name: 'الحكيم الأبيض', role: 'حافظ تاريخ القلعة',
    color: '#9575CD', draw: sageSVG
  }
};

export const CHARACTER_IDS = Object.keys(CHARACTERS);

/** رسم شخصية بالمعرف */
export function drawCharacter(id) {
  const c = CHARACTERS[id] || CHARACTERS.zaki;
  return c.draw();
}

/* ---------- جمل الحوار ---------- */

/** ترحيب بأول دخول للقسم */
const GREETINGS = {
  zaki: [
    'يلا بينا يا بطل! مغامرة جميلة مستنياك ⚽',
    'أنا زملكاوي الصغير! تعالى نكتشف حاجات جديدة سوا!',
    'استعد! عندنا أسئلة لطيفة وكؤوس مستنياك 🏆'
  ],
  zizi: [
    'أهلًا بك! أنا زملكاوية الصغيرة، وهساعدك بالتلميحات لو احترت 💡',
    'جاهز؟ هيدي دي سريعة وممتعة، وأنا معاك!',
    'متقلقش من أي سؤال صعب… التلميح جنبك دايمًا 😉'
  ],
  captain: [
    'الكابتن معاك! اجمع فريقك ونبدأ المباراة ⚽',
    'قلبي معاك يا نجم! ركّز شوية وهتنجح بإذن الله 💪',
    'في الملعب مفيش خسارة… فيه تعلّم ون محاولة جديدة!'
  ],
  sage: [
    'أهلًا بك في رحلة التاريخ يا صغيري… القلعة مليئة بالحكايات 📜',
    'من 1911 حتى اليوم… قصص جميلة سنعيشها معًا',
    'اسألني عن أي شيء… أنا الحكيم الأبيض، أحفظ قصص القلعة'
  ]
};

/** جمل ما قبل السؤال (حوار لطيف يفتح كل سؤال) */
const PRE_LINES = [
  'يلا يا بطل! السؤال ده هيعجبك 😍',
  'ركز معايا شوية… إنت كده بتكبر في عالم الزمالك! ⭐',
  'سؤال جديد يعني مغامرة جديدة!',
  'أنا متأكد إنك تعرف الإجابة… جرّب! 💪',
  'خد وقتك… مفيش استعجال عندنا',
  'إجابة صحيحة = نقاط ونجوم… يلا! ⚡',
  'تخيل إنك في الملعب وسط الجماهير… جاهز؟',
  'ده مش اختبار… ده لعبة! استمتع 😉'
];

/** جمل الإجابة الصحيحة (تشجيع بلا مبالغة) */
const CORRECT_LINES = [
  'برافو عليك! إجابة رائعة يا بطل! 🌟',
  'ما شاء الله! إنت فعلاً زملكاوي أصيل ⚪🔴',
  'إجابة صحيحة! الزمالك فخور بيك ❤️',
  'عين الصقر ما بتغلط… أحسنت! 🦅',
  'كده صح! كمّل ب نفس الحماس 💪',
  'يا سلام عليك! النقاط بتزيد والنجوم بتلمع ⭐'
];

/** جمل الإجابة الخاطئة (بلا إحراج ولا سخرية) */
const WRONG_LINES = [
  'ولا يهمك! كلنا بنتعلم، جرب تاني! ❤️',
  'قريب جدًا من الإجابة! خد المعلومة الجميلة دي 💡',
  'مفيش مشكلة خالص… المهم إنت بتحاول 🌟',
  'الأبطال كمان بيغلطوا… المهم بيكملوا! 💪',
  'ولا يهمك يا صديقي، اقرأ المعلومة وهتعرفها المرة الجاية',
  'حلو إنك حاولت! تعال نتعرف على الإجابة الصح 🤍'
];

/** جمل انتهاء الوقت (لطيفة جدًا) */
const TIMEOUT_LINES = [
  'الوقت خلص بسرعة! بس عادي، خد معلومتك الجميلة 💡',
  'الساعة عندها رأي تاني… المعلومة دي هتحبها!',
  'ولا يهمك! نكمل السؤال الجاي بنشاط ⚡'
];

/** مقدمة التلميح */
const HINT_INTROS = [
  'تلميح صغير من زملكاوية الصغيرة 💡: ',
  'زيزي بتقولك 💡: ',
  'خد التلميح ده بس متقولش لحد 😄: '
];

/** مقدمة معلومة الحكيم بعد الإجابة */
const FACT_INTROS = [
  'وقال الحكيم الأبيض 📜: ',
  'سر تاريخي من الحكيم الأبيض 📜: ',
  'الحكيم الأبيض بيحب يضيف 📜: '
];

/** جمل إكمال المرحلة */
const COMPLETE_LINES = {
  perfect: ['ممتاز جدًا! مرحلة كاملة بلا غلطة… أنت أسطورة! 👑', 'ثلاث نجوم لامعة! إنت نجم القلعة البيضاء ⭐⭐⭐'],
  passed: ['مرحلة جميلة! أكملت ونجومك بتزيد ⭐', 'برافو! القلعة البيضاء بتفتحلك أبوابها أكتر 🏰'],
  failed: ['محاولة شجاعة! خد نفسك وجرّب تاني… أنا معاك ❤️', 'مش مشكلة! المرحلة هتفضل مستنيك لما تكون جاهز 💪']
};

/** جمل صندوق المفاجآت */
const BOX_LINES = [
  'صندوق مفاجآت وصلك! افتحه بسرعة 🎁',
  'كمّلت المرحلة… والقلعة بتكافئك! 🎁',
  'هدية صغيرة من زملكاوي وزملكاوية 🎁'
];

/**
 * جملة حوار بحسب النوع
 * @param {string} kind greet|pre|correct|wrong|timeout|hint|fact|complete|box
 * @param {Object} ctx سياق: { characterId, state }
 */
export function say(kind, ctx = {}) {
  switch (kind) {
    case 'greet': return pick(GREETINGS[ctx.characterId] || GREETINGS.zaki);
    case 'pre': return pick(PRE_LINES);
    case 'correct': return pick(CORRECT_LINES);
    case 'wrong': return pick(WRONG_LINES);
    case 'timeout': return pick(TIMEOUT_LINES);
    case 'hint': return pick(HINT_INTROS);
    case 'fact': return pick(FACT_INTROS);
    case 'complete':
      return pick(COMPLETE_LINES[ctx.state] || COMPLETE_LINES.passed);
    case 'box': return pick(BOX_LINES);
    default: return '';
  }
}

/** فقاعة حوار جاهزة للعرض مع الشخصية */
export function speechBubble(characterId, text, extraClass = '') {
  const c = CHARACTERS[characterId] || CHARACTERS.zaki;
  return `
  <div class="char-bubble ${extraClass}">
    <div class="char-avatar">${c.draw()}</div>
    <div class="char-speech" style="--char-color:${c.color}">
      <b class="char-name">${c.name}</b>
      <span class="char-line">${text}</span>
    </div>
  </div>`;
}
