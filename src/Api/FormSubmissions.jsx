import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';
import { FiDownload, FiArrowLeft } from 'react-icons/fi';

const FormSubmissions = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [submissionsData, setSubmissionsData] = useState({ form: null, submissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axiosClient.get(`/admin/forms/${slug}/submissions`);
        setSubmissionsData(response.data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSubmissions();
    }
  }, [slug]);

  const handleExportCSV = async () => {
    try {
      const response = await axiosClient.get(`/admin/forms/${slug}/submissions/export`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${slug}-submissions.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      window.open(`http://43.156.53.131/api/admin/forms/${slug}/submissions/export`, '_blank');
    }
  };

  const submissions = submissionsData.submissions || [];

  const renderSafeValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      return val.ar || val.en || JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span>Forms</span>
            <span>/</span>
            <span className="text-[#ff7a00] font-semibold">{slug}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Form Submissions</h1>
          <p className="text-sm text-gray-400 mt-1">Review all submissions received for this form.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/forms')}
            className="px-4 py-2.5 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:text-white transition flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <FiArrowLeft size={16} />
            <span>Back to Forms</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition flex items-center space-x-2 shadow-sm cursor-pointer"
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
                <th className="p-4 font-semibold">Submitted Answers</th>
                <th className="p-4 font-semibold">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
              {submissions.map((sub, idx) => (
                <tr key={sub.id || idx} className="hover:bg-gray-800/30 transition">
                  <td className="p-4 font-medium text-white">#{sub.id}</td>
                  <td className="p-4">
                    <div className="space-y-2">
                      {sub.answers && sub.answers.length > 0 ? (
                        sub.answers.map((ans, aIdx) => (
                          <div key={ans.id || aIdx} className="bg-[#0d1117] border border-gray-800 p-2.5 rounded-xl text-xs flex flex-col">
                            <span className="text-[#ff7a00] font-semibold mb-0.5">
                              {renderSafeValue(ans.field_name)}:
                            </span>
                            <span className="text-gray-200">
                              {renderSafeValue(ans.answer)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">No answers available</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{sub.submitted_at || 'N/A'}</td>
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