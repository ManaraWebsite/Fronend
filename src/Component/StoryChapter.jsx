import React, { useLayoutEffect, useRef } from 'react';
import { useReducedMotion, useScroll } from 'framer-motion';
import { countWords, parseEmphasis, splitWords, wordScatter } from '../lib/clarity';
import { pageTop, watchPageLayout } from '../lib/pageGeometry';

// الكلمة هي أصغر وحدة تشتيت: تقسيم الحروف يقطع اتصال الحروف العربية.
// العبارات المُبرَزة تُلفّ بـ <mark>، ويُرسم تحتها خط يمتد بعد أن تتضح كلماتها (--t لأول كلمة فيها).
function Words({ text, start, total }) {
  const at = (index) => (total > 1 ? index / (total - 1) : 0);
  let k = 0;
  const word = (part, i) => {
    const index = start + k;
    k += 1;
    const s = wordScatter(index);
    return <span key={i} className="clarity-word" style={{
      '--t': at(index), '--dx': s.dx, '--dy': s.dy, '--r': s.r, '--b': s.blur, '--s': s.s,
    }}>{part}</span>;
  };
  const words = (chunk) => splitWords(chunk).map(({ part, isWord }, i) => (isWord ? word(part, i) : part));
  return parseEmphasis(text).map((seg, i) => {
    if (!seg.em) return <React.Fragment key={i}>{words(seg.text)}</React.Fragment>;
    const first = start + k;
    return <mark key={i} className="manara-em" style={{ '--t': at(first) }}>{words(seg.text)}</mark>;
  });
}

// مجموعة نص تتضح كوحدة واحدة (العنوان، أو مشهد). strings بترتيب ظهورها، و w(text) يلفّ كل نص بكلمات متحرّكة.
// النص حقيقي ومقروء دائماً: الحركة تُضاف فقط حين يضع StoryChapter الصنف is-live.
export function ClarityGroup({ as: Tag = 'div', strings, beat, className = '', children }) {
  const total = strings.reduce((n, s) => n + countWords(s), 0);
  let at = 0;
  const w = (text) => {
    const start = at;
    at += countWords(text);
    return <Words text={text} start={start} total={total} />;
  };
  return <Tag data-clarity="" data-beat={beat} className={`clarity ${className}`}>{children(w)}</Tag>;
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));

// الخط الزمني للفصل بوحدات «ارتفاع شاشة» من لحظة تثبيت البطاقة (s = 0).
const BEAT = 0.8; // مسافة التمرير لكل مشهد
const beatStart = (i) => 0.1 + i * BEAT;
const HOLD = 0.55; // بقاء المشهد الأخير مقروءاً قبل تحرّر البطاقة
const dwellFor = (beats) => beatStart(beats - 1) + 0.3 + HOLD;

// الفصل الأول «يولد» من الواجهة: يبدأ مساره متداخلاً معها (CSS: .manara-chapter--entry) فتثبت بطاقته في موضع
// القراءة قبل أن تظهر، ثم تظهر في مكانها بينما تذوب نصوص الواجهة وتتقدّم الكاميرا — بدل أن تنزلق من أسفل الشاشة.
// ENTRY_SHIFT يؤخّر خط الفصل الزمني بالمقدار نفسه، وENTRY_STOP يحدد متى يبلغ خط القصة المشترك (الكاميرا والضوء)
// حالة هذا الفصل (يُقرأ في HeroSection). كلها بوحدات ارتفاع الشاشة من بداية مسار الفصل.
const ENTRY_SHIFT = 0.3;
const ENTRY_STOP = 0.6;

