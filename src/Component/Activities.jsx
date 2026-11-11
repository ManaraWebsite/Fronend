import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion, useScroll } from 'framer-motion';
import { FiArrowDown, FiPlay } from 'react-icons/fi';
import { LanguageContext } from '../LanguageContext';
import { APERTURE_WORDS, mediaUrl } from '../content/activities';
import MediaLightbox from './MediaLightbox';
import { createAperture } from '../lib/apertureGL';
import { useMoments } from '../hooks/useMoments';

// «لحظات حقيقية» — تجربة مثبّتة يتحكم بها التمرير وحده (لا مؤقتات)، بأربع مراحل متتالية:
//   1) النافذة: العنوان الكبير يبدأ نصاً أبيض عادياً، ومع بداية التمرير تملأ صورة الافتتاح حروفه وتظهر حولها خطوط الكنتور،
//      ثم تنتفخ الحروف حتى تلتحم،
//      ثم يتحول الشكل إلى إطار مستدير يتسع حتى يملأ الشاشة، والصورة تتراجع قليلاً (تصغر) فيظهر منها أكثر.
//   2) ملء الشاشة: الصورة كاملة مع زوايا المُعايِن وعنوانها.
//   3) الرزمة: تصغر الصورة إلى أول لقطة في الشريط، وخلفها رزمة لقطات مائلة؛ يظهر العنوان وشريط الأنشطة.
//   4) الشريط: تُوزَّع اللقطات من الرزمة إلى أماكنها ثم يمر الشريط أفقياً عبر مُعايِن ثابت في وسط الشاشة، لقطةً لقطة:
//      كل لقطة تنزلق إلى الوسط وتستقر فيه قليلاً، فتكبر وتضيء ونشاطها مُضاء، والبقية تخفت وتضبب.
// كل الحالات دالة في موضع التمرير u (بوحدة ارتفاع الشاشة داخل المسار)، فالرجوع للأعلى يعكسها تماماً.
// بعد انتهاء التثبيت تبدأ المرحلة الثانية (بقية اللقطات والأفلام) بترقيم يكمل ترقيم الشريط.
// مع تقليل الحركة: نسخة ثابتة (عنوان، شريط قابل للتمرير الأفقي، ثم المرحلة الثانية).
// المحتوى من لوحة التحكم (useMoments): اختيار عشوائي جديد من 10 صور على الأكثر في كل زيارة، تُوزَّع على الشريط
// والمرحلة الثانية، والمقاطع بينها (buildMoments في content/activities.js).

