import { resolveMediaUrl } from './media';

// قيود صور المنشورات والورش، مطابقة لقواعد الـ backend (ValidatesImageUploads)
export const MAX_IMAGE_BYTES = 2048 * 1024; // max:2048 KB
export const MAX_POST_IMAGES = 10;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',');

// نسبتا العرض: 4:5 صورة منشور إنستغرام (المنشورات وبطاقات الورش)، و16:9 بانر نموذج التسجيل
export const IMAGE_RATIOS = {
  portrait: { label: '4:5 portrait', size: '1080 × 1350 px', className: 'aspect-[4/5]' },
  banner: { label: '16:9 landscape', size: '1600 × 900 px', className: 'aspect-video' },
};

// رسالة خطأ للملف أو null إن كان صالحاً — نتحقق قبل الرفع حتى لا يضيع وقت المستخدم
export const imageFileError = (file) => {
  if (!IMAGE_TYPES.includes(file.type)) return `"${file.name}" is not a JPG, PNG, WebP or GIF image.`;
  if (file.size > MAX_IMAGE_BYTES) return `"${file.name}" is larger than 2 MB.`;
  return null;
};

// نسبة التقدّم من حدث onUploadProgress في axios
export const uploadPercent = (event) => (event.total ? Math.round((event.loaded / event.total) * 100) : null);

// صور المنشور من الـ API: images[] (الأحدث)، مع الرجوع إلى cover_image للاستجابات القديمة
export const postImageUrls = (post) => {
  const urls = Array.isArray(post?.images) ? post.images.map((image) => resolveMediaUrl(image?.url)).filter(Boolean) : [];
  if (urls.length === 0 && post?.cover_image) urls.push(resolveMediaUrl(post.cover_image));
  return urls.filter(Boolean);
};

// عناصر معرض المنشور في لوحة التحكم: صورة محفوظة { key, id, url } أو ملف جديد { key, id: null, file }
export const imagesFromApi = (apiImages = []) =>
  apiImages.filter((image) => image?.url).map((image) => ({ key: `image-${image.id}`, id: image.id, url: image.url }));

// يضيف حقول المعرض إلى FormData بالمفاتيح التي يتحقق منها الـ backend:
// images[] للملفات الجديدة، image_order[] للترتيب النهائي (رقم الصورة المحفوظة أو new:{index})،
// و remove_images[] للصور المحفوظة التي حُذفت
export const appendPostImages = (formData, images, originalImages = []) => {
  let newIndex = 0;
  images.forEach((image) => {
    if (image.id) {
      formData.append('image_order[]', String(image.id));
    } else {
      formData.append('images[]', image.file);
      formData.append('image_order[]', `new:${newIndex++}`);
    }
  });

  const keptIds = new Set(images.filter((image) => image.id).map((image) => image.id));
  originalImages
    .filter((image) => !keptIds.has(image.id))
    .forEach((image) => formData.append('remove_images[]', String(image.id)));
};

// صور «لحظات حقيقية»: JPG/PNG/WebP فقط، بنفس حد الحجم (photoRules في الـ backend)
export const MOMENT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MOMENT_IMAGE_ACCEPT = MOMENT_IMAGE_TYPES.join(',');

export const momentFileError = (file) => {
  if (!MOMENT_IMAGE_TYPES.includes(file.type)) return `"${file.name}" is not a JPG, PNG or WebP image.`;
  if (file.size > MAX_IMAGE_BYTES) return `"${file.name}" is larger than 2 MB.`;
  return null;
};

// أصغر نسخة من صورة «لحظات حقيقية» للمصغّرات: الصور الأصلية لها srcset بعرضين، والمرفوعة نسخة واحدة
export const momentThumbUrl = (image) => resolveMediaUrl(image?.srcset ? image.srcset.split(' ')[0] : image?.url);