// فصل مثبّت: المسار (section) أطول من الشاشة، والبطاقة داخله sticky فتبقى ثابتة في مكان القراءة.
// staged: العنوان ثابت، والمشاهد تتبدّل داخل البطاقة بالتمرير (تتراكب في خلية واحدة بارتفاع أطولها فلا يتغير حجم البطاقة).
// flow: حين لا تتسع البطاقة للشاشة (هواتف صغيرة) أو مع تقليل الحركة، تُعرض المشاهد متتالية بشكل عادي.
// كل الحالات مشتقة من موضع التمرير، فالرجوع للأعلى يعكسها تماماً.
export default function StoryChapter({ id, tone, beats, layoutKey, entry = false, children }) {
  const track = useRef(null);
  const pin = useRef(null);
  const copy = useRef(null);
  const dwell = useRef(null);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  useLayoutEffect(() => {
    const section = track.current;
    const card = copy.current;
    const groups = [...card.querySelectorAll('[data-clarity]')].map(el => ({
      el, beat: el.dataset.beat === undefined ? -1 : Number(el.dataset.beat),
      // الحالة تُقرأ من DOM (قد تبقى من تشغيل سابق للتأثير) حتى لا تُتجاهل كتابة لازمة
      shown: el.style.getPropertyValue('--p') || '0.0000', clear: el.classList.contains('is-clear'),
      live: el.classList.contains('is-live'), opacity: el.style.opacity, active: el.classList.contains('is-active'),
    }));
    const steps = [...card.querySelectorAll('[data-step]')];
    let staged = false;
    let current = -1;

    // لا نكتب إلا عند تغيّر القيمة: كل كتابة تعيد حساب أنماط عشرات الكلمات.
    const setGroup = (g, p, near, opacity) => {
      const value = p.toFixed(4);
      if (value !== g.shown) { g.shown = value; g.el.style.setProperty('--p', value); }
      const done = p >= 0.999;
      if (done !== g.clear) { g.clear = done; g.el.classList.toggle('is-clear', done); }
      const live = near && !done;
      if (live !== g.live) { g.live = live; g.el.classList.toggle('is-live', live); }
      if (opacity !== g.opacity) { g.opacity = opacity; g.el.style.opacity = opacity; }
      const active = opacity === '' || Number(opacity) > 0.5;
      if (active !== g.active) { g.active = active; g.el.classList.toggle('is-active', active); }
    };

    // هل تتسع البطاقة بمشاهدها المتراكبة للشاشة؟ تُقاس عند التحميل وتغيّر الحجم واللغة فقط.
    const measure = () => {
      if (reduced) staged = false;
      else {
        const fits = () => pin.current.offsetHeight <= window.innerHeight + 1;
        card.classList.add('is-staged');
        pin.current.classList.remove('is-tight');
        staged = fits();
        // الأجهزة اللوحية: إن لم تتسع البطاقة تحت المنارة، تُرفع إلى ما تحت شريط التنقل مباشرة
        if (!staged && window.innerWidth >= 600) {
          pin.current.classList.add('is-tight');
          staged = fits();
          if (!staged) pin.current.classList.remove('is-tight');
        }
        if (!staged) card.classList.remove('is-staged');
      }
      const vh = window.innerHeight;
      const extra = entry ? ENTRY_SHIFT : 0;
      dwell.current.style.height = `${Math.round(((staged ? dwellFor(beats) : reduced ? 0.3 : 0.35) + extra) * vh)}px`;
      if (!staged) groups.forEach(g => { if (g.opacity !== '') { g.opacity = ''; g.el.style.opacity = ''; } });
    };
    // بطاقة أطول من الشاشة (وضع flow): يتحرّك المثبّت للأعلى بمقدار الزيادة فتُقرأ كاملة دون تمرير داخلي.
    let pinTop = pin.current.style.top;
    const fit = () => {
      const next = `${Math.min(0, window.innerHeight - pin.current.offsetHeight)}px`;
      if (next !== pinTop) { pinTop = next; pin.current.style.top = next; }
    };

    // الهندسة تُقاس عند تغيّر الأحجام فقط، والتمرير يحسب منها المواضع دون قراءة التخطيط (انظر lib/pageGeometry):
    // أعلى الفصل بإحداثيات الصفحة وارتفاعه، ارتفاع البطاقة المثبّتة، وبُعد كل مجموعة عن أعلى البطاقة.
    // البطاقة sticky: موضعها على الشاشة = موضعها الطبيعي (أعلى الفصل) حتى تبلغ قيمة top فتثبت، ولا تتجاوز نهاية الفصل.
    const geo = { top: 0, height: 0, pinHeight: 0, offsets: new Map() };
    let lastSide = null; // آخر جهة كان فيها الفصل بعيداً عن الشاشة (لا حاجة لإعادة الرسم ما دام بعيداً فيها)
    const measureGeometry = () => {
      geo.top = pageTop(section);
      geo.height = section.offsetHeight;
      geo.pinHeight = pin.current.offsetHeight;
      const pinBox = pin.current.getBoundingClientRect().top;
      groups.forEach(g => geo.offsets.set(g, g.el.getBoundingClientRect().top - pinBox));
      lastSide = null;
    };
    const viewport = () => {
      const top = geo.top - window.scrollY;
      const pinned = Math.min(Math.max(top, parseFloat(pinTop) || 0), top + geo.height - geo.pinHeight);
      return { top, bottom: top + geo.height, pinned };
    };

    // البطاقة الأولى مخفية فوق الواجهة، وتظهر تدريجياً (مع تقليل الحركة أيضاً: تلاشٍ فقط)
    let shown = '';
    const fadeIn = (s) => {
      if (!entry) return;
      const value = clamp01((s + 0.05) / 0.2).toFixed(3);
      if (value !== shown) { shown = value; card.style.opacity = value; }
    };

    const paint = () => {
      const vh = window.innerHeight;
      const rect = viewport();
      const near = rect.top < vh * 1.6 && rect.bottom > -vh * 0.2;
      // بعيد عن الشاشة: كل القيم ثابتة عند طرفيها (0 أو 1) ما دام في الجهة نفسها، فلا داعي لإعادة حسابها
      if (!near) {
        const side = rect.top > 0 ? 'below' : 'above';
        if (side === lastSide) return;
        lastSide = side;
      } else lastSide = null;
      fadeIn(-rect.top / vh);
      if (reduced) return;
      const s = -rect.top / vh - (entry ? ENTRY_SHIFT : 0);
      const last = beats - 1;
      let best = 0;
      let bestOpacity = -1;
      groups.forEach(g => {
        if (g.beat < 0) { setGroup(g, clamp01((s + 0.35) / 0.5), near, ''); return; }
        const i = g.beat;
        if (!staged) {
          const top = rect.pinned + (geo.offsets.get(g) ?? 0);
          setGroup(g, clamp01((vh * 0.92 - top) / (vh * 0.45)), near, '');
          return;
        }
        const a = beatStart(i);
        const enter = i === 0 ? 1 : clamp01((s - (a - 0.15)) / 0.15);
        const leave = i === last ? 0 : clamp01((s - (beatStart(i + 1) - 0.3)) / 0.15);
        const o = enter * (1 - leave);
        const p = i === 0 ? clamp01((s + 0.1) / 0.5) : clamp01((s - (a - 0.15)) / 0.45);
        // المشاهد الخفية لا تحتاج حسابات الحركة الثقيلة
        setGroup(g, p, near && o > 0, o.toFixed(3));
        if (o > bestOpacity) { bestOpacity = o; best = i; }
      });
      const step = staged ? best : -1;
      if (step !== current) {
        current = step;
        steps.forEach((el, i) => el.classList.toggle('is-current', i === step));
      }
    };

    // لوحة المفاتيح: التركيز على رابط داخل مشهد خفي يمرّر الصفحة إليه فيصبح ظاهراً
    const onFocus = (event) => {
      if (!staged) return;
      const beat = event.target.closest('[data-beat]');
      if (!beat) return;
      const s = -section.getBoundingClientRect().top / window.innerHeight - (entry ? ENTRY_SHIFT : 0);
      const target = beatStart(Number(beat.dataset.beat)) + 0.2;
      if (Math.abs(s - target) > BEAT / 2) {
        // instant: التمرير الناعم العام في الصفحة كان يترك المشهدين متراكبين أثناء الانتقال
        window.scrollTo({ top: window.scrollY + (target - s) * window.innerHeight, behavior: 'instant' });
      }
    };

    if (reduced) groups.forEach(g => { g.clear = true; g.el.classList.add('is-clear'); });
    const layout = () => { measure(); fit(); measureGeometry(); paint(); };
    const observer = new ResizeObserver(() => { fit(); measureGeometry(); paint(); });
    observer.observe(pin.current);
    card.addEventListener('focusin', onFocus);
    // تغيّر حجم النافذة يعيد القياس كاملاً؛ تغيّر ارتفاع الصفحة (فصل سابق، محتوى من الـ API) يغيّر موضع الفصل فقط
    let first = true;
    window.addEventListener('resize', layout);
    const unwatch = watchPageLayout(() => {
      if (first) { first = false; layout(); return; }
      measureGeometry(); paint();
    });
    // الخط النهائي يغيّر ارتفاع النص؛ نعيد القياس بعد تحميله
    document.fonts?.ready.then(() => { if (copy.current) layout(); });
    const unsubscribe = scrollY.on('change', paint);
    return () => {
      unsubscribe(); observer.disconnect(); unwatch();
      window.removeEventListener('resize', layout); card.removeEventListener('focusin', onFocus);
      groups.forEach(g => { g.el.classList.add('is-clear'); g.el.style.opacity = ''; });
      card.style.opacity = '';
      card.classList.remove('is-staged');
    };
  }, [reduced, scrollY, beats, layoutKey, entry]);

  return <section ref={track} id={id} data-story-chapter data-story-stop={entry ? ENTRY_STOP : undefined}
    className={`manara-chapter manara-chapter--${tone}${entry ? ' manara-chapter--entry' : ''}`} aria-labelledby={`${id}-title`}>
    <div ref={pin} className="manara-chapter-pin">
      <div ref={copy} className="manara-chapter-copy">{children}</div>
    </div>
    <div ref={dwell} className="manara-chapter-dwell" aria-hidden="true" />
  </section>;
}
