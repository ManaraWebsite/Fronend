import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';
import { FiPlus, FiEdit3, FiEye, FiTrash2, FiCopy, FiList } from 'react-icons/fi';

const FormsList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // دالة مساعدة لطباعة القيم الآمنة (النصوص أو الكائنات التي تحوي ar/en)
  const renderSafeValue = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') {
      return val.ar || val.en || JSON.stringify(val);
    }
    return String(val);
  };

  const fetchForms = async () => {
    try {
      const response = await axiosClient.get('/admin/forms');
      setForms(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      await axiosClient.delete(`/admin/forms/${slug}`);
      setForms(forms.filter(f => f.slug !== slug));
      setMessage('Form deleted successfully');
    } catch (error) {
      console.error('Error deleting form:', error);
      setMessage('Failed to delete form');
    }
  };

  const handleDuplicate = async (slug) => {
    try {
      await axiosClient.post(`/admin/forms/${slug}/duplicate`);
      fetchForms();
      setMessage('Form duplicated successfully');
    } catch (error) {
      console.error('Error duplicating form:', error);
      setMessage('Failed to duplicate form');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Forms Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your dynamic forms and check submissions.</p>
        </div>
        <button
          onClick={() => navigate('/admin/forms/create')}
          className="bg-[#ff7a00] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition shadow-md shadow-orange-500/10 flex items-center gap-2 cursor-pointer"
        >
          <FiPlus size={18} />
          <span>Create Form</span>
        </button>
      </div>

      {message && (
        <div className="p-4 mb-6 bg-[#161b22] text-[#ff7a00] rounded-xl text-sm font-medium border border-gray-800">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading forms...</div>
      ) : forms.length === 0 ? (
        <div className="bg-[#161b22] rounded-2xl p-12 text-center border border-gray-800 shadow-xs">
          <p className="text-gray-400 text-sm mb-4">No forms found yet.</p>
          <button
            onClick={() => navigate('/admin/forms/create')}
            className="text-[#ff7a00] font-semibold text-sm hover:underline cursor-pointer"
          >
            Create your first form &rarr;
          </button>
        </div>
      ) : (
        <div className="bg-[#161b22] rounded-2xl shadow-xs border border-gray-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0d1117]/70 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Slug</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
              {forms.map((form, idx) => (
                <tr key={idx} className="hover:bg-gray-800/30 transition">
                  <td className="p-4 font-medium text-white">
                    {renderSafeValue(form.title, 'Untitled Form')}
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-xs">{form.slug}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${form.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {form.is_active ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/forms/${form.slug}/submissions`)}
                        title="View Submissions"
                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition inline-flex items-center cursor-pointer"
                      >
                        <FiList size={16} />
                      </button>
                      <button 
                        title="Preview Form"
                        onClick={() => window.open(`/forms/${form.slug}`, '_blank')}
                        className="p-2 bg-gray-800 text-gray-300 hover:text-white rounded-lg transition inline-flex items-center cursor-pointer"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/forms/edit/${form.slug}`)}
                        title="Edit Form"
                        className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition inline-flex items-center cursor-pointer"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(form.slug)}
                        title="Duplicate Form"
                        className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition inline-flex items-center cursor-pointer"
                      >
                        <FiCopy size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(form.slug)}
                        title="Delete Form"
                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition inline-flex items-center cursor-pointer"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FormsList;