import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from './axiosClient';
import { FiArrowLeft } from 'react-icons/fi';

const FieldVoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    quote: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);

  // جلب البيانات في حال كنا في وضع التعديل (Edit)
  useEffect(() => {
    if (isEditing) {
      const fetchVoiceDetails = async () => {
        try {
          // جلب البيانات من الـ API (تأكدي من مسار الـ endpoint الخاص بجلب العنصر منفرداً أو من القائمة)
          const response = await axiosClient.get(`/admin/field-voices`);
          const voices = response.data.data || response.data;
          const currentVoice = voices.find((v) => v.id.toString() === id);

          if (currentVoice) {
            // التعامل مع الـ role والـ quote سواء كانت كائن (Object) أو نص عادي (String)
            const roleValue = typeof currentVoice.role === 'object' 
              ? currentVoice.role?.ar || currentVoice.role?.en || '' 
              : currentVoice.role || '';

            const quoteValue = typeof currentVoice.quote === 'object' 
              ? currentVoice.quote?.ar || currentVoice.quote?.en || '' 
              : currentVoice.quote || '';

            setFormData({
              name: currentVoice.name || '',
              role: roleValue,
              quote: quoteValue,
              image: null, // الصورة القديمة لا يتم وضعها في الـ input file لأسباب أمنية في المتصفح
            });
          }
        } catch (error) {
          console.error('Error fetching voice details:', error);
          alert('Failed to load voice details for editing.');
        }
      };
      fetchVoiceDetails();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('role', formData.role);
    data.append('quote', formData.quote);
    data.append('is_published', '1');
    
    // إرسال الصورة فقط إذا قام المستخدم بتحديد صورة جديدة
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (isEditing) {
        // في حال التعديل (نستخدم POST مع ?_method=PUT كما ظهر في Postman لتعامل أفضل مع الملفات في لارافيل)
        await axiosClient.post(`/admin/field-voices/${id}?_method=PUT`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // في حال الإضافة الجديدة
        await axiosClient.post('/admin/field-voices', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/admin/field-voices');
    } catch (error) {
      console.error('Error saving field voice:', error.response?.data || error);
      alert(error.response?.data?.message || 'Failed to save data. Please check image size (< 255KB).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Field Voice' : 'Add New Field Voice'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isEditing ? 'Update the details below.' : 'Fill out the details below.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/field-voices')}
          className="px-4 py-2.5 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:text-white transition flex items-center space-x-2"
        >
          <FiArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xs">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-white focus:border-[#ff7a00] focus:outline-none text-sm"
            placeholder="Enter name..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-white focus:border-[#ff7a00] focus:outline-0 text-sm"
            placeholder="Enter role..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Quote / Story</label>
          <textarea
            name="quote"
            value={formData.quote}
            onChange={handleChange}
            required
            rows="4"
            className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-white focus:border-[#ff7a00] focus:outline-none text-sm"
            placeholder="Enter quote..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image {isEditing ? '(Leave empty to keep current image)' : ''} - Max size: 255KB
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#ff7a00] file:text-white hover:file:bg-[#e06c00] cursor-pointer"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => navigate('/admin/field-voices')}
            className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition shadow-sm"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Voice' : 'Save Voice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FieldVoiceForm;