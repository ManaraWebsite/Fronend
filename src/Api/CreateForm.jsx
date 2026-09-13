import React, { useState } from 'react';
import axiosClient from './axiosClient';
import { 
  FiType, FiFileText, FiMail, FiHash, FiPhone, 
  FiCalendar, FiChevronDown, FiCheckSquare, FiRadio, FiUpload, 
  FiTrash2, FiArrowUp, FiArrowDown, FiCheck, FiImage 
} from 'react-icons/fi';

const CreateForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Draft');
  const [image, setImage] = useState(null);
  
  const [fields, setFields] = useState([
    { id: 1, type: 'text', label: 'Full name', placeholder: '', helpText: '', required: true, options: null },
    { id: 2, type: 'email', label: 'Email', placeholder: '', helpText: '', required: true, options: null },
    { 
      id: 3, 
      type: 'select', 
      label: 'University', 
      placeholder: '', 
      helpText: '', 
      required: true, 
      options: ['UCAS', 'Islamic University of Gaza', 'Palestine University', 'Other'] 
    }
  ]);
  
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fieldTypes = [
    { type: 'text', label: 'Text', icon: FiType },
    { type: 'textarea', label: 'Textarea', icon: FiFileText },
    { type: 'email', label: 'Email', icon: FiMail },
    { type: 'number', label: 'Number', icon: FiHash },
    { type: 'tel', label: 'Phone', icon: FiPhone },
    { type: 'date', label: 'Date', icon: FiCalendar },
    { type: 'select', label: 'Dropdown', icon: FiChevronDown },
    { type: 'checkbox', label: 'Checkbox', icon: FiCheckSquare },
    { type: 'radio', label: 'Radio', icon: FiRadio },
    { type: 'file', label: 'File Upload', icon: FiUpload },
  ];

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled-form-' + Date.now();
  };

  const addField = (typeObj) => {
    const needsOptions = ['select', 'radio', 'checkbox'].includes(typeObj.type);
    const newField = {
      id: Date.now(),
      type: typeObj.type,
      label: typeObj.label,
      placeholder: '',
      helpText: '',
      required: false,
      options: needsOptions ? [''] : null,
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

  const handleSubmit = async (formStatus) => {
    setLoading(true);
    setMessage('');
    try {
      const generatedSlug = generateSlug(title);
      
      const formData = new FormData();
      formData.append('title', title || 'Untitled Form');
      formData.append('description', description || '');
      formData.append('slug', generatedSlug);
      formData.append('is_active', formStatus === 'Published' ? 1 : 0);
      
      fields.forEach((field, index) => {
        const cleanType = typeof field.type === 'string' ? field.type : 'text';
        
        formData.append(`fields[${index}][type]`, cleanType);
        formData.append(`fields[${index}][label]`, field.label || '');
        formData.append(`fields[${index}][is_required]`, field.required ? 1 : 0);
        formData.append(`fields[${index}][order]`, index + 1);

        // إرسال الخيارات بشكل صحيح بدون [ar]
        if (field.options && Array.isArray(field.options)) {
          field.options.forEach((opt, optIndex) => {
            if (opt && opt.trim() !== '') {
              formData.append(`fields[${index}][options][${optIndex}]`, opt);
            }
          });
        }
      });
      
      if (image) {
        formData.append('image', image);
      }

      const response = await axiosClient.post('/admin/forms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('تم إنشاء النموذج بنجاح!');
      console.log('Success:', response.data);
    } catch (error) {
      console.error('API Error Response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء حفظ النموذج، تأكد من البيانات.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const selectedField = fields[selectedFieldIndex] || {};

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <span className="text-xs text-gray-400">Admin / Forms /</span>
          <h1 className="text-xl font-bold text-white">Create Form</h1>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded-xl text-sm border ${message.includes('نجاح') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161b22] p-4 rounded-2xl shadow-xs border border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Form title..."
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

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Form description..."
                rows="2"
                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Form Image</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-[#0d1117] border border-gray-800 rounded-xl text-sm text-gray-400 hover:border-[#ff7a00] hover:text-gray-200 transition cursor-pointer">
                  <FiImage className="text-[#ff7a00]" />
                  <span>{image ? image.name : 'Choose form image...'}</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {image && (
                  <button 
                    type="button" 
                    onClick={() => setImage(null)}
                    className="px-3 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs hover:bg-red-500/20 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] p-6 rounded-2xl shadow-xs border border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-4">Add a Field</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {fieldTypes.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addField(item)}
                    className="flex flex-col items-center justify-center p-3 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-[#ff7a00] hover:bg-[#ff7a00]/10 transition group"
                  >
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
              <p className="text-sm text-gray-500 text-center py-6">No fields added yet. Click an option above to add one.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((f, index) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFieldIndex(index)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${selectedFieldIndex === index ? 'border-[#ff7a00] bg-[#ff7a00]/10 ring-1 ring-[#ff7a00]' : 'border-gray-800 bg-[#0d1117] hover:bg-gray-800/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 cursor-grab">⋮⋮</span>
                      <span className="text-xs font-semibold px-2 py-1 bg-[#ff7a00]/20 text-[#ff7a00] rounded uppercase">{f.type}</span>
                      <span className="text-sm font-medium text-gray-200">{f.label || 'Untitled Field'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => moveUp(index, e)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded">
                        <FiArrowUp size={14} />
                      </button>
                      <button type="button" onClick={(e) => moveDown(index, e)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded">
                        <FiArrowDown size={14} />
                      </button>
                      <button type="button" onClick={(e) => removeField(index, e)} className="p-1.5 text-red-400 hover:text-red-300 rounded">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#161b22] p-6 rounded-2xl shadow-xs border border-gray-800 h-fit space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Field Settings</h2>
          
          {fields.length === 0 ? (
            <p className="text-xs text-gray-500">Select a field to edit its settings.</p>
          ) : (
            <>
              <div>
                <span className="inline-block px-2 py-1 bg-[#ff7a00]/20 text-[#ff7a00] rounded text-xs font-medium mb-3">
                  {selectedField.type}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Label</label>
                <input 
                  type="text" 
                  value={selectedField.label || ''}
                  onChange={(e) => updateSelectedField('label', e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Placeholder</label>
                <input 
                  type="text" 
                  value={selectedField.placeholder || ''}
                  onChange={(e) => updateSelectedField('placeholder', e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Help text <span className="text-gray-600 font-normal">optional</span></label>
                <input 
                  type="text" 
                  value={selectedField.helpText || ''}
                  onChange={(e) => updateSelectedField('helpText', e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                <div className="space-y-2 pt-3 border-t border-gray-800">
                  <label className="block text-xs font-semibold text-gray-400 uppercase">Options</label>
                  {selectedField.options?.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={opt}
                        placeholder={`Option ${optIndex + 1}`}
                        onChange={(e) => {
                          const updatedFields = [...fields];
                          updatedFields[selectedFieldIndex].options[optIndex] = e.target.value;
                          setFields(updatedFields);
                        }}
                        className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const updatedFields = [...fields];
                          updatedFields[selectedFieldIndex].options = updatedFields[selectedFieldIndex].options.filter((_, i) => i !== optIndex);
                          setFields(updatedFields);
                        }}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => {
                      const updatedFields = [...fields];
                      if (!updatedFields[selectedFieldIndex].options) updatedFields[selectedFieldIndex].options = [];
                      updatedFields[selectedFieldIndex].options.push('');
                      setFields(updatedFields);
                    }}
                    className="text-xs text-[#ff7a00] hover:underline mt-1 block font-medium"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className="text-xs font-semibold text-gray-400">Required field</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedField.required || false}
                    onChange={(e) => updateSelectedField('required', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff7a00]"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 mt-8 pt-4 border-t border-gray-800">
        <button 
          type="button" 
          onClick={() => handleSubmit('Draft')}
          disabled={loading}
          className="px-5 py-2.5 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 transition shadow-xs cursor-pointer"
        >
          Save as Draft
        </button>
        <button 
          type="button" 
          onClick={() => handleSubmit('Published')}
          disabled={loading}
          className="px-5 py-2.5 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <FiCheck />
          <span>Publish</span>
        </button>
      </div>
    </div>
  );
};

export default CreateForm;