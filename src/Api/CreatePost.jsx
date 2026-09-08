import React, { useState } from 'react';
import axiosClient from '../Api/axiosClient';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [status, setStatus] = useState('published');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // دالة لاختيار الصورة ومعاينتها
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('status', status);
    
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    try {
      const response = await axiosClient.post('/admin/posts', formData);

      setMessage('تم إنشاء البوست مع الصورة بنجاح!');
      console.log('Response:', response.data);
      
      // تفريغ الحقول بعد النجاح
      setTitle('');
      setContent('');
      setCoverImage(null);
      setImagePreview(null);
      setStatus('published');
    } catch (error) {
      console.error('Error creating post:', error);
      const errorData = error.response?.data;
      let errorMsg = errorData?.message || 'حدث خطأ أثناء إنشاء البوست.';
      
      if (errorData?.errors) {
        const firstKey = Object.keys(errorData.errors)[0];
        if (firstKey) {
          errorMsg = errorData.errors[firstKey][0];
        }
      }
      
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-[#23233c] text-white rounded-2xl shadow-xl border border-orange-500/10">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">إنشاء بوست جديد</h2>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm font-medium ${message.includes('نجاح') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* حقل العنوان */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">العنوان (title)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#1a1a2e] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-base placeholder-gray-500 shadow-inner"
            placeholder="أدخل عنوان البوست..."
          />
        </div>

        {/* حقل المحتوى */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">المحتوى (content)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="5"
            className="w-full px-4 py-3 bg-[#1a1a2e] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-base placeholder-gray-500 shadow-inner resize-y"
            placeholder="أدخل محتوى البوست..."
          ></textarea>
        </div>

        {/* حقل صورة الغلاف مع معاينة */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">صورة الغلاف (cover_image)</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30 cursor-pointer"
          />
          
          {imagePreview && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">معاينة الصورة:</p>
              <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover rounded-lg border border-gray-700" />
            </div>
          )}
        </div>

        {/* حقل الحالة */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">الحالة (status)</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a1a2e] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-base shadow-inner"
          >
            <option value="published" className="bg-[#1a1a2e] text-white">Published (منشور)</option>
            <option value="draft" className="bg-[#1a1a2e] text-white">Draft (مسودة)</option>
          </select>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition duration-200 disabled:bg-orange-400/50 shadow-lg cursor-pointer"
        >
          {loading ? 'جاري الإرسال...' : 'إنشاء البوست'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;