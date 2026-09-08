import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient'; // أو حسب مسار ملف الـ axiosClient عندك
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // جلب كافة المنشورات عند تحميل الصفحة
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/admin/posts');
      setPosts(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMessage('فشل في جلب المنشورات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // حذف منشور
  const handleDelete = async (slug) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    try {
      await axiosClient.delete(`/admin/posts/${slug}`);
      setPosts(posts.filter((post) => post.slug !== slug));
      setMessage('تم حذف المنشور بنجاح.');
    } catch (error) {
      console.error('Error deleting post:', error);
      setMessage('حدث خطأ أثناء محاولة الحذف.');
    }
  };

  // نشر المنشور (Publish)
  const handlePublish = async (slug) => {
    try {
      await axiosClient.post(`/admin/posts/${slug}/publish`);
      fetchPosts(); // إعادة جلب القائمة لتحديث الحالة
      setMessage('تم نشر المنشور بنجاح.');
    } catch (error) {
      console.error('Error publishing post:', error);
      setMessage('فشل نشر المنشور.');
    }
  };

  // إلغاء نشر المنشور (Unpublish)
  const handleUnpublish = async (slug) => {
    try {
      await axiosClient.post(`/admin/posts/${slug}/unpublish`);
      fetchPosts();
      setMessage('تم إلغاء نشر المنشور.');
    } catch (error) {
      console.error('Error unpublishing post:', error);
      setMessage('فشل إلغاء نشر المنشور.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      
      {/* رأس الصفحة وزر الإضافة */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <span className="text-xs text-gray-400">Admin /</span>
          <h1 className="text-xl font-bold text-white">Posts Management</h1>
        </div>
        <button
          onClick={() => navigate('/admin/posts/create')}
          className="px-4 py-2 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition flex items-center space-x-2 shadow-md shadow-orange-500/10"
        >
          <FiPlus size={18} />
          <span>Create Post</span>
        </button>
      </div>

      {message && (
        <div className="p-4 mb-4 rounded-xl text-sm bg-[#161b22] border border-gray-800 text-gray-300">
          {message}
        </div>
      )}

      {/* جدول المنشورات */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <p className="text-center py-8 text-gray-500 text-sm">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center py-8 text-gray-500 text-sm">No posts found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase bg-[#0d1117]/50">
                <th className="p-4">Title / Slug</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {posts.map((post) => {
                // معالجة العنوان لتجنب خطأ عرض الكائنات (Objects) في React
                const titleText = typeof post.title === 'object' 
                  ? post.title?.ar || post.title?.en || 'Untitled' 
                  : post.title || 'Untitled';

                return (
                  <tr key={post.id || post.slug} className="hover:bg-gray-800/30 transition">
                    <td className="p-4">
                      <div className="font-semibold text-gray-200">{titleText}</div>
                      <div className="text-xs text-gray-500">{post.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-px px-2.5 py-1 rounded-full text-xs font-medium ${post.status === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                        {post.status || 'draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {/* زر النشر أو إلغاء النشر */}
                      {post.status === 'published' ? (
                        <button 
                          onClick={() => handleUnpublish(post.slug)}
                          title="Unpublish"
                          className="p-2 bg-gray-800 text-yellow-400 hover:bg-gray-700 rounded-lg transition"
                        >
                          <FiXCircle size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePublish(post.slug)}
                          title="Publish"
                          className="p-2 bg-gray-800 text-green-400 hover:bg-gray-700 rounded-lg transition"
                        >
                          <FiCheckCircle size={16} />
                        </button>
                      )}

                      {/* زر التعديل */}
                      <button 
                        onClick={() => navigate(`/admin/posts/edit/${post.slug}`)}
                        title="Edit"
                        className="p-2 bg-gray-800 text-blue-400 hover:bg-gray-700 rounded-lg transition"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      {/* زر الحذف */}
                      <button 
                        onClick={() => handleDelete(post.slug)}
                        title="Delete"
                        className="p-2 bg-gray-800 text-red-400 hover:bg-gray-700 rounded-lg transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default PostsList;