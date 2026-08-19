import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { FiFileText, FiLayers, FiLogOut } from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      {/* القائمة الجانبية للأدمن */}
      <aside className="w-64 border-r border-gray-800 p-6 flex flex-col justify-between bg-[#161b22]">
        <div>
          <h2 className="text-white font-bold text-lg mb-8 tracking-wide">Admin Panel</h2>
          
          <nav className="space-y-2">
            <Link 
              to="/admin/forms" 
              className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-[#ff7a00]/10 hover:text-[#ff7a00] transition"
            >
              <FiFileText size={18} />
              <span>Forms Management</span>
            </Link>

            <Link 
              to="/admin/posts" 
              className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-[#ff7a00]/10 hover:text-[#ff7a00] transition"
            >
              <FiLayers size={18} />
              <span>Posts Management</span>
            </Link>
          </nav>
        </div>

        {/* زر تسجيل الخروج */}
        <button 
          onClick={handleLogout} 
          className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;