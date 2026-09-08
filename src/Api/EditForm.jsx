import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';
import { 
  FiType, FiFileText, FiMail, FiHash, FiPhone, 
  FiCalendar, FiChevronDown, FiCheckSquare, FiRadio, FiUpload, 
  FiTrash2, FiArrowUp, FiArrowDown, FiCheck 
} from 'react-icons/fi';

const EditForm = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [status, setStatus] = useState('Draft');
  const [fields, setFields] = useState([]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fieldTypes = [
    { type: 'text', label: 'Text', icon: FiType },
    { type: 'textarea', label: 'Textarea', icon: FiFileText },
    { type: 'email', label: 'Email', icon: FiMail },
    { type: 'number', label: 'Number', icon: FiHash },
    { type: 'phone', label: 'Phone', icon: FiPhone },
    { type: 'date', label: 'Date', icon: FiCalendar },
    { type: 'dropdown', label: 'Dropdown', icon: FiChevronDown },
    { type: 'checkbox', label: 'Checkbox', icon: FiCheckSquare },
    { type: 'radio', label: 'Radio', icon: FiRadio },
    { type: 'file', label: 'File Upload', icon: FiUpload },
  ];

  // جلب بيانات النموذج القديمة عند فتح الصفحة
  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        const response = await axiosClient.get(`/admin/forms/${slug}`);
        const formData = response.data.data || response.data;
        setTitle(formData.title || '');
        setFormSlug(formData.slug || '');
        setStatus(formData.status || 'Draft');
        setFields(formData.fields || []);
      } catch (error) {
        console.error('Error fetching form details:', error);
        setMessage('فشل في جلب بيانات النموذج.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormDetails();
  }, [slug]);

  const addField = (typeObj) => {
    const newField = {
      id: Date.now(),
      type: typeObj.type,
      label: typeObj.label,
      placeholder: '',
      helpText: '',
      required: false,
    };
    setFields([...fields, newField]);
    setSelectedFieldIndex(fields.length);
  };

  const removeField = (index, e) => {
    e.stopPropagation();
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    if (selectedFieldIndex >= updated.length) {
      setSelectedFieldIndex(Math.max(0, updated.length - 1));
    }
  };

  const moveUp = (index, e) => {
    e.stopPropagation();
    if (index === 0) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setFields(updated);
    setSelectedFieldIndex(index - 1);
  };

  const moveDown = (index, e) => {
    e.stopPropagation();
    if (index === fields.length - 1) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setFields(updated);
    setSelectedFieldIndex(index + 1);
  };

  const updateSelectedField = (key, value) => {
    if (fields.length === 0) return;
    const updated = [...fields];
    updated[selectedFieldIndex][key] = value;
    setFields(updated);
  };

  // حفظ التعديلات وإرسالها للسيرفر
  const handleUpdate = async (formStatus) => {
    setSubmitting(true);
    setMessage('');
    try {
      const payload = {
        title: title || 'Untitled Form',
        slug: formSlug,
        status: formStatus,
        fields: fields
      };
      await axiosClient.put(`/admin/forms/${slug}`, payload);
      setMessage('تم تحديث النموذج بنجاح!');
      setTimeout(() => navigate('/admin/forms'), 1500); // العودة للقائمة بعد النجاح
    } catch (error) {
      console.error(error);
      setMessage('حدث خطأ أثناء تحديث النموذج.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 bg-[#0d1117] min-h-screen">Loading form details...</div>;
  }

  const selectedField = fields[selectedFieldIndex] || {};

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <span className="text-xs text-gray-400">Admin / Forms / Edit /</span>
          <h1 className="text-xl font-bold text-white">Edit Form</h1>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded-xl text-sm border ${message.includes('نجاح') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161b22] p-4 rounded-2xl shadow-xs border border-gray-800 grid grid-cols-3 gap-4">
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
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Slug</label>
              <input 
                type="text" 
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          <div className="bg-[#161b22] p-6 rounded-2xl shadow-xs border border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-4">Add a Field</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {fieldTypes.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button key={idx} type="button" onClick={() => addField(item)} className="flex flex-col items-center justify-center p-3 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-[#ff7a00] hover:bg-[#ff7a00]/10 transition group">
                    <IconComponent className="text-gray-400 group-hover:text-[#ff7a00] mb-2 text-lg" />
                    <span className="text-xs font-medium text-gray-300">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#161b22] p-6 rounded-2xl shadow-xs border border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-4">Fields ({fields.length})</h2>
            {fields.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No fields added yet.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((f, index) => (
                  <div key={f.id || index} onClick={() => setSelectedFieldIndex(index)} className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${selectedFieldIndex === index ? 'border-[#ff7a00] bg-[#ff7a00]/10 ring-1 ring-[#ff7a00]' : 'border-gray-800 bg-[#0d1117] hover:bg-gray-800/50'}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-600 cursor-grab">⋮⋮</span>
                      <span className="text-xs font-semibold px-2 py-1 bg-[#ff7a00]/20 text-[#ff7a00] rounded uppercase">{f.type}</span>
                      <span className="text-sm font-medium text-gray-200">{f.label || 'Untitled Field'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button type="button" onClick={(e) => moveUp(index, e)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded"><FiArrowUp size={14} /></button>
                      <button type="button" onClick={(e) => moveDown(index, e)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded"><FiArrowDown size={14} /></button>
                      <button type="button" onClick={(e) => removeField(index, e)} className="p-1.5 text-red-400 hover:text-red-300 rounded"><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#161b22] p-6 rounded-2xl shadow-xs border border-gray-800 h-fit space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Field Settings</h2>
          {fields.length > 0 && selectedField && (
            <>
              <div>
                <span className="inline-block px-2 py-1 bg-[#ff7a00]/20 text-[#ff7a00] rounded text-xs font-medium mb-3">{selectedField.type}</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Label</label>
                <input type="text" value={selectedField.label || ''} onChange={(e) => updateSelectedField('label', e.target.value)} className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Placeholder</label>
                <input type="text" value={selectedField.placeholder || ''} onChange={(e) => updateSelectedField('placeholder', e.target.value)} className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Help text <span className="text-gray-600 font-normal">optional</span></label>
                <input type="text" value={selectedField.helpText || ''} onChange={(e) => updateSelectedField('helpText', e.target.value)} className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className="text-xs font-semibold text-gray-400">Required field</span>
                <input type="checkbox" checked={selectedField.required || false} onChange={(e) => updateSelectedField('required', e.target.checked)} className="cursor-pointer" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center space-x-3 mt-8 pt-4 border-t border-gray-800">
        <button onClick={() => handleUpdate('Draft')} disabled={submitting} className="px-5 py-2.5 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">Save Changes (Draft)</button>
        <button onClick={() => handleUpdate('Published')} disabled={submitting} className="px-5 py-2.5 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition flex items-center space-x-2"><FiCheck /> <span>Update & Publish</span></button>
      </div>
    </div>
  );
};

export default EditForm;