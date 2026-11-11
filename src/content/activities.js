import { resolveMediaUrl } from '../lib/media';

// «لحظات حقيقية»: تجربة من مرحلتين بصور ومقاطع حقيقية من ورش منارة ومبادراتها (الإعلانات الرسمية في قسم المنشورات).
//   المرحلة الأولى (Activities.jsx — مثبّتة ويتحكم بها التمرير): العنوان الكبير نافذة على صورة الافتتاح، تنتفخ حروفه
//   حتى تصير إطاراً يملأ الشاشة، ثم تصغر الصورة إلى أول لقطة في شريط تُوزَّع بقية لقطاته من رزمة ويتحرك أفقياً.
//   المرحلة الثانية: بقية اللقطات والأفلام الكاملة، بترقيم يكمل ترقيم الشريط.
// الصور ومجموعاتها (العناوين) تُدار من لوحة التحكم: GET /moments يعيد الشريط كما يختاره الأدمن (صورة الافتتاح، ثم صورة
// أو مقطع من كل مجموعة بترتيب المجموعات)، وبقية الصور للتكوين التحريري (المجموعات بترتيبها، وصور كل مجموعة بترتيب
// عشوائي في كل زيارة)، مع المجموعات المنشورة بترتيبها (buildMoments أدناه). المقاطع ثابتة في public/media/activities/<مفتاح المجموعة>/:
// مقطع قصير صامت (loop.mp4) وفيلم كامل (reel.mp4 مع reel-poster.webp)، وكذلك الصور الأصلية للقسم (WebP بعرضين 800 و1600)
// التي نُقلت سجلاتها إلى قاعدة البيانات.

export const ACTIVITY_MEDIA_BASE = '/media/activities';

// أسماء المجموعات الأصلية: احتياط للمقاطع إن لم تصل أسماؤها من الـ API
export const ACTIVITY_NAMES = {
  first: { AR: 'ورشة عمل حول الأمن السيبراني', EN: 'Cybersecurity Workshop' },
  field: { AR: 'التدريب الميداني', EN: 'Field Training' },
  github: { AR: 'ورشة GitHub', EN: 'GitHub Workshop' },
  games: { AR: 'ورشة تصميم الألعاب', EN: 'Game Design Workshop' },
  amanha: { AR: 'مبادرة أمانها قوة', EN: 'Amanha Quwwa Initiative' },
  ai: { AR: 'ورشة الذكاء الاصطناعي', EN: 'AI Workshop' },
  intro2: { AR: 'لقاء تعريفي — التدريب الميداني ٢', EN: 'Field Training Intro Meeting 2' },
  team: { AR: 'اجتماع الفريق', EN: 'Team Meeting' },
};

// العنوان الذي يصير نافذة الافتتاح: سطر واحد على الشاشات العريضة، وسطران على الهاتف
export const APERTURE_WORDS = {
  AR: { wide: ['لحظات حقيقية'], narrow: ['لحظات', 'حقيقية'] },
  EN: { wide: ['REAL MOMENTS'], narrow: ['REAL', 'MOMENTS'] },
};

// أوصاف المقاطع الحية القصيرة (loop.mp4) حسب مجلدها؛ الأدمن يختار لكل مجموعة لها مقطع أن يظهر في الشريط بدل صورة
const LOOP_ALTS = {
  field: { AR: 'لقطة حيّة من التدريب الميداني', EN: 'A live moment from the field training' },
  github: { AR: 'لقطة حيّة من ورشة GitHub', EN: 'A live moment from the GitHub workshop' },
  ai: { AR: 'لقطة حيّة من ورشة الذكاء الاصطناعي', EN: 'A live moment from the AI workshop' },
  team: { AR: 'لقطة حيّة من اجتماع فريق منارة حول طاولة الاجتماعات', EN: 'A live moment from the Manara team meeting around the conference table' },
};

