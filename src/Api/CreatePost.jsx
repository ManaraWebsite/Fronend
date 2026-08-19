import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [status, setStatus] = useState('published'); // القيمة الافتراضية
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }
    formData.append('status', status);

    try {
      const response = await axios.post(
        'http://43.156.53.131/api/admin/posts',
        formData,
        {
          headers: {
            'Authorization': 'Bearer 1|kM6kQ7aRYOrowRLTrCpy3oLpeAXdRUFvvPbVaB1N044f379c',
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage('تم إنشاء البوست بنجاح!');
      console.log('Response:', response.data);
      
      // تفريغ الحقول بعد النجاح
      setTitle('');
      setContent('');
      setCoverImage(null);
      setStatus('published');
    } catch (error) {
      console.error('Error creating post:', error);
      setMessage(error.response?.data?.message || 'حدث خطأ أثناء إنشاء البوست.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">إنشاء بوست جديد</h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('نجاح') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* حقل العنوان (title) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">العنوان (title)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="أدخل عنوان البوست..."
          />
        </div>

        {/* حقل المحتوى (content) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى (content)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="أدخل محتوى البوست..."
          ></textarea>
        </div>

        {/* حقل الصورة (cover_image) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">صورة الغلاف (cover_image)</label>
          <input
            type="file"
            onChange={(e) => setCoverImage(e.target.files[0])}
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* حقل الحالة (status) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الحالة (status)</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="published">Published (منشور)</option>
            <option value="draft">Draft (مسودة)</option>
          </select>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
        >
          {loading ? 'جاري الإرسال...' : 'إنشاء البوست'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;