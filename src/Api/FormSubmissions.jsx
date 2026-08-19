import React, { useEffect, useState } from 'react';
import axiosClient from './axiosClient';
import { FiDownload, FiArrowLeft } from 'react-icons/fi';

const FormSubmissions = ({ formSlug, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axiosClient.get(`/admin/forms/${formSlug}/submissions`);
        setSubmissions(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };
    if (formSlug) {
      fetchSubmissions();
    }
  }, [formSlug]);

  // تصدير الردود إلى ملف CSV
  const handleExportCSV = () => {
    window.open(`http://43.156.53.131/api/admin/forms/${formSlug}/submissions/export`, '_blank');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      
      {/* رأس الصفحة وأزرار التحكم */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span>Forms</span>
            <span>/</span>
            <span className="text-[#ff7a00] font-semibold">{formSlug}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Form Submissions</h1>
          <p className="text-sm text-gray-400 mt-1">Review all submissions received for this form.</p>
        </div>

        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:text-white transition flex items-center space-x-2 shadow-xs"
            >
              <FiArrowLeft size={16} />
              <span>Back to Forms</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition flex items-center space-x-2 shadow-sm"
          >
            <FiDownload size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="bg-[#161b22] rounded-2xl p-12 text-center border border-gray-800 shadow-xs">
          <p className="text-gray-400 text-sm">No submissions found for this form yet.</p>
        </div>
      ) : (
        <div className="bg-[#161b22] rounded-2xl shadow-xs border border-gray-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0d1117]/70 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold"># ID</th>
                <th className="p-4 font-semibold">Submitted Data</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
              {submissions.map((sub, idx) => (
                <tr key={idx} className="hover:bg-gray-800/30 transition">
                  <td className="p-4 font-medium text-white">{sub.id || idx + 1}</td>
                  <td className="p-4">
                    <pre className="text-xs bg-[#0d1117] border border-gray-800 p-3 rounded-xl text-gray-300 overflow-x-auto font-mono">
                      {JSON.stringify(sub.data || sub, null, 2)}
                    </pre>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{sub.created_at || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default FormSubmissions;