export const films = [
  { src: 'field/reel', duration: '0:18', activity: 'field', alt: { AR: 'فيلم من التدريب الميداني', EN: 'Film from the field training' } },
  { src: 'github/reel', duration: '0:38', activity: 'github', alt: { AR: 'فيلم من ورشة GitHub', EN: 'Film from the GitHub workshop' } },
  { src: 'team/reel', duration: '0:12', activity: 'team', alt: { AR: 'فيلم من اجتماع فريق منارة', EN: 'Film from the Manara team meeting' } },
  { src: 'amanha/reel', duration: '0:31', activity: 'amanha', alt: { AR: 'فيلم من مبادرة أمانها قوة', EN: 'Film from the Amanha Quwwa initiative' } },
  { src: 'ai/reel', duration: '1:24', activity: 'ai', alt: { AR: 'فيلم من ورشة الذكاء الاصطناعي', EN: 'Film from the AI workshop' } },
];

export const mediaUrl = (src, suffix) => `${ACTIVITY_MEDIA_BASE}/${src}${suffix}`;

const localized = (pair, fallback = '') => ({ AR: pair?.ar || pair?.en || fallback, EN: pair?.en || pair?.ar || fallback });

// صورة من الـ API بالشكل الذي يرسمه القسم: src رابط الصورة (ومعرّفها الفريد)، srcSet للصور الأصلية بعرضين،
// thumb للمصغّرات، ar نسبة العرض/الارتفاع، pos موضع القص، activity مفتاح مجموعتها
const toPhoto = (image, names) => {
  const url = resolveMediaUrl(image.url);
  const name = names[image.group] || { AR: '', EN: '' };
  const fallbackAlt = { AR: `صورة من ${name.AR}`, EN: `A photo from ${name.EN}` };
  return {
    type: 'image',
    id: image.id,
    src: url,
    srcSet: image.srcset || undefined,
    thumb: image.srcset ? image.srcset.split(' ')[0] : url,
    ar: image.width && image.height ? image.width / image.height : 4 / 3,
    pos: image.focal_point || '50% 50%',
    activity: image.group,
    lead: Boolean(image.is_lead),
    alt: { AR: image.alt?.ar || fallbackAlt.AR, EN: image.alt?.en || image.alt?.ar || fallbackAlt.EN },
  };
};

const toLoop = (item, names) => {
  const name = names[item.group] || { AR: '', EN: '' };
  return {
    type: 'loop',
    src: item.video,
    reel: `${item.video}/reel`,
    ar: 9 / 16,
    activity: item.group,
    alt: LOOP_ALTS[item.video] || { AR: `لقطة حيّة من ${name.AR}`, EN: `A live moment from ${name.EN}` },
  };
};

// من استجابة GET /moments إلى محتوى القسم: الشريط (صور ومقاطع)، بقية الصور، الأفلام، شريط الأنشطة، والأسماء
export function buildMoments(stripItems = [], groups = [], rest = []) {
  const names = { ...ACTIVITY_NAMES };
  groups.forEach((group) => { names[group.key] = localized(group.title, group.key); });
  const published = new Set(groups.map((group) => group.key));
  const usable = (image) => image?.url && published.has(image.group);

  const strip = stripItems
    .map((item) => {
      if (item?.type === 'video' && item.video && published.has(item.group)) return toLoop(item, names);
      if (item?.type === 'image' && usable(item.image)) return toPhoto(item.image, names);
      return null;
    })
    .filter(Boolean);
  const more = rest.filter(usable).map((image) => toPhoto(image, names));

  // الشريط يبدأ بصورة تملأ حروف العنوان: صورة الافتتاح (تصل أولاً)، وإلا أول صورة في الشريط، أو أول صورة بعده
  const firstPhoto = strip.findIndex((item) => item.type === 'image');
  if (firstPhoto > 0) strip.unshift(...strip.splice(firstPhoto, 1));
  else if (firstPhoto === -1 && more.length) strip.unshift(more.shift());
  if (strip[0]?.type !== 'image') strip.length = 0;

  // شريط الأنشطة: مجموعات لقطات الشريط فقط، بترتيب ظهورها في الشريط (الذي يرتّبه الأدمن)
  const ribbon = [...new Set(strip.map((item) => item.activity))];

  return {
    strip,
    more,
    photos: [...strip.filter((item) => item.type === 'image'), ...more],
    films: films.filter((film) => published.has(film.activity)),
    ribbon,
    names,
  };
}
