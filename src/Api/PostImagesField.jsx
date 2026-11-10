import React, { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiPlus, FiX } from 'react-icons/fi';
import useObjectUrl from '../hooks/useObjectUrl';
import { IMAGE_ACCEPT, IMAGE_RATIOS, MAX_POST_IMAGES, imageFileError } from '../lib/images';

let localKeyCounter = 0;
const newImage = (file) => ({ key: `new-${Date.now()}-${++localKeyCounter}`, id: null, file });

function Tile({ image, index, count, onMove, onRemove }) {
  const previewUrl = useObjectUrl(image.file) || image.url;
  const position = `Image ${index + 1} of ${count}`;
  const control = 'grid place-items-center w-7 h-7 rounded-full bg-black/65 text-white hover:bg-[#ff7a00] disabled:opacity-30 disabled:hover:bg-black/65 transition cursor-pointer disabled:cursor-default';

  return (
    <li className={`relative ${IMAGE_RATIOS.portrait.className} rounded-xl overflow-hidden border ${index === 0 ? 'border-[#ff7a00]' : 'border-gray-800'} bg-[#0d1117]`}>
      {previewUrl && <img src={previewUrl} alt={position} className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
        {index === 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff7a00] text-white">Cover</span>}
        {!image.id && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white">New</span>}
      </div>
      <button type="button" onClick={onRemove} aria-label={`Remove ${position.toLowerCase()}`} className={`${control} absolute top-2 right-2 hover:!bg-red-600`}>
        <FiX size={14} />
      </button>
      <div className="absolute bottom-2 inset-x-2 flex justify-between">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${position.toLowerCase()} earlier`} className={control}>
          <FiArrowLeft size={14} />
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move ${position.toLowerCase()} later`} className={control}>
          <FiArrowRight size={14} />
        </button>
      </div>
    </li>
  );
}

// معرض صور المنشور بنسبة 4:5 (منشور إنستغرام): إضافة عدة صور، حذف، وترتيب — الأولى هي الغلاف
const PostImagesField = ({ images, onChange }) => {
  const [errors, setErrors] = useState([]);
  const remaining = MAX_POST_IMAGES - images.length;

  const handleAdd = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const problems = [];
    const accepted = [];

    files.forEach((file) => {
      const fileError = imageFileError(file);
      if (fileError) problems.push(fileError);
      else if (accepted.length >= remaining) problems.push(`"${file.name}" was skipped: a post can have at most ${MAX_POST_IMAGES} images.`);
      else accepted.push(newImage(file));
    });

    setErrors(problems);
    if (accepted.length) onChange([...images, ...accepted]);
  };

  const move = (index, step) => {
    const target = index + step;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index) => {
    setErrors([]);
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <fieldset className="space-y-3">
      <legend className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-300">
        Post images
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-[#ff7a00]/10 text-[#ff7a00] border-[#ff7a00]/30">{IMAGE_RATIOS.portrait.label}</span>
        <span className="text-gray-500 font-normal">{images.length}/{MAX_POST_IMAGES}</span>
      </legend>
      <p id="post-images-hint" className="text-xs text-gray-500 leading-5">
        Instagram-style post images, shown on the homepage post cards and the post page (cropped to 4:5).
        Recommended {IMAGE_RATIOS.portrait.size}, JPG/PNG/WebP, max 2 MB each. The first image is the cover — use the arrows to reorder.
      </p>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <Tile key={image.key} image={image} index={index} count={images.length} onMove={(step) => move(index, step)} onRemove={() => remove(index)} />
        ))}
        {remaining > 0 && (
          <li className={IMAGE_RATIOS.portrait.className}>
            <label className="h-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 bg-[#0d1117] text-gray-400 text-xs text-center p-3 cursor-pointer hover:border-[#ff7a00] hover:text-[#ff7a00] focus-within:border-[#ff7a00] transition">
              <FiPlus size={22} aria-hidden="true" />
              <span>{images.length ? 'Add more images' : 'Add images'}</span>
              <input type="file" accept={IMAGE_ACCEPT} multiple onChange={handleAdd} aria-describedby="post-images-hint" className="sr-only" />
            </label>
          </li>
        )}
      </ul>

      {errors.length > 0 && (
        <ul role="alert" className="text-xs text-red-400 space-y-1">
          {errors.map((message, i) => <li key={i}>{message}</li>)}
        </ul>
      )}
    </fieldset>
  );
};

export default PostImagesField;
