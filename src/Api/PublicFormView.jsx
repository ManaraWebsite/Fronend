import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

const PublicFormView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPublicForm = async () => {
      try {
        const response = await axiosClient.get(`/forms/${slug}`);
        const data = response.data.data || response.data;
        setForm(data);
      } catch (error) {
        console.error('Error fetching form:', error);
        setErrorMessage('عذراً، هذا النموذج غير موجود أو تم إيقافه.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicForm();
  }, [slug]);

  const handleChange = (fieldId, value) => {
    setFormData({
      ...formData,
      [fieldId]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await axiosClient.post(`/forms/${slug}/submit`, { responses: formData });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('حدث خطأ أثناء إرسال الرد، يرجى المحاولة لاحقاً.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0d1117] text-gray-400">
        جاري تحميل النموذج...
      </div>
    );
  }

  if (errorMessage && !form) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d1117] text-gray-400 space-y-4">
        <p className="text-red-400">{errorMessage}</p>
        <button 
          onClick={() => navigate('/admin/forms')}
          className="px-4 py-2 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm hover:bg-gray-800 transition flex items-center space-x-2 cursor-pointer"
        >
          <FiArrowLeft /> <span>Back to Forms</span>
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] text-gray-100 p-4">
        <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 text-center max-w-md w-full shadow-lg space-y-4">
          <FiCheckCircle className="text-green-400 text-5xl mx-auto" />
          <h2 className="text-xl font-bold mb-2">تم إرسال ردك بنجاح!</h2>
          <p className="text-sm text-gray-400">شكراً لك على تعبئة النموذج.</p>
          <button 
            onClick={() => navigate('/admin/forms')}
            className="w-full py-2.5 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <FiArrowLeft /> <span>Back to Forms</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 py-12 px-4 sm:px-6 lg:px-8" dir="ltr">
      <div className="max-w-2xl mx-auto mb-4">
        <button 
          onClick={() => navigate('/admin/forms')}
          className="px-4 py-2 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm hover:bg-gray-800 transition flex items-center space-x-2 cursor-pointer"
        >
          <FiArrowLeft /> <span>Back to Forms</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-[#161b22] border border-gray-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2">{form?.title}</h1>
        <p className="text-xs text-gray-400 mb-6 pb-4 border-b border-gray-800">يرجى تعبئة الحقول أدناه بدقة.</p>

        {errorMessage && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {form?.fields?.map((field, index) => {
            const fieldKey = field.id || index;
            return (
              <div key={fieldKey} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={formData[fieldKey] || ''}
                    onChange={(e) => handleChange(fieldKey, e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    rows="4"
                    value={formData[fieldKey] || ''}
                    onChange={(e) => handleChange(fieldKey, e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                  />
                )}

                {field.type === 'email' && (
                  <input
                    type="email"
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={formData[fieldKey] || ''}
                    onChange={(e) => handleChange(fieldKey, e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={formData[fieldKey] || ''}
                    onChange={(e) => handleChange(fieldKey, e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                  />
                )}

                {field.type === 'phone' && (
                  <input
                    type="tel"
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={formData[fieldKey] || ''}
                    onChange={(e) => handleChange(fieldKey, e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                  />
                )}

                {field.type === 'date' && (
                  <input
                    type="date"
                    required={field.required}
                    value={formData[fieldKey] || ''}
                    onChange={(e) => handleChange(fieldKey, e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                  />
                )}

                {field.helpText && (
                  <p className="text-xs text-gray-500">{field.helpText}</p>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#ff7a00] text-white font-semibold rounded-xl hover:bg-[#e06c00] transition cursor-pointer"
          >
            {submitting ? 'جاري الإرسال...' : 'إرسال النموذج'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicFormView;