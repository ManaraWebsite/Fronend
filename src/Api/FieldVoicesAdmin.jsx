// FieldVoicesAdmin.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const FieldVoicesAdmin = () => {
  const navigate = useNavigate();
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة مساعدة لاستخراج النص حسب اللغة المتاحة من الكائن
  const getLocalizedText = (field) => {
    if (!field) return '';
    if (typeof field === 'object') {
      return field.ar || field.en || '';
    }
    return field;
  };

  const fetchVoices = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/admin/field-voices');
      setVoices(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching field voices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  // دالة الحذف
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this voice?')) return;
    try {
      await axiosClient.delete(`/admin/field-voices/${id}`);
      setVoices(voices.filter((voice) => voice.id !== id));
    } catch (error) {
      console.error('Error deleting voice:', error);
      alert('Failed to delete.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      
      {/* رأس الصفحة وأزرار التحكم */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#ff7a00] font-semibold">Field Voices</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Voices from the Field</h1>
          <p className="text-sm text-gray-400 mt-1">Manage success stories and field voices displayed on the website.</p>
        </div>

        <div>
          <button
            onClick={() => navigate('/admin/field-voices/create')}
            className="px-4 py-2.5 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition flex items-center space-x-2 shadow-sm cursor-pointer"
          >
            <FiPlus size={16} />
            <span>Add New Voice</span>
          </button>
        </div>
      </div>

      {/* عرض الجدول أو حالة التحميل */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading voices...</div>
      ) : voices.length === 0 ? (
        <div className="bg-[#161b22] rounded-2xl p-12 text-center border border-gray-800 shadow-xs">
          <p className="text-gray-400 text-sm">No field voices found yet.</p>
        </div>
      ) : (
        <div className="bg-[#161b22] rounded-2xl shadow-xs border border-gray-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0d1117]/70 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold"># ID</th>
                <th className="p-4 font-semibold">Name & Role</th>
                <th className="p-4 font-semibold">Quote / Story</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
              {voices.map((voice, idx) => {
                const nameText = getLocalizedText(voice.name);
                const roleText = getLocalizedText(voice.role);
                const quoteText = getLocalizedText(voice.quote);

                return (
                  <tr key={voice.id || idx} className="hover:bg-gray-800/30 transition">
                    <td className="p-4 font-medium text-white">{voice.id || idx + 1}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{nameText}</div>
                      <div className="text-xs text-[#ff7a00]">{roleText}</div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="text-xs text-gray-300 line-clamp-2">"{quoteText}"</p>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/field-voices/edit/${voice.id}`)}
                          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(voice.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};


export default FieldVoicesAdmin;