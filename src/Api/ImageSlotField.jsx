import React, { useState } from 'react';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';
import { IMAGE_ACCEPT, IMAGE_RATIOS, imageFileError } from '../lib/images';

// حقل صورة واحدة بمعاينة على نفس نسبة العرض الفعلية (4:5 أو 16:9)،
// حتى يرى الأدمن القصّ الذي سيظهر للزوار قبل الحفظ
const ImageSlotField = ({ id, label, ratio, description, previewUrl, fileName, isNew, onSelect, onRemove }) => {
  const [error, setError] = useState('');
  const spec = IMAGE_RATIOS[ratio];
  const frameWidth = ratio === 'portrait' ? 'w-32 sm:w-36' : 'w-full max-w-xs';

  const handleChange = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const fileError = imageFileError(file);
    setError(fileError || '');
    if (!fileError) onSelect(file);
  };

  return (
    <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span id={`${id}-label`} className="text-sm font-semibold text-white">{label}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ratio === 'portrait' ? 'bg-[#ff7a00]/10 text-[#ff7a00] border-[#ff7a00]/30' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'}`}>
          {spec.label}
        </span>
      </div>
      <p id={`${id}-hint`} className="text-xs text-gray-400 leading-5">
        {description} Recommended {spec.size}, JPG/PNG/WebP, max 2 MB.
      </p>

      <div className={`${frameWidth} ${spec.className} relative rounded-xl overflow-hidden border border-dashed border-gray-700 bg-[#161b22]`}>
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={`${label} preview`} className="absolute inset-0 w-full h-full object-cover" />
            {isNew && <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white">Not saved yet</span>}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-500 text-xs">
            <FiImage size={20} aria-hidden="true" />
            <span>No image</span>
            <span className="text-gray-600">{ratio === 'portrait' ? '4:5' : '16:9'}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#161b22] border border-gray-800 rounded-xl cursor-pointer hover:border-[#ff7a00] focus-within:border-[#ff7a00] transition text-xs font-semibold text-gray-300">
          <FiUpload size={14} aria-hidden="true" />
          <span>{previewUrl ? 'Replace' : 'Upload'}</span>
          <input
            id={id}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleChange}
            aria-labelledby={`${id}-label`}
            aria-describedby={`${id}-hint`}
            className="sr-only"
          />
        </label>
        {previewUrl && (
          <button type="button" onClick={() => { setError(''); onRemove(); }} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold hover:bg-red-500/20 transition cursor-pointer">
            <FiX size={14} aria-hidden="true" />
            Remove
          </button>
        )}
        {fileName && <span className="text-xs text-gray-500 truncate max-w-48" title={fileName}>{fileName}</span>}
      </div>

      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default ImageSlotField;
