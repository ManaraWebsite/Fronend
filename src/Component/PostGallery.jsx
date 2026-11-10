import React, { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { CoverImage } from './brand';

// معرض صور المقال بنسبة 4:5 كمنشور إنستغرام: شريط أفقي بالتمرير المغناطيسي (scroll-snap)
// يعمل بالسحب على الجوال، مع أسهم ونقاط وعدّاد. الشريحة الحالية تُرصد بـ IntersectionObserver
// فتبقى المؤشرات صحيحة سواء تنقّل الزائر بالسحب أو بالأزرار، وفي الاتجاهين RTL و LTR.
function PostGallery({ images, title, isAr }) {
  const track = useRef(null);
  const [active, setActive] = useState(0);
  const count = images.length;

  useEffect(() => {
    const el = track.current;
    if (!el || count < 2) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(Number(entry.target.dataset.index));
      }),
      { root: el, threshold: 0.6 },
    );
    Array.from(el.children).forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [count]);

  const goTo = (index) => {
    const el = track.current;
    const slide = el?.children[Math.max(0, Math.min(count - 1, index))];
    if (!slide) return;
    // إزاحة نسبية من موضع الشريحة على الشاشة: تعمل في RTL و LTR دون الاعتماد على
    // قيم scrollLeft/offsetLeft التي تختلف إشارتها بين المتصفحات في الاتجاه RTL
    const left = slide.getBoundingClientRect().left - el.getBoundingClientRect().left;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left, behavior: smooth ? 'smooth' : 'auto' });
  };

  // «التالي» بصرياً: لليسار في العربية ولليمين في الإنجليزية
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const forward = (e.key === 'ArrowRight') !== isAr;
    goTo(active + (forward ? 1 : -1));
  };

  const PrevIcon = isAr ? FiChevronRight : FiChevronLeft;
  const NextIcon = isAr ? FiChevronLeft : FiChevronRight;
  const slideLabel = (i) => (isAr ? `الصورة ${i + 1} من ${count}` : `Image ${i + 1} of ${count}`);

  if (count === 0) return null;

  return (
    <figure
      className="post-gallery"
      role={count > 1 ? 'region' : undefined}
      aria-roledescription={count > 1 ? (isAr ? 'معرض صور' : 'carousel') : undefined}
      aria-label={count > 1 ? (isAr ? `صور المقال: ${title}` : `Post images: ${title}`) : undefined}
    >
      <div
        ref={track}
        className="post-gallery-track"
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={count > 1 ? onKeyDown : undefined}
      >
        {images.map((src, i) => (
          <div key={`${src}-${i}`} data-index={i} className="post-gallery-slide" aria-roledescription={count > 1 ? (isAr ? 'شريحة' : 'slide') : undefined} aria-label={count > 1 ? slideLabel(i) : undefined}>
            <CoverImage src={src} tone="light" eager={i === 0} alt={count > 1 ? slideLabel(i) : title} className="h-full w-full" />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <span className="post-gallery-count" aria-live="polite">{active + 1} / {count}</span>
          <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} className="post-gallery-nav post-gallery-nav--prev" aria-label={isAr ? 'الصورة السابقة' : 'Previous image'}>
            <PrevIcon aria-hidden="true" />
          </button>
          <button type="button" onClick={() => goTo(active + 1)} disabled={active === count - 1} className="post-gallery-nav post-gallery-nav--next" aria-label={isAr ? 'الصورة التالية' : 'Next image'}>
            <NextIcon aria-hidden="true" />
          </button>
          <div className="post-gallery-dots">
            {images.map((_, i) => (
              <button key={i} type="button" onClick={() => goTo(i)} aria-label={slideLabel(i)} aria-current={i === active ? 'true' : undefined} className={i === active ? 'is-active' : ''} />
            ))}
          </div>
        </>
      )}
    </figure>
  );
}

export default PostGallery;