const RINGS = 6; // خطوط الكنتور حول النافذة
const T = {
  fill: [0.06, 0.32], // النص الأبيض تملؤه الصورة وتظهر خطوط الكنتور
  swell: [0.24, 0.85], // انتفاخ الحروف
  rect: [0.5, 1.3], // الإطار يتسع حتى يملأ الشاشة
  shrink: [1.6, 2.25], // الصورة تصغر إلى أول لقطة
  ui: [1.95, 2.35], // العنوان وشريط الأنشطة والرزمة
  deal: [2.3, 3.2], // توزيع اللقطات
  dealEach: 0.5, // مدة توزيع كل لقطة (تتداخل)
  travel: 3.25, // بداية الحركة الأفقية
  tail: 0.3, // بقاء الحالة الأخيرة قبل فك التثبيت
};
const DECK_TILT = [0, -6, 4, -3, 7, -4, 5];
// كل انتقال من لقطة إلى التالية بمسافة تمرير ثابتة قصيرة (بوحدة ارتفاع الشاشة): حركة MOVE ثم وقفة STOP داخل المُعايِن
const MOVE = 0.3;
const STOP = 0.15;

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { const t = clamp01(x); return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2; };
const span = (u, [a, b]) => clamp01((u - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const two = (n) => String(n).padStart(2, '0');

// الملصق (poster) يُحمَّل فور وجود الفيديو في الصفحة رغم preload="none"، فلا يُعطى إلا حين يقترب القسم (awake)
function LoopVideo({ src, active, awake = true }) {
  const video = useRef(null);
  useEffect(() => {
    const el = video.current;
    if (!el || navigator.connection?.saveData) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active]);
  return <video ref={video} src={mediaUrl(src, '/loop.mp4')} poster={awake ? mediaUrl(src, '/loop-poster.webp') : undefined} muted loop playsInline preload="none" disablePictureInPicture aria-hidden="true" />;
}

// فك ترميز متزامن: لقطات الشريط تتحرك بالتحويلات، ومع القفز بعيداً في التمرير (رابط، End، سحب شريط التمرير)
// كان الفك غير المتزامن يترك أجزاء من الصورة غير مرسومة
function FrameMedia({ item, lang, active, sizes, awake }) {
  if (item.type === 'loop') return <LoopVideo src={item.src} active={active} awake={awake} />;
  return (
    <img
      src={item.srcSet ? item.thumb : item.src}
      srcSet={item.srcSet}
      sizes={item.srcSet ? sizes : undefined}
      alt={item.alt[lang]}
      loading="lazy"
      decoding="sync"
      draggable="false"
      style={item.pos ? { objectPosition: item.pos } : undefined}
    />
  );
}

function useNarrow() {
  const query = '(max-width: 767px)';
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

function Ribbon({ current, lang, ribbon, names }) {
  return (
    <ol className="reel-ribbon">
      {ribbon.map((key) => (
        <li key={key} className={key === current ? 'is-on' : ''}>{names[key][lang]}</li>
      ))}
    </ol>
  );
}

// صورة مصغّرة للخلفية والعارض: ملصق المقطع أو أصغر نسخة من الصورة
const posterOf = (item) => (item.type === 'loop' ? mediaUrl(item.src, '/loop-poster.webp') : item.thumb);

function PinnedReel({ lang, isAr, onOpen, strip, ribbon, names }) {
  const narrow = useNarrow();
  const words = APERTURE_WORDS[lang][narrow ? 'narrow' : 'wide'];
  const track = useRef(null);
  const canvas = useRef(null);
  const aperture = useRef(null);
  const fallback = useRef(null);
  const fallbackImg = useRef(null);
  const [glOk, setGlOk] = useState(true);
  const [apReady, setApReady] = useState(false);
  const cue = useRef(null);
  const ui = useRef([]);
  const night = useRef(null);
  const frames = useRef([]);
  const finder = useRef(null);
  const layoutRef = useRef(null);
  const [size, setSize] = useState({ W: 0, H: 0 });
  const [trackH, setTrackH] = useState(null);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });

  // القسم بعيد أسفل الصفحة: سياق WebGL الثاني وصورة الافتتاح (1600px) وملصقات المقاطع تُنشأ حين يقترب فقط،
  // لا مع تحميل الصفحة (كانت تزاحم المشهد ثلاثي الأبعاد وتحميل الواجهة على الهاتف)
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setAwake(true);
      io.disconnect();
    }, { rootMargin: '200% 0px' });
    io.observe(track.current);
    return () => io.disconnect();
  }, []);

  // النافذة بـ WebGL2 (src/lib/apertureGL.js)؛ إن تعذّر: إطار مستدير بسيط يتسع (clip-path) دون الحروف
  useEffect(() => {
    if (!awake) return undefined;
    const ap = canvas.current ? createAperture(canvas.current, { photoUrl: strip[0].src }) : null;
    if (!ap) setGlOk(false);
    aperture.current = ap;
    setApReady(Boolean(ap)); // يعيد القياس بعد إنشاء النافذة (القياس الأول يسبقها)
    return () => { ap?.dispose(); aperture.current = null; };
  }, [strip, awake]);

  // القياس: العنوان (حجم الخط وحقل المسافات)، ومواضع لقطات الشريط، وطول المسار
  const measure = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    // قيم مبدئية حتى يُبنى حقل المسافات (buildAperture) حين يقترب القسم من الشاشة
    const prev = layoutRef.current;
    const font = prev?.apertureFor === `${W}x${H}` ? prev.font : Math.min(W * 0.11, H * 0.3);
    const box = prev?.apertureFor === `${W}x${H}` ? prev.box : { x: W * 0.08, y: H * 0.4, w: W * 0.84, h: H * 0.2 };
    setSize({ W, H });

    const M = Math.max(16, Math.min(80, W * 0.05));
    // على الهاتف: اللقطة الأولى أضيق من الشاشة حتى تظهر الرزمة خلفها كما في الشاشات العريضة
    const FH = narrow ? Math.min(H * 0.34, ((W - 2 * M) * 0.72) / strip[0].ar) : Math.min(H * 0.5, 560);
    const gap = narrow ? 12 : 18;
    const top = narrow ? H * 0.5 - FH / 2 + 10 : H * 0.53 - FH / 2;
    // اللقطة الأولى في وسط الشاشة، حيث المُعايِن الثابت الذي يمر به الشريط
    let x = (W - FH * strip[0].ar) / 2;
    const slots = strip.map((item) => {
      const w = FH * item.ar;
      const slot = { x, y: top, w, h: FH };
      x += w + gap;
      return slot;
    });
    // كل انتقال من لقطة إلى التالية بالمسافة نفسها من التمرير، أياً كان عرض اللقطتين
    const centers = slots.map((sl) => sl.x + sl.w / 2);
    const segs = [];
    let travelU = 0;
    for (let i = 0; i < centers.length - 1; i += 1) {
      const len = MOVE + STOP;
      segs.push({ from: centers[i], d: centers[i + 1] - centers[i], start: travelU, len });
      travelU += len;
    }
    const total = T.travel + travelU + T.tail;
    layoutRef.current = { ...prev, W, H, M, FH, slots, centers, segs, travelU, total, font, box };
    setTrackH(Math.round((total + 1) * H));
  }, [narrow, strip]);

  // بناء العنوان وحقل المسافات (~0.3 ثانية مرة واحدة): مؤجَّل حتى يقترب القسم من الشاشة، فلا يؤخر تحميل الصفحة،
  // ويُعاد بعد انتهاء تغيير حجم النافذة أو تبديل اللغة فقط
  const near = useRef(false);
  const buildAperture = useCallback(() => {
    const L = layoutRef.current;
    if (!aperture.current || !L || !near.current) return;
    const key = `${L.W}x${L.H}|${words.join(' ')}`;
    if (L.apertureKey === key) return;
    const res = aperture.current.setLayout({
      W: L.W, H: L.H, lines: words, dir: isAr ? 'rtl' : 'ltr', fontFamily: getComputedStyle(document.body).fontFamily,
      fitW: L.W * (narrow ? 0.86 : 0.9), fitH: L.H * (narrow ? 0.4 : 0.36), centerY: L.H * 0.5,
    });
    layoutRef.current = { ...layoutRef.current, font: res.font, box: res.box, apertureKey: key, apertureFor: `${L.W}x${L.H}` };
  }, [words, isAr, narrow]);

  useLayoutEffect(() => {
    measure();
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { measure(); buildAperture(); }, 180);
    };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(timer); window.removeEventListener('resize', onResize); };
  }, [measure, buildAperture]);

  useEffect(() => {
    const el = track.current;
    if (!el || !apReady) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      near.current = entry.isIntersecting;
      if (entry.isIntersecting) document.fonts.ready.then(() => { buildAperture(); setSize((sz) => ({ ...sz })); });
    }, { rootMargin: '150% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [apReady, buildAperture, glOk]);

  // رسم الحالة لموضع تمرير معيّن — الكتابة مباشرة على العناصر (بلا إعادة رسم React)
  const render = useCallback(() => {
    const L = layoutRef.current;
    if (!L || !trackH) return;
    const { W, H, slots, font, box } = L;
    const u = (scrollYProgress.get() * (trackH - H)) / H;

    // 1) النافذة: انتفاخ الحروف، ثم الإطار المستدير يتسع حتى يملأ الشاشة، والصورة تتراجع
    const tr = ease(span(u, T.rect));
    const r0 = { x: box.x + box.w * 0.08, y: box.y + box.h * 0.2, w: box.w * 0.84, h: box.h * 0.6 };
    const rect = { x: lerp(r0.x, 0, tr), y: lerp(r0.y, 0, tr), w: lerp(r0.w, W, tr), h: lerp(r0.h, H, tr) };
    const rectR = lerp(font * 0.3, 0, tr);
    // الصورة تتراجع من 1.22 إلى حجم الشاشة. في البداية تُزاح بحيث يقع الناس (نحو 72% من ارتفاعها) خلف الحروف،
    // ثم تعود تدريجياً إلى قصّها النهائي، وهو نفس قصّ اللقطة الأولى في الشريط (object-position: 50% 60%) فلا يظهر التبديل.
    const lead = strip[0];
    const z = lerp(1.22, 1, ease(span(u, [T.swell[0], T.rect[1]])));
    const imgW = Math.max(W, H * lead.ar) * z;
    const imgH = imgW / lead.ar;
    const yStart = Math.min(0, Math.max(H - imgH, box.y + box.h / 2 - imgH * 0.72));
    const photoBox = { x: (W - imgW) / 2, y: lerp(yStart, (H - imgH) * 0.6, tr), w: imgW, h: imgH };
    const apertureOn = u < T.rect[1];
    if (aperture.current) {
      canvas.current.style.visibility = apertureOn ? 'visible' : 'hidden';
      if (apertureOn) {
        aperture.current.draw({
          fill: ease(span(u, T.fill)),
          swell: font * 0.23 * ease(span(u, T.swell)),
          rect,
          rectR,
          rectOn: clamp01(span(u, T.rect) * 6),
          melt: font * 0.12,
          gap: font * 0.11,
          rings: RINGS,
          ringAlpha: 1 - span(u, [0.9, 1.25]),
          photo: photoBox,
        });
      }
    } else if (fallback.current) {
      // بديل بلا WebGL: الصورة داخل إطار مستدير يتسع
      fallback.current.style.visibility = apertureOn ? 'visible' : 'hidden';
      fallbackImg.current.style.opacity = ease(span(u, T.fill)).toFixed(3);
      const rr = u < T.rect[0] ? { ...r0 } : rect;
      fallback.current.style.clipPath = `inset(${rr.y.toFixed(1)}px ${(W - rr.x - rr.w).toFixed(1)}px ${(H - rr.y - rr.h).toFixed(1)}px ${rr.x.toFixed(1)}px round ${rectR.toFixed(1)}px)`;
      Object.assign(fallbackImg.current.style, { left: `${photoBox.x}px`, top: `${photoBox.y}px`, width: `${photoBox.w}px`, height: `${photoBox.h}px` });
    }
    if (cue.current) cue.current.style.opacity = (1 - span(u, [0.1, 0.4])).toFixed(3);

    // 2–4) الشريط: الصورة الأولى من ملء الشاشة إلى مكانها، والبقية من الرزمة إلى أماكنها، ثم الحركة الأفقية
    const ts = ease(span(u, T.shrink));
    const tu = ease(span(u, T.ui));
    // موضع مركز الشاشة على الشريط: يستقر عند مركز كل لقطة (نصف وقفة قبلها ونصف بعدها) وينتقل بينها بنعومة
    const { centers, segs } = L;
    const v = u - T.travel;
    let at = centers[0];
    let move = 0; // تقدّم الانتقال الجاري (0 = مستقرة في المُعايِن)
    if (v > 0) {
      const seg = segs.find((sg) => v < sg.start + sg.len);
      if (!seg) at = centers[centers.length - 1];
      else {
        move = clamp01((v - seg.start - STOP / 2) / MOVE);
        at = seg.from + seg.d * move * move * (3 - 2 * move);
      }
    }
    const tx = centers[0] - at;
    const phys = (x, w) => (isAr ? W - x - w : x);
    if (night.current) night.current.style.opacity = ts.toFixed(3);
    ui.current.forEach((el) => {
      if (!el) return;
      el.style.opacity = tu.toFixed(3);
      el.style.transform = `translateY(${((1 - tu) * 14).toFixed(1)}px)`;
      el.style.visibility = tu > 0 ? 'visible' : 'hidden';
    });

    const stagger = (T.deal[1] - T.deal[0] - T.dealEach) / Math.max(1, strip.length - 2);
    let nextCurrent = 0;
    frames.current.forEach((el, i) => {
      if (!el) return;
      const s = slots[i];
      if (i === 0) {
        const x = lerp(0, s.x, ts) + tx;
        const w = lerp(W, s.w, ts);
        const h = lerp(H, s.h, ts);
        const y = lerp(0, s.y, ts);
        el.style.visibility = apertureOn ? 'hidden' : 'visible';
        el.style.width = `${w.toFixed(1)}px`;
        el.style.height = `${h.toFixed(1)}px`;
        el.style.transform = `translate3d(${phys(x, w).toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.setProperty('--radius', `${lerp(0, 14, ts).toFixed(1)}px`);
        el.style.setProperty('--meta', ts.toFixed(3));
      } else {
        const td = ease((u - T.deal[0] - (i - 1) * stagger) / T.dealEach);
        const deck = { x: slots[0].x + slots[0].w * 0.7 + i * 16, y: s.y + i * 4 };
        const x = lerp(deck.x, s.x, td) + tx;
        const y = lerp(deck.y, s.y, td);
        const rot = lerp(DECK_TILT[i % DECK_TILT.length], 0, td) * (isAr ? -1 : 1);
        const sc = lerp(0.88, 1, td);
        el.style.width = `${s.w.toFixed(1)}px`;
        el.style.height = `${s.h.toFixed(1)}px`;
        el.style.opacity = tu.toFixed(3);
        el.style.visibility = tu > 0 ? 'visible' : 'hidden';
        el.style.transform = `translate3d(${phys(x, s.w).toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        el.style.setProperty('--meta', td.toFixed(3));
      }
    });
    // اللقطة الحالية: الأقرب مركزاً إلى وسط الشاشة (تتبدّل في منتصف الانتقال)
    let best = Infinity;
    centers.forEach((c, i) => {
      const d = Math.abs(c - at);
      if (d < best) { best = d; nextCurrent = i; }
    });
    // المُعايِن الثابت في الوسط: يظهر حين تستقر اللقطة الأولى مكانها، ويختفي أثناء الانتقال فلا يؤطّر فراغاً،
    // ثم يعود بعرض اللقطة التالية حين تستقر فيه (العرض يتبدّل في منتصف الانتقال وهو مخفي)
    if (finder.current) {
      const f = finder.current.style;
      f.opacity = (ts * (1 - clamp01(Math.min(move, 1 - move) * 4))).toFixed(3);
      f.visibility = ts > 0 ? 'visible' : 'hidden';
      f.left = `${(W / 2).toFixed(1)}px`; // نفس مرجع مواضع اللقطات (innerWidth)
      f.top = `${slots[0].y.toFixed(1)}px`;
      f.height = `${L.FH.toFixed(1)}px`;
      f.width = `${slots[nextCurrent].w.toFixed(1)}px`;
    }
    if (nextCurrent !== currentRef.current) { currentRef.current = nextCurrent; setCurrent(nextCurrent); }
  }, [isAr, scrollYProgress, trackH, strip]);

  useEffect(() => {
    render();
    return scrollYProgress.on('change', render);
  }, [render, scrollYProgress, size]);

  const { H } = size;
  const item = strip[current];
  const label = (i) => `${two(i + 1)} / ${two(strip.length)} · ${names[strip[i].activity][lang]}`;

  return (
    <div ref={track} className="reel-track" style={{ height: trackH ? `${trackH}px` : '500vh' }}>
      <div className="reel-stage" style={{ height: H ? `${H}px` : '100vh' }}>
        <div ref={night} className="reel-night" aria-hidden="true">
          {awake && <img key={item.src} className="reel-glow" src={posterOf(item)} alt="" decoding="async" />}
        </div>

        {/* 1) النافذة */}
        {glOk ? (
          <canvas ref={canvas} className="reel-aperture" aria-hidden="true" />
        ) : (
          <div ref={fallback} className="reel-aperture reel-aperture--fallback" aria-hidden="true">
            <img ref={fallbackImg} src={strip[0].src} alt="" />
          </div>
        )}
        <div ref={cue} className="reel-cue">
          <p className="reel-label">{isAr ? 'من أنشطتنا' : 'From our activities'}</p>
          <span>{isAr ? 'مرّر لتكتشفها' : 'Scroll to explore'} <FiArrowDown aria-hidden="true" /></span>
        </div>

        {/* 3–4) العنوان وشريط الأنشطة */}
        <header ref={(el) => { ui.current[0] = el; }} className="reel-head">
          <h2 id="moments-title" className="reel-title">{isAr ? 'لحظات حقيقية' : 'Real moments'}</h2>
          <Ribbon current={item.activity} lang={lang} ribbon={ribbon} names={names} />
        </header>

        <ul className="reel-frames">
          {strip.map((it, i) => (
            <li
              key={it.src}
              ref={(el) => { frames.current[i] = el; }}
              className={`reel-frame${i === 0 ? ' reel-frame--lead' : ''}${i === current ? ' is-current' : ''}`}
              style={{ zIndex: i === 0 ? strip.length + 1 : strip.length - i }}
            >
              <button type="button" className="reel-frame-media" onClick={(e) => onOpen('strip', i, e.currentTarget)} aria-label={`${it.alt[lang]} — ${names[it.activity][lang]}`}>
                <FrameMedia item={it} lang={lang} active={i === current} awake={awake} sizes={i === 0 ? '100vw' : '(min-width: 768px) 40vw, 80vw'} />
                {it.type === 'loop' && <span className="reel-play" aria-hidden="true"><FiPlay /></span>}
              </button>
              {/* زوايا ووسم اللقطة الأولى وهي تملأ الشاشة؛ في الشريط يتسلّمهما المُعايِن الثابت */}
              {i === 0 && <span className="reel-corners" aria-hidden="true"><i /><i /><i /><i /></span>}
              {i === 0 && <span className="reel-tag" aria-hidden="true">{label(i)}</span>}
              <span className="reel-caption" aria-hidden="true">{names[it.activity][lang]}</span>
            </li>
          ))}
        </ul>
        <div ref={finder} className="reel-finder" aria-hidden="true">
          <span className="reel-corners"><i /><i /><i /><i /></span>
          <span className="reel-tag">{label(current)}</span>
        </div>

        <footer ref={(el) => { ui.current[1] = el; }} className="reel-foot">
          <p className="reel-foot-name" aria-live="polite">{names[item.activity][lang]}</p>
          <a href="#moments-more" className="reel-foot-link">{isAr ? 'كل اللقطات والأفلام' : 'All moments & films'} <FiArrowDown aria-hidden="true" /></a>
        </footer>
      </div>
    </div>
  );
}

// نسخة ثابتة مع تقليل الحركة: لا تثبيت ولا تحريك، والشريط يُمرَّر أفقياً
function StaticReel({ lang, isAr, onOpen, strip, ribbon, names }) {
  return (
    <div className="reel-static">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="reel-label">{isAr ? 'من أنشطتنا' : 'From our activities'}</p>
        <h2 id="moments-title" className="reel-title mt-3">{isAr ? 'لحظات حقيقية' : 'Real moments'}</h2>
        <Ribbon current={null} lang={lang} ribbon={ribbon} names={names} />
      </div>
      <ul className="reel-static-strip">
        {strip.map((it, i) => (
          <li key={it.src} className="reel-frame is-static" style={{ '--ar': it.ar }}>
            <button type="button" className="reel-frame-media" onClick={(e) => onOpen('strip', i, e.currentTarget)} aria-label={`${it.alt[lang]} — ${names[it.activity][lang]}`}>
              {it.type === 'loop'
                ? <img src={mediaUrl(it.src, '/loop-poster.webp')} alt="" loading="lazy" />
                : <FrameMedia item={it} lang={lang} active={false} sizes="(min-width: 768px) 40vw, 80vw" />}
              {it.type === 'loop' && <span className="reel-play" aria-hidden="true"><FiPlay /></span>}
            </button>
            <span className="reel-caption">{names[it.activity][lang]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// قبل وصول الاختيار، أو إن لم توجد صور منشورة، أو تعذّر التحميل: العنوان مع رسالة قصيرة بدل الشريط
function MomentsStatus({ status, isAr, onRetry }) {
  const text = {
    loading: isAr ? 'جارٍ تحميل اللقطات…' : 'Loading moments…',
    empty: isAr ? 'لا توجد لقطات منشورة حالياً.' : 'No moments have been published yet.',
    error: isAr ? 'تعذّر تحميل اللقطات.' : 'The moments could not be loaded.',
  }[status];
  return (
    <div className="reel-static reel-status" aria-busy={status === 'loading'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="reel-label">{isAr ? 'من أنشطتنا' : 'From our activities'}</p>
        <h2 id="moments-title" className="reel-title mt-3">{isAr ? 'لحظات حقيقية' : 'Real moments'}</h2>
        <p className="reel-status-text" role={status === 'error' ? 'alert' : 'status'}>
          {status === 'loading' && <span className="reel-status-spinner" aria-hidden="true" />}
          {text}
          {status === 'error' && (
            <button type="button" className="reel-status-retry" onClick={onRetry}>{isAr ? 'إعادة المحاولة' : 'Try again'}</button>
          )}
        </p>
      </div>
    </div>
  );
}

// المرحلة الثانية: بقية اللقطات بتكوين تحريري غير متماثل (تحت كل صورة اسم ورشتها)، ثم الأفلام الكاملة.
// كل الصور الأخرى بترتيب عشوائي، تظهر على دفعات حتى لا تُحمَّل مكتبة كبيرة دفعة واحدة
const MORE_STEP = 12;

function MoreMoments({ lang, isAr, onOpen, more, films, names }) {
  const [shown, setShown] = useState(MORE_STEP);
  if (more.length === 0 && films.length === 0) return null;
  const left = more.length - shown;
  return (
    <div id="moments-more" className="reel-more">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {more.length > 0 && <ul className="reel-more-grid">
          {more.slice(0, shown).map((it, i) => (
            <li key={it.src} className={`reel-more-item reel-more-item--${i + 1}`} style={{ '--ar': it.ar }}>
              <button type="button" className="reel-frame-media" onClick={(e) => onOpen('more', i, e.currentTarget)} aria-label={`${it.alt[lang]} — ${names[it.activity][lang]}`}>
                <img src={it.srcSet ? it.thumb : it.src} srcSet={it.srcSet} sizes={it.srcSet ? '(min-width: 1024px) 45vw, 92vw' : undefined} alt={it.alt[lang]} loading="lazy" decoding="async" style={{ objectPosition: it.pos }} />
              </button>
              <span className="reel-caption">{names[it.activity][lang]}</span>
            </li>
          ))}
        </ul>}
        {left > 0 && (
          <div className="reel-more-actions">
            <button type="button" className="reel-more-button" onClick={() => setShown((n) => n + MORE_STEP)}>
              {isAr ? `عرض المزيد من الصور (${left})` : `Show more photos (${left})`}
              <FiArrowDown aria-hidden="true" />
            </button>
          </div>
        )}

        {films.length > 0 && <div className="reel-films">
          <p className="reel-films-label">{isAr ? 'أفلام قصيرة' : 'Short films'}</p>
          <ul>
            {films.map((f, i) => (
              <li key={f.src}>
                <button type="button" className="reel-film" onClick={(e) => onOpen('film', i, e.currentTarget)} aria-label={`${isAr ? 'شاهد' : 'Watch'}: ${f.alt[lang]}`}>
                  <img src={mediaUrl(f.src, '-poster.webp')} alt="" loading="lazy" decoding="async" />
                  <span className="reel-film-play" aria-hidden="true"><FiPlay /></span>
                  <span className="reel-film-meta"><strong>{names[f.activity][lang]}</strong><span>{f.duration}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </div>}
      </div>
    </div>
  );
}

export default function Activities() {
  const { lang } = useContext(LanguageContext);
  const isAr = lang === 'AR';
  const reduced = useReducedMotion();
  const { moments, status, retry } = useMoments();
  const [viewer, setViewer] = useState({ activity: null, index: null, autoPlay: false });
  const trigger = useRef(null);

  // الفيلم أو المقطع يُفتح وحده بالصوت؛ الصورة تُفتح بين كل صور الاختيار الحالي (الشريط ثم بقية اللقطات)
  const open = (group, index, from) => {
    const { strip, more, photos, films, names } = moments;
    trigger.current = from;
    const asVideo = (src, it) => ({ activity: { id: src, title: names[it.activity], media: [{ type: 'video', src, alt: it.alt }] }, index: 0, autoPlay: true });
    if (group === 'film') { setViewer(asVideo(films[index].src, films[index])); return; }
    if (group === 'strip' && strip[index].type === 'loop') { setViewer(asVideo(strip[index].reel, strip[index])); return; }
    const toImage = (it) => ({ type: 'image', src: it.src, srcSet: it.srcSet, thumb: it.thumb, w: 1600, h: Math.round(1600 / it.ar), alt: it.alt });
    const target = group === 'strip' ? strip[index] : more[index];
    setViewer({ activity: { id: 'moments', title: { AR: 'لحظات حقيقية', EN: 'Real moments' }, media: photos.map(toImage) }, index: photos.indexOf(target), autoPlay: false });
  };
  const close = () => {
    setViewer((v) => ({ ...v, index: null }));
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  };

  return (
    <section id="activities" className="reel-section" aria-labelledby="moments-title" dir={isAr ? 'rtl' : 'ltr'}>
      {status !== 'ready' ? (
        <MomentsStatus status={status} isAr={isAr} onRetry={retry} />
      ) : reduced ? (
        <StaticReel lang={lang} isAr={isAr} onOpen={open} strip={moments.strip} ribbon={moments.ribbon} names={moments.names} />
      ) : (
        // نافذة الافتتاح والقياسات تُبنى من الشريط، فاختيار جديد يعيد إنشاءها
        <PinnedReel key={moments.strip.map((it) => it.src).join('|')} lang={lang} isAr={isAr} onOpen={open} strip={moments.strip} ribbon={moments.ribbon} names={moments.names} />
      )}
      {moments && status !== 'loading' && (
        <MoreMoments lang={lang} isAr={isAr} onOpen={open} more={moments.more} films={moments.films} names={moments.names} />
      )}
      <MediaLightbox
        activity={viewer.activity}
        index={viewer.index}
        autoPlay={viewer.autoPlay}
        lang={lang}
        onIndex={(index) => setViewer((v) => ({ ...v, index, autoPlay: false }))}
        onClose={close}
      />
    </section>
  );
}
