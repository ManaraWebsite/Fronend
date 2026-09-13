import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';

export function EditForm() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isActive, setIsActive] = useState(0);
  const [fields, setFields] = useState([]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // دالة مساعدة لضمان تحويل أي قيمة لـ String تفادياً لمشكلة الـ Objects
  const getSafeString = (val) => {
    if (!val) return '';
    if (typeof val === 'object') {
      return val.ar || val.en || Object.values(val)[0] || '';
    }
    return String(val);
  };

  // جلب بيانات النموذج عند فتح الصفحة
  useEffect(() => {
    axiosClient.get(`/admin/forms/${slug}`)
      .then(response => {
        const formData = response.data.data || response.data;
        setTitle(getSafeString(formData.title));
        setFormSlug(formData.slug || '');
        setIsActive(formData.is_active ?? formData.status ?? 0);
        
        // معالجة الحقول والـ options للتأكد من أنها نصوص صالحة
        const processedFields = (formData.fields || []).map(f => ({
          ...f,
          label: getSafeString(f.label),
          placeholder: getSafeString(f.placeholder),
          help_text: getSafeString(f.help_text),
          options: Array.isArray(f.options) 
            ? f.options.map(opt => getSafeString(opt)) 
            : []
        }));

        setFields(processedFields);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching form:", error);
        setLoading(false);
      });
  }, [slug]);

  // إضافة حقل جديد
  const handleAddField = (type) => {
    const newField = {
      type: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      placeholder: '',
      help_text: '',
      required: false,
      options: type === 'dropdown' || type === 'radio' ? ['Option 1'] : []
    };
    setFields([...fields, newField]);
    setSelectedFieldIndex(fields.length);
  };

  // تحديث حقل محدد
  const handleFieldChange = (key, value) => {
    if (selectedFieldIndex === null) return;
    const updatedFields = [...fields];
    updatedFields[selectedFieldIndex][key] = value;
    setFields(updatedFields);
  };

  // حذف حقل
  const handleRemoveField = (index, e) => {
    e.stopPropagation();
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    if (selectedFieldIndex === index) {
      setSelectedFieldIndex(null);
    } else if (selectedFieldIndex > index) {
      setSelectedFieldIndex(selectedFieldIndex - 1);
    }
  };

  // تحديث النموذج وحفظه
  const handleUpdate = (statusOverride) => {
    setSubmitting(true);
    
    // تنظيف البيانات نهائياً قبل إرسالها لضمان أن كل الـ options عبارة عن Strings
    const cleanedFields = fields.map(f => ({
      ...f,
      options: Array.isArray(f.options) ? f.options.map(opt => getSafeString(opt)) : []
    }));

    const payload = {
      title,
      slug: formSlug,
      is_active: statusOverride !== undefined ? statusOverride : isActive,
      fields: cleanedFields
    };

    axiosClient.put(`/admin/forms/${slug}`, payload)
      .then(() => {
        setSubmitting(false);
        navigate('/admin/forms');
      })
      .catch(error => {
        setSubmitting(false);
        console.error("Full Error Response:", error.response?.data);
        const errorMsg = error.response?.data?.message || JSON.stringify(error.response?.data) || 'حدث خطأ أثناء التحديث.';
        alert('خطأ من السيرفر: ' + errorMsg);
      });
  };

  if (loading) {
    return <div className="p-6 text-gray-400">جاري تحميل البيانات...</div>;
  }

  const selectedField = selectedFieldIndex !== null ? fields[selectedFieldIndex] : null;

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-200">
      <div className="mb-6">
        <span className="text-xs text-gray-400">Admin / Forms / Edit /</span>
        <h1 className="text-2xl font-bold text-white mt-1">Edit Form</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الأعمدة الرئيسية (العنوان والحقول) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* معلومات النموذج الأساسية */}
          <div className="bg-[#161b22] p-4 rounded-2xl shadow-xs border border-gray-800 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Status</label>
              <select 
                value={isActive}
                onChange={(e) => setIsActive(Number(e.target.value))}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
              >
                <option value={0}>Draft (0)</option>
                <option value={1}>Published (1)</option>
              </select>
            </div>
            <input type="hidden" value={formSlug} />
          </div>

          {/* صورة الغلاف */}
          <div className="bg-[#161b22] p-4 rounded-2xl shadow-xs border border-gray-800">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Form Cover Image</label>
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-6 text-center hover:border-gray-700 cursor-pointer">
              <span className="text-sm text-gray-400">Choose new cover image</span>
              <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF up to 2MB</p>
            </div>
          </div>

          {/* إضافة حقل جديد */}
          <div className="bg-[#161b22] p-4 rounded-2xl shadow-xs border border-gray-800">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-3">Add a Field</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['text', 'textarea', 'email', 'number', 'phone', 'date', 'dropdown', 'checkbox', 'radio', 'file'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAddField(type)}
                  className="bg-[#0d1117] border border-gray-800 hover:border-[#ff7a00] p-3 rounded-xl text-xs font-medium text-gray-300 capitalize flex flex-col items-center gap-1 transition"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* قائمة الحقول المضافة */}
          <div className="bg-[#161b22] p-4 rounded-2xl shadow-xs border border-gray-800">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-3">Fields ({fields.length})</label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedFieldIndex(index)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    selectedFieldIndex === index ? 'border-[#ff7a00] bg-[#0d1117]' : 'border-gray-800 bg-[#0d1117]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded font-mono uppercase">{field.type}</span>
                    <span className="text-sm text-gray-200">{getSafeString(field.label) || 'Untitled Field'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={(e) => handleRemoveField(index, e)} className="text-gray-500 hover:text-red-400 p-1">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className="flex gap-3">
            <button 
              onClick={() => handleUpdate(0)} 
              disabled={submitting} 
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition"
            >
              Save as Draft
            </button>
            <button 
              onClick={() => handleUpdate(1)} 
              disabled={submitting} 
              className="px-5 py-2.5 bg-[#ff7a00] hover:bg-[#e06d00] text-white rounded-xl text-sm font-medium transition"
            >
              Publish Updates
            </button>
          </div>

        </div>

        {/* إعدادات الحقل الجانبية */}
        <div className="bg-[#161b22] p-4 rounded-2xl shadow-xs border border-gray-800 h-fit">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-4">Field Settings</h3>
          {selectedField ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs bg-[#ff7a00]/20 text-[#ff7a00] px-2 py-0.5 rounded font-mono uppercase">{selectedField.type}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Label</label>
                <input
                  type="text"
                  value={getSafeString(selectedField.label)}
                  onChange={(e) => handleFieldChange('label', e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Placeholder</label>
                <input
                  type="text"
                  value={getSafeString(selectedField.placeholder)}
                  onChange={(e) => handleFieldChange('placeholder', e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Help text <span className="text-gray-600">optional</span></label>
                <input
                  type="text"
                  value={getSafeString(selectedField.help_text)}
                  onChange={(e) => handleFieldChange('help_text', e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="requiredField"
                  checked={selectedField.required || false}
                  onChange={(e) => handleFieldChange('required', e.target.checked)}
                  className="rounded bg-[#0d1117] border-gray-800 text-[#ff7a00] focus:ring-0"
                />
                <label htmlFor="requiredField" className="text-xs text-gray-300">Required field</label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-6">Select a field from the list to edit its settings.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default EditForm;